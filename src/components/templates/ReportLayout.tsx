import React from 'react';
import { DisclaimerNotice } from '@/components/molecules/DisclaimerNotice';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';

export interface ReportLayoutProps {
  title: string;
  generatedDate?: Date | string;
  user?: { name: string; email: string };
  className?: string;
  children: React.ReactNode;
}

export function ReportLayout({
  title,
  generatedDate = '2024-01-01',
  user = { name: 'Demo User', email: 'demo@wealthtrack.dev' },
  className,
  children,
}: ReportLayoutProps) {
  const asOf = typeof generatedDate === 'string' ? generatedDate : generatedDate.toLocaleDateString();

  return (
    <div className={cn('max-w-4xl mx-auto p-8 bg-surface text-text font-sans', className)}>
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <div>
          <Heading level="h1">{title}</Heading>
          <Text variant="caption" tone="muted" className="mt-1">
            Generated on {asOf} for {user.name} ({user.email})
          </Text>
        </div>

        <div className="no-print">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
          >
            <Icon name="Printer" size="sm" className="mr-1.5" />
            Print Report
          </Button>
        </div>
      </div>

      <div className="space-y-6">{children}</div>

      <div className="mt-12 pt-6 border-t border-border">
        <DisclaimerNotice variant="compact" />
      </div>
    </div>
  );
}
