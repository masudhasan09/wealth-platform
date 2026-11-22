import Decimal from 'decimal.js';

export interface TaxLotTransaction {
  id: string;
  accountId: string;
  instrumentId: string;
  type: string; // 'buy' | 'sell' | 'transfer_in' | 'transfer_out' | etc.
  quantity: string;
  price: string;
  amount: string;
  fee?: string;
  date: Date | string;
  voidedAt?: Date | string | null;
  symbol?: string;
  name?: string;
}

export interface OpenTaxLot {
  id: string;
  transactionId: string;
  accountId: string;
  instrumentId: string;
  symbol?: string;
  name?: string;
  openDate: Date;
  originalQuantity: string;
  remainingQuantity: string;
  costBasisPerUnit: string;
  totalCostBasis: string; // remainingQuantity * costBasisPerUnit
  // Enriched when market price is supplied
  currentPrice?: string;
  currentValue?: string;
  unrealizedGainLoss?: string;
  unrealizedGainLossPct?: string;
  term?: 'short_term' | 'long_term';
  holdingDays?: number;
}

export interface RealizedLot {
  id: string;
  buyTransactionId: string;
  sellTransactionId: string;
  accountId: string;
  instrumentId: string;
  symbol?: string;
  name?: string;
  openDate: Date;
  closeDate: Date;
  quantity: string;
  costBasis: string;
  proceeds: string;
  gainLoss: string;
  term: 'short_term' | 'long_term';
  holdingDays: number;
}

export interface FifoTaxLotResult {
  openLots: OpenTaxLot[];
  realizedLots: RealizedLot[];
}

export interface RealizedGainsReportSummary {
  taxYear: number;
  shortTermProceeds: string;
  shortTermCostBasis: string;
  shortTermGain: string;
  longTermProceeds: string;
  longTermCostBasis: string;
  longTermGain: string;
  totalProceeds: string;
  totalCostBasis: string;
  totalGain: string;
  lots: RealizedLot[];
}

/**
 * Calculates calendar days between two dates.
 */
export function getHoldingDays(openDate: Date, closeDate: Date): number {
  const diffMs = closeDate.getTime() - openDate.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Determines whether a holding period qualifies as long-term (> 1 year / > 365 days).
 * Under US IRS rules, holding period must be MORE than one year.
 */
export function isLongTerm(openDate: Date, closeDate: Date): boolean {
  // Calendar check: date must be strictly after the 1-year anniversary of openDate
  const anniversary = new Date(openDate);
  anniversary.setFullYear(anniversary.getFullYear() + 1);
  return closeDate.getTime() > anniversary.getTime();
}

/**
 * Computes FIFO tax lots and realized gains/losses from a list of transactions.
 * Excludes voided transactions.
 * Grouped per instrument and account.
 */
export function computeTaxLots(transactions: TaxLotTransaction[]): FifoTaxLotResult {
  // Filter out voided transactions
  const activeTx = transactions.filter((tx) => !tx.voidedAt);

  // Sort chronologically by date
  const sortedTx = [...activeTx].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    if (da !== db) return da - db;
    // If same timestamp, buys process before sells
    if (a.type === 'buy' && b.type === 'sell') return -1;
    if (a.type === 'sell' && b.type === 'buy') return 1;
    return a.id.localeCompare(b.id);
  });

  const openLots: OpenTaxLot[] = [];
  const realizedLots: RealizedLot[] = [];

  let lotCounter = 1;
  let realizedCounter = 1;

  // Process transaction ledger
  for (const tx of sortedTx) {
    const txType = tx.type.toLowerCase();
    const isAcquisition = txType === 'buy' || txType === 'transfer_in';
    const isDisposal = txType === 'sell' || txType === 'transfer_out';

    if (!isAcquisition && !isDisposal) {
      continue;
    }

    const txDate = new Date(tx.date);
    const qty = new Decimal(tx.quantity || 0).abs();
    if (qty.isZero()) continue;

    if (isAcquisition) {
      // Calculate unit cost basis: (amount + fee) / quantity
      const amt = new Decimal(tx.amount || 0).abs();
      const fee = new Decimal(tx.fee || 0).abs();
      const totalCost = amt.plus(fee);
      const unitCost = totalCost.dividedBy(qty);

      openLots.push({
        id: `lot-${lotCounter++}`,
        transactionId: tx.id,
        accountId: tx.accountId,
        instrumentId: tx.instrumentId,
        symbol: tx.symbol,
        name: tx.name,
        openDate: txDate,
        originalQuantity: qty.toFixed(8),
        remainingQuantity: qty.toFixed(8),
        costBasisPerUnit: unitCost.toFixed(8),
        totalCostBasis: totalCost.toFixed(2),
      });
    } else if (isDisposal) {
      // Consume open lots FIFO matching instrument and account
      let remainingToSell = qty;
      const totalSellAmount = new Decimal(tx.amount || 0).abs();
      const totalSellFee = new Decimal(tx.fee || 0).abs();
      const netSellProceeds = totalSellAmount.minus(totalSellFee);
      // Net proceeds per unit for this sell transaction
      const unitProceeds = netSellProceeds.dividedBy(qty);

      // Find eligible open lots matching instrument and account
      for (const lot of openLots) {
        if (remainingToSell.isZero()) break;
        if (lot.instrumentId !== tx.instrumentId || lot.accountId !== tx.accountId) continue;

        const lotRemaining = new Decimal(lot.remainingQuantity);
        if (lotRemaining.isZero()) continue;

        // How much can we consume from this lot?
        const consumed = Decimal.min(remainingToSell, lotRemaining);
        const lotUnitCost = new Decimal(lot.costBasisPerUnit);
        const lotCostBasis = consumed.times(lotUnitCost);
        const lotProceeds = consumed.times(unitProceeds);
        const gainLoss = lotProceeds.minus(lotCostBasis);

        const holdingDays = getHoldingDays(lot.openDate, txDate);
        const longTerm = isLongTerm(lot.openDate, txDate);

        realizedLots.push({
          id: `realized-${realizedCounter++}`,
          buyTransactionId: lot.transactionId,
          sellTransactionId: tx.id,
          accountId: tx.accountId,
          instrumentId: tx.instrumentId,
          symbol: tx.symbol || lot.symbol,
          name: tx.name || lot.name,
          openDate: lot.openDate,
          closeDate: txDate,
          quantity: consumed.toFixed(8),
          costBasis: lotCostBasis.toFixed(2),
          proceeds: lotProceeds.toFixed(2),
          gainLoss: gainLoss.toFixed(2),
          term: longTerm ? 'long_term' : 'short_term',
          holdingDays,
        });

        // Update lot remaining quantity
        const newLotRemaining = lotRemaining.minus(consumed);
        lot.remainingQuantity = newLotRemaining.toFixed(8);
        lot.totalCostBasis = newLotRemaining.times(lotUnitCost).toFixed(2);

        remainingToSell = remainingToSell.minus(consumed);
      }
    }
  }

  // Filter out fully consumed lots from open lots
  const activeOpenLots = openLots.filter((lot) => new Decimal(lot.remainingQuantity).gt(0));

  return {
    openLots: activeOpenLots,
    realizedLots,
  };
}

