/**
 * Money formatting utilities.
 * Base currency is USD.
 */

export interface MoneyFormatOptions {
  currency?: string;
  showCents?: boolean | 'auto';
  signDisplay?: 'auto' | 'always' | 'never' | 'exceptZero';
  compact?: boolean;
}

export function formatMoney(
  value: number | string | { toString: () => string } | null | undefined,
  options: MoneyFormatOptions = {}
): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const num = typeof value === 'number' ? value : Number(value.toString());
  if (isNaN(num)) {
    return '—';
  }

  const {
    currency = 'USD',
    showCents = 'auto',
    signDisplay = 'auto',
    compact = false,
  } = options;

  let minFractionDigits = 2;
  let maxFractionDigits = 2;

  if (showCents === false) {
    minFractionDigits = 0;
    maxFractionDigits = 0;
  } else if (showCents === 'auto') {
    if (num % 1 === 0 && Math.abs(num) >= 1000) {
      minFractionDigits = 0;
      maxFractionDigits = 0;
    } else {
      minFractionDigits = 2;
      maxFractionDigits = 2;
    }
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: maxFractionDigits,
    signDisplay,
    notation: compact ? 'compact' : 'standard',
  });

  return formatter.format(num);
}
