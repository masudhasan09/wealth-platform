export interface HoldingViewModel {
  accountId: string;
  accountName: string;
  instrumentId: string;
  symbol: string;
  instrumentName: string;
  assetClass: string;
  quantity: string;
  averageCost: string;
  totalCost: string;
  currentPrice?: string;
  marketValue?: string;
  valuationMethod?: 'market' | 'model' | 'manual' | string;
  freshnessVariant?: 'live' | 'delayed' | 'manual' | 'stale' | 'very-stale';
  freshnessLabel?: string;
}
