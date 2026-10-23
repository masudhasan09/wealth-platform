'use client';

import React, { useState } from 'react';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Alert } from '@/components/molecules/Alert';
import { loginSchema, type LoginInput } from '@/lib/validation';

export interface LoginFormProps {
  onSubmit: (values: LoginInput) => Promise<{ error?: string } | void> | void;
  isLoading?: boolean;
  serverError?: string | null;
}

export function LoginForm({
  onSubmit,
  isLoading = false,
  serverError,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as 'email' | 'password';
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
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {serverError && (
        <Alert tone="danger" title="Sign in failed">
          {serverError}
        </Alert>
      )}

      <FormField
        label="Email Address"
        htmlFor="login-email"
        error={errors.email}
        required
      >
        <Input
          id="login-email"
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

      <FormField
        label="Password"
        htmlFor="login-password"
        error={errors.password}
        required
      >
        <Input
          id="login-password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!errors.password}
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
        Sign In
      </Button>
    </form>
  );
}
