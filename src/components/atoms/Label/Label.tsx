import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ required = false, className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'block text-sm font-medium text-text select-none mb-1.5',
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-danger ml-1" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
