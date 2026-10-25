'use client';

import React from 'react';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { MoneyText } from '@/components/atoms/MoneyText';
import { EmptyState } from '@/components/molecules/EmptyState';
import { CardHeader } from '@/components/molecules/CardHeader';
import type { AccountViewModel } from '@/lib/view-models';

export interface AccountListProps {
  accounts: AccountViewModel[];
  onAddAccount?: () => void;
  onSelectAccount?: (account: AccountViewModel) => void;
  onDeleteAccount?: (account: AccountViewModel) => void;
}

const typeLabels: Record<string, string> = {
  brokerage: 'Taxable Brokerage',
  retirement_401k: '401(k) Plan',
  ira: 'Traditional IRA',
  roth_ira: 'Roth IRA',
  hsa: 'HSA',
  bank: 'Bank Checking/Savings',
  crypto_wallet: 'Crypto Wallet',
  property: 'Real Estate',
};

export function AccountList({
  accounts,
  onAddAccount,
  onSelectAccount,
  onDeleteAccount,
}: AccountListProps) {
  if (accounts.length === 0) {
    return (
      <EmptyState
        title="No accounts registered"
        description="Add your first brokerage, bank, retirement, or crypto account to start tracking transactions and holdings."
        action={
          onAddAccount ? (
            <Button variant="primary" onClick={onAddAccount}>
              Add Account
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h3">Your Accounts</Heading>
          <Text variant="caption" tone="muted">
            {accounts.length} active financial {accounts.length === 1 ? 'account' : 'accounts'}
          </Text>
        </div>
        {onAddAccount && (
          <Button variant="primary" size="sm" onClick={onAddAccount}>
            + Add Account
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acct) => (
          <div
            key={acct.id}
            className="rounded-lg border border-border bg-surface p-5 shadow-xs hover:border-primary transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <CardHeader
                  title={acct.name}
                  subtitle={typeLabels[acct.type] || acct.type}
                  className="mb-0"
                />
                <Badge tone="neutral" className="uppercase text-xs font-semibold">
                  {acct.currency}
                </Badge>
              </div>

              {acct.description && (
                <Text variant="caption" tone="muted" className="mb-4 line-clamp-2">
                  {acct.description}
                </Text>
              )}
            </div>

            <div className="border-t border-border pt-4 mt-4 flex items-center justify-between">
              <div>
                <Text variant="caption" tone="muted">
                  Cash Balance
                </Text>
                <div className="text-lg font-bold text-text">
                  <MoneyText value={acct.cashBalance} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onSelectAccount && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onSelectAccount(acct)}
                  >
                    View
                  </Button>
                )}
                {onDeleteAccount && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:bg-danger-muted"
                    onClick={() => onDeleteAccount(acct)}
                    aria-label={`Remove ${acct.name}`}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

