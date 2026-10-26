import Decimal from 'decimal.js';

export interface AmortizationPayment {
  month: number;
  date: Date;
  payment: string;
  principal: string;
  interest: string;
  remainingBalance: string;
  cumulativePrincipal: string;
  cumulativeInterest: string;
}

export interface MortgageScheduleInput {
  principal: string;
  annualRate: string; // e.g. "0.06" for 6%
  termMonths: number;  // e.g. 360
  startDate: Date;
}

export interface PropertyEquityResult {
  effectiveValue: string;
  equity: string;
  ltvPct: string;
}

/**
 * Computes standard fixed-rate monthly mortgage payment:
 * M = P * [ i(1 + i)^n ] / [ (1 + i)^n - 1 ]
 * where i = annualRate / 12, n = termMonths.
 */
export function computeMonthlyMortgagePayment(
  principal: string,
  annualRate: string,
  termMonths: number
): string {
  const P = new Decimal(principal);
  const r = new Decimal(annualRate);
  const n = new Decimal(termMonths);

  if (P.isZero() || n.isZero()) return '0.00';
  if (r.isZero()) {
    return P.dividedBy(n).toFixed(2);
  }

  const i = r.dividedBy(12);
  const onePlusIPowN = new Decimal(1).plus(i).pow(n);
  const numerator = i.times(onePlusIPowN);
  const denominator = onePlusIPowN.minus(1);

  const monthlyPayment = P.times(numerator.dividedBy(denominator));
  return monthlyPayment.toFixed(2);
}

/**
 * Generates a full month-by-month amortization schedule using Decimal arithmetic.
 */
export function generateAmortizationSchedule({
  principal,
  annualRate,
  termMonths,
  startDate,
}: MortgageScheduleInput): AmortizationPayment[] {
  const schedule: AmortizationPayment[] = [];
  const P = new Decimal(principal);
  const r = new Decimal(annualRate);
  const monthlyRate = r.dividedBy(12);
  const fixedPayment = new Decimal(computeMonthlyMortgagePayment(principal, annualRate, termMonths));

  let currentBalance = P;
  let cumulativePrincipal = new Decimal(0);
  let cumulativeInterest = new Decimal(0);

  for (let m = 1; m <= termMonths; m++) {
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + m);

    let interestPart = currentBalance.times(monthlyRate);
    let principalPart = fixedPayment.minus(interestPart);

    // Final month adjustment if balance is smaller than payment
    if (m === termMonths || currentBalance.minus(principalPart).isNegative()) {
      principalPart = currentBalance;
      interestPart = fixedPayment.minus(principalPart);
      if (interestPart.isNegative()) interestPart = new Decimal(0);
      currentBalance = new Decimal(0);
    } else {
      currentBalance = currentBalance.minus(principalPart);
    }

    cumulativePrincipal = cumulativePrincipal.plus(principalPart);
    cumulativeInterest = cumulativeInterest.plus(interestPart);

    schedule.push({
      month: m,
      date: paymentDate,
      payment: fixedPayment.toFixed(2),
      principal: principalPart.toFixed(2),
      interest: interestPart.toFixed(2),
      remainingBalance: currentBalance.toFixed(2),
      cumulativePrincipal: cumulativePrincipal.toFixed(2),
      cumulativeInterest: cumulativeInterest.toFixed(2),
    });

    if (currentBalance.isZero()) break;
  }

  return schedule;
}

/**
 * Looks up the outstanding balance on an amortization schedule at a given date.
 */
export function getOutstandingBalanceAtDate(
  schedule: AmortizationPayment[],
  asOfDate: Date
): string {
  if (schedule.length === 0) return '0.00';

  // If before first payment date, balance is initial balance
  const targetTime = asOfDate.getTime();
  if (targetTime < schedule[0].date.getTime()) {
    // Initial principal is month 1 balance + month 1 principal
    const m1 = schedule[0];
    return new Decimal(m1.remainingBalance).plus(new Decimal(m1.principal)).toFixed(2);
  }

  // Find the most recent payment date on or before targetDate
  let lastPayment = schedule[0];
  for (const p of schedule) {
    if (p.date.getTime() <= targetTime) {
      lastPayment = p;
    } else {
      break;
    }
  }

  return lastPayment.remainingBalance;
}

/**
 * Calculates net property equity and Loan-to-Value (LTV) percentage:
 * effectiveValue = marketValue * ownershipPct
 * equity = effectiveValue - mortgageBalance
 * ltvPct = (mortgageBalance / effectiveValue) * 100
 */
export function computePropertyEquity({
  marketValue,
  ownershipPct = '1.0',
  mortgageBalance = '0',
}: {
  marketValue: string;
  ownershipPct?: string;
  mortgageBalance?: string;
}): PropertyEquityResult {
  const mv = new Decimal(marketValue || 0);
  const own = new Decimal(ownershipPct || 1);
  const debt = new Decimal(mortgageBalance || 0);

  const effectiveValue = mv.times(own);
  const equity = effectiveValue.minus(debt);
  const ltvPct = effectiveValue.isZero()
    ? new Decimal(0)
    : debt.dividedBy(effectiveValue).times(100);

  return {
    effectiveValue: effectiveValue.toFixed(2),
    equity: equity.toFixed(2),
    ltvPct: ltvPct.toFixed(1),
  };
}

