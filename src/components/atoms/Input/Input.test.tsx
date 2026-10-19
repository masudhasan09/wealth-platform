import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Input } from './Input';

describe('Input', () => {
  it('renders input correctly', () => {
    render(<Input placeholder="Enter symbol" />);
    expect(screen.getByPlaceholderText('Enter symbol')).toBeInTheDocument();
  });

  it('renders disabled input', () => {
    render(<Input placeholder="Disabled" disabled />);
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  it('applies error state with aria-invalid', () => {
    render(<Input error placeholder="Error input" />);
    const input = screen.getByPlaceholderText('Error input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('border-danger');
  });
});
