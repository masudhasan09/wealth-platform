import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { BondDetailsPanel } from './BondDetailsPanel';
import type { BondModel } from '@/lib/finance/bonds';

const mockBond: BondModel = {
  id: 'bond-1',
  symbol: 'UST-10Y',
  name: 'US Treasury 4.5% 2034',
  faceValue: '1000',
  couponRate: '0.045',
  couponFrequency: 'semi_annual',
  maturityDate: '2034-01-01T00:00:00.000Z',
  issueDate: '2024-01-01T00:00:00.000Z',
  dayCount: 'actual_actual',
  subType: 'treasury_note',
};

describe('BondDetailsPanel Organism', () => {
  it('renders bond header and stat cards with calculated yields and values', () => {
    render(
      <BondDetailsPanel
        bond={mockBond}
        currentPrice="980.00"
        asOfDate="2024-06-01T00:00:00.000Z"
      />
    );

    expect(screen.getByText('US Treasury 4.5% 2034')).toBeInTheDocument();
    expect(screen.getByText(/Symbol: UST-10Y/i)).toBeInTheDocument();
    expect(screen.getByText('Face / Par Value')).toBeInTheDocument();
    expect(screen.getByText('Current Price')).toBeInTheDocument();
    expect(screen.getByText('Accrued Interest')).toBeInTheDocument();
    expect(screen.getByText('Yield to Maturity (YTM)')).toBeInTheDocument();
  });
});

