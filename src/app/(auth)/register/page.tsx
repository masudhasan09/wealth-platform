'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/templates';
import { RegisterForm } from '@/components/organisms/auth';
import { Text } from '@/components/atoms/Text';
import { registerAction } from '@/app/actions/auth';
import type { RegisterInput } from '@/lib/validation';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (values: RegisterInput) => {
    setError(null);
    const result = await registerAction(values);
    if (result?.error) {
      setError(result.error);
    } else {
      router.push('/accounts');
      router.refresh();
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start tracking multi-asset wealth and portfolio ledger"
    >
      <RegisterForm
        onSubmit={handleRegister}
        serverError={error}
      />

      <div className="mt-6 text-center">
        <Text variant="caption" tone="muted">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </Text>
      </div>
    </AuthLayout>
  );
}

