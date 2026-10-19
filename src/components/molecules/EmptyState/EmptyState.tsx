import React from 'react';
import { Icon } from '@/components/atoms/Icon';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/lib/utils/cn';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = 'Inbox',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'p-12 text-center rounded-lg border border-dashed border-border flex flex-col items-center justify-center',
        className
      )}
    >
      <div className="h-12 w-12 rounded-full bg-surface-muted flex items-center justify-center text-text-muted mb-4">
        <Icon name={icon} size="lg" aria-hidden="true" />
      </div>

      <Heading level="h3" size="h4" className="mb-1">
        {title}
      </Heading>

      {description && (
        <Text variant="body" tone="muted" className="max-w-md mb-6">
          {description}
        </Text>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}
