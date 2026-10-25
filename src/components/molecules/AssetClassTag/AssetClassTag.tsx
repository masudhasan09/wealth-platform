import React from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Icon } from '@/components/atoms/Icon';
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

const icons: Record<string, string> = {
  equity: 'TrendingUp',
  crypto: 'Coins',
  fixed_income: 'Landmark',
  'fixed-income': 'Landmark',
  real_estate: 'Building2',
  'real-estate': 'Building2',
  cash: 'Wallet',
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
  showIcon?: boolean;
}

export function AssetClassTag({ assetClass, className, showIcon = true }: AssetClassTagProps) {
  const label = labels[assetClass] || assetClass;
  const tone = tones[assetClass] || 'neutral';
  const iconName = icons[assetClass];

  return (
    <Badge
      tone={tone}
      className={cn('inline-flex items-center gap-1.5 capitalize text-xs font-medium', className)}
    >
      {showIcon && iconName && <Icon name={iconName} size="xs" />}
      <span>{label}</span>
    </Badge>
  );
}
