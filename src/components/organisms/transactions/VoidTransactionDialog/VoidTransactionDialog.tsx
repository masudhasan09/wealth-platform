'use client';

import React from 'react';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import type { TransactionViewModel } from '@/lib/view-models';

export interface VoidTransactionDialogProps {
  transaction: TransactionViewModel | null;
  open: boolean;
  onConfirm: (transaction: TransactionViewModel) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function VoidTransactionDialog({
  transaction,
  open,
  onConfirm,
  onCancel,
  isLoading = false,
}: VoidTransactionDialogProps) {
  if (!transaction) return null;

  const description = `Are you sure you want to void this ${transaction.type.toUpperCase()} transaction of ${
    transaction.symbol || 'Cash'
  } on ${transaction.date.split('T')[0]}? It will remain in ledger history for audit purposes, but will be excluded from all portfolio balance, holding, and gain calculations.`;

  return (
    <ConfirmDialog
      open={open}
      title="Void Transaction"
      description={description}
      confirmLabel="Void Transaction"
      cancelLabel="Cancel"
      variant="danger"
      loading={isLoading}
      onConfirm={() => onConfirm(transaction)}
      onCancel={onCancel}
    />
  );
}

