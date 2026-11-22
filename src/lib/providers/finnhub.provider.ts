/**
 * FinnhubPriceProvider — fetches real-time equity quotes from Finnhub.
 * Free tier: 60 req/min. We stay well under with per-call rate limiting
 * handled in the price service (not here — providers are pure fetchers).
 *
 * Docs: https://finnhub.io/docs/api/quote
 */
import type { PriceProvider, PriceQuote } from './types';

interface FinnhubQuoteResponse {
  c: number; // current price
  t: number; // timestamp (unix seconds)
  pc?: number; // previous close
}

export class FinnhubPriceProvider implements PriceProvider {
  readonly source = 'finnhub' as const;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://finnhub.io/api/v1';

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.FINNHUB_API_KEY ?? '';
    if (!key) {
      throw new Error('FinnhubPriceProvider: FINNHUB_API_KEY environment variable is not set');
    }
    this.apiKey = key;
  }

  async fetchQuote(symbol: string): Promise<PriceQuote> {
    const url = `${this.baseUrl}/quote?symbol=${encodeURIComponent(symbol)}&token=${this.apiKey}`;
    const res = await fetch(url, { next: { revalidate: 0 } });

    if (!res.ok) {
      throw new Error(`FinnhubPriceProvider: HTTP ${res.status} for symbol "${symbol}"`);
    }

    const data = (await res.json()) as FinnhubQuoteResponse;

    if (!data.c || data.c === 0) {
      throw new Error(`FinnhubPriceProvider: no valid price for symbol "${symbol}" (c=${data.c})`);
    }

    const asOf = data.t ? new Date(data.t * 1000) : new Date();

    return {
      symbol,
      price: data.c.toFixed(4),
      asOf,
      source: 'finnhub',
      method: 'market',
      isStale: false,
      freshnessLabel: 'Live',
    };
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    try {
      const quote = await this.fetchQuote('AAPL');
      return {
        ok: true,
        message: `Finnhub connection verified. AAPL live quote: $${quote.price}.`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      // Sanitize key out of message
      const cleanMsg = msg.replace(/token=[^& ]+/gi, 'token=***');
      return { ok: false, message: cleanMsg };
    }
  }
}

