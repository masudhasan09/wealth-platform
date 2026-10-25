import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FreshnessBadge } from './FreshnessBadge';

describe('FreshnessBadge', () => {
  it('renders Live for live variant', () => {
    render(<FreshnessBadge variant="live" />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('renders Delayed for delayed variant', () => {
    render(<FreshnessBadge variant="delayed" />);
    expect(screen.getByText('Delayed')).toBeInTheDocument();
  });

  it('renders Manual for manual variant', () => {
    render(<FreshnessBadge variant="manual" />);
    expect(screen.getByText('Manual')).toBeInTheDocument();
  });

  it('uses custom label when provided', () => {
    render(<FreshnessBadge variant="stale" label="3 days old" />);
    expect(screen.getByText('3 days old')).toBeInTheDocument();
  });
});

