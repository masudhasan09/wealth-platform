import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Label } from './Label';

describe('Label', () => {
  it('renders text with children', () => {
    render(<Label htmlFor="symbol">Symbol</Label>);
    expect(screen.getByText('Symbol')).toBeInTheDocument();
  });

  it('renders required asterisk', () => {
    render(<Label required>Password</Label>);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
