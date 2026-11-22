import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LogoutButton, SubmitButton } from './LogoutButton';

// Mock react-dom useFormStatus
vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return {
    ...actual,
    useFormStatus: vi.fn(() => ({ pending: false, data: null, method: null, action: null })),
  };
});

describe('LogoutButton', () => {
  it('renders with Log out label and button atom', () => {
    render(<LogoutButton />);
    const button = screen.getByRole('button', { name: /Log out/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('honors the disabled prop to prevent submission', () => {
    render(<LogoutButton disabled />);
    const button = screen.getByRole('button', { name: /Log out/i });
    expect(button).toBeDisabled();
  });

  it('invokes form submission action when clicked', () => {
    const actionMock = vi.fn();
    render(<LogoutButton action={actionMock} />);
    const button = screen.getByRole('button', { name: /Log out/i });
    fireEvent.click(button);
    expect(actionMock).toHaveBeenCalled();
  });

  it('renders loading state and disables button when pending is true', async () => {
    const { useFormStatus } = await import('react-dom');
    vi.mocked(useFormStatus).mockReturnValueOnce({
      pending: true,
      data: new FormData(),
      method: 'POST',
      action: '/mock-action',
    });

    render(<SubmitButton />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(/Loading\.\.\./i);
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
