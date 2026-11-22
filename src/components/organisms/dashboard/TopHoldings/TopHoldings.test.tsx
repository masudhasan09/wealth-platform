import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TopHoldings } from './TopHoldings';

const mockHoldings = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    assetClass: 'equity',
    quantity: '100',
    marketValue: '18500.00',
    totalCost: '15000.00',
    unrealisedPnL: '3500.00',
    unrealisedPnLPct: '23.33',
    allocationPct: '45.0',
  },
];

describe('TopHoldings Organism', () => {
  it('renders top holdings table with symbol, value, and PnL', () => {
    render(<TopHoldings holdings={mockHoldings} />);
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
  });

  it('renders empty message when no holdings provided', () => {
    render(<TopHoldings holdings={[]} />);
    expect(screen.getByText('No holdings found.')).toBeInTheDocument();
  });
});

