import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ValuationHistory } from './ValuationHistory';

describe('ValuationHistory', () => {
  const records = [
    {
      id: 'v1',
      date: '2024-01-15',
      value: '500000',
      method: 'manual',
      note: 'Annual bank appraisal',
    },
    {
      id: 'v2',
      date: '2023-01-15',
      value: '450000',
      method: 'manual',
      note: 'Initial purchase appraisal',
    },
  ];

  it('renders valuation records table', () => {
    render(
      <ValuationHistory
        propertyId="prop-1"
        propertyName="Duplex"
        records={records}
        onAddMark={vi.fn()}
      />
    );

    expect(screen.getByText('Valuation & Appraisal History')).toBeInTheDocument();
    expect(screen.getByText('Annual bank appraisal')).toBeInTheDocument();
    expect(screen.getByText('Initial purchase appraisal')).toBeInTheDocument();
  });

  it('shows form when "+ Record New Appraisal" button is clicked', () => {
    render(
      <ValuationHistory
        propertyId="prop-1"
        propertyName="Duplex"
        records={records}
        onAddMark={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /\+ Record New Appraisal/i }));
    expect(screen.getByLabelText(/Appraised Value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Valuation Date/i)).toBeInTheDocument();
  });

  it('submits a new valuation mark', () => {
    const onAddMark = vi.fn();
    render(
      <ValuationHistory
        propertyId="prop-1"
        propertyName="Duplex"
        records={records}
        onAddMark={onAddMark}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /\+ Record New Appraisal/i }));
    fireEvent.change(screen.getByLabelText(/Appraised Value/i), { target: { value: '550000' } });
    fireEvent.change(screen.getByLabelText(/Notes/i), { target: { value: 'Refinance appraisal' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Valuation Mark/i }));

    expect(onAddMark).toHaveBeenCalledWith(
      'prop-1',
      expect.objectContaining({
        instrumentId: 'prop-1',
        value: '550000',
        note: 'Refinance appraisal',
      })
    );
  });
});
