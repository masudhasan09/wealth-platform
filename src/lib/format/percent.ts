/**
 * Percent formatting utilities.
 */

export interface PercentFormatOptions {
  decimals?: number;
  signDisplay?: 'auto' | 'always' | 'never' | 'exceptZero';
  isRawRatio?: boolean; // if true, 0.05 is 5%; if false, 5 is 5%
}

export function formatPercent(
  value: number | string | { toString: () => string } | null | undefined,
  options: PercentFormatOptions = {}
): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const rawNum = typeof value === 'number' ? value : Number(value.toString());
  if (isNaN(rawNum)) {
    return '—';
  }

  const {
    decimals = 2,
    signDisplay = 'auto',
    isRawRatio = false,
  } = options;

  const num = isRawRatio ? rawNum * 100 : rawNum;

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    signDisplay,
  });

  return `${formatter.format(num)}%`;
}
