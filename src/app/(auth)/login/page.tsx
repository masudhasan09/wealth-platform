'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/templates';
import { LoginForm } from '@/components/organisms/auth';
import { Text } from '@/components/atoms/Text';
import { loginAction } from '@/app/actions/auth';
import type { LoginInput } from '@/lib/validation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (values: LoginInput) => {
    setError(null);
    const result = await loginAction(values);
    if (result?.error) {
      setError(result.error);
    } else {
      router.push('/accounts');
      router.refresh();
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your private wealth portfolio"
    >
      <LoginForm
        onSubmit={handleLogin}
        serverError={error}
      />

      <div className="mt-6 text-center">
        <Text variant="caption" tone="muted">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-primary hover:underline font-medium"
          >
            Create account
          </Link>
        </Text>
      </div>
    </AuthLayout>
  );
}

