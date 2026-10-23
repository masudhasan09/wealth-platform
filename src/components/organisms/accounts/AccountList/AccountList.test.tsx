import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AccountList } from './AccountList';
import type { AccountViewModel } from '@/lib/view-models';

const mockAccounts: AccountViewModel[] = [
  {
    id: 'acc-1',
    name: 'Fidelity Brokerage',
    type: 'brokerage',
    currency: 'USD',
    cashBalance: '15400.50',
    description: 'Primary trading account',
  },
  {
    id: 'acc-2',
    name: 'Vanguard Roth IRA',
    type: 'roth_ira',
    currency: 'USD',
    cashBalance: '3200.00',
  },
];

describe('AccountList Organism', () => {
  it('renders account cards with names, types, and cash balances', () => {
    render(<AccountList accounts={mockAccounts} />);

    expect(screen.getByText('Fidelity Brokerage')).toBeInTheDocument();
    expect(screen.getByText('Taxable Brokerage')).toBeInTheDocument();
    expect(screen.getByText('Vanguard Roth IRA')).toBeInTheDocument();
    expect(screen.getByText('Roth IRA')).toBeInTheDocument();
  });

  it('renders empty state when account list is empty', () => {
    const handleAdd = vi.fn();
    render(<AccountList accounts={[]} onAddAccount={handleAdd} />);

    expect(screen.getByText('No accounts registered')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /Add Account/i });
    fireEvent.click(btn);
    expect(handleAdd).toHaveBeenCalled();
  });
});

