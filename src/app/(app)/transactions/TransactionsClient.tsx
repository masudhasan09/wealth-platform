'use client';

import React, { useState, useMemo } from 'react';
import { TransactionTable, TransactionForm, VoidTransactionDialog } from '@/components/organisms/transactions';
import { SearchBox } from '@/components/molecules/SearchBox';
import { Button } from '@/components/atoms/Button';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { createTransactionAction, voidTransactionAction } from '@/app/actions/transactions';
import type { TransactionViewModel } from '@/lib/view-models';
import type { TransactionInput } from '@/lib/validation';

export interface TransactionsClientProps {
  initialTransactions: TransactionViewModel[];
  accounts: { id: string; name: string }[];
}

export function TransactionsClient({
  initialTransactions,
  accounts,
}: TransactionsClientProps) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [voidCandidate, setVoidCandidate] = useState<TransactionViewModel | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return initialTransactions;
    const q = search.toLowerCase();
    return initialTransactions.filter(
      (tx) =>
        tx.symbol.toLowerCase().includes(q) ||
        tx.instrumentName.toLowerCase().includes(q) ||
        tx.accountName.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q) ||
        (tx.note && tx.note.toLowerCase().includes(q))
    );
  }, [initialTransactions, search]);

  const handleCreate = async (values: TransactionInput) => {
    setFormError(null);
    const result = await createTransactionAction(values);
    if (result?.error) {
      setFormError(result.error);
    } else {
      setShowAddModal(false);
    }
  };

  const handleConfirmVoid = async (tx: TransactionViewModel) => {
    await voidTransactionAction({
      transactionId: tx.id,
      reason: 'Voided by user from transaction ledger',
    });
    setVoidCandidate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Heading level="h2">Transaction Ledger</Heading>
          <Text variant="caption" tone="muted">
            Immutable financial history across all asset classes and accounts
          </Text>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          disabled={accounts.length === 0}
        >
          + Record Transaction
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <SearchBox
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by symbol, account, or type..."
          className="max-w-md w-full"
        />
      </div>

      <TransactionTable
        transactions={filtered}
        onVoidTransaction={(tx) => setVoidCandidate(tx)}
        emptyAction={
          accounts.length > 0 ? (
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              Record First Transaction
            </Button>
          ) : undefined
        }
      />

      <VoidTransactionDialog
        open={!!voidCandidate}
        transaction={voidCandidate}
        onConfirm={handleConfirmVoid}
        onCancel={() => setVoidCandidate(null)}
      />

      {showAddModal && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-overlay backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-xl p-6 max-w-2xl w-full shadow-2xl animate-fade-in max-h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <Heading level="h3">Record Transaction</Heading>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
              >
                ✕
              </Button>
            </div>

            <TransactionForm
              accounts={accounts}
              onSubmit={handleCreate}
              serverError={formError}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
