import React from 'react';
import { formatPercent, PercentFormatOptions } from '@/lib/format/percent';
import { cn } from '@/lib/utils/cn';

export interface PercentTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number | string | { toString: () => string } | null | undefined;
  options?: PercentFormatOptions;
  colored?: boolean;
}

export function PercentText({
  value,
  options,
  colored = false,
  className,
  ...props
}: PercentTextProps) {
  const formatted = formatPercent(value, options);
  const num = typeof value === 'number' ? value : Number(value?.toString() ?? 0);

  let colorClass = '';
  if (colored && !isNaN(num)) {
    if (num > 0) colorClass = 'text-gain';
    else if (num < 0) colorClass = 'text-loss';
    else colorClass = 'text-neutral-change';
  }

  return (
    <span
      className={cn('font-mono font-medium tabular-nums', colorClass, className)}
      {...props}
    >
      {formatted}
    </span>
  );
}
