import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
}

export function Divider({
  orientation = 'horizontal',
  className,
  ...props
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn('inline-block w-px self-stretch bg-border', className)}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  return (
    <hr
      className={cn('w-full border-0 border-t border-border my-4', className)}
      role="separator"
      {...props}
    />
  );
}
