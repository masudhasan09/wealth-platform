import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders label, formatted money value and gain indicator', () => {
    render(
      <StatCard
        label="Net Worth"
        value={1250000}
        change={4.2}
      />
    );
    expect(screen.getByText('Net Worth')).toBeInTheDocument();
    expect(screen.getByText('$1,250,000')).toBeInTheDocument();
    expect(screen.getByText('+4.20%')).toBeInTheDocument();
  });
});
