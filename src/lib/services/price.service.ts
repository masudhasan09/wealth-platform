/**
 * PriceService — orchestrates cache lookup → fetch → persist → fallback.
 *
 * Flow for getPrice(symbol):
 *  1. Look up the latest Price row in DB.
 *  2. If fresh → return as PriceQuote (isStale=false).
 *  3. If stale/missing AND Finnhub key available → fetch from Finnhub.
 *     a. On success → persist to DB → return fresh quote.
 *     b. On error → return cached row with isStale=true (graceful fallback).
 *  4. If no cache AND no API → throw.
 */
import { getLatestPrice, getLatestPriceById, upsertPrice } from '@/lib/db/prices';
import { findOrCreateInstrument } from '@/lib/db/instruments';
import { FinnhubPriceProvider } from '@/lib/providers/finnhub.provider';
import { isStale, getFreshnessLabel, getFreshnessVariant } from '@/lib/utils/freshness';
import type { PriceQuote, PriceSource, PriceMap } from '@/lib/providers/types';

/** Stale threshold by asset category (defaults to market). */
export type PriceCategory = 'market' | 'crypto' | 'manual' | 'daily';

export interface GetPriceOptions {
  category?: PriceCategory;
  /** Skip DB cache and always fetch from provider. */
  forceRefresh?: boolean;
}

function rowToQuote(row: {
  symbol: string;
  value: string;
  source: PriceSource;
  asOf: Date;
  method: string;
  isStale?: boolean;
}): PriceQuote {
  const stale = row.isStale ?? isStale(row.asOf, 'market');
  return {
    symbol: row.symbol,
    price: row.value,
    asOf: row.asOf,
    source: row.source,
    method: row.method as 'market' | 'model' | 'manual',
    isStale: stale,
    freshnessLabel: getFreshnessLabel(row.asOf),
  };
}

let _finnhub: FinnhubPriceProvider | null = null;
function getFinnhub(): FinnhubPriceProvider | null {
  if (!process.env.FINNHUB_API_KEY) return null;
  if (!_finnhub) _finnhub = new FinnhubPriceProvider();
  return _finnhub;
}

/**
 * Get a price quote for one symbol.
 * Checks DB cache first; fetches live if stale and API key is available.
 */
export async function getPrice(
  symbol: string,
  opts: GetPriceOptions = {},
): Promise<PriceQuote> {
  const { category = 'market', forceRefresh = false } = opts;

  // 1. Check DB cache
  const cached = await getLatestPrice(symbol);

  if (cached && !forceRefresh) {
    const stale = isStale(cached.asOf, category);
    if (!stale) {
      return rowToQuote({ ...cached, isStale: false });
    }
  }

  // 2. Try live fetch
  const finnhub = getFinnhub();
  if (finnhub) {
    try {
      const quote = await finnhub.fetchQuote(symbol);
      // 3. Persist to DB
      const instrument = await findOrCreateInstrument({ symbol: symbol });
      await upsertPrice({
        instrumentId: instrument.id,
        value: quote.price,
        source: quote.source,
        asOf: quote.asOf,
        method: quote.method,
      });
      return { ...quote, freshnessLabel: getFreshnessLabel(quote.asOf) };
    } catch {
      // fall through to cached fallback
    }
  }

  // 4. Fallback: return stale cache if available
  if (cached) {
    return rowToQuote({ ...cached, isStale: true });
  }

  throw new Error(`PriceService: no price available for symbol "${symbol}"`);
}

/**
 * Get prices for many symbols. Returns a PriceMap (symbol → PriceQuote).
 * Symbols with no price are omitted from the map (no throw).
 */
export async function getPrices(
  symbols: string[],
  opts: GetPriceOptions = {},
): Promise<PriceMap> {
  const map: PriceMap = new Map();
  await Promise.allSettled(
    symbols.map(async (sym) => {
      try {
        const q = await getPrice(sym, opts);
        map.set(sym.toUpperCase(), q);
      } catch {
        // instrument has no price; skip
      }
    }),
  );
  return map;
}

/**
 * Get price by instrument DB id (used by valuation engine).
 */
export async function getPriceByInstrumentId(
  instrumentId: string,
  opts: GetPriceOptions = {},
): Promise<PriceQuote | null> {
  const cached = await getLatestPriceById(instrumentId);
  if (!cached) return null;

  const { category = 'market', forceRefresh = false } = opts;

  if (!forceRefresh && !isStale(cached.asOf, category)) {
    return rowToQuote({ ...cached, isStale: false });
  }

  // Try live fetch
  const finnhub = getFinnhub();
  if (finnhub) {
    try {
      const quote = await finnhub.fetchQuote(cached.symbol);
      await upsertPrice({
        instrumentId,
        value: quote.price,
        source: quote.source,
        asOf: quote.asOf,
        method: quote.method,
      });
      return { ...quote, freshnessLabel: getFreshnessLabel(quote.asOf) };
    } catch {
      // fallback below
    }
  }

  return rowToQuote({ ...cached, isStale: true });
}

export { getFreshnessVariant };
