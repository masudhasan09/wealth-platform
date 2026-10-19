import React from 'react';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';

export interface DisclaimerNoticeProps {
  className?: string;
  variant?: 'banner' | 'inline' | 'compact';
}

export const DISCLAIMER_TEXT =
  'For informational and educational purposes only. This platform does not provide investment, financial, legal, or tax advice, and does not execute trades or hold funds. Past performance is no guarantee of future results.';

export function DisclaimerNotice({
  className,
  variant = 'inline',
}: DisclaimerNoticeProps) {
  if (variant === 'compact') {
    return (
      <p className={cn('text-xs text-text-muted disclaimer', className)}>
        {DISCLAIMER_TEXT}
      </p>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        role="note"
        aria-label="Legal disclaimer"
        className={cn(
          'p-3 rounded-md bg-surface-muted border border-border flex items-start gap-2.5 text-xs text-text-muted disclaimer',
          className
        )}
      >
        <Icon name="ShieldAlert" size="sm" className="shrink-0 mt-0.5 text-text-muted" aria-hidden="true" />
        <span>{DISCLAIMER_TEXT}</span>
      </div>
    );
  }

  return (
    <footer
      role="contentinfo"
      aria-label="Financial disclaimer"
      className={cn('text-xs text-text-muted border-t border-border pt-4 pb-2 disclaimer', className)}
    >
      <p>{DISCLAIMER_TEXT}</p>
    </footer>
  );
}
