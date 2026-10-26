'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/atoms/Badge';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
}

export interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function Tabs({
  items,
  activeTab,
  onChange,
  className,
  size = 'md',
}: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Navigation Tabs"
      className={cn('inline-flex items-center gap-1 p-1 bg-surface-muted rounded-lg border border-border', className)}
    >
      {items.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center justify-center font-medium rounded-md transition-all cursor-pointer select-none',
              size === 'sm' ? 'h-control-sm px-3 text-xs' : 'h-control-md px-4 text-sm',
              isActive
                ? 'bg-surface text-primary shadow-xs font-semibold'
                : 'text-text-muted hover:text-text hover:bg-surface-hover'
            )}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <Badge
                tone={isActive ? 'info' : 'neutral'}
                className="ml-2 text-xs"
              >
                {tab.badge}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
