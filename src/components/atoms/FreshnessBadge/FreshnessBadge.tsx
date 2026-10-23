import React from 'react';
import { Badge } from '@/components/atoms/Badge';
import type { FreshnessVariant } from '@/lib/utils/freshness';

const variantConfig: Record<
  FreshnessVariant,
  { label: string; tone: 'success' | 'warning' | 'info' | 'danger' | 'neutral' }
> = {
  live: { label: 'Live', tone: 'success' },
  delayed: { label: 'Delayed', tone: 'warning' },
  manual: { label: 'Manual', tone: 'info' },
  stale: { label: 'Stale', tone: 'warning' },
  'very-stale': { label: 'Stale', tone: 'danger' },
};

export interface FreshnessBadgeProps {
  variant: FreshnessVariant;
  /** Optional override label, e.g. "3 days old". */
  label?: string;
  className?: string;
}

/**
 * FreshnessBadge — displays data freshness as a colour-coded badge.
 * - Live (green): quote age < 15 min
 * - Delayed (yellow): 15 min – 24 h
 * - Manual (blue): set by user
 * - Stale (yellow): > 24 h
 * - Very Stale (red): > 7 days
 */
export function FreshnessBadge({ variant, label, className }: FreshnessBadgeProps) {
  const cfg = variantConfig[variant];
  return (
    <Badge tone={cfg.tone} dot className={className}>
      {label ?? cfg.label}
    </Badge>
  );
}
