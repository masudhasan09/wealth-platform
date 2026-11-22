'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/templates';
import { ResetPasswordForm } from '@/components/organisms/auth';
import { Alert } from '@/components/molecules/Alert';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { resetPasswordAction } from '@/app/actions/auth';
import type { ResetPasswordInput } from '@/lib/validation';

export interface ResetPasswordClientProps {
  initialToken?: string;
}

export function ResetPasswordClient({ initialToken = '' }: ResetPasswordClientProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (values: ResetPasswordInput) => {
    setError(null);
    const result = await resetPasswordAction(values);
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(true);
    }
  };

  if (!initialToken) {
    return (
      <AuthLayout
        title="Invalid Reset Request"
        subtitle="Password reset requires a valid security token"
      >
        <div className="space-y-4">
          <Alert tone="danger" title="Missing Token">
            No valid password reset token was found in the link. Please request a new password reset link.
          </Alert>

          <Link href="/forgot-password" className="block w-full">
            <Button variant="primary" className="w-full justify-center">
              Request New Reset Link
            </Button>
          </Link>

          <div className="text-center pt-2">
            <Text variant="caption" tone="muted">
              <Link href="/login" className="text-primary hover:underline font-medium">
                Back to Sign In
              </Link>
            </Text>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Choose a secure password of at least 8 characters"
    >
      <ResetPasswordForm
        token={initialToken}
        onSubmit={handleReset}
        serverError={error}
        success={success}
      />

      {!success && (
        <div className="mt-6 text-center">
          <Text variant="caption" tone="muted">
            Remember your password?{' '}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Back to Sign In
            </Link>
          </Text>
        </div>
      )}
    </AuthLayout>
  );
}
