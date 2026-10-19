import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { GainLossIndicator } from './GainLossIndicator';

describe('GainLossIndicator', () => {
  it('renders positive gain with TrendingUp icon and accessibility label', () => {
    render(<GainLossIndicator value={12.4} />);
    const indicator = screen.getByLabelText('Gain of 12.4%');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('text-gain');
    expect(screen.getByText('+12.40%')).toBeInTheDocument();
  });

  it('renders negative loss with TrendingDown icon', () => {
    render(<GainLossIndicator value={-5.8} />);
    const indicator = screen.getByLabelText('Loss of -5.8%');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('text-loss');
    expect(screen.getByText('-5.80%')).toBeInTheDocument();
  });
});
