/**
 * Price providers barrel.
 * Exports all provider implementations and the factory function.
 */
export type { PriceProvider, PriceQuote, PriceMap, PriceSource, ValuationMethod } from './types';
export { MockPriceProvider } from './mock.provider';
export { ManualPriceProvider } from './manual.provider';
export { FinnhubPriceProvider } from './finnhub.provider';
export { TwelveDataPriceProvider } from './twelvedata.provider';
export { CoinGeckoPriceProvider } from './coingecko.provider';
export { TreasuryYieldProvider } from './treasury.provider';

import type { PriceProvider, PriceSource } from './types';
import { ManualPriceProvider } from './manual.provider';
import { FinnhubPriceProvider } from './finnhub.provider';
import { TwelveDataPriceProvider } from './twelvedata.provider';
import { CoinGeckoPriceProvider } from './coingecko.provider';

/**
 * Factory — returns the correct provider for a given source.
 * Falls back to ManualPriceProvider when API keys are missing or source is manual.
 */
export function getProvider(source: PriceSource): PriceProvider {
  switch (source) {
    case 'finnhub':
      return new FinnhubPriceProvider();
    case 'twelve_data':
      return new TwelveDataPriceProvider();
    case 'coingecko':
      return new CoinGeckoPriceProvider();
    case 'manual':
    case 'import':
    default:
      return new ManualPriceProvider();
  }
}
