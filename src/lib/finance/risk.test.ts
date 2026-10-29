import { describe, it, expect } from 'vitest';
import { computePortfolioRisk, PositionRiskInput } from './risk';

describe('Portfolio Risk and Concentration Engine', () => {
  it('handles empty or zero-value portfolio gracefully', () => {
    const emptyResult = computePortfolioRisk([]);
    expect(emptyResult.totalPortfolioValue).toBe('0.00');
    expect(emptyResult.diversificationScore).toBe(0);
    expect(emptyResult.diversificationRating).toBe('Low');
    expect(emptyResult.topHoldings).toHaveLength(0);

    const zeroResult = computePortfolioRisk([
      { instrumentId: '1', symbol: 'AAPL', name: 'Apple', assetClass: 'equity', value: 0 },
    ]);
    expect(zeroResult.totalPortfolioValue).toBe('0.00');
    expect(zeroResult.diversificationScore).toBe(0);
  });

  it('correctly calculates concentration metrics for single holding portfolio', () => {
    const positions: PositionRiskInput[] = [
      { instrumentId: '1', symbol: 'NVDA', name: 'NVIDIA', assetClass: 'equity', value: 10000 },
    ];

    const result = computePortfolioRisk(positions);
    expect(result.totalPortfolioValue).toBe('10000.00');
    expect(result.topHoldingPct).toBe('100.00');
    expect(result.topHoldingSymbol).toBe('NVDA');
    expect(result.top5Pct).toBe('100.00');
    expect(result.assetClassCount).toBe(1);
    expect(result.diversificationRating).toBe('Low');

    // Deterministic insight for single holding risk
    const highRiskInsight = result.deterministicInsights.find((i) => i.id === 'insight-top-holding-high');
    expect(highRiskInsight).toBeDefined();
    expect(highRiskInsight?.title).toBe('High Single-Asset Risk');
  });

  it('correctly calculates well-diversified multi-asset portfolio score and insights', () => {
    // 6 positions across 4 asset classes, none exceeding 25%
    const positions: PositionRiskInput[] = [
      { instrumentId: '1', symbol: 'VTI', name: 'Total Stock Market', assetClass: 'equity', value: 2500 },
      { instrumentId: '2', symbol: 'BND', name: 'Total Bond Market', assetClass: 'fixed_income', value: 2000 },
      { instrumentId: '3', symbol: 'VNQ', name: 'Vanguard Real Estate', assetClass: 'real_estate', value: 2000 },
      { instrumentId: '4', symbol: 'BTC', name: 'Bitcoin', assetClass: 'crypto', value: 1000 },
      { instrumentId: '5', symbol: 'USD', name: 'Cash Reserves', assetClass: 'cash', value: 1500 },
      { instrumentId: '6', symbol: 'VXUS', name: 'International Stock', assetClass: 'equity', value: 1000 },
    ];
    // Total = 10,000

    const result = computePortfolioRisk(positions);
    expect(result.totalPortfolioValue).toBe('10000.00');
    expect(result.topHoldingSymbol).toBe('VTI');
    expect(result.topHoldingPct).toBe('25.00');
    expect(result.assetClassCount).toBe(5);
    expect(result.positionCount).toBe(6);
    expect(result.diversificationScore).toBeGreaterThanOrEqual(70);

    const broadSpread = result.deterministicInsights.find((i) => i.id === 'insight-asset-spread-broad');
    expect(broadSpread).toBeDefined();
  });

  it('generates high crypto exposure warning when crypto exceeds 20%', () => {
    const positions: PositionRiskInput[] = [
      { instrumentId: '1', symbol: 'BTC', name: 'Bitcoin', assetClass: 'crypto', value: 5000 },
      { instrumentId: '2', symbol: 'AAPL', name: 'Apple', assetClass: 'equity', value: 5000 },
    ];

    const result = computePortfolioRisk(positions);
    expect(result.topHoldings[0].percentage).toBe('50.00');
    const cryptoInsight = result.deterministicInsights.find((i) => i.id === 'insight-crypto-exposure');
    expect(cryptoInsight).toBeDefined();
    expect(cryptoInsight?.title).toBe('Elevated Digital Asset Exposure');
  });
});

