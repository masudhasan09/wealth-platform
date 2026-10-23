/**
 * Price providers barrel.
 * Exports all provider implementations and the factory function.
 */
export type { PriceProvider, PriceQuote, PriceMap, PriceSource, ValuationMethod } from './types';
export { MockPriceProvider } from './mock.provider';
export { ManualPriceProvider } from './manual.provider';
export { FinnhubPriceProvider } from './finnhub.provider';

import type { PriceProvider, PriceSource } from './types';
import { ManualPriceProvider } from './manual.provider';
import { FinnhubPriceProvider } from './finnhub.provider';

/**
 * Factory — returns the correct provider for a given source.
 * Falls back to ManualPriceProvider when the API key is missing.
 */
export function getProvider(source: PriceSource): PriceProvider {
  switch (source) {
    case 'finnhub':
      return new FinnhubPriceProvider();
    case 'manual':
    case 'import':
    default:
      return new ManualPriceProvider();
  }
}
