import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, disabled, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className={cn('inline-flex items-center gap-2 cursor-pointer', className)}>
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          className={cn(
            'h-4 w-4 rounded border border-border bg-surface text-primary cursor-pointer',
            'focus:ring-2 focus:ring-focus-ring focus:outline-none',
            error ? 'border-danger' : 'border-border',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium text-text select-none cursor-pointer',
              disabled && 'text-text-disabled cursor-not-allowed'
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
