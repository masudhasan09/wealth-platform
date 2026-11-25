import React from 'react';
import { CardHeader } from '@/components/molecules/CardHeader';
import { cn } from '@/lib/utils/cn';

export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  height?: number | string;
  className?: string;
  children: React.ReactNode;
}

export function ChartContainer({
  title,
  subtitle,
  action,
  height = 320,
  className,
  children,
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        'p-5 sm:p-6 rounded-xl border border-border bg-surface shadow-xs flex flex-col',
        className
      )}
    >
      <CardHeader title={title} subtitle={subtitle} action={action} className="mb-4" />
      <div
        style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}
        className="w-full flex-1 relative flex items-center justify-center"
      >
        {children}
      </div>
    </div>
  );
}
