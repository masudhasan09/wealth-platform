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
import { getFreshnessLabel } from '@/lib/utils/freshness';

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

    // -----------------------------------------------------------------------
    // Inject real estate valuations from ValuationMark as synthetic positions.
    // Real estate is not tracked via buy/sell transactions — it uses appraisals.
    // We pick the latest ValuationMark per instrument owned by this user's
    // property accounts and create a synthetic ValuedPosition for each.
    // -----------------------------------------------------------------------
    const propertyAccounts = await prisma.account.findMany({
      where: { userId, type: 'property' },
      select: { id: true },
    });
    const propertyAccountIds = propertyAccounts.map((a) => a.id);

    if (propertyAccountIds.length > 0) {
      // Get all real_estate instruments linked to this user's property accounts
      const propInstruments = await prisma.instrument.findMany({
        where: {
          assetClass: 'real_estate',
          OR: [
            { propertyDetails: { isNot: null } },
          ],
        },
        include: {
          propertyDetails: true,
          valuationMarks: {
            orderBy: { date: 'desc' },
            take: 1,
          },
        },
      });

      // Find which account each instrument belongs to
      const txAccountMap = new Map<string, string>();
      for (const tx of txRows) {
        if (tx.instrumentId && !txAccountMap.has(tx.instrumentId)) {
          txAccountMap.set(tx.instrumentId, tx.accountId);
        }
      }

      // Also query property accounts for instruments via liabilities or direct link
      const propLiabilities = await prisma.liability.findMany({
        where: { accountId: { in: propertyAccountIds } },
        select: { accountId: true, linkedInstrumentId: true },
      });
      for (const l of propLiabilities) {
        if (l.linkedInstrumentId) {
          txAccountMap.set(l.linkedInstrumentId, l.accountId);
        }
      }

      const now = new Date();
      for (const inst of propInstruments) {
        const latestMark = inst.valuationMarks[0];
        if (!latestMark) continue;

        // Determine ownership percentage (default 100%)
        const ownershipPct = inst.propertyDetails?.ownershipPct
          ? new Decimal(inst.propertyDetails.ownershipPct)
          : new Decimal(1);

        const appraisalValue = new Decimal(latestMark.value).times(ownershipPct);
        const purchasePrice = inst.propertyDetails?.purchasePrice
          ? new Decimal(inst.propertyDetails.purchasePrice).times(ownershipPct)
          : appraisalValue;

        // Resolve which account this property belongs to
        const accountId =
          txAccountMap.get(inst.id) ??
          propertyAccountIds[0]; // fallback to first property account

        const syntheticPosition: ValuedPosition = {
          accountId,
          instrumentId: inst.id,
          symbol: inst.symbol ?? inst.name,
          assetClass: 'real_estate',
          quantity: '1.00000000',
          averageCost: purchasePrice.toFixed(4),
          totalCost: purchasePrice.toFixed(2),
          currentPrice: appraisalValue.toFixed(4),
          marketValue: appraisalValue.toFixed(2),
          unrealisedPnL: appraisalValue.minus(purchasePrice).toFixed(2),
          unrealisedPnLPct: purchasePrice.isZero()
            ? '0.0000'
            : appraisalValue.minus(purchasePrice).div(purchasePrice).times(100).toFixed(4),
          priceSource: 'appraisal',
          priceAsOf: latestMark.date,
          isPriceStale: (now.getTime() - latestMark.date.getTime()) > 365 * 24 * 60 * 60 * 1000,
          freshnessLabel: getFreshnessLabel(latestMark.date),
        };

        positions.push(syntheticPosition);
      }
    }

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
