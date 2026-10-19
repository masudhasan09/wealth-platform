import React from 'react';
import { Badge } from '@/components/atoms/Badge';
import { cn } from '@/lib/utils/cn';

export type AssetClassType =
  | 'equity'
  | 'crypto'
  | 'fixed_income'
  | 'fixed-income'
  | 'real_estate'
  | 'real-estate'
  | 'cash';

const labels: Record<string, string> = {
  equity: 'Equity',
  crypto: 'Crypto',
  fixed_income: 'Fixed Income',
  'fixed-income': 'Fixed Income',
  real_estate: 'Real Estate',
  'real-estate': 'Real Estate',
  cash: 'Cash',
};

const tones: Record<string, 'info' | 'warning' | 'success' | 'neutral'> = {
  equity: 'info',
  crypto: 'warning',
  fixed_income: 'info',
  'fixed-income': 'info',
  real_estate: 'warning',
  'real-estate': 'warning',
  cash: 'success',
};

export interface AssetClassTagProps {
  assetClass: AssetClassType;
  className?: string;
}

export function AssetClassTag({ assetClass, className }: AssetClassTagProps) {
  const label = labels[assetClass] || assetClass;
  const tone = tones[assetClass] || 'neutral';

  return (
    <Badge
      tone={tone}
      className={cn('capitalize text-xs font-medium', className)}
    >
      {label}
    </Badge>
  );
}
