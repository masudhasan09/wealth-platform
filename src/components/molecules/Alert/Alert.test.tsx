import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders alert message and title', () => {
    render(<Alert title="Attention" tone="warning">Check market data.</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Attention')).toBeInTheDocument();
    expect(screen.getByText('Check market data.')).toBeInTheDocument();
  });

  it('calls onDismiss when close button clicked', () => {
    const handleDismiss = vi.fn();
    render(<Alert onDismiss={handleDismiss}>Dismissible notice</Alert>);
    const closeBtn = screen.getByLabelText('Dismiss alert');
    fireEvent.click(closeBtn);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});
