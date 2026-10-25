'use client';

import React from 'react';
import { StatCard } from '@/components/molecules/StatCard';
import { Heading } from '@/components/atoms/Heading';
import { Badge } from '@/components/atoms/Badge';
import { AssetClassTag } from '@/components/molecules/AssetClassTag';
import {
  accruedInterest,
  currentYield,
  yieldToMaturity,
  type BondModel,
} from '@/lib/finance/bonds';

export interface BondDetailsPanelProps {
  bond: BondModel;
  currentPrice: string; // Decimal string, e.g. "980.50"
  asOfDate?: Date | string;
  className?: string;
}

export function BondDetailsPanel({
  bond,
  currentPrice,
  asOfDate = new Date(),
  className,
}: BondDetailsPanelProps) {
  const accrued = accruedInterest(bond, asOfDate);
  const curYield = currentYield(bond, currentPrice);
  const ytm = yieldToMaturity(bond, currentPrice, asOfDate);

  const curYieldPct = (parseFloat(curYield) * 100).toFixed(2) + '%';
  const ytmPct = (parseFloat(ytm) * 100).toFixed(2) + '%';
  const couponRatePct = (parseFloat(bond.couponRate) * 100).toFixed(2) + '%';

  const maturityDateStr = new Date(bond.maturityDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className={className}>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Heading level="h3">{bond.name || bond.symbol}</Heading>
            <AssetClassTag assetClass="fixed_income" />
            {bond.subType && (
              <Badge tone="info" className="uppercase text-xs font-semibold">
                {bond.subType.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1 font-mono">
            Symbol: {bond.symbol} • Maturity: {maturityDateStr}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Face / Par Value"
          value={parseFloat(bond.faceValue)}
          helperText={`Coupon: ${couponRatePct} (${bond.couponFrequency.replace('_', ' ')})`}
        />

        <StatCard
          label="Current Price"
          value={parseFloat(currentPrice)}
          helperText={`Day Count: ${bond.dayCount || 'actual_actual'}`}
        />

        <StatCard
          label="Accrued Interest"
          value={parseFloat(accrued)}
          helperText="Interest accrued since last coupon"
        />

        <StatCard
          label="Yield to Maturity (YTM)"
          value={ytmPct}
          helperText={`Current Yield: ${curYieldPct}`}
        />
      </div>
    </div>
  );
}
