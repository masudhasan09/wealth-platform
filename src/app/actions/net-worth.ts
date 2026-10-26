'use server';

import { auth } from '@/auth';
import Decimal from 'decimal.js';
import { getTransactionsByUserId } from '@/lib/db/transactions';
import { computeHoldings, computeCashBalances } from '@/lib/finance/holdings';
import { valuePortfolio, computeNetWorth } from '@/lib/finance/valuation';
import { getPrices } from '@/lib/services/price.service';
import { saveSnapshot, getSnapshots } from '@/lib/db/net-worth';
import { prisma } from '@/lib/db/client';
import type { SnapshotRow } from '@/lib/db/net-worth';
import type { ValuedPosition, NetWorthResult } from '@/lib/finance/valuation';

export interface NetWorthData {
  result: NetWorthResult;
  positions: ValuedPosition[];
}

/**
 * Compute current net worth for the logged-in user.
 * Fetches transactions → computes holdings → fetches prices → values portfolio.
 */
export async function getNetWorthAction(): Promise<NetWorthData | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not authenticated' };
  const userId = session.user.id;

  try {
    // Load all transactions
    const txRows = await getTransactionsByUserId(userId);

    // Map to FinanceTransaction shape, enriched with symbol/assetClass from instrument
    const enriched = txRows.map((tx) => ({
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
      voidedReason: tx.voidedReason,
    }));

    // Compute holdings (non-strict to avoid crash on display)
    const rawHoldings = computeHoldings(enriched, { strict: false });

    // Enrich holdings with symbol + assetClass from instrument table
    const instrumentIds = [...new Set(rawHoldings.map((h) => h.instrumentId))];
    const instruments = await prisma.instrument.findMany({
      where: { id: { in: instrumentIds } },
      select: { id: true, symbol: true, assetClass: true },
    });
    const instMap = new Map(instruments.map((i) => [i.id, i]));

    const holdings = rawHoldings.map((h) => ({
      ...h,
      symbol: instMap.get(h.instrumentId)?.symbol ?? '',
      assetClass: instMap.get(h.instrumentId)?.assetClass ?? 'equity',
    }));

    // Fetch prices for all tickers
    const tickers = holdings.map((h) => h.symbol).filter(Boolean);
    const priceMap = await getPrices(tickers);

    // Value portfolio
    const { positions, unvaluedSymbols } = valuePortfolio(holdings, priceMap);

    // Compute cash balances
    const rawCash = computeCashBalances(enriched);
    const cashMap = new Map(Object.entries(rawCash));

    // Query liabilities for this user
    const liabilities = await prisma.liability.findMany({
      where: { account: { userId } },
    });
    const totalLiabilities = liabilities
      .reduce((sum, l) => sum.plus(new Decimal(l.principal)), new Decimal(0))
      .toFixed(2);

    // Compute net worth (subtracting liabilities)
    const result = computeNetWorth(positions, cashMap, unvaluedSymbols, totalLiabilities);

    return { result, positions };
  } catch (err) {
    console.error('[getNetWorthAction]', err);
    return { error: 'Failed to compute net worth' };
  }
}

/**
 * Take a net worth snapshot for the logged-in user.
 */
export async function takeSnapshotAction(): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };
  const userId = session.user.id;

  try {
    const data = await getNetWorthAction();
    if ('error' in data) return { success: false, error: data.error };

    const staleCount = data.positions.filter((p) => p.isPriceStale).length;
    await saveSnapshot(userId, data.result, staleCount);
    return { success: true };
  } catch (err) {
    console.error('[takeSnapshotAction]', err);
    return { success: false, error: 'Failed to save snapshot' };
  }
}

/**
 * Fetch snapshot history for chart.
 */
export async function getSnapshotHistoryAction(limit = 90): Promise<SnapshotRow[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  return getSnapshots(session.user.id, limit);
}
