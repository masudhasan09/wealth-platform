export interface TransactionViewModel {
  id: string;
  accountId: string;
  accountName: string;
  instrumentId: string;
  symbol: string;
  instrumentName: string;
  type: string;
  date: string; // ISO date string for deterministic rendering and formatting
  quantity: string;
  price: string;
  amount: string;
  fee: string;
  isVoided: boolean;
  voidedAt?: string | null;
  voidedReason?: string | null;
  note?: string | null;
}

