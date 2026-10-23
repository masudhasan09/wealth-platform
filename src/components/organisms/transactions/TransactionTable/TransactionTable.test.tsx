import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionTable } from './TransactionTable';
import type { TransactionViewModel } from '@/lib/view-models';

const mockTransactions: TransactionViewModel[] = [
  {
    id: 'tx-1',
    accountId: 'acc-1',
    accountName: 'Fidelity',
    instrumentId: 'inst-1',
    symbol: 'AAPL',
    instrumentName: 'Apple Inc.',
    type: 'buy',
    date: '2024-01-15T00:00:00.000Z',
    quantity: '10',
    price: '150.00',
    amount: '1500.00',
    fee: '0',
    isVoided: false,
  },
  {
    id: 'tx-2',
    accountId: 'acc-1',
    accountName: 'Fidelity',
    instrumentId: 'inst-cash',
    symbol: 'USD',
    instrumentName: 'US Dollar Cash',
    type: 'deposit',
    date: '2024-01-10T00:00:00.000Z',
    quantity: '0',
    price: '0',
    amount: '5000.00',
    fee: '0',
    isVoided: true,
    voidedReason: 'Duplicate entry',
  },
];

describe('TransactionTable Organism', () => {
  it('renders table headers and transaction rows', () => {
    render(<TransactionTable transactions={mockTransactions} />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Asset')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Voided')).toBeInTheDocument();
  });

  it('triggers onVoidTransaction when Void button is clicked', () => {
    const handleVoid = vi.fn();
    render(
      <TransactionTable
        transactions={mockTransactions}
        onVoidTransaction={handleVoid}
      />
    );

    const voidBtn = screen.getByRole('button', { name: /Void/i });
    fireEvent.click(voidBtn);
    expect(handleVoid).toHaveBeenCalledWith(mockTransactions[0]);
  });
});

