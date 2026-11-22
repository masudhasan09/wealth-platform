'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { StatCard } from '@/components/molecules/StatCard';
import { ChartContainer } from '@/components/molecules/ChartContainer';
import { MoneyText } from '@/components/atoms/MoneyText';
import { Icon } from '@/components/atoms/Icon';
import { AssetClassTag, type AssetClassType } from '@/components/molecules/AssetClassTag';
import { cn } from '@/lib/utils/cn';
import { RiskAnalysisResult } from '@/lib/finance/risk';

export interface RiskPanelProps {
  riskData: RiskAnalysisResult;
  className?: string;
}

const BAR_COLORS = [
  'var(--color-primary)',
  'var(--color-info)',
  'var(--asset-equity)',
  'var(--asset-crypto)',
  'var(--asset-fixed-income)',
  'var(--asset-real-estate)',
];

export function RiskPanel({ riskData, className }: RiskPanelProps) {
  const chartData = riskData.topHoldings.slice(0, 7).map((h) => ({
    name: h.symbol,
    fullName: h.name,
    percentage: parseFloat(h.percentage),
    value: parseFloat(h.value),
  }));

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Diversification Score"
          value={`${riskData.diversificationScore}/100 (${riskData.diversificationRating})`}
          helperText="HHI multi-asset & holding balance"
        />
        <StatCard
          label="Top 1 Concentration"
          value={`${riskData.topHoldingPct}%`}
          helperText={`Largest holding: ${riskData.topHoldingSymbol}`}
        />
        <StatCard
          label="Top 5 Concentration"
          value={`${riskData.top5Pct}%`}
          helperText="Combined share of top 5 positions"
        />
        <StatCard
          label="Estimated Volatility"
          value={riskData.estimatedAnnualVolatility}
          helperText="Annualized historical asset blend"
        />
      </div>

      {/* Grid: Concentration Chart & Deterministic Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Concentration Chart */}
        <ChartContainer
          title="Holdings Concentration"
          subtitle="Top positions as percentage of total portfolio"
          height={320}
        >
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  stroke="var(--color-text-muted)"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--color-text-muted)"
                  fontSize={12}
                  tickFormatter={(val) => `${val}%`}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val) => {
                    const num = typeof val === 'number' ? val : parseFloat(String(val ?? 0));
                    return [`${num}%`, 'Portfolio Share'];
                  }}
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--color-text)',
                  }}
                />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={BAR_COLORS[idx % BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-text-muted text-sm">No position data available.</div>
          )}
        </ChartContainer>

        {/* Deterministic Rule-Based Insights (NO LLM) */}
        <div className="p-5 rounded-lg border border-border bg-surface shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text mb-1">Risk & Diversification Insights</h3>
            <p className="text-xs text-text-muted mb-4">
              Rule-based deterministic diagnostics evaluating portfolio concentration and risk factors.
            </p>

            <div className="space-y-3">
              {riskData.deterministicInsights.map((insight) => {
                const iconName =
                  insight.type === 'success'
                    ? 'CheckCircle2'
                    : insight.type === 'warning'
                    ? 'AlertTriangle'
                    : 'Info';

                const toneClass =
                  insight.type === 'success'
                    ? 'text-success bg-success-muted border-success/30'
                    : insight.type === 'warning'
                    ? 'text-warning bg-warning-muted border-warning/30'
                    : 'text-info bg-info-muted border-info/30';

                return (
                  <div
                    key={insight.id}
                    className={`p-3 rounded-lg border flex gap-3 items-start text-xs ${toneClass}`}
                  >
                    <Icon name={iconName} size="sm" className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-text">{insight.title}</p>
                      <p className="text-text-muted mt-0.5 leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Positions Concentration Table */}
      <div className="p-5 rounded-lg border border-border bg-surface shadow-xs">
        <h3 className="text-sm font-semibold text-text mb-3">Concentration Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="py-2.5 px-3 font-medium">Rank</th>
                <th className="py-2.5 px-3 font-medium">Holding</th>
                <th className="py-2.5 px-3 font-medium">Asset Class</th>
                <th className="py-2.5 px-3 font-medium text-right">Value</th>
                <th className="py-2.5 px-3 font-medium text-right">Portfolio Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {riskData.topHoldings.map((h, idx) => (
                <tr key={`${h.instrumentId}-${idx}`} className="hover:bg-surface-hover transition-colors">
                  <td className="py-2.5 px-3 font-mono text-text-muted">#{idx + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-text">
                    {h.symbol}
                    {h.name && h.name !== h.symbol && (
                      <span className="font-normal text-text-muted ml-2">({h.name})</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <AssetClassTag assetClass={h.assetClass as AssetClassType} />
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-text">
                    <MoneyText value={h.value} />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-surface-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(100, parseFloat(h.percentage))}%` }}
                        />
                      </div>
                      <span className="font-mono font-medium text-text">{h.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
