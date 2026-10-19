import React from 'react';
import { formatDate, DateFormatOptions } from '@/lib/format/date';
import { cn } from '@/lib/utils/cn';

export interface DateTextProps extends React.HTMLAttributes<HTMLTimeElement> {
  value: Date | string | number | null | undefined;
  options?: DateFormatOptions;
}

export function DateText({
  value,
  options,
  className,
  ...props
}: DateTextProps) {
  const formatted = formatDate(value, options);
  const dateTimeStr =
    value instanceof Date
      ? value.toISOString()
      : typeof value === 'string' || typeof value === 'number'
      ? new Date(value).toISOString()
      : undefined;

  return (
    <time
      dateTime={dateTimeStr}
      className={cn('text-sm text-text-muted', className)}
      {...props}
    >
      {formatted}
    </time>
  );
}
