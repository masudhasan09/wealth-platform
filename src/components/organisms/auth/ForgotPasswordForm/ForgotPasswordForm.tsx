'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Alert } from '@/components/molecules/Alert';
import { Text } from '@/components/atoms/Text';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validation';

export interface ForgotPasswordFormProps {
  onSubmit: (values: ForgotPasswordInput) => Promise<{ error?: string; resetUrl?: string; message?: string } | void> | void;
  isLoading?: boolean;
  serverError?: string | null;
  successResult?: { message: string; resetUrl?: string } | null;
}

export function ForgotPasswordForm({
  onSubmit,
  isLoading = false,
  serverError,
  successResult,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      const fieldErrors: { email?: string } = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as 'email';
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

  return (
    <div className="space-y-4">
      {serverError && (
        <Alert tone="danger" title="Request Failed">
          {serverError}
        </Alert>
      )}

      {successResult && (
        <Alert tone="success" title="Reset Link Generated">
          {successResult.message}
        </Alert>
      )}

      {successResult?.resetUrl ? (
        <div className="p-4 rounded-lg border border-border bg-surface-muted space-y-3">
          <Text variant="caption" tone="muted">
            Development Mode: Since an external email provider is not required for local use, your secure password reset link is ready below:
          </Text>
          <Link href={successResult.resetUrl} className="block w-full">
            <Button variant="primary" className="w-full justify-center">
              Reset Password Now →
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField
            label="Email Address"
            htmlFor="forgot-email"
            error={errors.email}
            required
            hint="Enter the email associated with your Multi-Asset Portfolio Tracking Platform account"
          >
            <Input
              id="forgot-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="e.g. demo@wealthtrack.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
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
            Send Password Reset Link
          </Button>
        </form>
      )}
    </div>
  );
}
