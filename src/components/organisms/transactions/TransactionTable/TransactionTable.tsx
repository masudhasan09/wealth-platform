'use client';

import React from 'react';
import { DataTable, type ColumnDef } from '@/components/organisms/shared/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { MoneyText } from '@/components/atoms/MoneyText';
import { DateText } from '@/components/atoms/DateText';
import type { TransactionViewModel } from '@/lib/view-models';

export interface TransactionTableProps {
  transactions: TransactionViewModel[];
  onVoidTransaction?: (transaction: TransactionViewModel) => void;
  emptyAction?: React.ReactNode;
}

const typeTones: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  buy: 'success',
  deposit: 'success',
  sell: 'warning',
  withdrawal: 'danger',
  dividend: 'info',
  interest: 'info',
  fee: 'neutral',
};

export function TransactionTable({
  transactions,
  onVoidTransaction,
  emptyAction,
}: TransactionTableProps) {
  const columns: ColumnDef<TransactionViewModel>[] = [
    {
      header: 'Date',
      id: 'date',
      render: (tx) => (
        <span className="font-mono text-xs">
          <DateText value={new Date(tx.date)} />
        </span>
      ),
    },
    {
      header: 'Type',
      id: 'type',
      render: (tx) => (
        <Badge tone={typeTones[tx.type] || 'neutral'} className="uppercase text-xs font-semibold">
          {tx.type}
        </Badge>
      ),
    },
    {
      header: 'Account',
      accessorKey: 'accountName',
      id: 'account',
    },
    {
      header: 'Asset',
      id: 'asset',
      render: (tx) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text">{tx.symbol || 'USD'}</span>
          {tx.instrumentName && tx.instrumentName !== tx.symbol && (
            <span className="text-xs text-text-muted truncate max-w-xs">{tx.instrumentName}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Quantity',
      id: 'quantity',
      align: 'right',
      render: (tx) => {
        const qty = parseFloat(tx.quantity);
        return qty > 0 ? (
          <span className="font-mono text-text">{tx.quantity}</span>
        ) : (
          <span className="text-text-muted">—</span>
        );
      },
    },
    {
      header: 'Price',
      id: 'price',
      align: 'right',
      render: (tx) => {
        const prc = parseFloat(tx.price);
        return prc > 0 ? (
          <span className="font-mono text-text">
            <MoneyText value={tx.price} />
          </span>
        ) : (
          <span className="text-text-muted">—</span>
        );
      },
    },
    {
      header: 'Amount',
      id: 'amount',
      align: 'right',
      render: (tx) => (
        <span className="font-mono font-semibold text-text">
          <MoneyText value={tx.amount} />
        </span>
      ),
    },
    {
      header: 'Status',
      id: 'status',
      render: (tx) =>
        tx.isVoided ? (
          <Badge tone="danger" title={tx.voidedReason || 'Voided'}>
            Voided
          </Badge>
        ) : (
          <Badge tone="neutral">Active</Badge>
        ),
    },
    {
      header: 'Actions',
      id: 'actions',
      align: 'right',
      render: (tx) =>
        !tx.isVoided && onVoidTransaction ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVoidTransaction(tx)}
            className="text-danger hover:text-danger hover:bg-danger-muted"
          >
            Void
          </Button>
        ) : null,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={transactions}
      keyExtractor={(tx) => tx.id}
      emptyTitle="No transactions recorded"
      emptyDescription="Record your first deposit, buy, sell, or dividend transaction to build your ledger."
      emptyAction={emptyAction}
    />
  );
}

