import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FreshnessBadge } from './FreshnessBadge';

describe('FreshnessBadge', () => {
  it('renders source, method, and date in badge', () => {
    const d = new Date('2024-01-15T16:00:00Z');
    render(
      <FreshnessBadge
        source="finnhub"
        method="market"
        freshness="live"
        asOf={d}
      />
    );
    expect(screen.getByText(/FINNHUB • market/i)).toBeInTheDocument();
  });
});
