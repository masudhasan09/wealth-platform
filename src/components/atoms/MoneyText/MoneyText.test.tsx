import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MoneyText } from './MoneyText';

describe('MoneyText', () => {
  it('renders formatted currency', () => {
    render(<MoneyText value={150000} />);
    expect(screen.getByText('$150,000')).toBeInTheDocument();
  });
});
