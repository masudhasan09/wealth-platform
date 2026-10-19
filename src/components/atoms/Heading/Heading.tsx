import React from 'react';
import { cn } from '@/lib/utils/cn';

const sizes = {
  h1: 'text-3xl font-bold tracking-tight',
  h2: 'text-2xl font-bold tracking-tight',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-semibold',
} as const;

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type HeadingVisualSize = keyof typeof sizes;

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  size?: HeadingVisualSize;
}

export function Heading({
  level = 'h2',
  size,
  className,
  children,
  ...props
}: HeadingProps) {
  const Component = level;
  const visualSize = size || (level in sizes ? (level as HeadingVisualSize) : 'h4');

  return (
    <Component
      className={cn(sizes[visualSize], 'text-text', className)}
      {...props}
    >
      {children}
    </Component>
  );
}
