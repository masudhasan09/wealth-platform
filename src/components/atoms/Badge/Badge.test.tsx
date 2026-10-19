import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children with tone', () => {
    render(<Badge tone="success">Active</Badge>);
    const badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-success');
  });

  it('renders dot when specified', () => {
    const { container } = render(<Badge dot tone="warning">Pending</Badge>);
    expect(container.querySelector('.rounded-full.shrink-0')).toBeInTheDocument();
  });
});
