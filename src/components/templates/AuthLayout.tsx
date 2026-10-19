import React from 'react';
import Link from 'next/link';
import { DisclaimerNotice } from '@/components/molecules/DisclaimerNotice';
import { cn } from '@/lib/utils/cn';

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  className,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 sm:p-8">
      <div className="flex justify-center pt-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center text-xl">
            W
          </div>
          <span className="font-bold text-2xl tracking-tight text-text">
            WealthTrack
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto my-8">
        <div
          className={cn(
            'p-8 rounded-xl border border-border bg-surface shadow-md',
            className
          )}
        >
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-text">{title}</h1>
            {subtitle && (
              <p className="text-sm text-text-muted mt-1">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>

      <div className="max-w-md mx-auto w-full pb-4 text-center">
        <DisclaimerNotice variant="compact" />
      </div>
    </div>
  );
}
