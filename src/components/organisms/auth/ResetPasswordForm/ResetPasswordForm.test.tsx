import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ResetPasswordForm } from './ResetPasswordForm';

describe('ResetPasswordForm Organism', () => {
  it('renders password and confirm password fields', () => {
    render(<ResetPasswordForm token="test-token" onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/^New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
  });

  it('validates password length and match', async () => {
    const handleSubmit = vi.fn();
    render(<ResetPasswordForm token="test-token" onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: 'mismatch' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() => {
      expect(screen.getByText(/Must be at least 8 characters/i)).toBeInTheDocument();
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits valid matched passwords', async () => {
    const handleSubmit = vi.fn();
    render(<ResetPasswordForm token="test-token" onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/^New Password/i), {
      target: { value: 'validPassword123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: 'validPassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        token: 'test-token',
        password: 'validPassword123',
        confirmPassword: 'validPassword123',
      });
    });
  });

  it('renders success message when success prop is true', () => {
    render(<ResetPasswordForm token="test-token" onSubmit={vi.fn()} success={true} />);

    expect(screen.getByText(/Password Reset Complete/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Proceed to Sign In/i })).toBeInTheDocument();
  });
});
