import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}));

describe('Sidebar Component', () => {
  it('renders standard investor navigation routes in default investor mode', () => {
    render(<Sidebar adminOnly={false} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByText('Holdings')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.queryByText('Security & Data')).not.toBeInTheDocument();
  });

  it('strictly hides all investor routes and displays only admin routes when adminOnly is true', () => {
    render(<Sidebar adminOnly={true} />);

    expect(screen.getByText('Security & Data')).toBeInTheDocument();
    expect(screen.getByText('Data Sources & Keys')).toBeInTheDocument();

    // Investor links must NOT be rendered for admins
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Accounts')).not.toBeInTheDocument();
    expect(screen.queryByText('Holdings')).not.toBeInTheDocument();
    expect(screen.queryByText('Transactions')).not.toBeInTheDocument();
    expect(screen.queryByText('Net Worth')).not.toBeInTheDocument();
    expect(screen.queryByText('Tax & Gains')).not.toBeInTheDocument();
  });
});

