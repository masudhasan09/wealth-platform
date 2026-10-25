'use client';

import React from 'react';
import { DataTable, type ColumnDef } from '@/components/organisms/shared/DataTable';
import { MoneyText } from '@/components/atoms/MoneyText';
import { Badge } from '@/components/atoms/Badge';
import { FreshnessBadge } from '@/components/atoms/FreshnessBadge';
import { AssetClassTag, type AssetClassType } from '@/components/molecules/AssetClassTag';
import type { HoldingViewModel } from '@/lib/view-models';

export interface HoldingsTableProps {
  holdings: HoldingViewModel[];
  emptyAction?: React.ReactNode;
}

export function HoldingsTable({ holdings, emptyAction }: HoldingsTableProps) {
  const columns: ColumnDef<HoldingViewModel>[] = [
    {
      header: 'Account',
      accessorKey: 'accountName',
      id: 'account',
    },
    {
      header: 'Asset',
      id: 'asset',
      render: (h) => (
        <div className="flex flex-col">
          <span className="font-semibold text-text">{h.symbol || 'USD'}</span>
          {h.instrumentName && h.instrumentName !== h.symbol && (
            <span className="text-xs text-text-muted truncate max-w-xs">{h.instrumentName}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Asset Class',
      id: 'assetClass',
      render: (h) => (
        <AssetClassTag assetClass={h.assetClass as AssetClassType} />
      ),
    },
    {
      header: 'Quantity',
      id: 'quantity',
      align: 'right',
      render: (h) => (
        <span className="font-mono text-text font-medium">{h.quantity}</span>
      ),
    },
    {
      header: 'Average Cost Basis',
      id: 'averageCost',
      align: 'right',
      render: (h) => (
        <span className="font-mono text-text">
          <MoneyText value={h.averageCost} />
        </span>
      ),
    },
    {
      header: 'Total Cost Basis',
      id: 'totalCost',
      align: 'right',
      render: (h) => (
        <span className="font-mono font-semibold text-text">
          <MoneyText value={h.totalCost} />
        </span>
      ),
    },
    {
      header: 'Valuation Method',
      id: 'valuationMethod',
      align: 'center',
      render: (h) => {
        if (h.freshnessVariant) {
          return (
            <div className="flex items-center justify-center gap-1.5">
              <FreshnessBadge
                variant={h.freshnessVariant}
                label={h.freshnessLabel}
              />
              {h.valuationMethod && (
                <Badge tone="neutral" className="uppercase text-xs font-mono">
                  {h.valuationMethod}
                </Badge>
              )}
            </div>
          );
        }
        return (
          <Badge tone="neutral" className="uppercase text-xs font-mono">
            {h.valuationMethod || 'Cost Basis'}
          </Badge>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={holdings}
      keyExtractor={(h) => `${h.accountId}:${h.instrumentId}`}
      emptyTitle="No holdings currently held"
      emptyDescription="Buy transactions will create active positions and calculate your cost basis."
      emptyAction={emptyAction}
    />
  );
}
