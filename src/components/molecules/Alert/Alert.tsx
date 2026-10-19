import React from 'react';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';

const tones = {
  neutral: {
    container: 'bg-surface-muted border-border text-text',
    icon: 'Info',
    iconColor: 'text-text-muted',
  },
  success: {
    container: 'bg-success-muted border-success text-success',
    icon: 'CheckCircle2',
    iconColor: 'text-success',
  },
  warning: {
    container: 'bg-warning-muted border-warning text-warning',
    icon: 'AlertTriangle',
    iconColor: 'text-warning',
  },
  danger: {
    container: 'bg-danger-muted border-danger text-danger',
    icon: 'AlertCircle',
    iconColor: 'text-danger',
  },
  info: {
    container: 'bg-info-muted border-info text-info',
    icon: 'Info',
    iconColor: 'text-info',
  },
} as const;

export type AlertTone = keyof typeof tones;

export interface AlertProps {
  tone?: AlertTone;
  title?: string;
  onDismiss?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function Alert({
  tone = 'info',
  title,
  onDismiss,
  className,
  children,
}: AlertProps) {
  const config = tones[tone];

  return (
    <div
      role="alert"
      className={cn(
        'p-4 rounded-lg border flex gap-3 text-sm items-start',
        config.container,
        className
      )}
    >
      <Icon
        name={config.icon}
        size="md"
        className={cn('shrink-0 mt-0.5', config.iconColor)}
        aria-hidden="true"
      />

      <div className="flex-1">
        {title && <p className="font-semibold mb-1 text-text">{title}</p>}
        <div className="text-text">{children}</div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-text-muted hover:text-text cursor-pointer p-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-focus-ring"
          aria-label="Dismiss alert"
        >
          <Icon name="X" size="sm" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
