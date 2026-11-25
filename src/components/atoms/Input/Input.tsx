import React from 'react';
import { cn } from '@/lib/utils/cn';

const sizes = {
  sm: 'h-control-sm px-2.5 text-xs',
  md: 'h-control-md px-3 text-sm',
  lg: 'h-control-lg px-4 text-base',
} as const;

export type InputSize = keyof typeof sizes;

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'md', error = false, className, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          'w-full rounded-lg border bg-surface text-text placeholder:text-text-muted transition-all',
          'focus:outline-none focus:ring-2 focus:ring-focus-ring',
          error ? 'border-danger focus:border-danger' : 'border-border hover:border-border-strong focus:border-primary',
          'disabled:bg-surface-muted disabled:text-text-disabled disabled:cursor-not-allowed',
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
