import Decimal from 'decimal.js';

export interface BenchmarkSpreadResult {
  bondYtm: string; // e.g. "0.0480" (4.80%)
  benchmarkYield: string; // e.g. "0.0425" (4.25%)
  spreadPct: string; // e.g. "0.0055" (0.55%)
  spreadBps: number; // e.g. 55 bps
}

export interface CurvePoint {
  years: number;
  yieldRate: number; // e.g. 0.0425 for 4.25%
}

/**
 * Standard mapping of tenor strings to years.
 */
export const TENOR_TO_YEARS: Record<string, number> = {
  '3m': 0.25,
  '6m': 0.5,
  '1y': 1.0,
  '2y': 2.0,
  '3y': 3.0,
  '5y': 5.0,
  '7y': 7.0,
  '10y': 10.0,
  '20y': 20.0,
  '30y': 30.0,
};

/**
 * Linearly interpolates the benchmark yield for a bond's remaining maturity (in years),
 * then calculates the spread (bond YTM minus benchmark yield).
 *
 * Example (prompt 2 sanity check):
 *  - 2-year: 4.0% (0.04)
 *  - 5-year: 4.5% (0.045)
 *  - Remaining maturity: 3.5 years -> interpolated benchmark = 4.25% (0.0425)
 *  - Bond YTM = 4.80% (0.048) -> Spread = +0.55% = 55 basis points (bps).
 */
export function benchmarkSpread(
  bondYtm: string | number | Decimal,
  curve: { tenor: string; yieldPct: string | number | Decimal }[],
  yearsToMaturity: number
): BenchmarkSpreadResult {
  const ytmDec = new Decimal(bondYtm);

  if (!curve || curve.length === 0 || yearsToMaturity <= 0) {
    return {
      bondYtm: ytmDec.toFixed(4),
      benchmarkYield: '0.0000',
      spreadPct: ytmDec.toFixed(4),
      spreadBps: Math.round(ytmDec.times(10000).toNumber()),
    };
  }

  // Map curve points to numerical years and yield rates
  const sortedPoints: CurvePoint[] = curve
    .map((c) => ({
      years: TENOR_TO_YEARS[c.tenor.toLowerCase()] ?? parseFloat(c.tenor),
      yieldRate: new Decimal(c.yieldPct).toNumber(),
    }))
    .filter((p) => !isNaN(p.years) && !isNaN(p.yieldRate))
    .sort((a, b) => a.years - b.years);

  if (sortedPoints.length === 0) {
    return {
      bondYtm: ytmDec.toFixed(4),
      benchmarkYield: '0.0000',
      spreadPct: ytmDec.toFixed(4),
      spreadBps: Math.round(ytmDec.times(10000).toNumber()),
    };
  }

  let interpolatedYield: number;

  if (yearsToMaturity <= sortedPoints[0].years) {
    interpolatedYield = sortedPoints[0].yieldRate;
  } else if (yearsToMaturity >= sortedPoints[sortedPoints.length - 1].years) {
    interpolatedYield = sortedPoints[sortedPoints.length - 1].yieldRate;
  } else {
    // Find flanking points for linear interpolation
    let lower = sortedPoints[0];
    let upper = sortedPoints[sortedPoints.length - 1];

    for (let i = 0; i < sortedPoints.length - 1; i++) {
      if (
        yearsToMaturity >= sortedPoints[i].years &&
        yearsToMaturity <= sortedPoints[i + 1].years
      ) {
        lower = sortedPoints[i];
        upper = sortedPoints[i + 1];
        break;
      }
    }

    if (upper.years === lower.years) {
      interpolatedYield = lower.yieldRate;
    } else {
      const weight = (yearsToMaturity - lower.years) / (upper.years - lower.years);
      interpolatedYield = lower.yieldRate + weight * (upper.yieldRate - lower.yieldRate);
    }
  }

  const benchmarkDec = new Decimal(interpolatedYield);
  const spreadDec = ytmDec.minus(benchmarkDec);
  const spreadBps = Math.round(spreadDec.times(10000).toNumber());

  return {
    bondYtm: ytmDec.toFixed(4),
    benchmarkYield: benchmarkDec.toFixed(4),
    spreadPct: spreadDec.toFixed(4),
    spreadBps,
  };
}

