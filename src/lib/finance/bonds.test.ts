/**
 * Unit & Integration Tests for Fixed Income & Bond Analytics.
 * Tested against independent spreadsheet calculations in tests/fixtures/bonds.fixture.json.
 */
import { describe, it, expect } from 'vitest';
import {
  accruedInterest,
  currentYield,
  yieldToMaturity,
  couponSchedule,
  maturityLadder,
  type BondModel,
  type BondHoldingItem,
} from './bonds';
import fixtures from '../../../tests/fixtures/bonds.fixture.json';

describe('Fixed Income Math: Accrued Interest', () => {
  it('passes the US Treasury actual/actual sanity check from specification (~$8.24)', () => {
    // 60 days elapsed in a 182-day coupon period: 25 * (60 / 182) = 8.241758...
    const testCase = fixtures.accruedInterest[0];
    const accrued = accruedInterest(testCase.bond as unknown as BondModel, testCase.settlementDate);
    expect(accrued).toBe(testCase.expectedAccrued);
  });

  it('calculates corporate 30/360 accrued interest accurately', () => {
    // Exactly 90 days out of 180 elapsed for a 6% semi-annual bond = $15.00
    const testCase = fixtures.accruedInterest[1];
    const accrued = accruedInterest(testCase.bond as unknown as BondModel, testCase.settlementDate);
    expect(accrued).toBe(testCase.expectedAccrued);
  });

  it('returns zero accrued interest for zero-coupon bonds', () => {
    const testCase = fixtures.accruedInterest[2];
    const accrued = accruedInterest(testCase.bond as unknown as BondModel, testCase.settlementDate);
    expect(accrued).toBe('0.00');
  });

  it('returns zero if settlement is on or after maturity date', () => {
    const bond: BondModel = {
      faceValue: '1000',
      couponRate: '0.05',
      couponFrequency: 'semi_annual',
      maturityDate: '2024-01-01',
    };
    expect(accruedInterest(bond, '2024-01-01')).toBe('0.00');
    expect(accruedInterest(bond, '2024-06-01')).toBe('0.00');
  });
});

describe('Fixed Income Math: Current Yield', () => {
  it('calculates current yield for discount, par, and premium bonds', () => {
    for (const testCase of fixtures.currentYield) {
      const cy = currentYield(testCase.bond, testCase.price);
      expect(cy).toBe(testCase.expectedCurrentYield);
    }
  });

  it('returns zero current yield when price or rate is zero', () => {
    expect(currentYield({ faceValue: '1000', couponRate: '0.00' }, '950')).toBe('0.000000');
    expect(currentYield({ faceValue: '1000', couponRate: '0.05' }, '0')).toBe('0.000000');
  });
});

describe('Fixed Income Math: Yield to Maturity (YTM)', () => {
  it('matches coupon rate when bond price equals face value (par bond)', () => {
    const testCase = fixtures.yieldToMaturity[0];
    const ytm = yieldToMaturity(testCase.bond as unknown as BondModel, testCase.price, testCase.settlementDate);
    expect(ytm).toBe(testCase.expectedYTM);
  });

  it('calculates discount bond YTM accurately (~7.76% for 2yr 5% semi at $950)', () => {
    const testCase = fixtures.yieldToMaturity[1];
    const ytm = yieldToMaturity(testCase.bond as unknown as BondModel, testCase.price, testCase.settlementDate);
    expect(ytm).toBe(testCase.expectedYTM);
  });

  it('calculates zero-coupon bond YTM accurately', () => {
    const testCase = fixtures.yieldToMaturity[2];
    const ytm = yieldToMaturity(testCase.bond as unknown as BondModel, testCase.price, testCase.settlementDate);
    expect(ytm).toBe(testCase.expectedYTM);
  });
});

describe('Fixed Income Math: Coupon Schedule', () => {
  it('generates regular coupon payment dates and amounts until maturity', () => {
    const bond: BondModel = {
      faceValue: '1000',
      couponRate: '0.04',
      couponFrequency: 'semi_annual',
      issueDate: '2024-01-01T00:00:00.000Z',
      maturityDate: '2025-01-01T00:00:00.000Z',
    };

    const schedule = couponSchedule(bond);
    expect(schedule).toHaveLength(2);
    expect(schedule[0].amount).toBe('20.00');
    expect(schedule[1].amount).toBe('20.00');
    expect(schedule[0].paymentDate.getUTCMonth()).toBe(6); // July
    expect(schedule[1].paymentDate.getUTCMonth()).toBe(0); // January
  });

  it('returns empty schedule for zero coupon bond', () => {
    const bond: BondModel = {
      faceValue: '1000',
      couponRate: '0.00',
      couponFrequency: 'zero_coupon',
      maturityDate: '2025-01-01T00:00:00.000Z',
    };
    expect(couponSchedule(bond)).toEqual([]);
  });
});

describe('Fixed Income Math: Maturity Ladder', () => {
  it('categorizes bonds into maturity duration buckets with aggregate totals', () => {
    const now = '2024-01-01T00:00:00.000Z';
    const bonds: BondHoldingItem[] = [
      {
        symbol: 'UST-6M',
        name: 'US Treasury Bill 6M',
        maturityDate: '2024-06-01T00:00:00.000Z',
        faceValue: '1000',
        marketPrice: '980',
        quantity: '5',
        couponRate: '0.00',
      },
      {
        symbol: 'UST-2Y',
        name: 'US Treasury Note 2Y',
        maturityDate: '2025-06-01T00:00:00.000Z',
        faceValue: '1000',
        marketPrice: '990',
        quantity: '10',
        couponRate: '0.045',
      },
      {
        symbol: 'UST-10Y',
        name: 'US Treasury Bond 10Y',
        maturityDate: '2034-01-01T00:00:00.000Z',
        faceValue: '1000',
        marketPrice: '1000',
        quantity: '2',
        couponRate: '0.04',
      },
    ];

    const ladder = maturityLadder(bonds, now);
    expect(ladder).toHaveLength(5);

    const lessThan1Y = ladder.find((b) => b.bucket === '< 1 Year');
    expect(lessThan1Y?.bondCount).toBe(1);
    expect(lessThan1Y?.totalFaceValue).toBe('5000.00');
    expect(lessThan1Y?.totalMarketValue).toBe('4900.00');

    const oneToThreeY = ladder.find((b) => b.bucket === '1 - 3 Years');
    expect(oneToThreeY?.bondCount).toBe(1);
    expect(oneToThreeY?.totalFaceValue).toBe('10000.00');
    expect(oneToThreeY?.annualIncome).toBe('450.00'); // 10,000 * 0.045

    const tenPlusY = ladder.find((b) => b.bucket === '10+ Years');
    expect(tenPlusY?.bondCount).toBe(1);
    expect(tenPlusY?.totalFaceValue).toBe('2000.00');
    expect(tenPlusY?.annualIncome).toBe('80.00'); // 2,000 * 0.04
  });
});
