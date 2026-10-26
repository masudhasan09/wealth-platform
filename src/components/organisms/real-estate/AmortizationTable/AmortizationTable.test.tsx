import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AmortizationTable } from './AmortizationTable';

describe('AmortizationTable', () => {
  it('renders amortization table for loan', () => {
    render(
      <AmortizationTable
        principal="400000"
        annualInterestRatePct="6.0"
        termMonths={360}
        startDate="2024-01-01"
      />
    );

    expect(screen.getByText('Amortization Schedule')).toBeInTheDocument();
    expect(screen.getByText('Total Interest:')).toBeInTheDocument();
    expect(screen.getByText('Total Cost:')).toBeInTheDocument();
    expect(screen.getByText('Remaining Balance')).toBeInTheDocument();
  });

  it('navigates pagination correctly', () => {
    render(
      <AmortizationTable
        principal="400000"
        annualInterestRatePct="6.0"
        termMonths={360}
        startDate="2024-01-01"
      />
    );

    expect(screen.getByText(/Year 1 of 30/i)).toBeInTheDocument();
    const nextBtn = screen.getByRole('button', { name: /Next Year/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Year 2 of 30/i)).toBeInTheDocument();
  });
});
