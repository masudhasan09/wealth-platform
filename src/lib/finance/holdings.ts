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
  /** Asset class of the instrument, when known. Used to decide cash settlement. */
  assetClass?: string;
}

export interface ComputedHolding {
  accountId: string;
  instrumentId: string;
  quantity: string;
  averageCost: string;
  totalCost: string;
  /** Ticker symbol, e.g. "AAPL". Populated when enriched from DB. */
  symbol?: string;
  /** Asset class, e.g. "equity". Populated when enriched from DB. */
  assetClass?: string;
}

export interface ComputeHoldingsOptions {
  strict?: boolean;
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
 * Throws InsufficientHoldingsError if a sell exceeds current holding quantity and options.strict is true (default).
 * If options.strict is false, clamps to zero to avoid crashing read-only views.
 */
export function computeHoldings(
  transactions: FinanceTransaction[],
  options?: ComputeHoldingsOptions
): ComputedHolding[] {
  const strict = options?.strict ?? true;

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
    if (
      tx.type !== 'buy' &&
      tx.type !== 'sell' &&
      tx.type !== 'transfer_in' &&
      tx.type !== 'transfer_out' &&
      tx.type !== 'crypto_fee' &&
      tx.type !== 'maturity'
    ) {
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

    if (tx.type === 'buy' || tx.type === 'transfer_in') {
      const addedCost = txPrice.isZero() ? new Decimal(0) : txQty.times(txPrice).plus(txFee);
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
    } else if (
      tx.type === 'sell' ||
      tx.type === 'transfer_out' ||
      tx.type === 'crypto_fee' ||
      tx.type === 'maturity'
    ) {
      if (txQty.greaterThan(current.quantity)) {
        if (strict) {
          throw new InsufficientHoldingsError(
            `Cannot ${tx.type} ${txQty.toString()} units. Account ${tx.accountId} only holds ${current.quantity.toString()} units of instrument ${tx.instrumentId}.`
          );
        }
        // Non-strict fallback: clamp holding to 0
        holdingsMap.set(key, {
          accountId: tx.accountId,
          instrumentId: tx.instrumentId,
          quantity: new Decimal(0),
          totalCost: new Decimal(0),
          averageCost: new Decimal(0),
        });
        continue;
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
        // Average cost does not change on sell/transfer/maturity; total cost is reduced proportionally
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
 * Supports: deposit, withdrawal, buy, sell, dividend, coupon, maturity,
 * transfer_in, transfer_out, crypto_fee, interest, fee, rental_income,
 * property_expense, return_of_capital and reinvestment.
 * Ignores voided transactions and voided account entries.
 *
 * Asset purchases that are not settled in cash (real estate acquisitions,
 * which are recorded as an ownership share rather than a cash trade) do not
 * move the cash balance.
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
    const isCashSettledTrade = (tx.assetClass ?? '').toLowerCase() !== 'real_estate';

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
        // Cash paid for asset + transaction fee.
        // Real-estate acquisition is not a cash trade: the position is booked
        // as an ownership share, so it must not drain the cash balance.
        if (isCashSettledTrade) {
          const buyCost = qty.times(price).plus(fee);
          updated = current.minus(buyCost);
        }
        break;

      case 'sell':
        // Cash received from asset sale minus fee
        if (isCashSettledTrade) {
          const sellProceeds = qty.times(price).minus(fee);
          updated = current.plus(sellProceeds);
        }
        break;

      case 'transfer_in':
        // Units moved in from outside the platform; no cash movement.
        break;

      case 'transfer_out':
        // Units moved out of the platform; no cash movement.
        break;

      case 'rental_income':
        // Property rent received
        updated = current.plus(amount).minus(fee);
        break;

      case 'property_expense':
        // Property tax, maintenance, insurance paid out
        updated = current.minus(amount.isZero() ? fee : amount);
        break;

      case 'return_of_capital':
        // Distribution that reduces cost basis but is still paid in cash
        updated = current.plus(amount).minus(fee);
        break;

      case 'reinvestment':
        // Dividend immediately reinvested: income in, purchase out — nets to zero.
        break;

      case 'split':
        // Share split: quantity changes, cash does not.
        break;

      case 'journal':
        // Internal bookkeeping entry: no cash movement.
        break;

      case 'dividend':
        // Dividend income added
        updated = current.plus(amount).minus(fee);
        break;

      case 'coupon':
        // Bond coupon payment received
        updated = current.plus(amount).minus(fee);
        break;

      case 'maturity':
        // Bond principal returned at maturity
        const maturityAmt = amount.isZero() ? qty.times(price) : amount;
        updated = current.plus(maturityAmt).minus(fee);
        break;

      case 'interest':
        // Interest income added
        updated = current.plus(amount).minus(fee);
        break;

      case 'crypto_fee':
        // Crypto fee deducted from cash if amount specified
        if (!amount.isZero() || !fee.isZero()) {
          const feePaid = amount.isZero() ? fee : amount;
          updated = current.minus(feePaid);
        }
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
