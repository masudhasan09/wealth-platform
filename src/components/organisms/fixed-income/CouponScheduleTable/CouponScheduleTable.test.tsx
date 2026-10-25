import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { CouponScheduleTable } from './CouponScheduleTable';
import type { BondModel } from '@/lib/finance/bonds';

const mockBond: BondModel = {
  id: 'bond-1',
  symbol: 'UST-2Y',
  name: 'US Treasury 4.0% 2026',
  faceValue: '1000',
  couponRate: '0.04',
  couponFrequency: 'semi_annual',
  maturityDate: '2026-01-01T00:00:00.000Z',
  issueDate: '2024-01-01T00:00:00.000Z',
};

describe('CouponScheduleTable Organism', () => {
  it('renders coupon schedule table headers and periods', () => {
    render(<CouponScheduleTable bond={mockBond} />);

    expect(screen.getByText('Period')).toBeInTheDocument();
    expect(screen.getByText('Payment Date')).toBeInTheDocument();
    expect(screen.getByText('Amount per Unit')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
  });
});
