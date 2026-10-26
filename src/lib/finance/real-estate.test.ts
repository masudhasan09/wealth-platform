import { describe, it, expect } from 'vitest';
import {
  computeMonthlyMortgagePayment,
  generateAmortizationSchedule,
  getOutstandingBalanceAtDate,
  computePropertyEquity,
} from './real-estate';

describe('Real Estate & Mortgage Math (pure decimal.js)', () => {
  describe('computeMonthlyMortgagePayment', () => {
    it('calculates exact standard 30-year fixed mortgage payment', () => {
      // Principal: $400,000, Rate: 6.0% (0.06), Term: 30 years (360 months)
      // Expected: $2,398.20 per month
      const payment = computeMonthlyMortgagePayment('400000', '0.06', 360);
      expect(payment).toBe('2398.20');
    });

    it('calculates exact 15-year fixed mortgage payment', () => {
      // Principal: $300,000, Rate: 5.5% (0.055), Term: 15 years (180 months)
      // M = 300,000 * (0.055/12 * (1 + 0.055/12)^180) / ((1 + 0.055/12)^180 - 1)
      // Expected: $2,451.25
      const payment = computeMonthlyMortgagePayment('300000', '0.055', 180);
      expect(payment).toBe('2451.25');
    });

    it('handles zero interest loan cleanly', () => {
      // $120,000 over 120 months with 0% interest = $1,000.00 / month
      const payment = computeMonthlyMortgagePayment('120000', '0', 120);
      expect(payment).toBe('1000.00');
    });
  });

  describe('generateAmortizationSchedule', () => {
    it('generates accurate first two months and final balance for a 30-year mortgage', () => {
      const schedule = generateAmortizationSchedule({
        principal: '400000',
        annualRate: '0.06',
        termMonths: 360,
        startDate: new Date('2026-01-01'),
      });

      expect(schedule.length).toBe(360);

      // Month 1 check
      const m1 = schedule[0];
      expect(m1.month).toBe(1);
      expect(m1.payment).toBe('2398.20');
      expect(m1.interest).toBe('2000.00'); // 400,000 * 0.005
      expect(m1.principal).toBe('398.20');  // 2,398.20 - 2,000.00
      expect(m1.remainingBalance).toBe('399601.80');

      // Month 2 check
      const m2 = schedule[1];
      expect(m2.month).toBe(2);
      expect(m2.interest).toBe('1998.01'); // 399,601.80 * 0.005
      expect(m2.principal).toBe('400.19');  // 2,398.20 - 1,998.01
      expect(m2.remainingBalance).toBe('399201.61');

      // Final month balance should amortize to 0
      const lastMonth = schedule[schedule.length - 1];
      expect(parseFloat(lastMonth.remainingBalance)).toBeCloseTo(0, 1);
    });
  });

  describe('getOutstandingBalanceAtDate', () => {
    it('returns original principal if date is before first payment', () => {
      const schedule = generateAmortizationSchedule({
        principal: '400000',
        annualRate: '0.06',
        termMonths: 360,
        startDate: new Date('2026-01-01'),
      });

      const bal = getOutstandingBalanceAtDate(schedule, new Date('2025-12-15'));
      expect(bal).toBe('400000.00');
    });

    it('returns correct remaining balance after 12 months', () => {
      const schedule = generateAmortizationSchedule({
        principal: '400000',
        annualRate: '0.06',
        termMonths: 360,
        startDate: new Date('2026-01-01'),
      });

      // After 12 months (Jan 2027)
      const bal = getOutstandingBalanceAtDate(schedule, new Date('2027-01-01'));
      expect(parseFloat(bal)).toBeLessThan(400000);
      expect(parseFloat(bal)).toBeGreaterThan(390000);
    });
  });

  describe('computePropertyEquity', () => {
    it('computes 100% ownership equity and LTV correctly', () => {
      const res = computePropertyEquity({
        marketValue: '500000',
        ownershipPct: '1.0',
        mortgageBalance: '350000',
      });

      expect(res.effectiveValue).toBe('500000.00');
      expect(res.equity).toBe('150000.00');
      expect(res.ltvPct).toBe('70.0');
    });

    it('computes partial ownership (e.g. 50% tenancy in common) equity correctly', () => {
      const res = computePropertyEquity({
        marketValue: '800000',
        ownershipPct: '0.50',
        mortgageBalance: '200000',
      });

      // 50% of 800k = 400k
      // Equity = 400k - 200k = 200k
      expect(res.effectiveValue).toBe('400000.00');
      expect(res.equity).toBe('200000.00');
      expect(res.ltvPct).toBe('50.0');
    });
  });
});
