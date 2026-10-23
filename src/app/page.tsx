import React from 'react';
import Link from 'next/link';
import { auth } from '@/auth';
import { Button } from '@/components/atoms/Button';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { CardHeader } from '@/components/molecules/CardHeader';
import { StatCard } from '@/components/molecules/StatCard';
import { DisclaimerNotice } from '@/components/molecules/DisclaimerNotice';
import { DashboardLayout } from '@/components/templates';

export default async function HomePage() {
  const session = await auth();

  return (
    <DashboardLayout
      currentPath="/dashboard"
      user={
        session?.user
          ? {
              name: session.user.name || 'User',
              email: session.user.email || '',
            }
          : undefined
      }
    >
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Heading level="h1">Wealth Portfolio Overview</Heading>
            <Text variant="body" tone="muted" className="mt-1">
              Multi-asset tracking platform for equities, digital assets, fixed income, real estate, and cash.
            </Text>
          </div>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <Link href="/transactions">
                  <Button variant="secondary">View Ledger</Button>
                </Link>
                <Link href="/accounts">
                  <Button variant="primary">Manage Accounts</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary">Create Account</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* High-level stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Net Worth"
            value={1284500}
            change={5.2}
            helperText="vs. last month"
          />
          <StatCard
            label="Equities & ETFs"
            value={642000}
            change={8.1}
            helperText="50% allocation"
          />
          <StatCard
            label="Digital Assets"
            value={142500}
            change={-3.4}
            helperText="11% allocation"
          />
          <StatCard
            label="Real Estate Equity"
            value={500000}
            change={1.2}
            helperText="39% allocation"
          />
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border border-border bg-surface flex flex-col justify-between">
            <div>
              <CardHeader
                title="Accounts"
                subtitle="Brokerage, retirement, bank, crypto, and real estate"
              />
              <Text variant="caption" tone="muted" className="mt-2">
                Manage all accounts and cash balances across multiple custodians.
              </Text>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Link href="/accounts">
                <Button variant="secondary" size="sm" className="w-full">
                  Go to Accounts →
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface flex flex-col justify-between">
            <div>
              <CardHeader
                title="Transaction Ledger"
                subtitle="Double-entry immutable audit trail"
              />
              <Text variant="caption" tone="muted" className="mt-2">
                Record buys, sells, deposits, withdrawals, dividends, and interest with voiding capability.
              </Text>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Link href="/transactions">
                <Button variant="secondary" size="sm" className="w-full">
                  Go to Ledger →
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface flex flex-col justify-between">
            <div>
              <CardHeader
                title="Holdings & Cost Basis"
                subtitle="Dynamically derived positions"
              />
              <Text variant="caption" tone="muted" className="mt-2">
                View average cost basis, total cost, and uninvested cash per account.
              </Text>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Link href="/holdings">
                <Button variant="secondary" size="sm" className="w-full">
                  Go to Holdings →
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <DisclaimerNotice variant="banner" />
      </div>
    </DashboardLayout>
  );
}
