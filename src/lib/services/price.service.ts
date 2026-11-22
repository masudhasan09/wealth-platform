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
import { TwelveDataPriceProvider } from '@/lib/providers/twelvedata.provider';
import { CoinGeckoPriceProvider } from '@/lib/providers/coingecko.provider';
import { getDecryptedProviderKey, recordProviderResult } from './provider-config.service';
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

/**
 * Resolves active equity provider according to prompt 2 resolution order:
 * Enabled DB config by priority -> environment variable -> null
 */
async function resolveEquityProviders(): Promise<{ name: string; provider: FinnhubPriceProvider | TwelveDataPriceProvider }[]> {
  const providers: { name: string; provider: FinnhubPriceProvider | TwelveDataPriceProvider }[] = [];

  // Check Finnhub (DB key -> env key)
  const finnhubDbKey = await getDecryptedProviderKey('finnhub');
  const finnhubKey = finnhubDbKey || process.env.FINNHUB_API_KEY;
  if (finnhubKey) {
    providers.push({ name: 'finnhub', provider: new FinnhubPriceProvider(finnhubKey) });
  }

  // Check Twelve Data (DB key -> env key)
  const twelveDbKey = await getDecryptedProviderKey('twelvedata');
  const twelveKey = twelveDbKey || process.env.TWELVE_DATA_API_KEY || process.env.TWELVEDATA_API_KEY;
  if (twelveKey) {
    providers.push({ name: 'twelvedata', provider: new TwelveDataPriceProvider(twelveKey) });
  }

  return providers;
}

async function resolveCryptoProvider(): Promise<CoinGeckoPriceProvider> {
  const cgDbKey = await getDecryptedProviderKey('coingecko');
  const cgKey = cgDbKey || process.env.COINGECKO_API_KEY;
  return new CoinGeckoPriceProvider(cgKey || undefined);
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

  // Check if asset is known non-market (cash, real estate, fixed income)
  const existingInst = await prisma.instrument.findFirst({
    where: { symbol: upperSymbol },
    select: { assetClass: true },
  });

  if (
    existingInst &&
    existingInst.assetClass !== 'equity' &&
    existingInst.assetClass !== 'crypto'
  ) {
    if (cached) {
      return rowToQuote({ ...cached, isStale: false }, category);
    }
    return {
      symbol: upperSymbol,
      price: '1.0000',
      asOf: new Date(),
      source: 'manual',
      method: 'manual',
      isStale: false,
      freshnessLabel: 'Cached',
    };
  }

  // 2. Try live fetch
  if (isCrypto) {
    try {
      const coingecko = await resolveCryptoProvider();
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
      await recordProviderResult('coingecko', true);
      return { ...quote, freshnessLabel: getFreshnessLabel(quote.asOf) };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Fetch failed';
      await recordProviderResult('coingecko', false, msg);
    }
  } else {
    const equityProviders = await resolveEquityProviders();
    for (const ep of equityProviders) {
      try {
        const quote = await ep.provider.fetchQuote(upperSymbol);
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
        await recordProviderResult(ep.name, true);
        return { ...quote, freshnessLabel: getFreshnessLabel(quote.asOf) };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Fetch failed';
        await recordProviderResult(ep.name, false, msg);
        // Fall through to next provider
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
