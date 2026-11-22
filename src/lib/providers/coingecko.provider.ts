/**
 * CoinGeckoPriceProvider — fetches cryptocurrency prices from CoinGecko.
 * Free tier: 10-30 calls/min (public API) or with COINGECKO_API_KEY.
 *
 * Docs: https://docs.coingecko.com/reference/simple-price
 */
import type { PriceProvider, PriceQuote, PriceMap } from './types';

const SYMBOL_TO_COIN_ID: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  USDT: 'tether',
  USDC: 'usd-coin',
  ADA: 'cardano',
  AVAX: 'avalanche-2',
  DOT: 'polkadot',
  LINK: 'chainlink',
  MATIC: 'matic-network',
  POL: 'polygon-ecosystem-token',
  DOGE: 'dogecoin',
  XRP: 'ripple',
  BNB: 'binancecoin',
};

const COIN_ID_TO_SYMBOL: Record<string, string> = Object.fromEntries(
  Object.entries(SYMBOL_TO_COIN_ID).map(([sym, id]) => [id, sym])
);

export class CoinGeckoPriceProvider implements PriceProvider {
  readonly source = 'coingecko' as const;
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  private readonly apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.COINGECKO_API_KEY;
  }

  private resolveCoinId(symbol: string): string {
    const upper = symbol.toUpperCase().trim();
    return SYMBOL_TO_COIN_ID[upper] || symbol.toLowerCase().trim();
  }

  async fetchQuote(symbol: string): Promise<PriceQuote> {
    const coinId = this.resolveCoinId(symbol);
    const url = new URL(`${this.baseUrl}/simple/price`);
    url.searchParams.set('ids', coinId);
    url.searchParams.set('vs_currencies', 'usd');
    url.searchParams.set('include_last_updated_at', 'true');

    if (this.apiKey) {
      url.searchParams.set('x_cg_demo_api_key', this.apiKey);
    }

    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    if (!res.ok) {
      throw new Error(`CoinGeckoPriceProvider: HTTP ${res.status} for symbol "${symbol}" (id: ${coinId})`);
    }

    const data = (await res.json()) as Record<string, { usd?: number; last_updated_at?: number }>;
    const item = data[coinId];

    if (!item || typeof item.usd !== 'number') {
      throw new Error(`CoinGeckoPriceProvider: no valid price found for symbol "${symbol}"`);
    }

    const asOf = item.last_updated_at ? new Date(item.last_updated_at * 1000) : new Date();

    return {
      symbol: symbol.toUpperCase(),
      price: item.usd.toString(),
      asOf,
      source: 'coingecko',
      method: 'market',
      isStale: false,
      freshnessLabel: 'Live',
    };
  }

  async fetchQuotes(symbols: string[]): Promise<PriceMap> {
    const map: PriceMap = new Map();
    if (symbols.length === 0) return map;

    const coinIdsToSymbols = new Map<string, string>();
    for (const sym of symbols) {
      const id = this.resolveCoinId(sym);
      coinIdsToSymbols.set(id, sym.toUpperCase());
    }

    const idsParam = Array.from(coinIdsToSymbols.keys()).join(',');
    const url = new URL(`${this.baseUrl}/simple/price`);
    url.searchParams.set('ids', idsParam);
    url.searchParams.set('vs_currencies', 'usd');
    url.searchParams.set('include_last_updated_at', 'true');

    if (this.apiKey) {
      url.searchParams.set('x_cg_demo_api_key', this.apiKey);
    }

    try {
      const res = await fetch(url.toString(), { next: { revalidate: 0 } });
      if (!res.ok) {
        throw new Error(`CoinGecko batch fetch failed: HTTP ${res.status}`);
      }

      const data = (await res.json()) as Record<string, { usd?: number; last_updated_at?: number }>;
      for (const [coinId, info] of Object.entries(data)) {
        if (info && typeof info.usd === 'number') {
          const sym = coinIdsToSymbols.get(coinId) || (COIN_ID_TO_SYMBOL[coinId] ?? coinId.toUpperCase());
          const asOf = info.last_updated_at ? new Date(info.last_updated_at * 1000) : new Date();
          map.set(sym, {
            symbol: sym,
            price: info.usd.toString(),
            asOf,
            source: 'coingecko',
            method: 'market',
            isStale: false,
            freshnessLabel: 'Live',
          });
        }
      }
    } catch {
      // Return whatever quotes we managed or empty map so caller can fallback
    }

    return map;
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    try {
      const quote = await this.fetchQuote('BTC');
      return {
        ok: true,
        message: `CoinGecko public API verified. BTC live quote: $${quote.price}.`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      return { ok: false, message: msg };
    }
  }
}

