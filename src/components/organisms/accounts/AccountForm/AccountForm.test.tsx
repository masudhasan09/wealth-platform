import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AccountForm } from './AccountForm';

describe('AccountForm Organism', () => {
  it('renders form with accessible fields and default values', () => {
    render(<AccountForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/Account Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Account Type/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('validates account name min length', async () => {
    const handleSubmit = vi.fn();
    render(<AccountForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/Account Name/i), {
      target: { value: 'A' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits valid account data', async () => {
    const handleSubmit = vi.fn();
    render(<AccountForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/Account Name/i), {
      target: { value: 'Roth IRA Vanguard' },
    });
    fireEvent.change(screen.getByLabelText(/Account Type/i), {
      target: { value: 'roth_ira' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'Roth IRA Vanguard',
        type: 'roth_ira',
        currency: 'USD',
        description: undefined,
      });
    });
  });
});

