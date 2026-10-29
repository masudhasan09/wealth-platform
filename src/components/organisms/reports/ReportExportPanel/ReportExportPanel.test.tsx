import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportExportPanel } from './ReportExportPanel';

describe('ReportExportPanel Organism', () => {
  const mockUser = { name: 'Demo User', email: 'demo@wealthtrack.dev' };
  const mockHoldings = [
    {
      accountId: 'acc-1',
      accountName: 'Brokerage',
      instrumentId: 'inst-1',
      symbol: 'AAPL',
      instrumentName: 'Apple Inc.',
      assetClass: 'equity',
      quantity: '10',
      averageCost: '150.00',
      totalCost: '1500.00',
      currentPrice: '180.00',
      currentValue: '1800.00',
    },
  ];
  const mockGains = {
    taxYear: 2025,
    shortTermProceeds: '0.00',
    shortTermCostBasis: '0.00',
    shortTermGain: '0.00',
    longTermProceeds: '1800.00',
    longTermCostBasis: '1000.00',
    longTermGain: '800.00',
    totalProceeds: '1800.00',
    totalCostBasis: '1000.00',
    totalGain: '800.00',
    lots: [],
  };

  it('renders report controls, disclaimer and holdings view', () => {
    render(
      <ReportExportPanel
        user={mockUser}
        holdings={mockHoldings}
        gainsSummary={mockGains}
        netWorthTotal="1800.00"
      />
    );

    expect(screen.getByText('Report Type:')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Print / Save PDF')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Valuation & Holdings Report')).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(
      screen.getByText(/For informational and educational purposes only/i)
    ).toBeInTheDocument();
  });
});
