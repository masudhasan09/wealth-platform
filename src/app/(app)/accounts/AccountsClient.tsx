'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AccountList } from '@/components/organisms/accounts';
import { AccountForm } from '@/components/organisms/accounts';
import { Button } from '@/components/atoms/Button';
import { Heading } from '@/components/atoms/Heading';
import { Alert } from '@/components/molecules/Alert';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { createAccountAction, deleteAccountAction } from '@/app/actions/accounts';
import type { AccountViewModel } from '@/lib/view-models';
import type { AccountInput } from '@/lib/validation';

export interface AccountsClientProps {
  initialAccounts: AccountViewModel[];
}

export function AccountsClient({ initialAccounts }: AccountsClientProps) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<AccountViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [, startTransition] = useTransition();

  const handleCreate = async (values: AccountInput) => {
    setError(null);
    const result = await createAccountAction(values);
    if (result?.error) {
      setError(result.error);
    } else {
      setShowAddModal(false);
      startTransition(() => {
        router.refresh();
      });
    }
  };

  const handleDelete = async () => {
    if (!accountToDelete) return;
    setIsDeleting(true);
    setError(null);
    try {
      const result = await deleteAccountAction(accountToDelete.id);
      if (result?.error) {
        setError(result.error);
      } else {
        setAccountToDelete(null);
        startTransition(() => {
          router.refresh();
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <AccountList
        accounts={initialAccounts}
        onAddAccount={() => setShowAddModal(true)}
        onDeleteAccount={(acct) => setAccountToDelete(acct)}
      />

      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-account-dialog-title"
          data-modal-open="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-md"
        >
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <Heading id="add-account-dialog-title" level="h3">Add New Account</Heading>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
              >
                ✕
              </Button>
            </div>

            <AccountForm
              onSubmit={handleCreate}
              serverError={error}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(accountToDelete)}
        title="Remove Account"
        description={`Are you sure you want to remove "${accountToDelete?.name}"? If this account has past transactions, it will be closed to preserve your ledger audit trail.`}
        confirmLabel="Remove Account"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setAccountToDelete(null)}
      />
    </div>
  );
}
