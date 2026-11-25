import React from 'react';
import { DisclaimerNotice } from '@/components/molecules/DisclaimerNotice';
import { cn } from '@/lib/utils/cn';

export interface FooterProps {
  year?: number;
  className?: string;
}

export function Footer({ year = 2025, className }: FooterProps) {
  return (
    <footer className={cn('mt-auto py-6 px-6 border-t border-border bg-surface', className)}>
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-2">
          <span>&copy; {year} Multi-Asset Portfolio Tracking Platform. All rights reserved.</span>
          <span>Multi-Asset Edition &bull; Read-Only Tracking</span>
        </div>
        <DisclaimerNotice variant="compact" />
      </div>
    </footer>
  );
}
