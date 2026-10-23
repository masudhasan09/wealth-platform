import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VoidTransactionDialog } from './VoidTransactionDialog';
import type { TransactionViewModel } from '@/lib/view-models';

const mockTx: TransactionViewModel = {
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
};

describe('VoidTransactionDialog Organism', () => {
  it('renders confirmation text when open', () => {
    render(
      <VoidTransactionDialog
        transaction={mockTx}
        open={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: 'Void Transaction' })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to void this BUY transaction of AAPL/i)).toBeInTheDocument();
  });

  it('triggers onConfirm when confirmed', () => {
    const handleConfirm = vi.fn();
    render(
      <VoidTransactionDialog
        transaction={mockTx}
        open={true}
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />
    );

    const buttons = screen.getAllByRole('button', { name: /Void Transaction/i });
    fireEvent.click(buttons[buttons.length - 1]);
    expect(handleConfirm).toHaveBeenCalledWith(mockTx);
  });
});
