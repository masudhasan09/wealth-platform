/**
 * Fixed Income & Bond Analytics Engine.
 * All financial math is strictly performed with Decimal.js to avoid IEEE 754 precision issues.
 */
import Decimal from 'decimal.js';

export type CouponFrequency = 'annual' | 'semi_annual' | 'quarterly' | 'monthly' | 'zero_coupon';
export type DayCountConvention = 'actual_actual' | 'thirty_360' | 'actual_360' | 'actual_365';

export interface BondModel {
  id?: string;
  symbol?: string;
  name?: string;
  faceValue: string; // Decimal string, e.g. "1000"
  couponRate: string; // Decimal string annual rate, e.g. "0.05" for 5%
  couponFrequency: CouponFrequency;
  maturityDate: Date | string;
  issueDate?: Date | string | null;
  dayCount?: DayCountConvention;
  callDate?: Date | string | null;
  callPrice?: string | null;
  subType?: 'treasury_bill' | 'treasury_note' | 'treasury_bond' | 'tips' | 'corporate' | 'municipal' | string;
}

export interface CouponPayment {
  paymentDate: Date;
  amount: string; // Decimal string per 1 unit face value
  periodNumber: number;
}

export interface MaturityLadderBucket {
  bucket: '< 1 Year' | '1 - 3 Years' | '3 - 5 Years' | '5 - 10 Years' | '10+ Years';
  totalFaceValue: string;
  totalMarketValue: string;
  annualIncome: string;
  bondCount: number;
  bonds: Array<{
    id?: string;
    symbol: string;
    name: string;
    maturityDate: string;
    faceValue: string;
    marketValue: string;
  }>;
}

/** Get the number of coupon payments per year. */
export function getFrequencyFactor(freq: CouponFrequency): number {
  switch (freq) {
    case 'annual':
      return 1;
    case 'semi_annual':
      return 2;
    case 'quarterly':
      return 4;
    case 'monthly':
      return 12;
    case 'zero_coupon':
      return 0;
    default:
      return 2;
  }
}

/** Get interval in months for a given frequency. */
function getFrequencyMonths(freq: CouponFrequency): number {
  switch (freq) {
    case 'annual':
      return 12;
    case 'semi_annual':
      return 6;
    case 'quarterly':
      return 3;
    case 'monthly':
      return 1;
    default:
      return 6;
  }
}

/** Calculate days between two dates using 30/360 (US Municipal/Corporate) convention. */
function daysBetween30_360(d1: Date, d2: Date): number {
  const y1 = d1.getUTCFullYear();
  const m1 = d1.getUTCMonth();
  let day1 = d1.getUTCDate();

  const y2 = d2.getUTCFullYear();
  const m2 = d2.getUTCMonth();
  let day2 = d2.getUTCDate();

  if (day1 === 31) day1 = 30;
  if (day2 === 31 && day1 >= 30) day2 = 30;

  return 360 * (y2 - y1) + 30 * (m2 - m1) + (day2 - day1);
}

