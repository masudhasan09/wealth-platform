import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskPanel } from './RiskPanel';
import { RiskAnalysisResult } from '@/lib/finance/risk';

describe('RiskPanel Organism', () => {
  const mockRiskData: RiskAnalysisResult = {
    totalPortfolioValue: '100000.00',
    topHoldingPct: '22.50',
    topHoldingSymbol: 'AAPL',
    top5Pct: '68.00',
    diversificationScore: 78,
    diversificationRating: 'Strong',
    estimatedAnnualVolatility: '13.40%',
    assetClassCount: 4,
    positionCount: 8,
    topHoldings: [
      {
        instrumentId: 'inst-1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetClass: 'equity',
        value: '22500.00',
        percentage: '22.50',
      },
    ],
    assetClassBreakdown: [
      { assetClass: 'equity', value: '60000.00', percentage: '60.00' },
      { assetClass: 'fixed_income', value: '25000.00', percentage: '25.00' },
      { assetClass: 'crypto', value: '10000.00', percentage: '10.00' },
      { assetClass: 'cash', value: '5000.00', percentage: '5.00' },
    ],
    deterministicInsights: [
      {
        id: 'insight-1',
        type: 'success',
        title: 'Multi-Asset Spread',
        description: 'Portfolio distributed across 4 distinct asset classes.',
      },
    ],
  };

  it('renders risk stat cards, insights and concentration breakdown', () => {
    render(<RiskPanel riskData={mockRiskData} />);

    expect(screen.getByText('Diversification Score')).toBeInTheDocument();
    expect(screen.getByText('78/100 (Strong)')).toBeInTheDocument();

    expect(screen.getByText('Top 1 Concentration')).toBeInTheDocument();
    expect(screen.getAllByText('22.50%').length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('Top 5 Concentration')).toBeInTheDocument();
    expect(screen.getByText('68.00%')).toBeInTheDocument();

    expect(screen.getByText('Estimated Volatility')).toBeInTheDocument();
    expect(screen.getByText('13.40%')).toBeInTheDocument();

    expect(screen.getByText('Multi-Asset Spread')).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
  });
});
