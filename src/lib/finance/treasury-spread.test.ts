import { describe, it, expect } from 'vitest';
import { benchmarkSpread } from './treasury-spread';

describe('US Treasury Benchmark Spread Interpolation', () => {
  it('passes Prompt 2 sanity test: 2y @ 4.0%, 5y @ 4.5%, bond with 3.5y left @ 4.80% YTM gives 55 bps spread', () => {
    const curve = [
      { tenor: '3m', yieldPct: '0.0435' },
      { tenor: '2y', yieldPct: '0.0400' }, // 4.0%
      { tenor: '5y', yieldPct: '0.0450' }, // 4.5%
      { tenor: '10y', yieldPct: '0.0420' },
      { tenor: '30y', yieldPct: '0.0450' },
    ];

    // 3.5 years is halfway between 2y and 5y: (3.5 - 2)/(5 - 2) = 1.5/3 = 0.5
    // Benchmark = 4.0% + 0.5 * (4.5% - 4.0%) = 4.25%
    // Spread = 4.80% - 4.25% = 0.55% = 55 bps
    const result = benchmarkSpread('0.0480', curve, 3.5);

    expect(result.benchmarkYield).toBe('0.0425');
    expect(result.spreadPct).toBe('0.0055');
    expect(result.spreadBps).toBe(55);
  });

  it('clamps to endpoints if bond maturity is below min tenor or above max tenor', () => {
    const curve = [
      { tenor: '2y', yieldPct: '0.0400' },
      { tenor: '10y', yieldPct: '0.0450' },
    ];

    const shortResult = benchmarkSpread('0.0500', curve, 1.0);
    expect(shortResult.benchmarkYield).toBe('0.0400');
    expect(shortResult.spreadBps).toBe(100);

    const longResult = benchmarkSpread('0.0500', curve, 15.0);
    expect(longResult.benchmarkYield).toBe('0.0450');
    expect(longResult.spreadBps).toBe(50);
  });
});

