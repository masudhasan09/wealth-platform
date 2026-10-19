import React from 'react';
import { cn } from '@/lib/utils/cn';

const sizes = {
  sm: 'h-control-sm text-xs',
  md: 'h-control-md text-sm',
  lg: 'h-control-lg text-base',
} as const;

export type FileInputSize = keyof typeof sizes;

export interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: FileInputSize;
  error?: boolean;
}

export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ size = 'md', error = false, className, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="file"
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          'w-full rounded-md border bg-surface text-text file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-muted file:text-primary hover:file:bg-surface-hover file:cursor-pointer transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-focus-ring',
          error ? 'border-danger focus:border-danger' : 'border-border focus:border-primary',
          'disabled:bg-surface-muted disabled:text-text-disabled disabled:cursor-not-allowed disabled:file:cursor-not-allowed',
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

FileInput.displayName = 'FileInput';
