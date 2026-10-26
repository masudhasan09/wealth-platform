import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PropertyForm } from './PropertyForm';

describe('PropertyForm', () => {
  const accounts = [{ id: 'acc-1', name: 'Real Estate Account' }];

  it('renders all required form fields', () => {
    render(<PropertyForm accounts={accounts} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/Property Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Property Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Purchase Price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ownership Share/i)).toBeInTheDocument();
  });

  it('validates required fields before submitting', () => {
    const onSubmit = vi.fn();
    render(<PropertyForm accounts={accounts} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /Save Property/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/Property name must be at least 2 characters/i)).toBeInTheDocument();
  });

  it('submits valid data', () => {
    const onSubmit = vi.fn();
    render(<PropertyForm accounts={accounts} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Property Name/i), { target: { value: 'Austin Condo' } });
    fireEvent.change(screen.getByLabelText(/Property Address/i), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText(/Purchase Price/i), { target: { value: '350000' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Property/i }));
    expect(onSubmit).toHaveBeenCalledWith('acc-1', expect.objectContaining({
      name: 'Austin Condo',
      address: '123 Main St',
      purchasePrice: '350000',
    }));
  });
});
