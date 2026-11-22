import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RealizedGainsReport } from './RealizedGainsReport';
import { RealizedGainsReportSummary } from '@/lib/finance/tax-lots';

describe('RealizedGainsReport Organism', () => {
  const mockSummary: RealizedGainsReportSummary = {
    taxYear: 2025,
    shortTermProceeds: '2000.00',
    shortTermCostBasis: '1750.00',
    shortTermGain: '250.00',
    longTermProceeds: '2900.00',
    longTermCostBasis: '1750.00',
    longTermGain: '1150.00',
    totalProceeds: '4900.00',
    totalCostBasis: '3500.00',
    totalGain: '1400.00',
    lots: [
      {
        id: 'realized-1',
        buyTransactionId: 'tx-b1',
        sellTransactionId: 'tx-s1',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        openDate: new Date('2024-01-10T10:00:00Z'),
        closeDate: new Date('2025-02-15T10:00:00Z'),
        quantity: '10.00000000',
        costBasis: '1000.00',
        proceeds: '1800.00',
        gainLoss: '800.00',
        term: 'long_term',
        holdingDays: 402,
      },
      {
        id: 'realized-2',
        buyTransactionId: 'tx-b2',
        sellTransactionId: 'tx-s1',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        openDate: new Date('2024-06-15T10:00:00Z'),
        closeDate: new Date('2025-02-15T10:00:00Z'),
        quantity: '5.00000000',
        costBasis: '750.00',
        proceeds: '900.00',
        gainLoss: '150.00',
        term: 'short_term',
        holdingDays: 245,
      },
    ],
  };

  it('renders summary stat cards with short-term, long-term and net gains', () => {
    render(<RealizedGainsReport summary={mockSummary} />);

    expect(screen.getByText('Net Realized Gain')).toBeInTheDocument();
    expect(screen.getByText('Short-Term Gains')).toBeInTheDocument();
    expect(screen.getByText('Long-Term Gains')).toBeInTheDocument();
    expect(screen.getAllByText('Gross Proceeds').length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('Long-Term')).toBeInTheDocument();
    expect(screen.getByText('Short-Term')).toBeInTheDocument();
    expect(screen.getByText('402d')).toBeInTheDocument();
    expect(screen.getByText('245d')).toBeInTheDocument();
  });

  it('renders empty message when no realized lots exist for year', () => {
    const emptySummary: RealizedGainsReportSummary = {
      taxYear: 2024,
      shortTermProceeds: '0.00',
      shortTermCostBasis: '0.00',
      shortTermGain: '0.00',
      longTermProceeds: '0.00',
      longTermCostBasis: '0.00',
      longTermGain: '0.00',
      totalProceeds: '0.00',
      totalCostBasis: '0.00',
      totalGain: '0.00',
      lots: [],
    };

    render(<RealizedGainsReport summary={emptySummary} selectedYear={2024} />);
    expect(
      screen.getByText('No realized gains for 2024')
    ).toBeInTheDocument();
  });
});