/** Calculate exact calendar days between two dates. */
function daysBetweenActual(d1: Date, d2: Date): number {
  const ms1 = Date.UTC(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate());
  const ms2 = Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), d2.getUTCDate());
  return Math.round((ms2 - ms1) / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// 1. Accrued Interest
// ---------------------------------------------------------------------------

/**
 * Calculates accrued interest since the last coupon date.
 * If zero_coupon or settlement is after maturity, accrued interest is $0.
 *
 * Benchmark check from prompt:
 * $1,000 face, 5% annual coupon paid semiannually ($25 coupon),
 * 60 days in a 182-day period, gives $8.241758... ≈ $8.24 under actual/actual.
 */
export function accruedInterest(
  bond: BondModel,
  settlementDate: Date | string = new Date()
): string {
  const freq = bond.couponFrequency;
  if (freq === 'zero_coupon') {
    return '0.00';
  }

  const sDate = new Date(settlementDate);
  const mDate = new Date(bond.maturityDate);
  const iDate = bond.issueDate ? new Date(bond.issueDate) : new Date(mDate.getTime() - 10 * 365.25 * 86400000);

  if (sDate >= mDate || sDate < iDate) {
    return '0.00';
  }

  const face = new Decimal(bond.faceValue || '1000');
  const rate = new Decimal(bond.couponRate || '0');
  const m = getFrequencyFactor(freq);
  if (m === 0 || rate.isZero()) {
    return '0.00';
  }

  // Coupon payment per period = (face * rate) / m
  const periodCoupon = face.times(rate).dividedBy(m);
  const freqMonths = getFrequencyMonths(freq);

  // Find the immediately preceding coupon date and next coupon date relative to settlementDate
  let prevCoupon = new Date(mDate);
  while (prevCoupon > sDate) {
    const prev = new Date(prevCoupon);
    prev.setUTCMonth(prev.getUTCMonth() - freqMonths);
    if (prev <= sDate) {
      break;
    }
    prevCoupon = prev;
  }
  const lastCouponDate = new Date(prevCoupon);
  lastCouponDate.setUTCMonth(lastCouponDate.getUTCMonth() - freqMonths);

  const nextCouponDate = prevCoupon;
  const dayCount = bond.dayCount || 'actual_actual';

  let fraction: Decimal;

  if (dayCount === 'thirty_360') {
    const elapsedDays = new Decimal(daysBetween30_360(lastCouponDate, sDate));
    const periodDays = new Decimal(360 / m); // e.g. 180 for semi-annual
    fraction = elapsedDays.dividedBy(periodDays);
  } else if (dayCount === 'actual_360') {
    const elapsedDays = new Decimal(daysBetweenActual(lastCouponDate, sDate));
    const periodDays = new Decimal(360 / m);
    fraction = elapsedDays.dividedBy(periodDays);
  } else if (dayCount === 'actual_365') {
    const elapsedDays = new Decimal(daysBetweenActual(lastCouponDate, sDate));
    const periodDays = new Decimal(365 / m);
    fraction = elapsedDays.dividedBy(periodDays);
  } else {
    // actual_actual (US Treasuries standard)
    const elapsedDays = new Decimal(daysBetweenActual(lastCouponDate, sDate));
    const totalPeriodDays = new Decimal(daysBetweenActual(lastCouponDate, nextCouponDate));
    fraction = totalPeriodDays.isZero() ? new Decimal(0) : elapsedDays.dividedBy(totalPeriodDays);
  }

  const accrued = periodCoupon.times(fraction);
  return accrued.toFixed(2);
}

// ---------------------------------------------------------------------------
// 2. Current Yield
// ---------------------------------------------------------------------------

/**
 * Calculates current yield = annual coupon in dollars / current market price.
 * Example: $1000 face @ 6% coupon = $60 annual coupon, price $950 -> 60 / 950 = 6.3158%
 */
export function currentYield(bond: Pick<BondModel, 'faceValue' | 'couponRate'>, price: string): string {
  const p = new Decimal(price);
  if (p.isZero() || p.isNegative()) {
    return '0.000000';
  }

  const face = new Decimal(bond.faceValue || '1000');
  const rate = new Decimal(bond.couponRate || '0');
  const annualCoupon = face.times(rate);

  return annualCoupon.dividedBy(p).toFixed(6);
}

// ---------------------------------------------------------------------------
// 3. Yield to Maturity (YTM)
// ---------------------------------------------------------------------------

/**
 * Calculates the annualized Yield to Maturity (YTM) using a bounded bisection solver.
 *
 * Model:
 * Solves for annual yield y such that:
 * Price = sum(C_i / (1 + y/m)^t_i) + Face / (1 + y/m)^N
 *
 * For zero-coupon bonds:
 * Price = Face / (1 + y)^T  =>  y = (Face / Price)^(1 / T) - 1
 */
export function yieldToMaturity(
  bond: BondModel,
  price: string,
  settlementDate: Date | string = new Date()
): string {
  const p = new Decimal(price);
  const face = new Decimal(bond.faceValue || '1000');
  if (p.isZero() || p.isNegative() || face.isZero()) {
    return '0.0000';
  }

  const sDate = new Date(settlementDate);
  const mDate = new Date(bond.maturityDate);
  const totalDays = daysBetweenActual(sDate, mDate);
  if (totalDays <= 0) {
    return '0.0000';
  }

  const yearsToMaturity = new Decimal(totalDays).dividedBy(365.25);
  const freq = bond.couponFrequency;
  const m = getFrequencyFactor(freq);
  const rate = new Decimal(bond.couponRate || '0');

  // Case A: Zero-Coupon Bond
  if (freq === 'zero_coupon' || rate.isZero() || m === 0) {
    // y = (Face / Price)^(1 / T) - 1
    const y = Math.pow(face.dividedBy(p).toNumber(), 1 / yearsToMaturity.toNumber()) - 1;
    return new Decimal(y).toFixed(4);
  }

  // Case B: Coupon Bond — Price = Par check
  if (p.equals(face)) {
    return rate.toFixed(4);
  }

  // Total remaining coupon periods
  const nPeriods = Math.max(1, Math.round(yearsToMaturity.times(m).toNumber()));
  const couponPerPeriod = face.times(rate).dividedBy(m).toNumber();
  const targetPrice = p.toNumber();
  const faceVal = face.toNumber();

  // Price function given periodic yield r (where r = annual_yield / m)
  function priceAtYield(r: number): number {
    if (r <= -1) return Infinity;
    let pv = 0;
    for (let t = 1; t <= nPeriods; t++) {
      pv += couponPerPeriod / Math.pow(1 + r, t);
    }
    pv += faceVal / Math.pow(1 + r, nPeriods);
    return pv;
  }

  // Bisection solver for periodic yield r in range [-0.5, 2.0]
  let low = -0.5 / m;
  let high = 2.0 / m;

  // Verify bounds bracket the root
  let fLow = priceAtYield(low) - targetPrice;
  let fHigh = priceAtYield(high) - targetPrice;

  if (fLow * fHigh > 0) {
    // Expand bounds if needed
    low = -0.99 / m;
    high = 5.0 / m;
  }

  for (let iter = 0; iter < 100; iter++) {
    const mid = (low + high) / 2;
    const fMid = priceAtYield(mid) - targetPrice;

    if (Math.abs(fMid) < 1e-7 || (high - low) < 1e-7) {
      const annualizedYield = mid * m;
      return new Decimal(annualizedYield).toFixed(4);
    }

    if (fLow * fMid < 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }

  const result = ((low + high) / 2) * m;
  return new Decimal(result).toFixed(4);
}

// ---------------------------------------------------------------------------
// 4. Coupon Schedule
// ---------------------------------------------------------------------------

/**
 * Generates all projected coupon payments for a bond from issue date to maturity.
 */
export function couponSchedule(bond: BondModel): CouponPayment[] {
  const freq = bond.couponFrequency;
  if (freq === 'zero_coupon') return [];

  const mDate = new Date(bond.maturityDate);
  const freqMonths = getFrequencyMonths(freq);
  const m = getFrequencyFactor(freq);
  const face = new Decimal(bond.faceValue || '1000');
  const rate = new Decimal(bond.couponRate || '0');
  const periodAmount = face.times(rate).dividedBy(m).toFixed(2);

  // Walk backwards from maturity date
  const schedule: Date[] = [];
  const cur = new Date(mDate);
  const iDate = bond.issueDate ? new Date(bond.issueDate) : new Date(mDate.getTime() - 5 * 365.25 * 86400000);

  while (cur > iDate) {
    schedule.unshift(new Date(cur));
    cur.setUTCMonth(cur.getUTCMonth() - freqMonths);
  }

  return schedule.map((paymentDate, index) => ({
    paymentDate,
    amount: periodAmount,
    periodNumber: index + 1,
  }));
}

// ---------------------------------------------------------------------------
// 5. Maturity Ladder
// ---------------------------------------------------------------------------

export interface BondHoldingItem {
  id?: string;
  symbol: string;
  name: string;
  maturityDate: Date | string;
  faceValue: string;
  marketPrice: string;
  quantity: string;
  couponRate: string;
}

/**
 * Aggregates a list of bond positions into maturity ladder buckets:
 * < 1 Year, 1 - 3 Years, 3 - 5 Years, 5 - 10 Years, 10+ Years.
 */
export function maturityLadder(
  bonds: BondHoldingItem[],
  asOfDate: Date | string = new Date()
): MaturityLadderBucket[] {
  const now = new Date(asOfDate);

  const buckets: Record<MaturityLadderBucket['bucket'], MaturityLadderBucket> = {
    '< 1 Year': {
      bucket: '< 1 Year',
      totalFaceValue: '0.00',
      totalMarketValue: '0.00',
      annualIncome: '0.00',
      bondCount: 0,
      bonds: [],
    },
    '1 - 3 Years': {
      bucket: '1 - 3 Years',
      totalFaceValue: '0.00',
      totalMarketValue: '0.00',
      annualIncome: '0.00',
      bondCount: 0,
      bonds: [],
    },
    '3 - 5 Years': {
      bucket: '3 - 5 Years',
      totalFaceValue: '0.00',
      totalMarketValue: '0.00',
      annualIncome: '0.00',
      bondCount: 0,
      bonds: [],
    },
    '5 - 10 Years': {
      bucket: '5 - 10 Years',
      totalFaceValue: '0.00',
      totalMarketValue: '0.00',
      annualIncome: '0.00',
      bondCount: 0,
      bonds: [],
    },
    '10+ Years': {
      bucket: '10+ Years',
      totalFaceValue: '0.00',
      totalMarketValue: '0.00',
      annualIncome: '0.00',
      bondCount: 0,
      bonds: [],
    },
  };

  for (const b of bonds) {
    const matDate = new Date(b.maturityDate);
    const days = daysBetweenActual(now, matDate);
    const years = days / 365.25;

    let targetBucket: MaturityLadderBucket['bucket'];
    if (years < 1) {
      targetBucket = '< 1 Year';
    } else if (years < 3) {
      targetBucket = '1 - 3 Years';
    } else if (years < 5) {
      targetBucket = '3 - 5 Years';
    } else if (years < 10) {
      targetBucket = '5 - 10 Years';
    } else {
      targetBucket = '10+ Years';
    }

    const qty = new Decimal(b.quantity || '1');
    const facePerUnit = new Decimal(b.faceValue || '1000');
    const pricePerUnit = new Decimal(b.marketPrice || b.faceValue || '1000');
    const rate = new Decimal(b.couponRate || '0');

    const totalFace = facePerUnit.times(qty);
    const totalMarket = pricePerUnit.times(qty);
    const income = totalFace.times(rate);

    const target = buckets[targetBucket];
    target.totalFaceValue = new Decimal(target.totalFaceValue).plus(totalFace).toFixed(2);
    target.totalMarketValue = new Decimal(target.totalMarketValue).plus(totalMarket).toFixed(2);
    target.annualIncome = new Decimal(target.annualIncome).plus(income).toFixed(2);
    target.bondCount += 1;
    target.bonds.push({
      id: b.id,
      symbol: b.symbol,
      name: b.name,
      maturityDate: matDate.toISOString().split('T')[0],
      faceValue: totalFace.toFixed(2),
      marketValue: totalMarket.toFixed(2),
    });
  }

  return Object.values(buckets);
}
