import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaxLotTable, OpenTaxLotViewModel } from './TaxLotTable';

describe('TaxLotTable Organism', () => {
  it('renders empty message when no tax lots are provided', () => {
    render(<TaxLotTable lots={[]} />);
    expect(screen.getByText('No open tax lots')).toBeInTheDocument();
  });

  it('renders tax lots correctly with holding period and cost basis', () => {
    const mockLots: OpenTaxLotViewModel[] = [
      {
        id: 'lot-1',
        transactionId: 'tx-1',
        accountId: 'acc-1',
        accountName: 'Brokerage',
        instrumentId: 'inst-aapl',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        openDate: new Date('2024-01-15T00:00:00Z'),
        originalQuantity: '10.00000000',
        remainingQuantity: '10.00000000',
        costBasisPerUnit: '150.00',
        totalCostBasis: '1500.00',
        currentPrice: '180.00',
        currentValue: '1800.00',
        unrealizedGainLoss: '300.00',
        unrealizedGainLossPct: '20.00',
        term: 'long_term',
        holdingDays: 400,
      },
    ];

    render(<TaxLotTable lots={mockLots} />);

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('Brokerage')).toBeInTheDocument();
    expect(screen.getByText('Long-Term')).toBeInTheDocument();
    expect(screen.getByText('400d')).toBeInTheDocument();
  });
});
