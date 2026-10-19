import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error = false, className, disabled, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          'w-full min-h-20 p-3 rounded-md border bg-surface text-text placeholder:text-text-muted transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-focus-ring',
          error ? 'border-danger focus:border-danger' : 'border-border focus:border-primary',
          'disabled:bg-surface-muted disabled:text-text-disabled disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
