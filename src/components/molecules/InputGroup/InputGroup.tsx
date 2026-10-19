import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputGroupProps {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function InputGroup({
  prefix,
  suffix,
  className,
  children,
}: InputGroupProps) {
  return (
    <div className={cn('relative flex items-center w-full', className)}>
      {prefix && (
        <div className="absolute left-3 z-10 flex items-center pointer-events-none text-text-muted text-sm font-medium">
          {prefix}
        </div>
      )}

      <div
        className={cn(
          'w-full',
          Boolean(prefix) ? '[&>input]:pl-8' : '',
          Boolean(suffix) ? '[&>input]:pr-8' : ''
        )}
      >
        {children}
      </div>

      {suffix && (
        <div className="absolute right-3 z-10 flex items-center pointer-events-none text-text-muted text-sm font-medium">
          {suffix}
        </div>
      )}
    </div>
  );
}
