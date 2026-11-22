'use client';

import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ChartContainer } from '@/components/molecules/ChartContainer';
import { Tabs } from '@/components/molecules/Tabs';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/lib/utils/cn';

export interface AllocationItem {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export interface AllocationChartProps {
  assetClassData: AllocationItem[];
  accountTypeData?: AllocationItem[];
  groupBy?: 'assetClass' | 'accountType';
  onGroupByChange?: (mode: 'assetClass' | 'accountType') => void;
  height?: number;
  className?: string;
}

const DEFAULT_PALETTE = [
  'var(--asset-equity)',
  'var(--asset-crypto)',
  'var(--asset-fixed-income)',
  'var(--asset-real-estate)',
  'var(--asset-cash)',
  'var(--color-primary)',
  'var(--color-info)',
  'var(--color-warning)',
];

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
}

export function AllocationChart({
  assetClassData,
  accountTypeData = [],
  groupBy,
  onGroupByChange,
  height = 340,
  className,
}: AllocationChartProps) {
  const [internalMode, setInternalMode] = useState<'assetClass' | 'accountType'>('assetClass');
  const activeMode = groupBy ?? internalMode;

  const currentData = (activeMode === 'accountType' && accountTypeData.length > 0
    ? accountTypeData
    : assetClassData
  )
    .filter((item) => item.value > 0)
    .map((item, idx) => ({
      ...item,
      color: item.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length],
    }));

  const totalValue = currentData.reduce((acc, curr) => acc + curr.value, 0);

  const handleTabChange = (id: string) => {
    const nextMode = id as 'assetClass' | 'accountType';
    if (onGroupByChange) {
      onGroupByChange(nextMode);
    } else {
      setInternalMode(nextMode);
    }
  };

  const actionTabs = accountTypeData.length > 0 ? (
    <Tabs
      size="sm"
      items={[
        { id: 'assetClass', label: 'Asset Class' },
        { id: 'accountType', label: 'Account Type' },
      ]}
      activeTab={activeMode}
      onChange={handleTabChange}
    />
  ) : undefined;

  return (
    <div className={cn('w-full', className)}>
      <ChartContainer
        title="Asset Allocation"
        subtitle={`Portfolio breakdown by ${activeMode === 'assetClass' ? 'asset class' : 'account category'}`}
        action={actionTabs}
        height={height}
      >
        {currentData.length > 0 ? (
          <div className="w-full flex flex-col items-center justify-between h-full">
            <ResponsiveContainer width="100%" height={height - 120}>
              <PieChart>
                <Pie
                  data={currentData}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {currentData.map((entry, index) => (
                    <Cell key={`cell-${entry.id}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => {
                    const num = typeof val === 'number' ? val : parseFloat(String(val ?? 0));
                    const pct = totalValue > 0 ? ((num / totalValue) * 100).toFixed(1) : '0';
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
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-border">
              {currentData.map((item) => {
                const pct = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : '0';
                return (
                  <div key={item.id} className="flex items-center gap-1.5 text-xs truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-text-muted truncate">
                      {item.label} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 text-text-muted">
            <Text variant="caption">No open investments to display.</Text>
          </div>
        )}
      </ChartContainer>
    </div>
  );
}

