import React from 'react';
import { CardHeader } from '@/components/molecules/CardHeader';
import { cn } from '@/lib/utils/cn';

export interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function DashboardSection({
  title,
  subtitle,
  action,
  className,
  children,
}: DashboardSectionProps) {
  return (
    <section
      aria-label={title}
      className={cn('bg-surface border border-border rounded-xl p-6 shadow-xs flex flex-col gap-5', className)}
    >
      <CardHeader title={title} subtitle={subtitle} action={action} className="mb-0" />
      <div>{children}</div>
    </section>
  );
}

