import type { PriceProvider, PriceQuote } from './types';

/**
 * TwelveDataPriceProvider — secondary equity provider behind Finnhub.
 * Free tier: 800 req/day, 8 req/min.
 * Docs: https://twelvedata.com/docs
 */
export class TwelveDataPriceProvider implements PriceProvider {
  readonly source = 'twelve_data' as const;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.twelvedata.com';

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.TWELVE_DATA_API_KEY ?? '';
    this.apiKey = key;
  }

  async fetchQuote(symbol: string): Promise<PriceQuote> {
    if (!this.apiKey) {
      throw new Error('TwelveDataPriceProvider: TWELVE_DATA_API_KEY is not set');
    }

    const url = `${this.baseUrl}/price?symbol=${encodeURIComponent(symbol)}&apikey=${this.apiKey}`;
    const res = await fetch(url, { next: { revalidate: 0 } });

    if (!res.ok) {
      throw new Error(`TwelveDataPriceProvider: HTTP ${res.status} for symbol "${symbol}"`);
    }

    const data = (await res.json()) as { price?: string; message?: string; status?: string };
    if (data.status === 'error' || !data.price) {
      throw new Error(`TwelveDataPriceProvider: ${data.message || 'Price not found'}`);
    }

    return {
      symbol: symbol.toUpperCase(),
      price: parseFloat(data.price).toFixed(4),
      asOf: new Date(),
      source: 'twelve_data',
      method: 'market',
      isStale: false,
      freshnessLabel: 'Live',
    };
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    if (!this.apiKey) {
      return { ok: false, message: 'API key is not configured.' };
    }

    try {
      const quote = await this.fetchQuote('AAPL');
      return {
        ok: true,
        message: `Twelve Data connection verified. AAPL quote: $${quote.price}.`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      const cleanMsg = msg.replace(/apikey=[^& ]+/gi, 'apikey=***');
      return { ok: false, message: cleanMsg };
    }
  }
}

