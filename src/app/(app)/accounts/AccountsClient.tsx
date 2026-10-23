'use client';

import React, { useState } from 'react';
import { AccountList } from '@/components/organisms/accounts';
import { AccountForm } from '@/components/organisms/accounts';
import { Button } from '@/components/atoms/Button';
import { Heading } from '@/components/atoms/Heading';
import { createAccountAction } from '@/app/actions/accounts';
import type { AccountViewModel } from '@/lib/view-models';
import type { AccountInput } from '@/lib/validation';

export interface AccountsClientProps {
  initialAccounts: AccountViewModel[];
}

export function AccountsClient({ initialAccounts }: AccountsClientProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (values: AccountInput) => {
    setError(null);
    const result = await createAccountAction(values);
    if (result?.error) {
      setError(result.error);
    } else {
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <AccountList
        accounts={initialAccounts}
        onAddAccount={() => setShowAddModal(true)}
      />

      {showAddModal && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-overlay backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <Heading level="h3">Add New Account</Heading>
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
    </div>
  );
}

