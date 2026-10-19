import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  circle?: boolean;
}

export function Skeleton({ circle = false, className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-surface-muted',
        circle ? 'rounded-full' : 'rounded-md',
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
