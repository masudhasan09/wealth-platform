/**
 * MockPriceProvider — returns deterministic, hard-coded prices.
 * Used exclusively in tests. Never reaches the network.
 */
import type { PriceProvider, PriceQuote, PriceMap } from './types';

/** Static price table for well-known test symbols. */
const MOCK_PRICES: Record<string, string> = {
  AAPL: '182.35',
  MSFT: '415.20',
  GOOGL: '178.50',
  AMZN: '195.10',
  TSLA: '248.42',
  BTC: '67500.00',
  ETH: '3450.00',
  SPY: '541.88',
  QQQ: '462.75',
  CASH: '1.00',
};

export class MockPriceProvider implements PriceProvider {
  readonly source = 'manual' as const;

  /** Custom overrides injected at construction time (useful for edge-case tests). */
  constructor(private readonly overrides: Record<string, string> = {}) {}

  async fetchQuote(symbol: string): Promise<PriceQuote> {
    const price = this.overrides[symbol] ?? MOCK_PRICES[symbol.toUpperCase()];
    if (!price) {
      throw new Error(`MockPriceProvider: no price configured for symbol "${symbol}"`);
    }
    return {
      symbol,
      price,
      asOf: new Date('2025-01-01T12:00:00Z'),
      source: 'manual',
      method: 'manual',
      isStale: false,
      freshnessLabel: 'Mock',
    };
  }

  async fetchQuotes(symbols: string[]): Promise<PriceMap> {
    const map: PriceMap = new Map();
    await Promise.all(
      symbols.map(async (s) => {
        try {
          map.set(s.toUpperCase(), await this.fetchQuote(s));
        } catch {
          // skip missing symbols in batch
        }
      }),
    );
    return map;
  }
}
