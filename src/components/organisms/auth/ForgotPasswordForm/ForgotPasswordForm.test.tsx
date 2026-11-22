import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ForgotPasswordForm } from './ForgotPasswordForm';

describe('ForgotPasswordForm Organism', () => {
  it('renders email input and submit button', () => {
    render(<ForgotPasswordForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Password Reset Link/i })).toBeInTheDocument();
  });

  it('validates email format before submitting', async () => {
    const handleSubmit = vi.fn();
    render(<ForgotPasswordForm onSubmit={handleSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /Send Password Reset Link/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with valid email', async () => {
    const handleSubmit = vi.fn();
    render(<ForgotPasswordForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'demo@wealthtrack.dev' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Send Password Reset Link/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'demo@wealthtrack.dev',
      });
    });
  });

  it('renders development mode link when resetUrl is provided', () => {
    render(
      <ForgotPasswordForm
        onSubmit={vi.fn()}
        successResult={{
          message: 'Reset link generated successfully.',
          resetUrl: '/reset-password?token=mock-token-123',
        }}
      />
    );

    expect(screen.getByText(/Reset link generated successfully/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password Now/i })).toBeInTheDocument();
  });
});
