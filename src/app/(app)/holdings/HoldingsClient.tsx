'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HoldingsTable } from '@/components/organisms/holdings';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { MoneyText } from '@/components/atoms/MoneyText';
import { CardHeader } from '@/components/molecules/CardHeader';
import { Alert } from '@/components/molecules/Alert';
import type { HoldingViewModel, AccountViewModel } from '@/lib/view-models';

export interface HoldingsClientProps {
  holdings: HoldingViewModel[];
  accounts: AccountViewModel[];
  ledgerWarning?: string | null;
}

const ASSET_CLASS_TABS = [
  { id: 'all', label: 'All Assets' },
  { id: 'equity', label: 'Equities' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'fixed_income', label: 'Fixed Income' },
  { id: 'real_estate', label: 'Real Estate' },
] as const;

export function HoldingsClient({
  holdings,
  accounts,
  ledgerWarning,
}: HoldingsClientProps) {
  const [selectedTab, setSelectedTab] = useState<string>('all');

  const filteredHoldings = holdings.filter((h) => {
    if (selectedTab === 'all') return true;
    return h.assetClass === selectedTab || h.assetClass.replace(/-/g, '_') === selectedTab;
  });

  return (
    <div className="space-y-8">
      <div>
        <Heading level="h2">Portfolio Holdings</Heading>
        <Text variant="caption" tone="muted">
          Active positions and cash balances across equities, digital assets, fixed income, and cash
        </Text>
      </div>

      {ledgerWarning && (
        <Alert tone="warning" title="Ledger Discrepancy Detected">
          {ledgerWarning}
        </Alert>
      )}

      {/* Cash Balances Summary */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
        <CardHeader
          title="Cash Balances by Account"
          subtitle="Available uninvested cash tracked via deposits, withdrawals, trades, coupons, and dividends"
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

      {/* Positions Table with Asset Class Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Heading level="h3">Asset Positions</Heading>
            <p className="text-xs text-text-muted mt-0.5">
              Showing {filteredHoldings.length} of {holdings.length} positions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/fixed-income">
              <Button variant="secondary" size="sm">
                Fixed Income Analytics
              </Button>
            </Link>
            <Link href="/transactions">
              <Button variant="secondary" size="sm">
                View Transactions
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
          {ASSET_CLASS_TABS.map((tab) => {
            const count = tab.id === 'all'
              ? holdings.length
              : holdings.filter((h) => h.assetClass === tab.id || h.assetClass.replace(/-/g, '_') === tab.id).length;
            const isSelected = selectedTab === tab.id;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-surface text-text-muted border-border hover:bg-surface-subtle hover:text-text'
                }`}
              >
                <span>{tab.label}</span>
                <Badge
                  tone={isSelected ? 'neutral' : 'neutral'}
                  className={`text-xs px-1.5 py-0 ${isSelected ? 'bg-primary-dark text-primary-foreground' : ''}`}
                >
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>

        <HoldingsTable
          holdings={filteredHoldings}
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
