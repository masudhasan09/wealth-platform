/**
 * Valuation engine tests.
 * All expected values are hand-calculated.
 */
import { describe, it, expect } from 'vitest';
import { valuePortfolio, computeNetWorth } from './valuation';
import type { ComputedHolding } from './holdings';
import type { PriceMap, PriceQuote } from '@/lib/providers/types';
import type { ValuedPosition } from './valuation';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeHolding(
  overrides: { instrumentId: string; quantity: string; averageCost: string } & Partial<ComputedHolding>,
): ComputedHolding {
  return {
    accountId: 'acct-1',
    totalCost: '0',
    symbol: overrides.symbol ?? overrides.instrumentId.toUpperCase(),
    assetClass: 'equity',
    ...overrides,
  };
}

function makeQuote(symbol: string, price: string, stale = false): PriceQuote {
  return {
    symbol,
    price,
    asOf: new Date('2025-01-01T12:00:00Z'),
    source: 'manual',
    method: 'manual',
    isStale: stale,
    freshnessLabel: stale ? '3 days old' : 'Just now',
  };
}

function priceMap(entries: [string, string][], stale = false): PriceMap {
  return new Map(entries.map(([sym, price]) => [sym, makeQuote(sym, price, stale)]));
}

function makePosition(overrides: Partial<ValuedPosition> & Pick<ValuedPosition, 'symbol' | 'marketValue' | 'assetClass' | 'accountId'>): ValuedPosition {
  return {
    instrumentId: 'i1',
    quantity: '1.00000000',
    averageCost: '100.0000',
    totalCost: '100.00',
    currentPrice: '100.0000',
    unrealisedPnL: '0.00',
    unrealisedPnLPct: '0.0000',
    priceSource: 'manual',
    priceAsOf: new Date('2025-01-01T12:00:00Z'),
    isPriceStale: false,
    freshnessLabel: 'Just now',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// valuePortfolio
// ---------------------------------------------------------------------------

describe('valuePortfolio', () => {
  it('values a single long position correctly', () => {
    // 10 shares AAPL @ avg cost $150, current price $182.35
    // marketValue = 10 × 182.35 = 1823.50
    // totalCost   = 10 × 150.00 = 1500.00
    // pnl         = 1823.50 − 1500.00 = 323.50
    // pnlPct      = 323.50 / 1500 × 100 = 21.5667%
    const holdings: ComputedHolding[] = [
      makeHolding({ instrumentId: 'inst-aapl', symbol: 'AAPL', quantity: '10', averageCost: '150.00' }),
    ];
    const prices = priceMap([['AAPL', '182.35']]);
    const { positions, unvaluedSymbols } = valuePortfolio(holdings, prices);

    expect(unvaluedSymbols).toHaveLength(0);
    expect(positions).toHaveLength(1);
    const p = positions[0];
    expect(p.marketValue).toBe('1823.50');
    expect(p.totalCost).toBe('1500.00');
    expect(p.unrealisedPnL).toBe('323.50');
    expect(p.unrealisedPnLPct).toBe('21.5667');
    expect(p.currentPrice).toBe('182.3500');
    expect(p.isPriceStale).toBe(false);
  });

  it('handles multiple positions in different accounts', () => {
    // AAPL: acct-1, 5 shares @ $100, price $200  → mv=$1000, pnl=$500
    // MSFT: acct-2, 2 shares @ $300, price $415.20 → mv=$830.40, pnl=$230.40
    const holdings: ComputedHolding[] = [
      makeHolding({ instrumentId: 'inst-aapl', symbol: 'AAPL', quantity: '5', averageCost: '100.00', accountId: 'acct-1' }),
      makeHolding({ instrumentId: 'inst-msft', symbol: 'MSFT', quantity: '2', averageCost: '300.00', accountId: 'acct-2' }),
    ];
    const prices = priceMap([['AAPL', '200.00'], ['MSFT', '415.20']]);
    const { positions } = valuePortfolio(holdings, prices);

    expect(positions).toHaveLength(2);
    expect(positions.find(p => p.symbol === 'AAPL')?.marketValue).toBe('1000.00');
    expect(positions.find(p => p.symbol === 'MSFT')?.marketValue).toBe('830.40');
  });

  it('marks positions as unvalued when symbol is missing from PriceMap', () => {
    const holdings: ComputedHolding[] = [
      makeHolding({ instrumentId: 'inst-aapl', symbol: 'AAPL', quantity: '10', averageCost: '150' }),
      makeHolding({ instrumentId: 'inst-xyz', symbol: 'XYZ', quantity: '5', averageCost: '50' }),
    ];
    const prices = priceMap([['AAPL', '182.35']]);
    const { positions, unvaluedSymbols } = valuePortfolio(holdings, prices);

    expect(positions).toHaveLength(1);
    expect(unvaluedSymbols).toContain('XYZ');
  });

  it('propagates isStale flag from quote', () => {
    const holdings: ComputedHolding[] = [
      makeHolding({ instrumentId: 'inst-aapl', symbol: 'AAPL', quantity: '1', averageCost: '150' }),
    ];
    const prices = priceMap([['AAPL', '182.35']], true);
    const { positions } = valuePortfolio(holdings, prices);
    expect(positions[0].isPriceStale).toBe(true);
  });

  it('computes zero PnL when cost equals price', () => {
    // 10 shares @ $100 cost, current price $100 → pnl = 0, pnlPct = 0
    const holdings: ComputedHolding[] = [
      makeHolding({ instrumentId: 'inst-aapl', symbol: 'AAPL', quantity: '10', averageCost: '100.00' }),
    ];
    const prices = priceMap([['AAPL', '100.00']]);
    const { positions } = valuePortfolio(holdings, prices);
    expect(positions[0].unrealisedPnL).toBe('0.00');
    expect(positions[0].unrealisedPnLPct).toBe('0.0000');
  });

  it('returns empty positions and no unvalued symbols for empty inputs', () => {
    const { positions, unvaluedSymbols } = valuePortfolio([], new Map());
    expect(positions).toHaveLength(0);
    expect(unvaluedSymbols).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// computeNetWorth
// ---------------------------------------------------------------------------

describe('computeNetWorth', () => {
  it('totals positions and cash correctly', () => {
    // positions: AAPL mv=1823.50, MSFT mv=830.40  → equity total = 2653.90
    // cash: acct-1=$5000, acct-2=$2000           → cash total = 7000
    // net worth = 2653.90 + 7000 = 9653.90
    const positions: ValuedPosition[] = [
      makePosition({ symbol: 'AAPL', accountId: 'acct-1', assetClass: 'equity', marketValue: '1823.50', averageCost: '150.0000', totalCost: '1500.00', currentPrice: '182.3500', unrealisedPnL: '323.50', unrealisedPnLPct: '21.5667' }),
      makePosition({ symbol: 'MSFT', accountId: 'acct-2', assetClass: 'equity', marketValue: '830.40', averageCost: '300.0000', totalCost: '600.00', currentPrice: '415.2000', unrealisedPnL: '230.40', unrealisedPnLPct: '38.4000', instrumentId: 'i2' }),
    ];
    const cash = new Map([['acct-1', '5000.00'], ['acct-2', '2000.00']]);
    const result = computeNetWorth(positions, cash);

    expect(result.total).toBe('9653.90');
    expect(result.byAssetClass['equity']).toBe('2653.90');
    expect(result.byAssetClass['cash']).toBe('7000.00');
    expect(result.hasStaleData).toBe(false);
    expect(result.unvaluedSymbols).toHaveLength(0);
  });

  it('sets hasStaleData=true when any position is stale', () => {
    const positions: ValuedPosition[] = [
      makePosition({ symbol: 'AAPL', accountId: 'acct-1', assetClass: 'equity', marketValue: '182.35', isPriceStale: true, freshnessLabel: '3 days old' }),
    ];
    const result = computeNetWorth(positions, new Map());
    expect(result.hasStaleData).toBe(true);
  });

  it('handles all-cash portfolio (no positions)', () => {
    // cash only: acct-1=$10000
    const result = computeNetWorth([], new Map([['acct-1', '10000.00']]));
    expect(result.total).toBe('10000.00');
    expect(result.byAssetClass['cash']).toBe('10000.00');
    expect(result.byAccount['acct-1']).toBe('10000.00');
  });

  it('handles negative cash balance (overdraft scenario)', () => {
    // equity $1000, cash -$200 → net worth $800
    const positions: ValuedPosition[] = [
      makePosition({ symbol: 'AAPL', accountId: 'acct-1', assetClass: 'equity', marketValue: '1000.00' }),
    ];
    const result = computeNetWorth(positions, new Map([['acct-1', '-200.00']]));
    expect(result.total).toBe('800.00');
  });
});
