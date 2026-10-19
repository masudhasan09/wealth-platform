import React from 'react';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/lib/utils/cn';

export interface PageLayoutProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function PageLayout({
  title,
  description,
  actions,
  breadcrumbs,
  className,
  children,
}: PageLayoutProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {breadcrumbs && <div className="text-xs text-text-muted">{breadcrumbs}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Heading level="h1">{title}</Heading>
          {description && (
            <Text variant="body" tone="muted" className="mt-1">
              {description}
            </Text>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>

      <div>{children}</div>
    </div>
  );
}
