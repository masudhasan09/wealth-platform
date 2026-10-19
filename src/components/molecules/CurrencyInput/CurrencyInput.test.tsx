import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CurrencyInput } from './CurrencyInput';

describe('CurrencyInput', () => {
  it('renders with currency symbol and code', () => {
    render(<CurrencyInput defaultValue="100.50" />);
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100.50')).toBeInTheDocument();
  });
});
