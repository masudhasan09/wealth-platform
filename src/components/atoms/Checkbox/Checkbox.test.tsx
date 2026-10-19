import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders with label and toggles', () => {
    render(<Checkbox label="I agree" />);
    expect(screen.getByRole('checkbox', { name: /i agree/i })).toBeInTheDocument();
  });

  it('renders disabled checkbox', () => {
    render(<Checkbox label="Locked" disabled />);
    expect(screen.getByRole('checkbox', { name: /locked/i })).toBeDisabled();
  });
});
