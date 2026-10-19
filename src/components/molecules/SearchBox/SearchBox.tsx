'use client';

import React from 'react';
import { Icon } from '@/components/atoms/Icon';
import { Input, InputProps } from '@/components/atoms/Input';
import { cn } from '@/lib/utils/cn';

export interface SearchBoxProps extends Omit<InputProps, 'type'> {
  onClear?: () => void;
}

export const SearchBox = React.forwardRef<HTMLInputElement, SearchBoxProps>(
  ({ value, onChange, onClear, className, placeholder = 'Search...', ...props }, ref) => {
    const hasValue = Boolean(value);

    return (
      <div className={cn('relative w-full flex items-center', className)}>
        <span className="absolute left-3 text-text-muted pointer-events-none">
          <Icon name="Search" size="sm" aria-hidden="true" />
        </span>

        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="pl-9 pr-9"
          {...props}
        />

        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 text-text-muted hover:text-text cursor-pointer"
            aria-label="Clear search"
          >
            <Icon name="X" size="xs" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);

SearchBox.displayName = 'SearchBox';
