/**
 * ManualPriceProvider — reads the most recent "manual" Price row from the DB.
 * Used when a user sets a price manually through the UI.
 */
import type { PriceProvider, PriceQuote } from './types';
import { getLatestPrice } from '@/lib/db/prices';
import { getFreshnessLabel } from '@/lib/utils/freshness';

export class ManualPriceProvider implements PriceProvider {
  readonly source = 'manual' as const;

  async fetchQuote(symbol: string): Promise<PriceQuote> {
    const row = await getLatestPrice(symbol, 'manual');
    if (!row) {
      throw new Error(`ManualPriceProvider: no manual price found for symbol "${symbol}"`);
    }
    const asOf = row.asOf;
    return {
      symbol,
      price: row.value,
      asOf,
      source: 'manual',
      method: 'manual',
      isStale: false, // manual prices are always considered intentional
      freshnessLabel: getFreshnessLabel(asOf),
    };
  }
}

