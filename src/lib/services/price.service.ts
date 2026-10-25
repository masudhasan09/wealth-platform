/**
 * PriceService — orchestrates cache lookup → provider fetch → persist → fallback.
 *
 * Flow for getPrice(symbol):
 *  1. Look up the latest Price row in DB.
 *  2. If fresh → return as PriceQuote (isStale=false).
 *  3. If stale/missing:
 *     a. If crypto asset → fetch from CoinGecko.
 *     b. If equity asset → fetch from Finnhub (if key set).
 *     c. Persist fresh quote to DB.
 *  4. Fallback: return cached row with isStale=true (graceful fallback).
 *  5. If no cache AND no API → throw.
 */
import { getLatestPrice, getLatestPriceById, upsertPrice } from '@/lib/db/prices';
import { findOrCreateInstrument } from '@/lib/db/instruments';
import { FinnhubPriceProvider } from '@/lib/providers/finnhub.provider';
import { CoinGeckoPriceProvider } from '@/lib/providers/coingecko.provider';
import { isStale, getFreshnessLabel, getFreshnessVariant } from '@/lib/utils/freshness';
import type { PriceQuote, PriceSource, PriceMap } from '@/lib/providers/types';
import { prisma } from '@/lib/db/client';

/** Stale threshold by asset category (defaults to market). */
export type PriceCategory = 'market' | 'crypto' | 'manual' | 'daily';

export interface GetPriceOptions {
  category?: PriceCategory;
  /** Skip DB cache and always fetch from provider. */
  forceRefresh?: boolean;
}

const KNOWN_CRYPTO = new Set([
  'BTC', 'ETH', 'SOL', 'USDT', 'USDC', 'ADA', 'AVAX', 'DOT', 'LINK', 'MATIC', 'POL', 'DOGE', 'XRP', 'BNB'
]);

function rowToQuote(row: {
  symbol: string;
  value: string;
  source: PriceSource;
  asOf: Date;
  method: string;
  isStale?: boolean;
}, category: PriceCategory = 'market'): PriceQuote {
  const stale = row.isStale ?? isStale(row.asOf, category);
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

let _coingecko: CoinGeckoPriceProvider | null = null;
function getCoinGecko(): CoinGeckoPriceProvider {
  if (!_coingecko) _coingecko = new CoinGeckoPriceProvider();
  return _coingecko;
}

/** Check whether a symbol represents cryptocurrency. */
async function isCryptoAsset(symbol: string): Promise<boolean> {
  const upper = symbol.toUpperCase().trim();
  if (KNOWN_CRYPTO.has(upper)) return true;

  const inst = await prisma.instrument.findFirst({
    where: { symbol: upper },
    select: { assetClass: true },
  });
  return inst?.assetClass === 'crypto';
}

/**
 * Get a price quote for one symbol.
 * Checks DB cache first; fetches live if stale and provider is available.
 */
export async function getPrice(
  symbol: string,
  opts: GetPriceOptions = {},
): Promise<PriceQuote> {
  const upperSymbol = symbol.toUpperCase().trim();
  const isCrypto = await isCryptoAsset(upperSymbol);
  const category: PriceCategory = opts.category ?? (isCrypto ? 'crypto' : 'market');
  const forceRefresh = opts.forceRefresh ?? false;

  // 1. Check DB cache
  const cached = await getLatestPrice(upperSymbol);

  if (cached && !forceRefresh) {
    const stale = isStale(cached.asOf, category);
    if (!stale) {
      return rowToQuote({ ...cached, isStale: false }, category);
    }
  }

  // 2. Try live fetch
  if (isCrypto) {
    try {
      const coingecko = getCoinGecko();
      const quote = await coingecko.fetchQuote(upperSymbol);
      const instrument = await findOrCreateInstrument({
        symbol: upperSymbol,
        assetClass: 'crypto',
      });
      await upsertPrice({
        instrumentId: instrument.id,
        value: quote.price,
        source: quote.source,
        asOf: quote.asOf,
        method: quote.method,
      });
      return { ...quote, freshnessLabel: getFreshnessLabel(quote.asOf) };
    } catch {
      // Graceful fallback to cached if available
    }
  } else {
    const finnhub = getFinnhub();
    if (finnhub) {
      try {
        const quote = await finnhub.fetchQuote(upperSymbol);
        const instrument = await findOrCreateInstrument({
          symbol: upperSymbol,
          assetClass: 'equity',
        });
        await upsertPrice({
          instrumentId: instrument.id,
          value: quote.price,
          source: quote.source,
          asOf: quote.asOf,
          method: quote.method,
        });
        return { ...quote, freshnessLabel: getFreshnessLabel(quote.asOf) };
      } catch {
        // Fall through to cached fallback
      }
    }
  }

  // 3. Fallback: return stale cache if available
  if (cached) {
    return rowToQuote({ ...cached, isStale: true }, category);
  }

  throw new Error(`PriceService: no price available for symbol "${upperSymbol}"`);
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
        // Instrument has no price; skip
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

  try {
    return await getPrice(cached.symbol, opts);
  } catch {
    return rowToQuote({ ...cached, isStale: true });
  }
}

export { getFreshnessVariant };
