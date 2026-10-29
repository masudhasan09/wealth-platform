'use client';

import React from 'react';
import { DataTable, type ColumnDef } from '@/components/organisms/shared/DataTable';
import { MoneyText } from '@/components/atoms/MoneyText';
import { Badge } from '@/components/atoms/Badge';
import { DateText } from '@/components/atoms/DateText';
import { GainLossIndicator } from '@/components/molecules/GainLossIndicator';

export interface OpenTaxLotViewModel {
  id: string;
  transactionId: string;
  accountId: string;
  accountName?: string;
  instrumentId: string;
  symbol?: string;
  name?: string;
  openDate: Date | string;
  originalQuantity: string;
  remainingQuantity: string;
  costBasisPerUnit: string;
  totalCostBasis: string;
  currentPrice?: string;
  currentValue?: string;
  unrealizedGainLoss?: string;
  unrealizedGainLossPct?: string;
  term?: 'short_term' | 'long_term';
  holdingDays?: number;
}

export interface TaxLotTableProps {
  lots: OpenTaxLotViewModel[];
  emptyAction?: React.ReactNode;
}

export function TaxLotTable({ lots, emptyAction }: TaxLotTableProps) {
  const columns: ColumnDef<OpenTaxLotViewModel>[] = [
    {
      header: 'Open Date',
      id: 'openDate',
      render: (lot) => (
        <span className="font-mono text-sm text-text">
          <DateText value={lot.openDate} />
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
      header: 'Account',
      accessorKey: 'accountName',
      id: 'account',
    },
    {
      header: 'Remaining Qty',
      id: 'remainingQuantity',
      align: 'right',
      render: (lot) => (
        <span className="font-mono text-text font-medium">{lot.remainingQuantity}</span>
      ),
    },
    {
      header: 'Cost Basis / Unit',
      id: 'costBasisPerUnit',
      align: 'right',
      render: (lot) => (
        <span className="font-mono text-text">
          <MoneyText value={lot.costBasisPerUnit} />
        </span>
      ),
    },
    {
      header: 'Total Cost Basis',
      id: 'totalCostBasis',
      align: 'right',
      render: (lot) => (
        <span className="font-mono text-text">
          <MoneyText value={lot.totalCostBasis} />
        </span>
      ),
    },
    {
      header: 'Current Value',
      id: 'currentValue',
      align: 'right',
      render: (lot) =>
        lot.currentValue ? (
          <span className="font-mono text-text font-medium">
            <MoneyText value={lot.currentValue} />
          </span>
        ) : (
          <span className="text-text-muted">—</span>
        ),
    },
    {
      header: 'Unrealized Gain/Loss',
      id: 'unrealizedGainLoss',
      align: 'right',
      render: (lot) => {
        if (!lot.unrealizedGainLoss) return <span className="text-text-muted">—</span>;
        return (
          <div className="flex flex-col items-end">
            <GainLossIndicator
              value={lot.unrealizedGainLoss}
              isPercent={false}
              currencyValue={lot.unrealizedGainLoss}
            />
            {lot.unrealizedGainLossPct && (
              <span className="text-xs text-text-muted">
                {parseFloat(lot.unrealizedGainLossPct) > 0 ? '+' : ''}
                {lot.unrealizedGainLossPct}%
              </span>
            )}
          </div>
        );
      },
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
            {lot.holdingDays !== undefined && (
              <span className="text-xs text-text-muted font-mono">{lot.holdingDays}d</span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={lots}
      keyExtractor={(lot) => lot.id}
      emptyTitle="No open tax lots"
      emptyDescription="No active open tax lots found in your portfolio."
      emptyAction={emptyAction}
    />
  );
}
