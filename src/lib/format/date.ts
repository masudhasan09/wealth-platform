/**
 * Date formatting utilities.
 */

export interface DateFormatOptions {
  format?: 'short' | 'medium' | 'long' | 'iso';
  includeTime?: boolean;
}

export function formatDate(
  value: Date | string | number | null | undefined,
  options: DateFormatOptions = {}
): string {
  if (!value) return '—';

  const date = typeof value === 'object' && value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '—';

  const { format = 'medium', includeTime = false } = options;

  if (format === 'iso') {
    return includeTime ? date.toISOString() : date.toISOString().split('T')[0];
  }

  let dateStyle: 'short' | 'medium' | 'long' = 'medium';
  if (format === 'short') dateStyle = 'short';
  if (format === 'long') dateStyle = 'long';

  const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle,
    timeStyle: includeTime ? 'short' : undefined,
  });

  return formatter.format(date);
}
