import React from 'react';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/lib/utils/cn';

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between pb-4 border-b border-border',
        className
      )}
    >
      <div>
        <Heading level="h3" size="h4">{title}</Heading>
        {subtitle && (
          <Text variant="caption" tone="muted" className="mt-0.5">
            {subtitle}
          </Text>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
