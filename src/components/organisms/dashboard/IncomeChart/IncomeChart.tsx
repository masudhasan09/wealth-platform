'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartContainer } from '@/components/molecules/ChartContainer';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/lib/utils/cn';

export interface MonthlyIncomeItem {
  month: string;
  dividends: number;
  interest: number;
  coupons: number;
  rent: number;
  total: number;
}

export interface IncomeChartProps {
  data: MonthlyIncomeItem[];
  height?: number;
  className?: string;
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
}

export function IncomeChart({
  data,
  height = 340,
  className,
}: IncomeChartProps) {
  const totalIncome = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className={cn('w-full', className)}>
      <ChartContainer
        title="Income by Month"
        subtitle={`Cumulative cash flows (${formatCurrency(totalIncome)} YTD)`}
        height={height}
      >
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={height - 70}>
            <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => `$${v}`}
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip
                formatter={(val, name) => {
                  const num = typeof val === 'number' ? val : parseFloat(String(val ?? 0));
                  return [formatCurrency(num), name];
                }}
                contentStyle={{
                  background: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--color-text)',
                }}
              />
              <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="dividends" name="Dividends" fill="var(--asset-equity)" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="coupons" name="Coupons" fill="var(--asset-fixed-income)" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="interest" name="Interest" fill="var(--color-primary)" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="rent" name="Rental" fill="var(--asset-real-estate)" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 text-text-muted">
            <Text variant="caption">No income transactions recorded for this period.</Text>
          </div>
        )}
      </ChartContainer>
    </div>
  );
}

