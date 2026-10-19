import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PercentText } from './PercentText';

describe('PercentText', () => {
  it('renders formatted percent and applies gain color', () => {
    render(<PercentText value={8.5} colored />);
    const el = screen.getByText('8.50%');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('text-gain');
  });

  it('applies loss color for negative', () => {
    render(<PercentText value={-3.2} colored />);
    const el = screen.getByText('-3.20%');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('text-loss');
  });
});
