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
import { DataTable, type ColumnDef } from '@/components/organisms/shared/DataTable';
import { MoneyText } from '@/components/atoms/MoneyText';
import { Badge } from '@/components/atoms/Badge';
import {
  maturityLadder,
  type BondHoldingItem,
  type MaturityLadderBucket,
} from '@/lib/finance/bonds';

export interface MaturityLadderProps {
  bonds: BondHoldingItem[];
  asOfDate?: Date | string;
  className?: string;
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
}

export function MaturityLadder({
  bonds,
  asOfDate = new Date(),
  className,
}: MaturityLadderProps) {
  const ladder = maturityLadder(bonds, asOfDate);

  const chartData = ladder.map((b) => ({
    name: b.bucket,
    'Face Value': parseFloat(b.totalFaceValue),
    'Market Value': parseFloat(b.totalMarketValue),
    'Annual Income': parseFloat(b.annualIncome),
    bonds: b.bondCount,
  }));

  const tableColumns: ColumnDef<MaturityLadderBucket>[] = [
    {
      header: 'Maturity Bucket',
      accessorKey: 'bucket',
      align: 'left',
      render: (item) => <span className="font-medium text-text">{item.bucket}</span>,
    },
    {
      header: 'Holdings Count',
      align: 'center',
      render: (item) => (
        <Badge tone={item.bondCount > 0 ? 'info' : 'neutral'}>
          {item.bondCount} {item.bondCount === 1 ? 'bond' : 'bonds'}
        </Badge>
      ),
    },
    {
      header: 'Total Face Value',
      align: 'right',
      render: (item) => (
        <span className="font-mono">
          <MoneyText value={parseFloat(item.totalFaceValue)} />
        </span>
      ),
    },
    {
      header: 'Market Value',
      align: 'right',
      render: (item) => (
        <span className="font-mono font-medium">
          <MoneyText value={parseFloat(item.totalMarketValue)} />
        </span>
      ),
    },
    {
      header: 'Projected Annual Income',
      align: 'right',
      render: (item) => (
        <span className="font-mono text-success">
          <MoneyText value={parseFloat(item.annualIncome)} />
        </span>
      ),
    },
  ];

  return (
    <div className={className}>
      <div className="flex flex-col gap-6">
        <ChartContainer
          title="Bond Maturity Ladder"
          subtitle="Portfolio distribution and cash-flow timeline across maturity tenors"
          height={320}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
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
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px' }} />
              <Bar dataKey="Market Value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Annual Income" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <DataTable
          columns={tableColumns}
          data={ladder}
          keyExtractor={(item) => item.bucket}
          emptyTitle="No Bond Holdings"
          emptyDescription="You do not have any fixed income positions to display in the maturity ladder."
        />
      </div>
    </div>
  );
}

