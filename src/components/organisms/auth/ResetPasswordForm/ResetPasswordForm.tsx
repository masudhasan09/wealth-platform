'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Alert } from '@/components/molecules/Alert';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validation';

export interface ResetPasswordFormProps {
  token: string;
  onSubmit: (values: ResetPasswordInput) => Promise<{ error?: string } | void> | void;
  isLoading?: boolean;
  serverError?: string | null;
  success?: boolean;
}

export function ResetPasswordForm({
  token,
  onSubmit,
  isLoading = false,
  serverError,
  success = false,
}: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = resetPasswordSchema.safeParse({
      token,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: { password?: string; confirmPassword?: string } = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as 'password' | 'confirmPassword';
        if (path) fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(result.data);
    } finally {
      setSubmitting(false);
    }
  };

  const busy = isLoading || submitting;

  if (success) {
    return (
      <div className="space-y-4">
        <Alert tone="success" title="Password Reset Complete">
          Your password has been successfully updated. You can now log in with your new credentials.
        </Alert>

        <Link href="/login" className="block w-full">
          <Button variant="primary" className="w-full justify-center">
            Proceed to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {serverError && (
        <Alert tone="danger" title="Password Reset Failed">
          {serverError}
        </Alert>
      )}

      <FormField
        label="New Password"
        htmlFor="reset-password"
        error={errors.password}
        required
        hint="Must be at least 8 characters"
      >
        <Input
          id="reset-password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!errors.password}
          disabled={busy}
        />
      </FormField>

      <FormField
        label="Confirm New Password"
        htmlFor="reset-confirm-password"
        error={errors.confirmPassword}
        required
      >
        <Input
          id="reset-confirm-password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={!!errors.confirmPassword}
          disabled={busy}
        />
      </FormField>

      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full mt-2"
        loading={busy}
        disabled={busy}
      >
        Reset Password
      </Button>
    </form>
  );
}
