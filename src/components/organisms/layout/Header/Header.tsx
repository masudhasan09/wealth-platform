'use client';

import React from 'react';
import { FreshnessBadge } from '@/components/molecules/FreshnessBadge';
import { SearchBox } from '@/components/molecules/SearchBox';
import { cn } from '@/lib/utils/cn';

export interface HeaderProps {
  lastUpdated?: Date | string;
  source?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function Header({
  lastUpdated = '2024-01-01T00:00:00.000Z',
  source = 'market cache',
  onSearch,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'h-16 border-b border-border bg-surface px-6 flex items-center justify-between gap-4 sticky top-0 z-20',
        className
      )}
    >
      <div className="w-72">
        <SearchBox
          placeholder="Search tickers, accounts..."
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <FreshnessBadge
          source={source}
          asOf={lastUpdated}
          method="market"
          freshness="delayed"
        />
      </div>
    </header>
  );
}
