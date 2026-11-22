import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MortgagePanel } from './MortgagePanel';

describe('MortgagePanel', () => {
  it('renders unencumbered state when no mortgage is attached', () => {
    render(
      <MortgagePanel
        propertyId="prop-1"
        propertyValue="500000"
        ownershipPct={1.0}
        mortgage={null}
      />
    );

    expect(screen.getByText('Unencumbered')).toBeInTheDocument();
    expect(screen.getByText('Net Equity')).toBeInTheDocument();
  });

  it('renders mortgage details when provided', () => {
    const mortgage = {
      id: 'm1',
      name: 'Primary Mortgage',
      principal: '400000',
      rate: '0.06',
      termMonths: 360,
      startDate: '2024-01-01',
      outstandingBalance: '395000',
    };

    render(
      <MortgagePanel
        propertyId="prop-1"
        propertyValue="500000"
        ownershipPct={1.0}
        mortgage={mortgage}
      />
    );

    expect(screen.getByText('Primary Mortgage')).toBeInTheDocument();
    expect(screen.getByText('6.00% Fixed')).toBeInTheDocument();
    expect(screen.getByText(/30 Years/i)).toBeInTheDocument();
  });

  it('allows opening mortgage creation form', () => {
    const accounts = [{ id: 'acc-1', name: 'Liability Account' }];
    const onAddMortgage = vi.fn();

    render(
      <MortgagePanel
        propertyId="prop-1"
        propertyValue="500000"
        ownershipPct={1.0}
        mortgage={null}
        accounts={accounts}
        onAddMortgage={onAddMortgage}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /\+ Link Mortgage/i }));
    expect(screen.getByLabelText(/Mortgage \/ Lender Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Loan Amount \/ Principal/i)).toBeInTheDocument();
  });
});
