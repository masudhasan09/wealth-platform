import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { MaturityLadder } from './MaturityLadder';
import type { BondHoldingItem } from '@/lib/finance/bonds';

const mockBonds: BondHoldingItem[] = [
  {
    symbol: 'UST-2Y',
    name: 'US Treasury 4.0% 2026',
    maturityDate: '2026-01-01T00:00:00.000Z',
    faceValue: '1000',
    marketPrice: '990',
    quantity: '5',
    couponRate: '0.04',
  },
];

describe('MaturityLadder Organism', () => {
  it('renders maturity ladder title and bucket table headers', () => {
    render(<MaturityLadder bonds={mockBonds} asOfDate="2024-01-01T00:00:00.000Z" />);

    expect(screen.getByText('Bond Maturity Ladder')).toBeInTheDocument();
    expect(screen.getByText('Maturity Bucket')).toBeInTheDocument();
    expect(screen.getByText('Holdings Count')).toBeInTheDocument();
    expect(screen.getByText('Total Face Value')).toBeInTheDocument();
    expect(screen.getByText('Market Value')).toBeInTheDocument();
    expect(screen.getByText('Projected Annual Income')).toBeInTheDocument();
    expect(screen.getByText('1 - 3 Years')).toBeInTheDocument();
  });
});
