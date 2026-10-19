/**
 * Finance-specific design tokens.
 * These are semantic tokens specific to financial data display.
 * They are included in the theme and become CSS variables.
 */

// ---------------------------------------------------------------------------
// Asset class tokens
// ---------------------------------------------------------------------------
export type AssetClassToken = 'equity' | 'crypto' | 'fixed-income' | 'real-estate' | 'cash';

/** Tailwind class names for asset class badges and chart segments */
export const assetClassColors: Record<AssetClassToken, { bg: string; text: string; border: string }> = {
  equity: {
    bg: 'bg-asset-equity',
    text: 'text-asset-equity',
    border: 'border-asset-equity',
  },
  crypto: {
    bg: 'bg-asset-crypto',
    text: 'text-asset-crypto',
    border: 'border-asset-crypto',
  },
  'fixed-income': {
    bg: 'bg-asset-fixed-income',
    text: 'text-asset-fixed-income',
    border: 'border-asset-fixed-income',
  },
  'real-estate': {
    bg: 'bg-asset-real-estate',
    text: 'text-asset-real-estate',
    border: 'border-asset-real-estate',
  },
  cash: {
    bg: 'bg-asset-cash',
    text: 'text-asset-cash',
    border: 'border-asset-cash',
  },
};

// ---------------------------------------------------------------------------
// Freshness state tokens
// ---------------------------------------------------------------------------
export type FreshnessState = 'live' | 'delayed' | 'manual' | 'stale';

export const freshnessConfig: Record<
  FreshnessState,
  { label: string; dotClass: string; textClass: string }
> = {
  live: {
    label: 'Live',
    dotClass: 'bg-success',
    textClass: 'text-success',
  },
  delayed: {
    label: 'Delayed',
    dotClass: 'bg-warning',
    textClass: 'text-warning',
  },
  manual: {
    label: 'Manual',
    dotClass: 'bg-text-muted',
    textClass: 'text-text-muted',
  },
  stale: {
    label: 'Stale',
    dotClass: 'bg-danger',
    textClass: 'text-danger',
  },
};

// ---------------------------------------------------------------------------
// Valuation method labels
// ---------------------------------------------------------------------------
export type ValuationMethodToken = 'market' | 'model' | 'manual';

export const valuationMethodLabel: Record<ValuationMethodToken, string> = {
  market: 'Market price',
  model: 'Model price',
  manual: 'Manual entry',
};

// ---------------------------------------------------------------------------
// Chart palette (ordered, for pie/bar/line series)
// ---------------------------------------------------------------------------
export const chartPalette = [
  'var(--asset-equity)',
  'var(--asset-crypto)',
  'var(--asset-fixed-income)',
  'var(--asset-real-estate)',
  'var(--asset-cash)',
  'var(--color-primary)',
  'var(--color-info)',
  'var(--color-warning)',
] as const;
