import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { NavItem } from './NavItem';

describe('NavItem', () => {
  it('renders link with label and active aria-current', () => {
    render(<NavItem href="/dashboard" label="Dashboard" icon="LayoutDashboard" active />);
    const link = screen.getByRole('link', { name: /dashboard/i });
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveAttribute('href', '/dashboard');
    expect(link).toHaveClass('text-primary');
  });
});
