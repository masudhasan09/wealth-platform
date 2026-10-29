'use client';

import React from 'react';
import { DataTable, type ColumnDef } from '@/components/organisms/shared/DataTable';
import { StatCard } from '@/components/molecules/StatCard';
import { Badge } from '@/components/atoms/Badge';
import { DateText } from '@/components/atoms/DateText';
import { MoneyText } from '@/components/atoms/MoneyText';
import { GainLossIndicator } from '@/components/molecules/GainLossIndicator';
import { Select } from '@/components/atoms/Select';
import { formatMoney } from '@/lib/format';
import { RealizedLot, RealizedGainsReportSummary } from '@/lib/finance/tax-lots';

export interface RealizedGainsReportProps {
  summary: RealizedGainsReportSummary;
  availableYears?: number[];
  selectedYear?: number;
  onYearChange?: (year: number) => void;
}

export function RealizedGainsReport({
  summary,
  availableYears = [2026, 2025, 2024],
  selectedYear,
  onYearChange,
}: RealizedGainsReportProps) {
  const currentYear = selectedYear ?? summary.taxYear ?? new Date().getFullYear();

  const columns: ColumnDef<RealizedLot>[] = [
    {
      header: 'Close Date',
      id: 'closeDate',
      render: (lot) => (
        <span className="font-mono text-sm text-text">
          <DateText value={lot.closeDate} />
        </span>
      ),
    },
    {
      header: 'Asset',
      id: 'asset',
      render: (lot) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text">{lot.symbol || 'USD'}</span>
          {lot.name && lot.name !== lot.symbol && (
            <span className="text-xs text-text-muted truncate max-w-xs">{lot.name}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Qty Sold',
      id: 'quantity',
      align: 'right',
      render: (lot) => (
        <span className="font-mono text-text font-medium">{lot.quantity}</span>
      ),
    },
    {
      header: 'Gross Proceeds',
      id: 'proceeds',
      align: 'right',
      render: (lot) => (
        <span className="font-mono text-text">
          <MoneyText value={lot.proceeds} />
        </span>
      ),
    },
    {
      header: 'Cost Basis',
      id: 'costBasis',
      align: 'right',
      render: (lot) => (
        <span className="font-mono text-text">
          <MoneyText value={lot.costBasis} />
        </span>
      ),
    },
    {
      header: 'Realized Gain / Loss',
      id: 'gainLoss',
      align: 'right',
      render: (lot) => (
        <GainLossIndicator
          value={lot.gainLoss}
          isPercent={false}
          currencyValue={lot.gainLoss}
        />
      ),
    },
    {
      header: 'Holding Period',
      id: 'term',
      align: 'right',
      render: (lot) => {
        const isLt = lot.term === 'long_term';
        return (
          <div className="flex flex-col items-end gap-0.5">
            <Badge tone={isLt ? 'success' : 'warning'}>
              {isLt ? 'Long-Term' : 'Short-Term'}
            </Badge>
            <span className="text-xs text-text-muted font-mono">{lot.holdingDays}d</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Year Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h2 className="text-base font-semibold text-text">Tax Year Capital Gains</h2>
          <p className="text-xs text-text-muted">
            FIFO realized gains and losses classification for IRS Schedule D reporting.
          </p>
        </div>

        {availableYears.length > 0 && onYearChange && (
          <div className="w-36">
            <Select
              value={String(currentYear)}
              onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
            >
              {availableYears.map((y) => (
                <option key={y} value={String(y)}>
                  Tax Year {y}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* Summary StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Net Realized Gain"
          value={formatMoney(summary.totalGain)}
          helperText={`Tax year ${currentYear} total gain/loss`}
        />
        <StatCard
          label="Short-Term Gains"
          value={formatMoney(summary.shortTermGain)}
          helperText="Held ≤ 1 year (ordinary tax rate)"
        />
        <StatCard
          label="Long-Term Gains"
          value={formatMoney(summary.longTermGain)}
          helperText="Held > 1 year (preferential rate)"
        />
        <StatCard
          label="Gross Proceeds"
          value={formatMoney(summary.totalProceeds)}
          helperText="Total disposal sales volume"
        />
      </div>

      {/* Realized Lots Table */}
      <DataTable
        columns={columns}
        data={summary.lots}
        keyExtractor={(lot) => lot.id}
        emptyTitle={`No realized gains for ${currentYear}`}
        emptyDescription="No realized capital gains or closed lots found for this tax year."
      />
    </div>
  );
}
