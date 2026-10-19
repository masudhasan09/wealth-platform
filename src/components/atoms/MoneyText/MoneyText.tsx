import React from 'react';
import { formatMoney, MoneyFormatOptions } from '@/lib/format/money';
import { cn } from '@/lib/utils/cn';

export interface MoneyTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number | string | { toString: () => string } | null | undefined;
  options?: MoneyFormatOptions;
}

export function MoneyText({
  value,
  options,
  className,
  ...props
}: MoneyTextProps) {
  const formatted = formatMoney(value, options);

  return (
    <span
      className={cn('font-mono font-medium tabular-nums', className)}
      {...props}
    >
      {formatted}
    </span>
  );
}
