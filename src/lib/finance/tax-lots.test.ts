import { describe, it, expect } from 'vitest';
import {
  computeTaxLots,
  enrichOpenLotsWithPrices,
  computeRealizedGainsReport,
  isLongTerm,
  TaxLotTransaction,
} from './tax-lots';

describe('Tax Lots and Capital Gains (FIFO Engine)', () => {
  it('correctly determines short-term vs long-term holding period', () => {
    const buyDate = new Date('2024-01-15T00:00:00Z');
    // Exactly 1 year later (not more than 1 year) is short-term
    const oneYearLater = new Date('2025-01-15T00:00:00Z');
    expect(isLongTerm(buyDate, oneYearLater)).toBe(false);

    // 1 year and 1 day later is long-term
    const oneYearAndDay = new Date('2025-01-16T00:00:00Z');
    expect(isLongTerm(buyDate, oneYearAndDay)).toBe(true);

    // 6 months later is short-term
    const sixMonths = new Date('2024-07-15T00:00:00Z');
    expect(isLongTerm(buyDate, sixMonths)).toBe(false);
  });

  it('acceptance check: hand-built scenario with 3 buys and 2 sells produces expected FIFO gains and split', () => {
    // 3 buys and 2 sells
    const transactions: TaxLotTransaction[] = [
      // Buy 1: 10 @ $100 on Jan 10, 2024
      {
        id: 'tx-b1',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        symbol: 'AAPL',
        type: 'buy',
        quantity: '10',
        price: '100',
        amount: '1000',
        fee: '0',
        date: new Date('2024-01-10T10:00:00Z'),
      },
      // Buy 2: 10 @ $150 on June 15, 2024
      {
        id: 'tx-b2',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        symbol: 'AAPL',
        type: 'buy',
        quantity: '10',
        price: '150',
        amount: '1500',
        fee: '0',
        date: new Date('2024-06-15T10:00:00Z'),
      },
      // Buy 3: 10 @ $200 on March 1, 2025
      {
        id: 'tx-b3',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        symbol: 'AAPL',
        type: 'buy',
        quantity: '10',
        price: '200',
        amount: '2000',
        fee: '0',
        date: new Date('2025-03-01T10:00:00Z'),
      },
      // Sell 1: 15 @ $180 on Feb 15, 2025
      // Consumes:
      // - 10 from Buy 1 (held Jan 10, 2024 -> Feb 15, 2025: > 1 yr = LONG TERM). Cost: $1,000, Proceeds: $1,800, Gain: $800.
      // - 5 from Buy 2 (held Jun 15, 2024 -> Feb 15, 2025: 8 mos = SHORT TERM). Cost: $750, Proceeds: $900, Gain: $150.
      {
        id: 'tx-s1',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        symbol: 'AAPL',
        type: 'sell',
        quantity: '15',
        price: '180',
        amount: '2700',
        fee: '0',
        date: new Date('2025-02-15T10:00:00Z'),
      },
      // Sell 2: 10 @ $220 on Aug 1, 2025
      // Consumes:
      // - remaining 5 from Buy 2 (held Jun 15, 2024 -> Aug 1, 2025: > 1 yr = LONG TERM). Cost: $750, Proceeds: $1,100, Gain: $350.
      // - 5 from Buy 3 (held Mar 1, 2025 -> Aug 1, 2025: 5 mos = SHORT TERM). Cost: $1,000, Proceeds: $1,100, Gain: $100.
      {
        id: 'tx-s2',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        symbol: 'AAPL',
        type: 'sell',
        quantity: '10',
        price: '220',
        amount: '2200',
        fee: '0',
        date: new Date('2025-08-01T10:00:00Z'),
      },
    ];

    const result = computeTaxLots(transactions);

    // Check realized lots
    expect(result.realizedLots).toHaveLength(4);

    // Lot 1 consumed by Sell 1: Long Term
    const r1 = result.realizedLots[0];
    expect(r1.buyTransactionId).toBe('tx-b1');
    expect(r1.sellTransactionId).toBe('tx-s1');
    expect(r1.quantity).toBe('10.00000000');
    expect(r1.costBasis).toBe('1000.00');
    expect(r1.proceeds).toBe('1800.00');
    expect(r1.gainLoss).toBe('800.00');
    expect(r1.term).toBe('long_term');

    // Lot 2 partially consumed by Sell 1: Short Term
    const r2 = result.realizedLots[1];
    expect(r2.buyTransactionId).toBe('tx-b2');
    expect(r2.sellTransactionId).toBe('tx-s1');
    expect(r2.quantity).toBe('5.00000000');
    expect(r2.costBasis).toBe('750.00');
    expect(r2.proceeds).toBe('900.00');
    expect(r2.gainLoss).toBe('150.00');
    expect(r2.term).toBe('short_term');

    // Lot 2 remaining consumed by Sell 2: Long Term
    const r3 = result.realizedLots[2];
    expect(r3.buyTransactionId).toBe('tx-b2');
    expect(r3.sellTransactionId).toBe('tx-s2');
    expect(r3.quantity).toBe('5.00000000');
    expect(r3.costBasis).toBe('750.00');
    expect(r3.proceeds).toBe('1100.00');
    expect(r3.gainLoss).toBe('350.00');
    expect(r3.term).toBe('long_term');

    // Lot 3 partially consumed by Sell 2: Short Term
    const r4 = result.realizedLots[3];
    expect(r4.buyTransactionId).toBe('tx-b3');
    expect(r4.sellTransactionId).toBe('tx-s2');
    expect(r4.quantity).toBe('5.00000000');
    expect(r4.costBasis).toBe('1000.00');
    expect(r4.proceeds).toBe('1100.00');
    expect(r4.gainLoss).toBe('100.00');
    expect(r4.term).toBe('short_term');

    // Check open lots: exactly 5 shares from Buy 3 remain
    expect(result.openLots).toHaveLength(1);
    const open = result.openLots[0];
    expect(open.transactionId).toBe('tx-b3');
    expect(open.originalQuantity).toBe('10.00000000');
    expect(open.remainingQuantity).toBe('5.00000000');
    expect(open.costBasisPerUnit).toBe('200.00000000');
    expect(open.totalCostBasis).toBe('1000.00');

    // Check report for tax year 2025
    const report2025 = computeRealizedGainsReport(result.realizedLots, 2025);
    // Short term: 150 + 100 = 250
    expect(report2025.shortTermGain).toBe('250.00');
    // Long term: 800 + 350 = 1150
    expect(report2025.longTermGain).toBe('1150.00');
    // Total gain: 1400
    expect(report2025.totalGain).toBe('1400.00');
    // Total proceeds: 1800 + 900 + 1100 + 1100 = 4900
    expect(report2025.totalProceeds).toBe('4900.00');
    // Total cost basis: 1000 + 750 + 750 + 1000 = 3500
    expect(report2025.totalCostBasis).toBe('3500.00');
  });

  it('incorporates purchase fees into cost basis and sale fees reduce proceeds', () => {
    const transactions: TaxLotTransaction[] = [
      {
        id: 'tx-1',
        accountId: 'acc-1',
        instrumentId: 'inst-1',
        type: 'buy',
        quantity: '10',
        price: '100',
        amount: '1000',
        fee: '20', // Total cost = $1,020 -> $102/unit
        date: new Date('2024-01-01'),
      },
      {
        id: 'tx-2',
        accountId: 'acc-1',
        instrumentId: 'inst-1',
        type: 'sell',
        quantity: '10',
        price: '150',
        amount: '1500',
        fee: '15', // Net proceeds = $1,485
        date: new Date('2024-06-01'),
      },
    ];

    const result = computeTaxLots(transactions);
    expect(result.realizedLots).toHaveLength(1);
    const r = result.realizedLots[0];
    expect(r.costBasis).toBe('1020.00');
    expect(r.proceeds).toBe('1485.00');
    expect(r.gainLoss).toBe('465.00'); // 1485 - 1020 = 465
  });

  it('ignores voided transactions', () => {
    const transactions: TaxLotTransaction[] = [
      {
        id: 'tx-1',
        accountId: 'acc-1',
        instrumentId: 'inst-1',
        type: 'buy',
        quantity: '10',
        price: '100',
        amount: '1000',
        date: new Date('2024-01-01'),
      },
      {
        id: 'tx-voided-sell',
        accountId: 'acc-1',
        instrumentId: 'inst-1',
        type: 'sell',
        quantity: '10',
        price: '200',
        amount: '2000',
        date: new Date('2024-02-01'),
        voidedAt: new Date('2024-02-02'),
      },
    ];

    const result = computeTaxLots(transactions);
    expect(result.realizedLots).toHaveLength(0);
    expect(result.openLots).toHaveLength(1);
    expect(result.openLots[0].remainingQuantity).toBe('10.00000000');
  });

  it('enriches open tax lots with current market price and calculates unrealized gain/loss', () => {
    const transactions: TaxLotTransaction[] = [
      {
        id: 'tx-1',
        accountId: 'acc-1',
        instrumentId: 'inst-tsla',
        symbol: 'TSLA',
        type: 'buy',
        quantity: '5',
        price: '200',
        amount: '1000',
        date: new Date('2024-01-01'),
      },
    ];

    const { openLots } = computeTaxLots(transactions);
    const asOf = new Date('2024-07-01');
    const enriched = enrichOpenLotsWithPrices(openLots, { 'inst-tsla': '250' }, asOf);

    expect(enriched).toHaveLength(1);
    const lot = enriched[0];
    expect(lot.currentPrice).toBe('250.00');
    expect(lot.currentValue).toBe('1250.00'); // 5 * 250
    expect(lot.totalCostBasis).toBe('1000.00');
    expect(lot.unrealizedGainLoss).toBe('250.00');
    expect(lot.unrealizedGainLossPct).toBe('25.00');
    expect(lot.term).toBe('short_term');
  });
});

