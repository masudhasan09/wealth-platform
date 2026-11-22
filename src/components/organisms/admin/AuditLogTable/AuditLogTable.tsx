'use client';

import React from 'react';
import { DataTable, type ColumnDef } from '@/components/organisms/shared/DataTable';
import { DateText } from '@/components/atoms/DateText';
import { Badge } from '@/components/atoms/Badge';
import type { AuditEntry } from '../types';

export interface AuditLogTableProps {
  entries: AuditEntry[];
  className?: string;
}

export function AuditLogTable({ entries, className }: AuditLogTableProps) {
  const columns: ColumnDef<AuditEntry>[] = [
    {
      header: 'Timestamp',
      id: 'timestamp',
      render: (entry) => (
        <span className="font-mono text-xs text-text">
          <DateText value={entry.createdAt} />{' '}
          {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      ),
    },
    {
      header: 'Admin User',
      id: 'actor',
      render: (entry) => (
        <span className="font-medium text-text text-xs">
          {entry.actorEmail || entry.actorUserId}
        </span>
      ),
    },
    {
      header: 'Action',
      id: 'action',
      render: (entry) => {
        const actionTone =
          entry.action === 'save_key'
            ? 'success'
            : entry.action === 'remove_key'
            ? 'danger'
            : entry.action === 'test_connection'
            ? 'info'
            : 'neutral';

        return (
          <Badge tone={actionTone}>
            {entry.action.replace('_', ' ').toUpperCase()}
          </Badge>
        );
      },
    },
    {
      header: 'Target Resource',
      id: 'target',
      render: (entry) => (
        <span className="font-mono text-xs text-text-muted">
          {entry.target}
        </span>
      ),
    },
    {
      header: 'Details',
      id: 'metadata',
      render: (entry) => (
        <span className="font-mono text-xs text-text-muted truncate max-w-xs block">
          {entry.metadata ? String(entry.metadata) : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className={className}>
      <DataTable
        columns={columns}
        data={entries}
        keyExtractor={(e) => e.id}
        emptyTitle="No audit records"
        emptyDescription="Administrative changes to data sources will be logged here."
      />
    </div>
  );
}
