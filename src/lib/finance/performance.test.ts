import { describe, it, expect } from 'vitest';
import {
  computeTWR,
  computeMWR,
  partitionPositionsByLiquidity,
  APPRAISED_ASSET_SMOOTHING_EXPLANATION,
  type CashFlowItem,
  type TWRSubPeriod,
} from './performance';

describe('Performance Engine (pure decimal.js)', () => {
  describe('computeTWR (Time-Weighted Return)', () => {
    it('computes exact hand-calculated 21.0% TWR for mid-period deposit scenario', () => {
      // Scenario from Phase 4 specification:
      // Subperiod 1: starts at $100,000, grows to $110,000 (+10%), deposit $50k makes it $160,000
      // Subperiod 2: starts at $160,000, grows to $176,000 (+10%)
      // Hand calculation: (1 + 0.10) * (1 + 0.10) - 1 = 1.21 - 1 = 0.21 (+21.0%)
      const subperiods: TWRSubPeriod[] = [
        {
          startValue: '100000',
          endValueBeforeFlow: '110000',
          netFlow: '50000',
        },
        {
          startValue: '160000',
          endValueBeforeFlow: '176000',
          netFlow: '0',
        },
      ];

      const res = computeTWR(subperiods);
      expect(res.twrPct).toBe('21.00');
      expect(res.subperiodReturns).toEqual(['10.00', '10.00']);
    });

    it('computes TWR for negative return scenario', () => {
      // Subperiod 1: $100k -> $80k (-20%), then $20k withdrawal -> $60k
      // Subperiod 2: $60k -> $72k (+20%)
      // Total TWR: (0.80 * 1.20) - 1 = 0.96 - 1 = -4.00%
      const subperiods: TWRSubPeriod[] = [
        {
          startValue: '100000',
          endValueBeforeFlow: '80000',
          netFlow: '-20000',
        },
        {
          startValue: '60000',
          endValueBeforeFlow: '72000',
          netFlow: '0',
        },
      ];

      const res = computeTWR(subperiods);
      expect(res.twrPct).toBe('-4.00');
    });

    it('returns 0.00% when no subperiods exist or initial value is 0', () => {
      expect(computeTWR([]).twrPct).toBe('0.00');
    });
  });

  describe('computeMWR (Money-Weighted Return / XIRR)', () => {
    it('solves exact hand-calculated 21.0% annual MWR for mid-period deposit scenario', () => {
      // Cash flows (using exactly 182.5 days for half-year and 365 days for full year):
      // 2025-01-01: -100,000 (initial investment)
      // 2025-07-02: -50,000 (182.5 days = half year)
      // 2026-01-01: +176,000 (terminal value at exactly 365 days)
      const flows: CashFlowItem[] = [
        { date: new Date('2025-01-01T00:00:00Z'), amount: '-100000' },
        { date: new Date('2025-07-02T12:00:00Z'), amount: '-50000' },
      ];

      const terminalValue = '176000';
      const terminalDate = new Date('2026-01-01T00:00:00Z');

      const res = computeMWR({
        cashFlows: flows,
        terminalValue,
        terminalDate,
      });

      // Annual MWR is 21.0%
      expect(parseFloat(res.mwrPct)).toBeCloseTo(21.0, 1);
    });

    it('converges properly for simple 1-year 10% gain', () => {
      const flows: CashFlowItem[] = [
        { date: new Date('2025-01-01T00:00:00Z'), amount: '-100000' },
      ];

      const res = computeMWR({
        cashFlows: flows,
        terminalValue: '110000',
        terminalDate: new Date('2026-01-01T00:00:00Z'),
      });

      expect(parseFloat(res.mwrPct)).toBeCloseTo(10.0, 1);
    });
  });

  describe('partitionPositionsByLiquidity & Appraisal Tooltip', () => {
    it('separates mark-to-market vs illiquid appraised assets', () => {
      const sample = [
        { symbol: 'AAPL', assetClass: 'equity', marketValue: '50000' },
        { symbol: 'BTC', assetClass: 'crypto', marketValue: '20000' },
        { symbol: 'PROP-1', assetClass: 'real_estate', marketValue: '400000' },
        { symbol: 'UST-4Y', assetClass: 'fixed_income', marketValue: '15000' },
      ];

      const { liquid, illiquid } = partitionPositionsByLiquidity(sample);
      expect(liquid.map((p) => p.symbol)).toEqual(['AAPL', 'BTC', 'UST-4Y']);
      expect(illiquid.map((p) => p.symbol)).toEqual(['PROP-1']);
    });

    it('contains clear explanation of appraisal smoothing bias', () => {
      expect(APPRAISED_ASSET_SMOOTHING_EXPLANATION.toLowerCase()).toContain('appraised');
      expect(APPRAISED_ASSET_SMOOTHING_EXPLANATION.toLowerCase()).toContain('volatility');
    });
  });
});
