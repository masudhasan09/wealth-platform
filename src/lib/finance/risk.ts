import Decimal from 'decimal.js';

export interface PositionRiskInput {
  instrumentId: string;
  symbol: string;
  name: string;
  assetClass: string;
  value: string | number | Decimal;
}

export interface ConcentrationItem {
  instrumentId: string;
  symbol: string;
  name: string;
  assetClass: string;
  value: string;
  percentage: string;
}

export interface RiskAnalysisResult {
  totalPortfolioValue: string;
  topHoldingPct: string;
  topHoldingSymbol: string;
  top5Pct: string;
  diversificationScore: number; // 0 to 100
  diversificationRating: 'Low' | 'Moderate' | 'Strong';
  estimatedAnnualVolatility: string; // e.g. "14.2%"
  assetClassCount: number;
  positionCount: number;
  topHoldings: ConcentrationItem[];
  assetClassBreakdown: {
    assetClass: string;
    value: string;
    percentage: string;
  }[];
  deterministicInsights: {
    id: string;
    type: 'warning' | 'info' | 'success';
    title: string;
    description: string;
  }[];
}

/**
 * Standard asset-class annualized historical volatility benchmarks.
 */
const ASSET_CLASS_VOLATILITY: Record<string, number> = {
  cash: 0.005,        // 0.5%
  fixed_income: 0.055, // 5.5%
  real_estate: 0.090,  // 9.0%
  equity: 0.175,       // 17.5%
  crypto: 0.650,       // 65.0%
};

/**
 * Computes portfolio risk analysis, concentration metrics, diversification score,
 * and deterministic plain-language insights.
 */
