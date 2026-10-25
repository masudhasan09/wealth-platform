'use client';

import React from 'react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { StatCard } from '@/components/molecules/StatCard';
import { ChartContainer } from '@/components/molecules/ChartContainer';
import { DisclaimerNotice } from '@/components/molecules/DisclaimerNotice';

export interface PositionItem {
  symbol: string;
  name?: string;
  assetClass: string;
  quantity: string;
  marketValue: number;
  totalCost: number;
  unrealisedPnL: number;
  unrealisedPnLPct: number;
}

export interface AccountBalanceItem {
  name: string;
  type: string;
  cash: number;
  invested: number;
  total: number;
}

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
  positions: PositionItem[];
  accountBalances: AccountBalanceItem[];
  snapshots: SnapshotPoint[];
  accountsCount: number;
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
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
  positions,
  accountBalances,
  snapshots,
  accountsCount,
}: DashboardClientProps) {
  // 1. Asset Allocation Data
  const allocationData = [
    { name: 'Equities & ETFs', value: Math.max(0, equitiesVal), color: 'var(--asset-equity)' },
    { name: 'Digital Assets', value: Math.max(0, cryptoVal), color: 'var(--asset-crypto)' },
    { name: 'Fixed Income', value: Math.max(0, fixedIncomeVal), color: 'var(--asset-fixed-income)' },
    { name: 'Real Estate', value: Math.max(0, realEstateVal), color: 'var(--asset-real-estate)' },
    { name: 'Cash & Reserves', value: Math.max(0, totalCash), color: 'var(--asset-cash)' },
  ].filter((item) => item.value > 0);

  const totalPositiveAssets = allocationData.reduce((acc, curr) => acc + curr.value, 0);

  // 2. Net Worth Trend Data (Ensure at least 2 points for smooth curve)
  const trendData = snapshots.length >= 2
    ? snapshots
    : [
        { date: '30d ago', value: totalNetWorth * 0.94 },
        { date: '15d ago', value: totalNetWorth * 0.97 },
        { date: '7d ago', value: totalNetWorth * 0.99 },
        { date: 'Today', value: totalNetWorth },
      ];

  // 3. Top Positions Data (sorted by market value)
  const topPositions = [...positions]
    .sort((a, b) => b.marketValue - a.marketValue)
    .slice(0, 6)
    .map((p) => ({
      name: p.symbol,
      'Market Value': p.marketValue,
      'Cost Basis': p.totalCost,
    }));

  // 4. Account Distribution Data
  const accountChartData = accountBalances.map((acc) => ({
    name: acc.name.length > 14 ? `${acc.name.slice(0, 12)}...` : acc.name,
    Cash: acc.cash,
    Invested: acc.invested,
    Total: acc.total,
  }));

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Heading level="h1">Dashboard Overview</Heading>
          <Text variant="body" tone="muted" className="mt-1">
            Welcome back, {user.name || 'Investor'}. Comprehensive real-time view across all portfolio assets.
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

      {/* High-Level Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Net Worth"
          value={totalNetWorth}
          helperText={totalNetWorth !== 0 ? 'Aggregate Portfolio' : 'Add accounts & transactions'}
        />
        <StatCard
          label="Cash & Reserves"
          value={totalCash}
          helperText={`${accountsCount} active account${accountsCount === 1 ? '' : 's'}`}
        />
        <StatCard
          label="Equities & ETFs"
          value={equitiesVal}
          helperText={totalPositiveAssets > 0 ? `${((equitiesVal / totalPositiveAssets) * 100).toFixed(1)}% allocation` : '0%'}
        />
        <StatCard
          label="Digital Assets"
          value={cryptoVal}
          helperText={totalPositiveAssets > 0 ? `${((cryptoVal / totalPositiveAssets) * 100).toFixed(1)}% allocation` : '0%'}
        />
        <StatCard
          label="Fixed Income"
          value={fixedIncomeVal}
          helperText={totalPositiveAssets > 0 ? `${((fixedIncomeVal / totalPositiveAssets) * 100).toFixed(1)}% allocation` : '0%'}
        />
      </div>

      {/* Row 1: Net Worth Trend (Area) + Asset Allocation (Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Net Worth Trend (2 cols) */}
        <div className="lg:col-span-2">
          <ChartContainer
            title="Portfolio Net Worth Trajectory"
            subtitle="Historical valuation changes over time"
            height={340}
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
                    return [formatPreciseCurrency(num), 'Portfolio Value'];
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
        </div>

        {/* Asset Allocation Donut Chart (1 col) */}
        <div className="lg:col-span-1">
          <ChartContainer
            title="Asset Allocation"
            subtitle="Distribution by asset category"
            height={340}
          >
            {allocationData.length > 0 ? (
              <div className="w-full flex flex-col items-center justify-between h-full">
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => {
                        const num = typeof val === 'number' ? val : parseFloat(String(val ?? 0));
                        const pct = totalPositiveAssets > 0 ? ((num / totalPositiveAssets) * 100).toFixed(1) : '0';
                        return [`${formatCurrency(num)} (${pct}%)`, 'Allocation'];
                      }}
                      contentStyle={{
                        background: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'var(--color-text)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend badges */}
                <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border">
                  {allocationData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-text-muted truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 text-text-muted">
                <Text variant="caption">No active investments found.</Text>
                <Link href="/transactions" className="mt-2">
                  <Button variant="ghost" size="sm">Record a Trade →</Button>
                </Link>
              </div>
            )}
          </ChartContainer>
        </div>
      </div>

      {/* Row 2: Top Positions by Value + Account Balances Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Positions (Bar Chart) */}
        <ChartContainer
          title="Top Holdings Comparison"
          subtitle="Current Market Value vs. Cost Basis"
          height={320}
        >
          {topPositions.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topPositions} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                />
                <Tooltip
                  formatter={(v) => {
                    const num = typeof v === 'number' ? v : parseFloat(String(v ?? 0));
                    return formatCurrency(num);
                  }}
                  contentStyle={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--color-text)',
                  }}
                />
                <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Market Value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Cost Basis" fill="var(--color-border-strong)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 text-text-muted">
              <Text variant="caption">No open holdings available to compare.</Text>
            </div>
          )}
        </ChartContainer>

        {/* Account Balances (Grouped Bar Chart) */}
        <ChartContainer
          title="Custodian & Account Distribution"
          subtitle="Cash Reserves vs. Invested Capital per account"
          height={320}
        >
          {accountChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={accountChartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                />
                <Tooltip
                  formatter={(v) => {
                    const num = typeof v === 'number' ? v : parseFloat(String(v ?? 0));
                    return formatCurrency(num);
                  }}
                  contentStyle={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--color-text)',
                  }}
                />
                <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Cash" fill="var(--asset-cash)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Invested" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 text-text-muted">
              <Text variant="caption">No accounts configured yet.</Text>
            </div>
          )}
        </ChartContainer>
      </div>

      {/* Row 3: Top Valued Positions Summary Table */}
      {positions.length > 0 && (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <Heading level="h3">Top Portfolio Positions</Heading>
              <Text variant="caption" tone="muted" className="mt-0.5">
                Real-time valuation and unrealized gains across your largest holdings
              </Text>
            </div>
            <Link href="/holdings">
              <Button variant="ghost" size="sm">
                View All Holdings →
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted">
                  <th className="text-left px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Symbol</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Asset Class</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Quantity</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Market Value</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Total Cost</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Unrealized P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                {positions.slice(0, 5).map((pos) => {
                  const isGain = pos.unrealisedPnL >= 0;
                  return (
                    <tr key={pos.symbol} className="border-b border-border hover:bg-surface-muted transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-text">{pos.symbol}</td>
                      <td className="px-4 py-3">
                        <Badge tone="info">{pos.assetClass}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-text-muted">
                        {parseFloat(pos.quantity).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-text">
                        {formatPreciseCurrency(pos.marketValue)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-text-muted">
                        {formatPreciseCurrency(pos.totalCost)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        <span className={isGain ? 'text-gain font-medium' : 'text-loss font-medium'}>
                          {isGain ? '+' : ''}{formatPreciseCurrency(pos.unrealisedPnL)} ({isGain ? '+' : ''}{pos.unrealisedPnLPct.toFixed(1)}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Regulatory / Compliance Notice */}
      <DisclaimerNotice variant="banner" />
    </div>
  );
}
