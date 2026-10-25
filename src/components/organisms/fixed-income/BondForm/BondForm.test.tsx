import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { BondForm } from './BondForm';

describe('BondForm Organism', () => {
  it('renders form fields with accessible labels and default values', () => {
    render(<BondForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/Bond Identifier \/ Symbol/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bond Description \/ Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bond Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Face \/ Par Value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Annual Coupon Rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Coupon Payment Frequency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Day-Count Convention/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Maturity Date/i)).toBeInTheDocument();
  });

  it('validates symbol, name, and maturity date before submitting', async () => {
    const handleSubmit = vi.fn();
    render(<BondForm onSubmit={handleSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /Save Bond Instrument/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/Bond symbol\/identifier is required/i)).toBeInTheDocument();
  });
});

