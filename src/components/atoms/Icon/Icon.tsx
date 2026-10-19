import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const sizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
} as const;

export type IconSize = keyof typeof sizes;
export type IconName = keyof typeof LucideIcons;

export interface IconProps {
  name: string;
  size?: IconSize;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

export function Icon({
  name,
  size = 'md',
  className,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}: IconProps) {
  const IconComponent = (
    LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>
  )[name];

  if (!IconComponent) {
    // Fallback placeholder square
    return (
      <span
        className={cn('inline-block bg-surface-muted rounded-sm', sizes[size], className)}
        aria-hidden="true"
      />
    );
  }

  const isHidden = ariaHidden ?? (!ariaLabel ? 'true' : undefined);

  return (
    <IconComponent
      className={cn('inline-block shrink-0', sizes[size], className)}
      aria-label={ariaLabel}
      aria-hidden={isHidden}
    />
  );
}
