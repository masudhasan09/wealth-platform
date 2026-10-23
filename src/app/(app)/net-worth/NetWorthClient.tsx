'use client';

import React, { useState, useTransition } from 'react';
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
import { Badge } from '@/components/atoms/Badge';
import { FreshnessBadge } from '@/components/atoms/FreshnessBadge';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Alert } from '@/components/molecules/Alert';
import { takeSnapshotAction } from '@/app/actions/net-worth';
import { getFreshnessVariant } from '@/lib/utils/freshness';
import type { NetWorthResult, ValuedPosition } from '@/lib/finance/valuation';

interface SnapshotEntry {
  id: string;
  total: string;
  byAccount: Record<string, string>;
  byAssetClass: Record<string, string>;
  staleCount: number;
  snapshotAt: string;
}

interface NetWorthClientProps {
  netWorth: NetWorthResult | null;
  positions: ValuedPosition[];
  snapshots: SnapshotEntry[];
  error: string | null;
}

function formatMoney(val: string | number): string {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NetWorthClient({ netWorth, positions, snapshots, error }: NetWorthClientProps) {
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSnapshot = () => {
    setSnapshotError(null);
    setSnapshotSuccess(false);
    startTransition(async () => {
      const res = await takeSnapshotAction();
      if (res.success) {
        setSnapshotSuccess(true);
        window.location.reload();
      } else {
        setSnapshotError(res.error ?? 'Failed to save snapshot');
      }
    });
  };

  const chartData = [...snapshots]
    .reverse()
    .map((s) => ({
      date: formatDate(s.snapshotAt),
      value: parseFloat(s.total),
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Heading level="h1">Net Worth</Heading>
          <Text tone="muted" variant="caption" className="mt-1">
            Total portfolio value including all assets and cash balances.
          </Text>
        </div>
        <Button
          variant="primary"
          onClick={handleSnapshot}
          disabled={isPending}
          loading={isPending}
        >
          <Icon name="camera" size="sm" />
          <span className="ml-2">Take Snapshot</span>
        </Button>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}
      {snapshotError && <Alert tone="danger">{snapshotError}</Alert>}
      {snapshotSuccess && <Alert tone="success">Snapshot saved successfully.</Alert>}

      {/* Total Net Worth Card */}
      {netWorth && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-1">
            <Text tone="muted" variant="overline">
              Total Net Worth
            </Text>
            {netWorth.hasStaleData && (
              <FreshnessBadge variant="stale" label="Some prices stale" />
            )}
          </div>
          <div className="text-4xl font-bold text-text">
            {formatMoney(netWorth.total)}
          </div>
          <Text tone="muted" variant="caption" className="mt-2">
            Calculated at {new Date(netWorth.calculatedAt).toLocaleTimeString('en-US')}
          </Text>
          {netWorth.unvaluedSymbols.length > 0 && (
            <Alert tone="warning" className="mt-4">
              {netWorth.unvaluedSymbols.length} instrument(s) could not be valued (no price available):{' '}
              {netWorth.unvaluedSymbols.join(', ')}. Set a manual price on the{' '}
              <a href="/prices" className="underline">Prices page</a>.
            </Alert>
          )}
        </div>
      )}

      {/* Asset Class Breakdown */}
      {netWorth && Object.keys(netWorth.byAssetClass).length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <Heading level="h3" className="mb-4">Breakdown by Asset Class</Heading>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Object.entries(netWorth.byAssetClass).map(([cls, val]) => (
              <div key={cls} className="bg-surface-muted rounded-lg p-3">
                <Text tone="muted" variant="overline" className="capitalize">
                  {cls.replace(/_/g, ' ')}
                </Text>
                <div className="text-lg font-semibold mt-1">{formatMoney(val)}</div>
                <Text tone="muted" variant="caption" className="mt-0.5">
                  {parseFloat(netWorth.total) !== 0
                    ? ((parseFloat(val) / parseFloat(netWorth.total)) * 100).toFixed(1) + '%'
                    : '0%'}
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positions Table */}
      {positions.length > 0 && (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <Heading level="h3">Valued Positions</Heading>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted">
                  <th className="text-left px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Symbol</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Class</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Qty</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Price</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Market Value</th>
                  <th className="text-right px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Unrealised P&amp;L</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Freshness</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p, i) => {
                  const pnl = parseFloat(p.unrealisedPnL);
                  const variant = getFreshnessVariant(p.priceAsOf, p.priceSource);
                  return (
                    <tr key={i} className="border-b border-border hover:bg-surface-muted transition-colors">
                      <td className="px-4 py-3 font-mono font-medium">{p.symbol}</td>
                      <td className="px-4 py-3">
                        <Badge tone="info">{p.assetClass}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-text-muted">
                        {parseFloat(p.quantity).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatMoney(p.currentPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium">
                        {formatMoney(p.marketValue)}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono ${pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                        {pnl >= 0 ? '+' : ''}{formatMoney(p.unrealisedPnL)}
                        <span className="ml-1 text-xs text-text-muted">
                          ({parseFloat(p.unrealisedPnLPct).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <FreshnessBadge variant={variant} label={p.freshnessLabel} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History Chart */}
      {chartData.length > 1 && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <Heading level="h3" className="mb-4">Net Worth History</Heading>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
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
                    const num = typeof v === 'number' ? v : Array.isArray(v) ? 0 : parseFloat(String(v ?? 0));
                    return [formatMoney(num), 'Net Worth'] as [string, string];
                  }}
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#netWorthGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {chartData.length === 0 && (
        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <Icon name="chart-line" size="xl" className="mx-auto text-text-muted mb-3" />
          <Text tone="muted">No snapshot history yet. Click &quot;Take Snapshot&quot; to start tracking your net worth over time.</Text>
        </div>
      )}
    </div>
  );
}
