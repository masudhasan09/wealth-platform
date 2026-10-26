import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { IncomeChart } from './IncomeChart';

const mockIncome = [
  { month: 'Jan', dividends: 250, interest: 50, coupons: 100, rent: 1500, total: 1900 },
  { month: 'Feb', dividends: 100, interest: 50, coupons: 0, rent: 1500, total: 1650 },
];

describe('IncomeChart Organism', () => {
  it('renders income chart with title and data', () => {
    render(<IncomeChart data={mockIncome} />);
    expect(screen.getByText('Income by Month')).toBeInTheDocument();
  });

  it('renders empty state when data is empty', () => {
    render(<IncomeChart data={[]} />);
    expect(screen.getByText('No income transactions recorded for this period.')).toBeInTheDocument();
  });
});
