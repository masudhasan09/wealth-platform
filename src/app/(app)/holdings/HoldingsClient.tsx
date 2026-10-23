'use client';

import React from 'react';
import Link from 'next/link';
import { HoldingsTable } from '@/components/organisms/holdings';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/atoms/Button';
import { MoneyText } from '@/components/atoms/MoneyText';
import { CardHeader } from '@/components/molecules/CardHeader';
import type { HoldingViewModel, AccountViewModel } from '@/lib/view-models';

export interface HoldingsClientProps {
  holdings: HoldingViewModel[];
  accounts: AccountViewModel[];
}

export function HoldingsClient({ holdings, accounts }: HoldingsClientProps) {
  return (
    <div className="space-y-8">
      <div>
        <Heading level="h2">Portfolio Holdings</Heading>
        <Text variant="caption" tone="muted">
          Active positions and cash balances derived dynamically from transaction history
        </Text>
      </div>

      {/* Cash Balances Summary */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
        <CardHeader
          title="Cash Balances by Account"
          subtitle="Available uninvested cash tracked via deposits, withdrawals, trades, and dividends"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((acct) => (
            <div
              key={acct.id}
              className="p-4 rounded-lg border border-border bg-surface-subtle flex flex-col justify-between"
            >
              <Text variant="caption" tone="muted" className="font-medium truncate">
                {acct.name}
              </Text>
              <div className="text-xl font-bold text-text mt-1">
                <MoneyText value={acct.cashBalance} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Positions Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Heading level="h3">Asset Positions</Heading>
          <Link href="/transactions">
            <Button variant="secondary" size="sm">
              View Transactions
            </Button>
          </Link>
        </div>

        <HoldingsTable
          holdings={holdings}
          emptyAction={
            <Link href="/transactions">
              <Button variant="primary">Record Buy Transaction</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}

