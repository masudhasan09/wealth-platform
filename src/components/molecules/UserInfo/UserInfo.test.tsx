import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserInfo } from './UserInfo';

describe('UserInfo', () => {
  it('renders user name and email', () => {
    render(<UserInfo name="Jane Doe" email="jane@example.com" />);
    expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('jane@example.com').length).toBeGreaterThan(0);
  });

  it('renders dropdown menu with Settings link and LogoutButton', () => {
    const logoutMock = vi.fn();
    render(<UserInfo name="Jane Doe" email="jane@example.com" logoutAction={logoutMock} />);

    expect(screen.getByRole('menuitem', { name: /Settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log out/i })).toBeInTheDocument();
  });

  it('closes dropdown when Escape key is pressed', () => {
    const { container } = render(<UserInfo name="Jane Doe" email="jane@example.com" />);
    const details = container.querySelector('details');
    expect(details).toBeInTheDocument();

    // Open details
    if (details) {
      details.open = true;
      expect(details.open).toBe(true);

      // Press Escape
      fireEvent.keyDown(details, { key: 'Escape', code: 'Escape' });
      expect(details.open).toBe(false);
    }
  });

  it('renders without dropdown when showDropdown is false', () => {
    const { container } = render(
      <UserInfo name="Jane Doe" email="jane@example.com" showDropdown={false} />
    );
    expect(container.querySelector('details')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });
});
