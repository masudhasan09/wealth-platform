import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="h-16 w-16 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto text-3xl font-bold text-primary">
          404
        </div>
        <div>
          <Heading level="h2">Page Not Found</Heading>
          <Text variant="body" tone="muted" className="mt-2">
            The page you are looking for does not exist or has not been unlocked yet.
          </Text>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="primary">Back to Dashboard</Button>
          </Link>
          <Link href="/accounts">
            <Button variant="secondary">View Accounts</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

