'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { EmptyState } from '@/components/molecules/EmptyState';

export interface ColumnDef<T> {
  id?: string;
  header: React.ReactNode;
  accessorKey?: keyof T;
  align?: 'left' | 'center' | 'right';
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyTitle = 'No records found',
  emptyDescription = 'There is currently no data to display.',
  emptyAction,
  footer,
  className,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className={cn('rounded-xl border border-border bg-surface p-6 shadow-xs', className)}>
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-border bg-surface shadow-xs', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              {columns.map((col, idx) => {
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left';
                return (
                  <th
                    key={col.id || (col.accessorKey ? String(col.accessorKey) : `col-${idx}`)}
                    scope="col"
                    className={cn(
                      'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap',
                      alignClass,
                      col.className
                    )}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-text">
            {data.map((item, rowIdx) => (
              <tr
                key={keyExtractor(item, rowIdx)}
                className="transition-colors hover:bg-surface-hover"
              >
                {columns.map((col, colIdx) => {
                  const alignClass =
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left';

                  const cellValue = col.render
                    ? col.render(item, rowIdx)
                    : col.accessorKey
                    ? String(item[col.accessorKey] ?? '')
                    : null;

                  return (
                    <td
                      key={col.id || (col.accessorKey ? String(col.accessorKey) : `cell-${colIdx}`)}
                      className={cn('px-4 py-3 whitespace-nowrap', alignClass, col.className)}
                    >
                      {cellValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer && (
        <div className="border-t border-border bg-surface-muted px-4 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}

