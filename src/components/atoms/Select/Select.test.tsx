import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Select } from './Select';

describe('Select', () => {
  it('renders options correctly', () => {
    render(
      <Select defaultValue="usd">
        <option value="usd">USD</option>
        <option value="eur">EUR</option>
      </Select>
    );
    expect(screen.getByRole('combobox')).toHaveValue('usd');
  });

  it('handles error state', () => {
    render(
      <Select error>
        <option value="a">A</option>
      </Select>
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });
});
