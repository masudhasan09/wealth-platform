'use client';

import React, { useState } from 'react';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Alert } from '@/components/molecules/Alert';
import { registerSchema, type RegisterInput } from '@/lib/validation';

export interface RegisterFormProps {
  onSubmit: (values: RegisterInput) => Promise<{ error?: string } | void> | void;
  isLoading?: boolean;
  serverError?: string | null;
}

export function RegisterForm({
  onSubmit,
  isLoading = false,
  serverError,
}: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse({ name, email, password });
    if (!result.success) {
      const fieldErrors: { name?: string; email?: string; password?: string } = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as 'name' | 'email' | 'password';
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
        <Alert tone="danger" title="Registration failed">
          {serverError}
        </Alert>
      )}

      <FormField
        label="Full Name"
        htmlFor="reg-name"
        error={errors.name}
        required
      >
        <Input
          id="reg-name"
          type="text"
          name="name"
          autoComplete="name"
          placeholder="e.g. Alex Morgan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!errors.name}
          disabled={busy}
        />
      </FormField>

      <FormField
        label="Email Address"
        htmlFor="reg-email"
        error={errors.email}
        required
      >
        <Input
          id="reg-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="e.g. alex@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!errors.email}
          disabled={busy}
        />
      </FormField>

      <FormField
        label="Password"
        htmlFor="reg-password"
        hint="Must be at least 8 characters"
        error={errors.password}
        required
      >
        <Input
          id="reg-password"
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

      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full mt-2"
        loading={busy}
        disabled={busy}
      >
        Create Account
      </Button>
    </form>
  );
}
