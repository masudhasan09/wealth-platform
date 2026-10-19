import React from 'react';
import { Badge } from '@/components/atoms/Badge';
import { formatDate } from '@/lib/format/date';
import { cn } from '@/lib/utils/cn';

export type ValuationMethod = 'market' | 'model' | 'manual';
export type PriceFreshness = 'live' | 'delayed' | 'manual' | 'stale';

export interface FreshnessBadgeProps {
  source?: string;
  asOf: Date | string;
  method?: ValuationMethod;
  freshness?: PriceFreshness;
  className?: string;
}

export function FreshnessBadge({
  source = 'manual',
  asOf,
  method = 'manual',
  freshness = 'delayed',
  className,
}: FreshnessBadgeProps) {
  const asOfDate = new Date(asOf);
  const formattedDate = formatDate(asOfDate, { format: 'short', includeTime: true });

  const tone =
    freshness === 'live'
      ? 'success'
      : freshness === 'delayed'
      ? 'warning'
      : freshness === 'stale'
      ? 'danger'
      : 'neutral';

  const label = `${source.toUpperCase()} • ${method} (${formattedDate})`;

  return (
    <Badge
      tone={tone}
      dot
      className={cn('text-xs font-mono uppercase tracking-wider', className)}
      title={`Price source: ${source}, Method: ${method}, As of: ${formattedDate}`}
    >
      {label}
    </Badge>
  );
}
