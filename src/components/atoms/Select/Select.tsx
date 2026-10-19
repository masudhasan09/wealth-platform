import React from 'react';
import { cn } from '@/lib/utils/cn';

const sizes = {
  sm: 'h-control-sm px-2.5 text-xs',
  md: 'h-control-md px-3 text-sm',
  lg: 'h-control-lg px-4 text-base',
} as const;

export type SelectSize = keyof typeof sizes;

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: SelectSize;
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ size = 'md', error = false, className, disabled, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          'w-full rounded-md border bg-surface text-text transition-colors appearance-none pr-8 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-focus-ring',
          error ? 'border-danger focus:border-danger' : 'border-border focus:border-primary',
          'disabled:bg-surface-muted disabled:text-text-disabled disabled:cursor-not-allowed',
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';