/**
 * Enriches open tax lots with current prices to compute unrealized gain/loss and holding period.
 */
export function enrichOpenLotsWithPrices(
  openLots: OpenTaxLot[],
  prices: Record<string, string | number | Decimal>,
  asOf: Date = new Date()
): OpenTaxLot[] {
  return openLots.map((lot) => {
    const rawPrice = prices[lot.instrumentId] ?? (lot.symbol ? prices[lot.symbol] : undefined);
    const holdingDays = getHoldingDays(lot.openDate, asOf);
    const term = isLongTerm(lot.openDate, asOf) ? 'long_term' : 'short_term';

    if (rawPrice === undefined || rawPrice === null) {
      return {
        ...lot,
        holdingDays,
        term,
      };
    }

    const price = new Decimal(rawPrice);
    const remainingQty = new Decimal(lot.remainingQuantity);
    const currentValue = remainingQty.times(price);
    const totalCostBasis = new Decimal(lot.totalCostBasis);
    const unrealizedGainLoss = currentValue.minus(totalCostBasis);
    const pct = totalCostBasis.gt(0)
      ? unrealizedGainLoss.dividedBy(totalCostBasis).times(100)
      : new Decimal(0);

    return {
      ...lot,
      currentPrice: price.toFixed(2),
      currentValue: currentValue.toFixed(2),
      unrealizedGainLoss: unrealizedGainLoss.toFixed(2),
      unrealizedGainLossPct: pct.toFixed(2),
      holdingDays,
      term,
    };
  });
}

/**
 * Summarizes realized capital gains by tax year (or all years if year is unspecified).
 */
export function computeRealizedGainsReport(
  realizedLots: RealizedLot[],
  targetYear?: number
): RealizedGainsReportSummary {
  const filtered = targetYear
    ? realizedLots.filter((lot) => new Date(lot.closeDate).getFullYear() === targetYear)
    : realizedLots;

  let stProceeds = new Decimal(0);
  let stCost = new Decimal(0);
  let stGain = new Decimal(0);

  let ltProceeds = new Decimal(0);
  let ltCost = new Decimal(0);
  let ltGain = new Decimal(0);

  for (const lot of filtered) {
    const proceeds = new Decimal(lot.proceeds);
    const cost = new Decimal(lot.costBasis);
    const gain = new Decimal(lot.gainLoss);

    if (lot.term === 'short_term') {
      stProceeds = stProceeds.plus(proceeds);
      stCost = stCost.plus(cost);
      stGain = stGain.plus(gain);
    } else {
      ltProceeds = ltProceeds.plus(proceeds);
      ltCost = ltCost.plus(cost);
      ltGain = ltGain.plus(gain);
    }
  }

  const totalProceeds = stProceeds.plus(ltProceeds);
  const totalCost = stCost.plus(ltCost);
  const totalGain = stGain.plus(ltGain);

  return {
    taxYear: targetYear ?? new Date().getFullYear(),
    shortTermProceeds: stProceeds.toFixed(2),
    shortTermCostBasis: stCost.toFixed(2),
    shortTermGain: stGain.toFixed(2),
    longTermProceeds: ltProceeds.toFixed(2),
    longTermCostBasis: ltCost.toFixed(2),
    longTermGain: ltGain.toFixed(2),
    totalProceeds: totalProceeds.toFixed(2),
    totalCostBasis: totalCost.toFixed(2),
    totalGain: totalGain.toFixed(2),
    lots: filtered,
  };
}

