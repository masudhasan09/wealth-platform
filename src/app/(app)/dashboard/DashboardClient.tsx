'use client';

import React from 'react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/atoms/Button';
import { StatCard } from '@/components/molecules/StatCard';
import { ChartContainer } from '@/components/molecules/ChartContainer';
import { DisclaimerNotice } from '@/components/molecules/DisclaimerNotice';
import {
  DashboardSection,
  AllocationChart,
  IncomeChart,
  TopHoldings,
  PerformancePanel,
  type AllocationItem,
  type MonthlyIncomeItem,
  type TopHoldingItem,
} from '@/components/organisms/dashboard';

export interface SnapshotPoint {
  date: string;
  value: number;
}

export interface DashboardClientProps {
  user: { name: string; email: string };
  totalNetWorth: number;
  totalCash: number;
  equitiesVal: number;
  cryptoVal: number;
  fixedIncomeVal: number;
  realEstateVal: number;
  accountsCount: number;
  snapshots: SnapshotPoint[];
  assetClassAllocation: AllocationItem[];
  accountTypeAllocation: AllocationItem[];
  incomeData: MonthlyIncomeItem[];
  topHoldings: TopHoldingItem[];
  performance: {
    twrPct: number;
    mwrPct: number;
    liquidReturnPct: number;
    appraisedReturnPct: number;
  };
}

function formatPreciseCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function DashboardClient({
  user,
  totalNetWorth,
  totalCash,
  equitiesVal,
  cryptoVal,
  fixedIncomeVal,
  realEstateVal,
  accountsCount,
  snapshots,
  assetClassAllocation,
  accountTypeAllocation,
  incomeData,
  topHoldings,
  performance,
}: DashboardClientProps) {
  const totalPositiveAssets =
    Math.max(0, equitiesVal) +
    Math.max(0, cryptoVal) +
    Math.max(0, fixedIncomeVal) +
    Math.max(0, realEstateVal) +
    Math.max(0, totalCash);

  // Net Worth Trend Data — only real recorded snapshots are plotted. A single
  // snapshot renders as one point; with none, the chart shows today's valuation.
  const trendData: SnapshotPoint[] =
    snapshots.length > 0 ? snapshots : [{ date: 'Today', value: totalNetWorth }];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Heading level="h1">Dashboard Overview</Heading>
          <Text variant="body" tone="muted" className="mt-1">
            Welcome back, {user.name || 'Investor'}. Comprehensive real-time view across all 5 asset classes.
          </Text>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/transactions">
            <Button variant="secondary">View Ledger</Button>
          </Link>
          <Link href="/accounts">
            <Button variant="primary">Manage Accounts</Button>
          </Link>
        </div>
      </div>

      {/* High-Level Stat Cards Across All 5 Asset Classes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <StatCard
          label="Total Net Worth"
          value={totalNetWorth}
          helperText={totalNetWorth !== 0 ? 'Assets minus Debt' : 'Add accounts & data'}
        />
        <StatCard
          label="Cash & Reserves"
          value={totalCash}
          helperText={`${accountsCount} active account${accountsCount === 1 ? '' : 's'}`}
        />
        <StatCard
          label="Equities & ETFs"
          value={equitiesVal}
          helperText={
            totalPositiveAssets > 0
              ? `${((equitiesVal / totalPositiveAssets) * 100).toFixed(1)}%`
              : '0%'
          }
        />
        <StatCard
          label="Digital Assets"
          value={cryptoVal}
          helperText={
            totalPositiveAssets > 0
              ? `${((cryptoVal / totalPositiveAssets) * 100).toFixed(1)}%`
              : '0%'
          }
        />
        <StatCard
          label="Fixed Income"
          value={fixedIncomeVal}
          helperText={
            totalPositiveAssets > 0
              ? `${((fixedIncomeVal / totalPositiveAssets) * 100).toFixed(1)}%`
              : '0%'
          }
        />
        <StatCard
          label="Real Estate (Net)"
          value={realEstateVal}
          helperText={
            totalPositiveAssets > 0
              ? `${((realEstateVal / totalPositiveAssets) * 100).toFixed(1)}%`
              : '0%'
          }
        />
      </div>

      {/* Section 1: Portfolio Performance Panel (TWR & MWR) */}
      <DashboardSection
        title="Portfolio Performance"
        subtitle="Time-Weighted Return (TWR) and Money-Weighted Return (MWR / XIRR) with appraisal smoothing isolation"
      >
        <PerformancePanel
          twrPct={performance.twrPct}
          mwrPct={performance.mwrPct}
          liquidReturnPct={performance.liquidReturnPct}
          appraisedReturnPct={performance.appraisedReturnPct}
        />
      </DashboardSection>

      {/* Section 2: Net Worth Trajectory AreaChart */}
      <DashboardSection
        title="Net Worth Trajectory"
        subtitle="Historical portfolio valuation trajectory over time"
        action={
          <Link href="/net-worth">
            <Button variant="secondary" size="sm">
              Detailed History →
            </Button>
          </Link>
        }
      >
        <ChartContainer
          title=""
          subtitle=""
          height={320}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="dashboardNetWorthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                formatter={(v) => {
                  const num = typeof v === 'number' ? v : parseFloat(String(v ?? 0));
                  return [formatPreciseCurrency(num), 'Net Worth'];
                }}
                contentStyle={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: 'var(--color-text)',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#dashboardNetWorthGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </DashboardSection>

      {/* Section 3 & 4: Asset Allocation (Donut) & Income By Month (Stacked Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSection
          title="Portfolio Allocation"
          subtitle="Unified allocation with toggle for Asset Class or Account Type"
        >
          <AllocationChart
            assetClassData={assetClassAllocation}
            accountTypeData={accountTypeAllocation}
            height={360}
          />
        </DashboardSection>

        <DashboardSection
          title="Income & Cash Flow"
          subtitle="Monthly dividends, coupons, interest, and rental income"
        >
          <IncomeChart data={incomeData} height={360} />
        </DashboardSection>
      </div>

      {/* Section 5: Top Holdings Table */}
      <DashboardSection
        title="Top Holdings"
        subtitle="Largest portfolio positions ranked by market value"
        action={
          <Link href="/holdings">
            <Button variant="secondary" size="sm">
              View All Holdings →
            </Button>
          </Link>
        }
      >
        <TopHoldings holdings={topHoldings} />
      </DashboardSection>

      <DisclaimerNotice />
    </div>
  );
}
