'use client';

import React from 'react';
import { StatCard } from '@/components/molecules/StatCard';
import { Icon } from '@/components/atoms/Icon';
import { APPRAISED_ASSET_SMOOTHING_EXPLANATION } from '@/lib/finance/performance';
import { cn } from '@/lib/utils/cn';

export interface PerformancePanelProps {
  twrPct: number;
  mwrPct: number;
  liquidReturnPct: number;
  appraisedReturnPct: number;
  periodLabel?: string;
  className?: string;
}

export function PerformancePanel({
  twrPct,
  mwrPct,
  liquidReturnPct,
  appraisedReturnPct,
  periodLabel = '1-Year Annualized',
  className,
}: PerformancePanelProps) {
  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {/* Appraised smoothing explanatory notice */}
      <div className="flex items-start justify-between gap-3 p-3.5 rounded-lg bg-surface-muted border border-border text-xs text-text-muted">
        <div className="flex items-start gap-3">
          <Icon name="Info" size="sm" className="text-info shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-text">Appraisal Smoothing Note: </span>
            <span>{APPRAISED_ASSET_SMOOTHING_EXPLANATION}</span>
          </div>
        </div>
        <span className="text-xs font-mono text-text-muted shrink-0 hidden sm:inline">
          {periodLabel}
        </span>
      </div>

      {/* Grid of Returns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Time-Weighted Return (TWR)"
          value={`${twrPct >= 0 ? '+' : ''}${twrPct.toFixed(2)}%`}
          helperText="Eliminates cash-flow timing bias"
        />
        <StatCard
          label="Money-Weighted Return (MWR / XIRR)"
          value={`${mwrPct >= 0 ? '+' : ''}${mwrPct.toFixed(2)}%`}
          helperText="Reflects exact dollar-timing impact"
        />
        <StatCard
          label="Liquid Assets Return"
          value={`${liquidReturnPct >= 0 ? '+' : ''}${liquidReturnPct.toFixed(2)}%`}
          helperText="Mark-to-market (stocks, crypto, ETFs)"
        />
        <StatCard
          label="Appraised Assets Return"
          value={`${appraisedReturnPct >= 0 ? '+' : ''}${appraisedReturnPct.toFixed(2)}%`}
          helperText="Appraisal-based (real estate)"
        />
      </div>
    </div>
  );
}
