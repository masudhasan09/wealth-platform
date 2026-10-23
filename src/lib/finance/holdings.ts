import Decimal from 'decimal.js';

export interface FinanceTransaction {
  id: string;
  accountId: string;
  instrumentId: string;
  type:
    | 'buy'
    | 'sell'
    | 'dividend'
    | 'split'
    | 'deposit'
    | 'withdrawal'
    | 'interest'
    | 'fee'
    | string;
  quantity: string;
  price: string;
  amount: string;
  fee: string;
  date: Date;
  voidedAt?: Date | null;
  voidedReason?: string | null;
}

export interface ComputedHolding {
  accountId: string;
  instrumentId: string;
  quantity: string;
  averageCost: string;
  totalCost: string;
}

export class InsufficientHoldingsError extends Error {
  constructor(message = 'Insufficient holdings to execute sell transaction') {
    super(message);
    this.name = 'InsufficientHoldingsError';
  }
}

/**
 * Computes holdings (quantity, average cost basis, total cost)
 * from a list of transactions using pure Decimal.js arithmetic.
 *
 * Ignores voided transactions.
 * Throws InsufficientHoldingsError if a sell exceeds current holding quantity.
 */
export function computeHoldings(
  transactions: FinanceTransaction[]
): ComputedHolding[] {
  // 1. Filter out voided transactions and sort chronologically
  const activeTx = transactions
    .filter((tx) => !tx.voidedAt)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Key: `${accountId}:${instrumentId}`
  const holdingsMap = new Map<
    string,
    {
      accountId: string;
      instrumentId: string;
      quantity: Decimal;
      totalCost: Decimal;
      averageCost: Decimal;
    }
  >();

  for (const tx of activeTx) {
    if (tx.type !== 'buy' && tx.type !== 'sell') {
      continue;
    }

    const key = `${tx.accountId}:${tx.instrumentId}`;
    const current = holdingsMap.get(key) || {
      accountId: tx.accountId,
      instrumentId: tx.instrumentId,
      quantity: new Decimal(0),
      totalCost: new Decimal(0),
      averageCost: new Decimal(0),
    };

    const txQty = new Decimal(tx.quantity || 0);
    const txPrice = new Decimal(tx.price || 0);
    const txFee = new Decimal(tx.fee || 0);

    if (tx.type === 'buy') {
      const addedCost = txQty.times(txPrice).plus(txFee);
      const newQty = current.quantity.plus(txQty);
      const newTotalCost = current.totalCost.plus(addedCost);
      const newAvgCost = newQty.isZero() ? new Decimal(0) : newTotalCost.dividedBy(newQty);

      holdingsMap.set(key, {
        accountId: tx.accountId,
        instrumentId: tx.instrumentId,
        quantity: newQty,
        totalCost: newTotalCost,
        averageCost: newAvgCost,
      });
    } else if (tx.type === 'sell') {
      if (txQty.greaterThan(current.quantity)) {
        throw new InsufficientHoldingsError(
          `Cannot sell ${txQty.toString()} units. Account ${tx.accountId} only holds ${current.quantity.toString()} units of instrument ${tx.instrumentId}.`
        );
      }

      const newQty = current.quantity.minus(txQty);
      if (newQty.isZero()) {
        holdingsMap.set(key, {
          accountId: tx.accountId,
          instrumentId: tx.instrumentId,
          quantity: new Decimal(0),
          totalCost: new Decimal(0),
          averageCost: new Decimal(0),
        });
      } else {
        // Average cost does not change on sell; total cost is reduced proportionally
        const newTotalCost = current.averageCost.times(newQty);
        holdingsMap.set(key, {
          accountId: tx.accountId,
          instrumentId: tx.instrumentId,
          quantity: newQty,
          totalCost: newTotalCost,
          averageCost: current.averageCost,
        });
      }
    }
  }

  // Convert to serializable strings, retaining holdings with quantity > 0
  const result: ComputedHolding[] = [];
  for (const item of holdingsMap.values()) {
    if (item.quantity.greaterThan(0)) {
      result.push({
        accountId: item.accountId,
        instrumentId: item.instrumentId,
        quantity: item.quantity.toString(),
        averageCost: item.averageCost.toString(),
        totalCost: item.totalCost.toString(),
      });
    }
  }

  return result;
}

/**
 * Computes cash balances per account from transactions.
 * Supports: deposit, withdrawal, buy, sell, dividend, fee, interest.
 * Ignores voided transactions.
 */
export function computeCashBalances(
  transactions: FinanceTransaction[]
): Record<string, string> {
  const activeTx = transactions.filter((tx) => !tx.voidedAt);
  const accountBalances = new Map<string, Decimal>();

  for (const tx of activeTx) {
    const current = accountBalances.get(tx.accountId) || new Decimal(0);
    const amount = new Decimal(tx.amount || 0);
    const qty = new Decimal(tx.quantity || 0);
    const price = new Decimal(tx.price || 0);
    const fee = new Decimal(tx.fee || 0);

    let updated = current;

    switch (tx.type) {
      case 'deposit':
        // Cash added
        const depositAmt = amount.isZero() ? qty.times(price) : amount;
        updated = current.plus(depositAmt).minus(fee);
        break;

      case 'withdrawal':
        // Cash removed
        const withdrawAmt = amount.isZero() ? qty.times(price) : amount;
        updated = current.minus(withdrawAmt).minus(fee);
        break;

      case 'buy':
        // Cash paid for asset + transaction fee
        const buyCost = qty.times(price).plus(fee);
        updated = current.minus(buyCost);
        break;

      case 'sell':
        // Cash received from asset sale minus fee
        const sellProceeds = qty.times(price).minus(fee);
        updated = current.plus(sellProceeds);
        break;

      case 'dividend':
        // Dividend income added
        updated = current.plus(amount).minus(fee);
        break;

      case 'interest':
        // Interest income added
        updated = current.plus(amount).minus(fee);
        break;

      case 'fee':
        // Account fee deducted
        const feeAmt = fee.isZero() ? amount : fee;
        updated = current.minus(feeAmt);
        break;

      default:
        break;
    }

    accountBalances.set(tx.accountId, updated);
  }

  const result: Record<string, string> = {};
  for (const [accountId, balance] of accountBalances.entries()) {
    result[accountId] = balance.toString();
  }

  return result;
}