export function computePortfolioRisk(positions: PositionRiskInput[]): RiskAnalysisResult {
  if (!positions || positions.length === 0) {
    return {
      totalPortfolioValue: '0.00',
      topHoldingPct: '0.00',
      topHoldingSymbol: 'N/A',
      top5Pct: '0.00',
      diversificationScore: 0,
      diversificationRating: 'Low',
      estimatedAnnualVolatility: '0.00%',
      assetClassCount: 0,
      positionCount: 0,
      topHoldings: [],
      assetClassBreakdown: [],
      deterministicInsights: [
        {
          id: 'insight-empty',
          type: 'info',
          title: 'Empty Portfolio',
          description: 'No active holdings found to calculate portfolio risk.',
        },
      ],
    };
  }

  // Calculate total portfolio value
  let totalDec = new Decimal(0);
  const validPositions = positions
    .map((p) => {
      const val = new Decimal(p.value || 0);
      return { ...p, decValue: val };
    })
    .filter((p) => p.decValue.gt(0));

  for (const p of validPositions) {
    totalDec = totalDec.plus(p.decValue);
  }

  if (totalDec.isZero()) {
    return {
      totalPortfolioValue: '0.00',
      topHoldingPct: '0.00',
      topHoldingSymbol: 'N/A',
      top5Pct: '0.00',
      diversificationScore: 0,
      diversificationRating: 'Low',
      estimatedAnnualVolatility: '0.00%',
      assetClassCount: 0,
      positionCount: 0,
      topHoldings: [],
      assetClassBreakdown: [],
      deterministicInsights: [],
    };
  }

  // Sort descending by value
  validPositions.sort((a, b) => b.decValue.comparedTo(a.decValue));

  // Concentration items
  const concentrationItems: ConcentrationItem[] = validPositions.map((p) => {
    const pct = p.decValue.dividedBy(totalDec).times(100);
    return {
      instrumentId: p.instrumentId,
      symbol: p.symbol || p.name || 'Unknown',
      name: p.name || p.symbol || 'Unknown',
      assetClass: p.assetClass,
      value: p.decValue.toFixed(2),
      percentage: pct.toFixed(2),
    };
  });

  const topHolding = concentrationItems[0];
  const topHoldingPct = new Decimal(topHolding.percentage);

  // Top 5 sum
  const top5Items = concentrationItems.slice(0, 5);
  let top5Sum = new Decimal(0);
  for (const item of top5Items) {
    top5Sum = top5Sum.plus(new Decimal(item.percentage));
  }

  // Asset class breakdown
  const classMap = new Map<string, Decimal>();
  for (const p of validPositions) {
    const cls = p.assetClass || 'equity';
    const current = classMap.get(cls) || new Decimal(0);
    classMap.set(cls, current.plus(p.decValue));
  }

  const assetClassBreakdown = Array.from(classMap.entries()).map(([cls, val]) => {
    const pct = val.dividedBy(totalDec).times(100);
    return {
      assetClass: cls,
      value: val.toFixed(2),
      percentage: pct.toFixed(2),
    };
  });

  const assetClassCount = assetClassBreakdown.length;

  // ---------------------------------------------------------------------------
  // DIVERSIFICATION SCORE FORMULA (0-100)
  // 1. Asset Class Balance (50 pts):
  //    Based on Herfindahl-Hirschman Index across asset classes.
  //    Min HHI for 5 equal classes = 2000; single class = 10000.
  //    Score = max(0, 50 * (1 - (HHI - 2000) / 8000)).
  // 2. Individual Holding Balance (50 pts):
  //    Penalties for topHolding > 20% and top5 > 60% (scaled for portfolio size).
  // ---------------------------------------------------------------------------
  let classHhi = 0;
  for (const b of assetClassBreakdown) {
    const p = parseFloat(b.percentage);
    classHhi += p * p;
  }
  const classScore = Math.max(0, Math.min(50, 50 * (1 - Math.max(0, classHhi - 2000) / 8000)));

  const topPctNum = topHoldingPct.toNumber();
  const top5Num = top5Sum.toNumber();
  const isSmallPortfolio = validPositions.length <= 5;
  const topHoldingPenalty = Math.max(0, topPctNum - 20) * 1.5;
  const top5Penalty = isSmallPortfolio
    ? 0
    : Math.max(0, top5Num - 60) * (validPositions.length < 10 ? 0.4 : 0.75);
  const holdingScore = Math.max(0, Math.min(50, 50 - topHoldingPenalty - top5Penalty));

  const diversificationScore = Math.round(Math.max(0, Math.min(100, classScore + holdingScore)));

  const diversificationRating =
    diversificationScore >= 75 ? 'Strong' : diversificationScore >= 50 ? 'Moderate' : 'Low';

  // ---------------------------------------------------------------------------
  // ESTIMATED ANNUAL VOLATILITY
  // Weighted sum of asset class volatilities
  // ---------------------------------------------------------------------------
  let weightedVol = 0;
  for (const b of assetClassBreakdown) {
    const weight = parseFloat(b.percentage) / 100;
    const vol = ASSET_CLASS_VOLATILITY[b.assetClass] ?? 0.15;
    weightedVol += weight * vol;
  }
  const volPct = (weightedVol * 100).toFixed(2);

  // ---------------------------------------------------------------------------
  // DETERMINISTIC INSIGHTS (NO LLM)
  // Rule-based deterministic explanations
  // ---------------------------------------------------------------------------
  const insights: RiskAnalysisResult['deterministicInsights'] = [];

  // Concentration insight
  if (topPctNum > 35) {
    insights.push({
      id: 'insight-top-holding-high',
      type: 'warning',
      title: 'High Single-Asset Risk',
      description: `Your largest holding (${topHolding.symbol}) accounts for ${topHolding.percentage}% of the portfolio, exposing you to significant idiosyncratic risk.`,
    });
  } else if (topPctNum <= 20 && validPositions.length >= 5) {
    insights.push({
      id: 'insight-top-holding-healthy',
      type: 'success',
      title: 'Healthy Individual Position Sizing',
      description: `No single holding exceeds 20% of your portfolio (largest is ${topHolding.symbol} at ${topHolding.percentage}%).`,
    });
  }

  // Top 5 concentration insight
  if (top5Num > 70 && validPositions.length > 5) {
    insights.push({
      id: 'insight-top5-high',
      type: 'warning',
      title: 'Concentrated Core Positions',
      description: `Your top 5 holdings represent ${top5Sum.toFixed(1)}% of your assets, leaving your portfolio vulnerable to downturns in those key positions.`,
    });
  }

  // Asset class diversity insight
  if (assetClassCount >= 4) {
    insights.push({
      id: 'insight-asset-spread-broad',
      type: 'success',
      title: 'Multi-Asset Spread',
      description: `Your capital is distributed across ${assetClassCount} distinct asset classes, providing defensive non-correlation benefits.`,
    });
  } else if (assetClassCount <= 2) {
    insights.push({
      id: 'insight-asset-spread-narrow',
      type: 'warning',
      title: 'Narrow Asset Allocation',
      description: `Your assets are confined to only ${assetClassCount} asset class(es). Adding fixed income, real estate, or cash cushions market downturns.`,
    });
  }

  // Crypto exposure check
  const cryptoItem = assetClassBreakdown.find((b) => b.assetClass === 'crypto');
  if (cryptoItem && parseFloat(cryptoItem.percentage) > 20) {
    insights.push({
      id: 'insight-crypto-exposure',
      type: 'warning',
      title: 'Elevated Digital Asset Exposure',
      description: `Crypto represents ${cryptoItem.percentage}% of your portfolio, significantly driving up expected annual volatility (${volPct}%).`,
    });
  }

  // Overall score summary insight
  insights.push({
    id: 'insight-overall-score',
    type: diversificationScore >= 75 ? 'success' : diversificationScore >= 50 ? 'info' : 'warning',
    title: `Diversification Rating: ${diversificationRating} (${diversificationScore}/100)`,
    description:
      diversificationScore >= 75
        ? 'Your portfolio exhibits robust risk distribution across both individual positions and multi-asset classes.'
        : diversificationScore >= 50
        ? 'Moderate portfolio diversification. Trimming top holdings and allocating to underrepresented asset classes could improve resilience.'
        : 'Low diversification score. Heavy concentration in single assets or single asset classes increases downside exposure.',
  });

  return {
    totalPortfolioValue: totalDec.toFixed(2),
    topHoldingPct: topHolding.percentage,
    topHoldingSymbol: topHolding.symbol,
    top5Pct: top5Sum.toFixed(2),
    diversificationScore,
    diversificationRating,
    estimatedAnnualVolatility: `${volPct}%`,
    assetClassCount,
    positionCount: validPositions.length,
    topHoldings: concentrationItems.slice(0, 10),
    assetClassBreakdown,
    deterministicInsights: insights,
  };
}
