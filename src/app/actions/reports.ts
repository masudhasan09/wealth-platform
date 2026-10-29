'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db/client';
import { getAccountsByUserId, getTransactionsByUserId } from '@/lib/db';
import { computeHoldings } from '@/lib/finance/holdings';
import { getPrices } from '@/lib/services/price.service';
import { getUserTaxLotsAndGains } from '@/lib/db/tax-lots';
import { getNetWorthAction } from './net-worth';
import type { HoldingViewModel } from '@/lib/view-models';
import Decimal from 'decimal.js';

export async function getReportDataAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be signed in to view and export reports.' };
  }

  const userId = session.user.id;

  try {
    const [user, accounts, transactions, taxLotsData, netWorthData] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      }),
      getAccountsByUserId(userId),
      getTransactionsByUserId(userId),
      getUserTaxLotsAndGains(userId),
      getNetWorthAction(),
    ]);

    const accountMap = new Map(accounts.map((a) => [a.id, a]));
    const instrumentMap = new Map(transactions.map((t) => [t.instrumentId, t.instrument]));

    const financeTx = transactions.map((tx) => ({
      id: tx.id,
      accountId: tx.accountId,
      instrumentId: tx.instrumentId,
      type: tx.type,
      quantity: tx.quantity,
      price: tx.price,
      amount: tx.amount,
      fee: tx.fee,
      date: tx.date,
      voidedAt: tx.voidedAt,
    }));

    const computedHoldingsList = computeHoldings(financeTx, { strict: false });

    const tickers = Array.from(
      new Set(
        computedHoldingsList
          .map((h) => instrumentMap.get(h.instrumentId)?.symbol)
          .filter((sym): sym is string => !!sym)
      )
    );

    const priceMap = await getPrices(tickers);

    const holdings: HoldingViewModel[] = computedHoldingsList.map((h) => {
      const acct = accountMap.get(h.accountId);
      const inst = instrumentMap.get(h.instrumentId);
      const sym = inst?.symbol || '';
      const quote = sym ? priceMap.get(sym.toUpperCase()) : undefined;

      let marketVal: string | undefined;
      if (quote?.price) {
        const q = new Decimal(h.quantity || '0');
        const p = new Decimal(quote.price);
        marketVal = q.times(p).toFixed(2);
      }

      return {
        accountId: h.accountId,
        accountName: acct?.name || 'Unknown Account',
        instrumentId: h.instrumentId,
        symbol: sym,
        instrumentName: inst?.name || inst?.symbol || '',
        assetClass: inst?.assetClass || 'equity',
        quantity: h.quantity,
        averageCost: h.averageCost,
        totalCost: h.totalCost,
        currentPrice: quote?.price,
        currentValue: marketVal,
        marketValue: marketVal,
        valuationMethod: quote?.method || 'market',
      };
    });

    const netWorthTotal =
      'result' in netWorthData ? netWorthData.result.total : '0.00';

    return {
      user: {
        name: user?.name || 'Account Holder',
        email: user?.email || '',
      },
      holdings,
      gainsSummary: taxLotsData.realizedReport,
      netWorthTotal,
    };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Failed to compile report data.' };
  }
}

