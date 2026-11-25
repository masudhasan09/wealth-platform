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
import { Icon } from '@/components/atoms/Icon';
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
      {/* Executive Dashboard Header */}
      <div className="pb-6 border-b border-border">
        <Heading level="h1">Multi-Asset Portfolio Overview</Heading>
        <Text variant="body" tone="muted" className="mt-1">
          Welcome back, {user.name || 'Investor'}. Unified valuation across cash, equities, crypto, fixed income, and real estate.
        </Text>
      </div>

      {/* Hero Net Worth Card + Balanced 3x2 Asset Class & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-5 rounded-2xl border border-primary bg-primary-muted p-6 shadow-sm flex flex-col justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Text variant="caption" className="font-bold uppercase tracking-wider text-primary">
                Total Net Worth
              </Text>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface text-primary border border-border text-xs font-semibold">
                <Icon name="ShieldCheck" size="xs" aria-hidden="true" />
                {accountsCount} Account{accountsCount === 1 ? '' : 's'}
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-bold tracking-tight font-mono tabular-nums text-text pt-1">
              {formatPreciseCurrency(totalNetWorth)}
            </div>

            <Text variant="caption" tone="muted">
              {totalNetWorth !== 0
                ? 'Consolidated total assets minus linked liabilities'
                : 'Add accounts and transactions to calculate live net worth'}
            </Text>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
            <div className="rounded-xl bg-surface/80 border border-border p-3">
              <Text variant="caption" tone="muted" className="text-xs font-medium">
                Gross Assets
              </Text>
              <div className="text-sm font-bold font-mono tabular-nums text-text mt-0.5">
                {formatPreciseCurrency(totalPositiveAssets)}
              </div>
            </div>
            <div className="rounded-xl bg-surface/80 border border-border p-3">
              <Text variant="caption" tone="muted" className="text-xs font-medium">
                Invested Capital
              </Text>
              <div className="text-sm font-bold font-mono tabular-nums text-text mt-0.5">
                {formatPreciseCurrency(Math.max(0, totalPositiveAssets - Math.max(0, totalCash)))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
          <StatCard
            label="Cash & Reserves"
            value={totalCash}
            accentDotClass="bg-asset-cash"
            helperText={
              totalPositiveAssets > 0
                ? `${((Math.max(0, totalCash) / totalPositiveAssets) * 100).toFixed(1)}% of assets`
                : `${accountsCount} active`
            }
          />
          <StatCard
            label="Equities & ETFs"
            value={equitiesVal}
            accentDotClass="bg-asset-equity"
            helperText={
              totalPositiveAssets > 0
                ? `${((equitiesVal / totalPositiveAssets) * 100).toFixed(1)}% of assets`
                : '0.0%'
            }
          />
          <StatCard
            label="Digital Assets"
            value={cryptoVal}
            accentDotClass="bg-asset-crypto"
            helperText={
              totalPositiveAssets > 0
                ? `${((cryptoVal / totalPositiveAssets) * 100).toFixed(1)}% of assets`
                : '0.0%'
            }
          />
          <StatCard
            label="Fixed Income"
            value={fixedIncomeVal}
            accentDotClass="bg-asset-fixed-income"
            helperText={
              totalPositiveAssets > 0
                ? `${((fixedIncomeVal / totalPositiveAssets) * 100).toFixed(1)}% of assets`
                : '0.0%'
            }
          />
          <StatCard
            label="Real Estate (Net)"
            value={realEstateVal}
            accentDotClass="bg-asset-real-estate"
            helperText={
              totalPositiveAssets > 0
                ? `${((realEstateVal / totalPositiveAssets) * 100).toFixed(1)}% of assets`
                : '0.0%'
            }
          />
          <Link
            href="/risk"
            className="p-5 rounded-xl border border-border bg-surface shadow-xs hover:border-primary hover:bg-surface-hover transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between gap-2">
              <Text variant="caption" tone="muted" className="font-semibold uppercase tracking-wider text-xs">
                Risk &amp; Tax Tools
              </Text>
              <Icon
                name="ArrowUpRight"
                size="sm"
                className="text-text-muted group-hover:text-primary transition-colors"
                aria-hidden="true"
              />
            </div>
            <div className="mt-2">
              <div className="text-base font-bold text-text">HHI &amp; Schedule D</div>
              <Text variant="caption" tone="muted">
                Inspect concentration &amp; FIFO gains
              </Text>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-border text-xs font-semibold text-primary">
              Open Analytics &rarr;
            </div>
          </Link>
        </div>
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
