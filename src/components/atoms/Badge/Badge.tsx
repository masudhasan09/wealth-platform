import React from 'react';
import { cn } from '@/lib/utils/cn';

const tones = {
  neutral: 'bg-surface-muted text-text-muted border-border',
  success: 'bg-success-muted text-success border-success',
  warning: 'bg-warning-muted text-warning border-warning',
  danger: 'bg-danger-muted text-danger border-danger',
  info: 'bg-info-muted text-info border-info',
} as const;

export type BadgeTone = keyof typeof tones;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

export function Badge({
  tone = 'neutral',
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        tones[tone],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full shrink-0',
            tone === 'neutral' && 'bg-text-muted',
            tone === 'success' && 'bg-success',
            tone === 'warning' && 'bg-warning',
            tone === 'danger' && 'bg-danger',
            tone === 'info' && 'bg-info'
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
