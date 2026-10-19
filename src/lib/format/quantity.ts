/**
 * Asset quantity and share formatting.
 */

export interface QuantityFormatOptions {
  decimals?: number;
  maxDecimals?: number;
  compact?: boolean;
}

export function formatQuantity(
  value: number | string | { toString: () => string } | null | undefined,
  options: QuantityFormatOptions = {}
): string {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  const num = typeof value === 'number' ? value : Number(value.toString());
  if (isNaN(num)) {
    return '0';
  }

  const {
    decimals,
    maxDecimals = 8,
    compact = false,
  } = options;

  const minFraction = decimals ?? 0;
  const maxFraction = decimals ?? (num % 1 === 0 ? 0 : Math.min(maxDecimals, 6));

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: minFraction,
    maximumFractionDigits: maxFraction,
    notation: compact ? 'compact' : 'standard',
  });

  return formatter.format(num);
}
