import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HoldingsTable } from './HoldingsTable';
import type { HoldingViewModel } from '@/lib/view-models';

const mockHoldings: HoldingViewModel[] = [
  {
    accountId: 'acc-1',
    accountName: 'Fidelity Brokerage',
    instrumentId: 'inst-1',
    symbol: 'AAPL',
    instrumentName: 'Apple Inc.',
    assetClass: 'equity',
    quantity: '20',
    averageCost: '110.00',
    totalCost: '2200.00',
  },
];

describe('HoldingsTable Organism', () => {
  it('renders holdings columns with account, asset, class, quantity, average cost, and total cost', () => {
    render(<HoldingsTable holdings={mockHoldings} />);

    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Asset')).toBeInTheDocument();
    expect(screen.getByText('Asset Class')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Average Cost Basis')).toBeInTheDocument();
    expect(screen.getByText('Total Cost Basis')).toBeInTheDocument();
    expect(screen.getByText('Fidelity Brokerage')).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Equity')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('renders empty state when holdings is empty', () => {
    render(<HoldingsTable holdings={[]} />);
    expect(screen.getByText('No holdings currently held')).toBeInTheDocument();
  });
});

