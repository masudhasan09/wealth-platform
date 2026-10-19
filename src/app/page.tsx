import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { CardHeader } from '@/components/molecules/CardHeader';
import { StatCard } from '@/components/molecules/StatCard';
import { DisclaimerNotice } from '@/components/molecules/DisclaimerNotice';
import { DashboardLayout } from '@/components/templates/DashboardLayout';

export default function HomePage() {
  return (
    <DashboardLayout currentPath="/dashboard">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Heading level="h1">Wealth Portfolio Overview</Heading>
            <Text variant="body" tone="muted" className="mt-1">
              Multi-asset tracking platform for equities, digital assets, fixed income, real estate, and cash.
            </Text>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dev/components">
              <Button variant="secondary">
                Component Gallery
              </Button>
            </Link>
            <Button variant="primary">
              Add Asset
            </Button>
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

        {/* Section */}
        <div className="p-6 rounded-lg border border-border bg-surface">
          <CardHeader
            title="Design System Status (Phase 0)"
            subtitle="Atomic Design architecture & Centralized Design Tokens"
          />
          <div className="mt-4 space-y-4">
            <Text variant="body">
              All 17 atoms and 18 molecules are built, verified with Vitest tests, and wired to centralized design tokens.
            </Text>
            <div className="flex gap-4">
              <Link href="/dev/components">
                <Button variant="primary" size="md">
                  View All Atoms & Molecules
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
