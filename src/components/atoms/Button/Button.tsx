import React from 'react';
import { cn } from '@/lib/utils/cn';

const variants = {
  primary:
    'bg-primary text-primary-foreground border border-primary hover:bg-primary-hover hover:border-primary-hover active:bg-primary-active shadow-sm hover:shadow-md',
  secondary:
    'bg-surface text-text border border-border hover:bg-surface-hover hover:border-border-strong active:bg-surface-active shadow-2xs',
  danger:
    'bg-danger text-danger-foreground border border-danger hover:bg-danger-hover hover:border-danger-hover active:bg-danger-hover shadow-sm hover:shadow-md',
  ghost:
    'bg-transparent text-text-muted border border-transparent hover:text-text hover:bg-surface-muted active:bg-surface-active',
} as const;

const sizes = {
  sm: 'h-control-sm px-3.5 text-xs rounded-lg',
  md: 'h-control-md px-4.5 text-sm rounded-xl',
  lg: 'h-control-lg px-6 text-base rounded-xl',
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 font-semibold tracking-tight transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading ? 'true' : undefined}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 current-color"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
