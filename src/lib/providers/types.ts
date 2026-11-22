/**
 * Price Provider abstraction.
 * All financial values are stored as decimal strings to avoid float precision issues.
 */

export type PriceSource = 'finnhub' | 'twelve_data' | 'coingecko' | 'fred' | 'manual' | 'import';
export type ValuationMethod = 'market' | 'model' | 'manual';

/** A single price quote returned by any provider. */
export interface PriceQuote {
  /** The instrument ticker / symbol (e.g. "AAPL"). */
  symbol: string;
  /** Price as a decimal string, e.g. "182.35". */
  price: string;
  /** ISO 8601 timestamp of when this price was observed at the source. */
  asOf: Date;
  /** Which data source provided this quote. */
  source: PriceSource;
  /** How the price was determined. */
  method: ValuationMethod;
  /** True when served from a stale cache or fallback, not a fresh fetch. */
  isStale: boolean;
  /** Human-readable age description, e.g. "2 days old". */
  freshnessLabel?: string;
}

/** Batch result returned by price service. */
export type PriceMap = Map<string, PriceQuote>;

/** Every concrete provider implements this interface. */
export interface PriceProvider {
  /** Unique identifier of this provider (matches PriceSource enum values). */
  readonly source: PriceSource;

  /**
   * Fetch a price quote for the given symbol.
   * Throws if the symbol is unknown or the network call fails.
   */
  fetchQuote(symbol: string): Promise<PriceQuote>;

  /**
   * Optional batch fetch. Providers that support it (e.g. Finnhub multi-quote)
   * should override this. Default falls back to sequential fetchQuote calls.
   */
  fetchQuotes?(symbols: string[]): Promise<PriceMap>;

  /**
   * Performs a lightweight test query to check API key validity and connectivity.
   */
  testConnection?(): Promise<{ ok: boolean; message: string }>;
}

