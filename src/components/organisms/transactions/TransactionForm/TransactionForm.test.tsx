import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionForm } from './TransactionForm';

const mockAccounts = [
  { id: 'acc-1', name: 'Brokerage' },
  { id: 'acc-2', name: 'IRA' },
];

describe('TransactionForm Organism', () => {
  it('renders form fields with accessible labels for trade transactions', () => {
    render(<TransactionForm accounts={mockAccounts} onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Transaction Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Transaction Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Asset Symbol/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Unit Price/i)).toBeInTheDocument();
  });

  it('validates symbol, quantity, and price on buy submission', async () => {
    const handleSubmit = vi.fn();
    render(<TransactionForm accounts={mockAccounts} onSubmit={handleSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /Record Transaction/i }));

    await waitFor(() => {
      expect(screen.getByText(/Symbol is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Quantity must be greater than zero/i)).toBeInTheDocument();
      expect(screen.getByText(/Price must be greater than zero/i)).toBeInTheDocument();
    });

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('switches to cash input mode when transaction type is deposit', async () => {
    render(<TransactionForm accounts={mockAccounts} onSubmit={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Transaction Type/i), {
      target: { value: 'deposit' },
    });

    expect(screen.getByLabelText(/Cash Amount/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Asset Symbol/i)).not.toBeInTheDocument();
  });
});

