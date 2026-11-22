import React, { Suspense } from 'react';
import { ResetPasswordClient } from './ResetPasswordClient';

export const dynamic = 'force-dynamic';

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const resolvedParams = await searchParams;
  const token = typeof resolvedParams.token === 'string' ? resolvedParams.token : '';

  return (
    <Suspense>
      <ResetPasswordClient initialToken={token} />
    </Suspense>
  );
}
