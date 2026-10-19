import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/atoms/Button';

describe('EmptyState', () => {
  it('renders title, description and action', () => {
    render(
      <EmptyState
        title="No transactions yet"
        description="Add your first trade or cash deposit."
        action={<Button>Add Transaction</Button>}
      />
    );
    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    expect(screen.getByText('Add your first trade or cash deposit.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add transaction/i })).toBeInTheDocument();
  });
});
