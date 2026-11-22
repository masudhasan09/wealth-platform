'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/templates';
import { ForgotPasswordForm } from '@/components/organisms/auth';
import { Text } from '@/components/atoms/Text';
import { requestPasswordResetAction } from '@/app/actions/auth';
import type { ForgotPasswordInput } from '@/lib/validation';

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    message: string;
    resetUrl?: string;
  } | null>(null);

  const handleRequest = async (values: ForgotPasswordInput) => {
    setError(null);
    setSuccessResult(null);
    const result = await requestPasswordResetAction(values);
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccessResult({
        message: result.message,
        resetUrl: result.resetUrl,
      });
    }
  };

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your email address to receive password reset instructions"
    >
      <ForgotPasswordForm
        onSubmit={handleRequest}
        serverError={error}
        successResult={successResult}
      />

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
    </AuthLayout>
  );
}
