import { describe, it, expect } from 'vitest';
import { formatMoney } from './money';
import { formatPercent } from './percent';
import { formatQuantity } from './quantity';
import { formatDate } from './date';

describe('formatMoney', () => {
  it('formats standard USD amounts', () => {
    expect(formatMoney(1234.56)).toBe('$1,234.56');
    expect(formatMoney('50000')).toBe('$50,000');
    expect(formatMoney(0)).toBe('$0.00');
  });

  it('handles negative numbers', () => {
    expect(formatMoney(-150.25)).toBe('-$150.25');
  });

  it('handles null/undefined/empty', () => {
    expect(formatMoney(null)).toBe('—');
    expect(formatMoney(undefined)).toBe('—');
    expect(formatMoney('')).toBe('—');
    expect(formatMoney('invalid')).toBe('—');
  });

  it('respects showCents option', () => {
    expect(formatMoney(1234.56, { showCents: false })).toBe('$1,235');
  });
});

describe('formatPercent', () => {
  it('formats percentage values', () => {
    expect(formatPercent(5.25)).toBe('5.25%');
    expect(formatPercent('12.5')).toBe('12.50%');
    expect(formatPercent(0.0525, { isRawRatio: true })).toBe('5.25%');
  });

  it('handles null and invalid', () => {
    expect(formatPercent(null)).toBe('—');
    expect(formatPercent('abc')).toBe('—');
  });

  it('supports sign display', () => {
    expect(formatPercent(4.5, { signDisplay: 'always' })).toBe('+4.50%');
    expect(formatPercent(-4.5, { signDisplay: 'always' })).toBe('-4.50%');
  });
});

describe('formatQuantity', () => {
  it('formats stock/crypto quantities', () => {
    expect(formatQuantity(50)).toBe('50');
    expect(formatQuantity('0.25')).toBe('0.25');
    expect(formatQuantity(1234567)).toBe('1,234,567');
  });

  it('handles null/undefined', () => {
    expect(formatQuantity(null)).toBe('0');
    expect(formatQuantity(undefined)).toBe('0');
  });
});

describe('formatDate', () => {
  it('formats valid dates', () => {
    const d = new Date('2024-01-15T12:00:00Z');
    expect(formatDate(d, { format: 'iso' })).toBe('2024-01-15');
    expect(formatDate(null)).toBe('—');
  });
});
