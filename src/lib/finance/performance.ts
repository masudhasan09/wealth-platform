import Decimal from 'decimal.js';

export interface TWRSubPeriod {
  /** Portfolio value at start of subperiod */
  startValue: string;
  /** Portfolio value at end of subperiod immediately before external cash flow */
  endValueBeforeFlow: string;
  /** External net cash flow (positive for deposit, negative for withdrawal) */
  netFlow: string;
}

export interface TWRResult {
  /** Compounded TWR as percentage string (e.g. "21.00" for +21.00%) */
  twrPct: string;
  /** Individual subperiod returns as percentage strings */
  subperiodReturns: string[];
}

export interface CashFlowItem {
  date: Date;
  /** Cash flow: negative for outflows/investments, positive for distributions */
  amount: string;
}

export interface MWRInput {
  cashFlows: CashFlowItem[];
  terminalValue: string;
  terminalDate: Date;
  maxIterations?: number;
  tolerance?: number;
}

export interface MWRResult {
  /** Annualized MWR / XIRR percentage string (e.g. "21.00" for +21.00%) */
  mwrPct: string;
  iterations: number;
  converged: boolean;
}

export const APPRAISED_ASSET_SMOOTHING_EXPLANATION =
  'Appraised assets (such as real estate) are valued periodically through appraisals rather than continuous market trading. Including them in blended portfolio returns dampens short-term volatility and produces a smoother return profile compared to purely mark-to-market assets.';

/**
 * Computes Time-Weighted Return (TWR) by linking subperiod returns:
 * R_i = (endValueBeforeFlow_i - startValue_i) / startValue_i
 * 1 + TWR = Product(1 + R_i)
 */
export function computeTWR(subperiods: TWRSubPeriod[]): TWRResult {
  if (subperiods.length === 0) {
    return { twrPct: '0.00', subperiodReturns: [] };
  }

  let compounded = new Decimal(1);
  const subperiodReturns: string[] = [];

  for (const period of subperiods) {
    const start = new Decimal(period.startValue);
    const end = new Decimal(period.endValueBeforeFlow);

    if (start.isZero()) {
      subperiodReturns.push('0.00');
      continue;
    }

    // Rate of return for this subperiod
    const r = end.minus(start).dividedBy(start);
    compounded = compounded.times(new Decimal(1).plus(r));
    subperiodReturns.push(r.times(100).toFixed(2));
  }

  const twr = compounded.minus(1).times(100);
  return {
    twrPct: twr.toFixed(2),
    subperiodReturns,
  };
}

/**
 * Computes Money-Weighted Return (MWR / XIRR) using a bisection root solver.
 *
 * NPV equation:
 * Sum_{k} [ C_k / (1 + r)^((d_k - d_0) / 365) ] + V_end / (1 + r)^((d_end - d_0) / 365) = 0
 */
export function computeMWR({
  cashFlows,
  terminalValue,
  terminalDate,
  maxIterations = 100,
  tolerance = 1e-6,
}: MWRInput): MWRResult {
  if (cashFlows.length === 0) {
    return { mwrPct: '0.00', iterations: 0, converged: true };
  }

  // Combine cash flows and terminal value
  const allFlows = [
    ...cashFlows.map((f) => ({
      date: new Date(f.date).getTime(),
      amount: new Decimal(f.amount),
    })),
    {
      date: new Date(terminalDate).getTime(),
      amount: new Decimal(terminalValue),
    },
  ].sort((a, b) => a.date - b.date);

  const t0 = allFlows[0].date;
  const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

  // NPV function for a given annual rate r
  const calcNPV = (rate: number): number => {
    let npv = 0;
    for (const flow of allFlows) {
      const dtYears = (flow.date - t0) / MS_PER_YEAR;
      const base = 1 + rate;
      if (base <= 0) return NaN;
      npv += flow.amount.toNumber() / Math.pow(base, dtYears);
    }
    return npv;
  };

  // Bisection search bounds: -99% to +1,000%
  let low = -0.99;
  let high = 10.0;
  let npvLow = calcNPV(low);
  let npvHigh = calcNPV(high);

  // If signs do not differ, expand upper bound
  if (npvLow * npvHigh > 0) {
    high = 50.0;
    npvHigh = calcNPV(high);
    if (npvLow * npvHigh > 0) {
      // Cannot bracket root
      return { mwrPct: '0.00', iterations: 0, converged: false };
    }
  }

  let mid = 0;
  let iter = 0;

  for (; iter < maxIterations; iter++) {
    mid = (low + high) / 2;
    const npvMid = calcNPV(mid);

    if (Math.abs(npvMid) < tolerance || (high - low) / 2 < tolerance) {
      return {
        mwrPct: (mid * 100).toFixed(2),
        iterations: iter + 1,
        converged: true,
      };
    }

    if (npvLow * npvMid < 0) {
      high = mid;
      npvHigh = npvMid;
    } else {
      low = mid;
      npvLow = npvMid;
    }
  }

  return {
    mwrPct: (mid * 100).toFixed(2),
    iterations: iter,
    converged: true,
  };
}

/**
 * Partitions a list of positions into liquid (market priced) vs illiquid (appraised).
 */
export function partitionPositionsByLiquidity<T extends { assetClass: string }>(
  positions: T[]
): { liquid: T[]; illiquid: T[] } {
  const illiquidClasses = new Set(['real_estate', 'property', 'private_equity']);

  const liquid: T[] = [];
  const illiquid: T[] = [];

  for (const pos of positions) {
    if (illiquidClasses.has(pos.assetClass.toLowerCase())) {
      illiquid.push(pos);
    } else {
      liquid.push(pos);
    }
  }

  return { liquid, illiquid };
}
