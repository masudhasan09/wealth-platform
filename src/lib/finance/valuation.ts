/**
 * Valuation engine — converts holdings (qty + avg cost) into valued positions
 * using a PriceMap, then aggregates into a net worth result.
 *
 * All arithmetic uses decimal.js — no native float operations.
 */
import Decimal from 'decimal.js';
import type { PriceMap, PriceQuote } from '@/lib/providers/types';
import type { ComputedHolding } from './holdings';
import { getFreshnessLabel } from '@/lib/utils/freshness';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ValuedPosition {
  accountId: string;
  instrumentId: string;
  /** Ticker symbol, e.g. "AAPL". */
  symbol: string;
  /** Asset class, e.g. "equity". */
  assetClass: string;
  /** Number of units held (decimal string). */
  quantity: string;
  /** Average cost basis per unit (decimal string). */
  averageCost: string;
  /** Total cost basis = averageCost × quantity (decimal string). */
  totalCost: string;
  /** Current market price per unit (decimal string). */
  currentPrice: string;
  /** Total market value = qty × currentPrice (decimal string). */
  marketValue: string;
  /** Unrealised gain/loss (decimal string). */
  unrealisedPnL: string;
  /** Unrealised gain/loss as percentage of cost basis (decimal string). */
  unrealisedPnLPct: string;
  /** Price data provenance. */
  priceSource: string;
  priceAsOf: Date;
  isPriceStale: boolean;
  freshnessLabel: string;
}

export interface NetWorthResult {
  /** Total net worth = sum of all market values + cash - liabilities (decimal string). */
  total: string;
  /** Gross assets before deducting liabilities. */
  grossAssets?: string;
  /** Total outstanding liabilities deducted from net worth. */
  totalLiabilities?: string;
  /** Breakdown by account (accountId → total market value string). */
  byAccount: Record<string, string>;
  /** Breakdown by asset class (assetClass → total market value string). */
  byAssetClass: Record<string, string>;
  /** Positions with no price (symbols that couldn't be valued). */
  unvaluedSymbols: string[];
  /** Timestamp this calculation was performed. */
  calculatedAt: Date;
  /** True if any position used a stale price. */
  hasStaleData: boolean;
}

// ---------------------------------------------------------------------------
// valuePortfolio
// ---------------------------------------------------------------------------

/**
 * Converts computed holdings into valued positions using the provided PriceMap.
 * Holdings for symbols NOT in the PriceMap are excluded from the output
 * and their symbols are returned separately via `unvaluedSymbols`.
 *
 * @param holdings   Output of computeHoldings(), enriched with symbol & assetClass
 * @param prices     Map of UPPERCASE symbol → PriceQuote
 */
export function valuePortfolio(
  holdings: ComputedHolding[],
  prices: PriceMap,
): {
  positions: ValuedPosition[];
  unvaluedSymbols: string[];
} {
  const positions: ValuedPosition[] = [];
  const unvaluedSymbols: string[] = [];

  for (const h of holdings) {
    const sym = (h.symbol ?? '').toUpperCase();
    if (!sym) {
      unvaluedSymbols.push(h.instrumentId);
      continue;
    }

    const quote: PriceQuote | undefined = prices.get(sym);
    if (!quote) {
      unvaluedSymbols.push(sym);
      continue;
    }

    const qty = new Decimal(h.quantity);
    const avgCost = new Decimal(h.averageCost ?? '0');
    const price = new Decimal(quote.price);

    const totalCost = avgCost.mul(qty);
    const marketValue = price.mul(qty);
    const pnl = marketValue.sub(totalCost);
    const pnlPct = totalCost.isZero()
      ? new Decimal(0)
      : pnl.div(totalCost).mul(100);

    positions.push({
      accountId: h.accountId,
      instrumentId: h.instrumentId,
      symbol: sym,
      assetClass: h.assetClass ?? 'equity',
      quantity: qty.toFixed(8),
      averageCost: avgCost.toFixed(4),
      totalCost: totalCost.toFixed(2),
      currentPrice: price.toFixed(4),
      marketValue: marketValue.toFixed(2),
      unrealisedPnL: pnl.toFixed(2),
      unrealisedPnLPct: pnlPct.toFixed(4),
      priceSource: quote.source,
      priceAsOf: quote.asOf,
      isPriceStale: quote.isStale,
      freshnessLabel: quote.freshnessLabel ?? getFreshnessLabel(quote.asOf),
    });
  }

  return { positions, unvaluedSymbols };
}

// ---------------------------------------------------------------------------
// computeNetWorth
// ---------------------------------------------------------------------------

/**
 * Aggregates valued positions and cash balances into a single NetWorthResult.
 *
 * @param positions       Output of valuePortfolio()
 * @param cashBalances    Map of accountId → cash balance string (can be negative)
 * @param unvaluedSymbols Symbols that had no price (pass-through)
 */
export function computeNetWorth(
  positions: ValuedPosition[],
  cashBalances: Map<string, string>,
  unvaluedSymbols: string[] = [],
  totalLiabilities: string = '0',
): NetWorthResult {
  let grossTotal = new Decimal(0);
  const byAccount: Record<string, Decimal> = {};
  const byAssetClass: Record<string, Decimal> = {};
  let hasStaleData = false;

  // Sum equity/crypto/fixed-income/real-estate positions
  for (const p of positions) {
    const mv = new Decimal(p.marketValue);
    grossTotal = grossTotal.add(mv);

    byAccount[p.accountId] = (byAccount[p.accountId] ?? new Decimal(0)).add(mv);
    byAssetClass[p.assetClass] = (byAssetClass[p.assetClass] ?? new Decimal(0)).add(mv);

    if (p.isPriceStale) hasStaleData = true;
  }

  // Add cash balances
  for (const [accountId, cashStr] of cashBalances) {
    const cash = new Decimal(cashStr);
    grossTotal = grossTotal.add(cash);
    byAccount[accountId] = (byAccount[accountId] ?? new Decimal(0)).add(cash);
    byAssetClass['cash'] = (byAssetClass['cash'] ?? new Decimal(0)).add(cash);
  }

  const liabilitiesDec = new Decimal(totalLiabilities || 0);
  const netTotal = grossTotal.minus(liabilitiesDec);

  return {
    total: netTotal.toFixed(2),
    grossAssets: grossTotal.toFixed(2),
    totalLiabilities: liabilitiesDec.toFixed(2),
    byAccount: Object.fromEntries(
      Object.entries(byAccount).map(([k, v]) => [k, v.toFixed(2)]),
    ),
    byAssetClass: Object.fromEntries(
      Object.entries(byAssetClass).map(([k, v]) => [k, v.toFixed(2)]),
    ),
    unvaluedSymbols,
    calculatedAt: new Date(),
    hasStaleData,
  };
}
