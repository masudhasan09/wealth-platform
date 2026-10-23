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
}

