export interface AccountViewModel {
  id: string;
  name: string;
  type: string;
  currency: string;
  description?: string | null;
  cashBalance: string;
  holdingCount?: number;
}

