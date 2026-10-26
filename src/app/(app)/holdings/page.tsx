import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getAccountsByUserId, getTransactionsByUserId } from '@/lib/db';
import { computeHoldings, computeCashBalances, InsufficientHoldingsError } from '@/lib/finance';
import { getPrices } from '@/lib/services/price.service';
import { getFreshnessVariant } from '@/lib/utils/freshness';
import { HoldingsClient } from './HoldingsClient';
import type { HoldingViewModel, AccountViewModel } from '@/lib/view-models';
import Decimal from 'decimal.js';

export const dynamic = 'force-dynamic';

export default async function HoldingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [accounts, transactions] = await Promise.all([
    getAccountsByUserId(session.user.id),
    getTransactionsByUserId(session.user.id),
  ]);

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

  let computedHoldingsList: ReturnType<typeof computeHoldings> = [];
  let ledgerWarning: string | null = null;

  try {
    computedHoldingsList = computeHoldings(financeTx, { strict: true });
  } catch (err) {
    if (err instanceof InsufficientHoldingsError) {
      ledgerWarning =
        'A sell transaction in your ledger history exceeds available purchased shares (e.g., an earlier purchase was voided). Please review your transaction ledger to correct this.';
      computedHoldingsList = computeHoldings(financeTx, { strict: false });
    } else {
      throw err;
    }
  }

  const cashBalances = computeCashBalances(financeTx);

  // Map to lookup accounts and instruments
  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const instrumentMap = new Map(
    transactions.map((t) => [t.instrumentId, t.instrument])
  );

  // Fetch prices for all holding tickers
  const tickers = Array.from(
    new Set(
      computedHoldingsList
        .map((h) => instrumentMap.get(h.instrumentId)?.symbol)
        .filter((sym): sym is string => !!sym)
    )
  );

  const priceMap = await getPrices(tickers);

  const holdingViewModels: HoldingViewModel[] = computedHoldingsList.map((h) => {
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
      marketValue: marketVal,
      valuationMethod: quote?.method || (inst?.assetClass === 'fixed_income' ? 'model' : 'market'),
      freshnessVariant: quote ? getFreshnessVariant(quote.asOf, quote.source) : undefined,
      freshnessLabel: quote?.freshnessLabel,
    };
  });

  const accountViewModels: AccountViewModel[] = accounts.map((acct) => ({
    id: acct.id,
    name: acct.name,
    type: acct.type,
    currency: acct.currency,
    description: acct.description,
    cashBalance: cashBalances[acct.id] || '0',
  }));

  return (
    <HoldingsClient
      holdings={holdingViewModels}
      accounts={accountViewModels}
      ledgerWarning={ledgerWarning}
    />
  );
}
