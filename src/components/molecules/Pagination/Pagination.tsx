import React from 'react';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav
      aria-label="Pagination Navigation"
      className={cn('flex items-center justify-between gap-4 py-3', className)}
    >
      <Button
        variant="secondary"
        size="sm"
        disabled={!canPrev}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <Icon name="ChevronLeft" size="sm" className="mr-1" />
        Previous
      </Button>

      <Text variant="caption" tone="muted">
        Page <span className="font-semibold text-text">{page}</span> of{' '}
        <span className="font-semibold text-text">{Math.max(1, totalPages)}</span>
      </Text>

      <Button
        variant="secondary"
        size="sm"
        disabled={!canNext}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        Next
        <Icon name="ChevronRight" size="sm" className="ml-1" />
      </Button>
    </nav>
  );
}
