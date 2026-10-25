import { describe, it, expect } from 'vitest';
import {
  computeHoldings,
  computeCashBalances,
  InsufficientHoldingsError,
  type FinanceTransaction,
} from './holdings';

describe('Finance Module: computeHoldings', () => {
  it('calculates average cost: buy 10 @ $100 then buy 10 @ $120 gives quantity 20 and average cost $110', () => {
    const transactions: FinanceTransaction[] = [
      {
        id: 'tx-1',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        type: 'buy',
        quantity: '10',
        price: '100',
        amount: '1000',
        fee: '0',
        date: new Date('2024-01-01'),
      },
      {
        id: 'tx-2',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        type: 'buy',
        quantity: '10',
        price: '120',
        amount: '1200',
        fee: '0',
        date: new Date('2024-01-02'),
      },
    ];

    const holdings = computeHoldings(transactions);
    const aapl = holdings.find(
      (h) => h.accountId === 'acc-1' && h.instrumentId === 'inst-aapl'
    );

    expect(aapl).toBeDefined();
    expect(aapl?.quantity).toBe('20');
    expect(aapl?.averageCost).toBe('110');
    expect(aapl?.totalCost).toBe('2200');
  });

  it('sell 5 reduces quantity to 15 without changing average cost ($110)', () => {
    const transactions: FinanceTransaction[] = [
      {
        id: 'tx-1',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        type: 'buy',
        quantity: '10',
        price: '100',
        amount: '1000',
        fee: '0',
        date: new Date('2024-01-01'),
      },
      {
        id: 'tx-2',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        type: 'buy',
        quantity: '10',
        price: '120',
        amount: '1200',
        fee: '0',
        date: new Date('2024-01-02'),
      },
      {
        id: 'tx-3',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        type: 'sell',
        quantity: '5',
        price: '150',
        amount: '750',
        fee: '0',
        date: new Date('2024-01-03'),
      },
    ];

    const holdings = computeHoldings(transactions);
    const aapl = holdings.find(
      (h) => h.accountId === 'acc-1' && h.instrumentId === 'inst-aapl'
    );

    expect(aapl).toBeDefined();
    expect(aapl?.quantity).toBe('15');
    expect(aapl?.averageCost).toBe('110');
    expect(aapl?.totalCost).toBe('1650');
  });

  it('rejects selling more than owned by throwing InsufficientHoldingsError', () => {
    const transactions: FinanceTransaction[] = [
      {
        id: 'tx-1',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        type: 'buy',
        quantity: '10',
        price: '100',
        amount: '1000',
        fee: '0',
        date: new Date('2024-01-01'),
      },
      {
        id: 'tx-2',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        type: 'sell',
        quantity: '15',
        price: '105',
        amount: '1575',
        fee: '0',
        date: new Date('2024-01-02'),
      },
    ];

    expect(() => computeHoldings(transactions)).toThrow(InsufficientHoldingsError);
  });

  it('safely clamps holdings to 0 when strict is false to avoid crashing read-only views', () => {
    const transactions: FinanceTransaction[] = [
      {
        id: 'tx-1',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        type: 'buy',
        quantity: '10',
        price: '100',
        amount: '1000',
        fee: '0',
        date: new Date('2024-01-01'),
        voidedAt: new Date('2024-01-02'), // Voided buy
      },
      {
        id: 'tx-2',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        type: 'sell',
        quantity: '10',
        price: '120',
        amount: '1200',
        fee: '0',
        date: new Date('2024-01-03'), // Orphaned sell
      },
    ];

    expect(() => computeHoldings(transactions, { strict: false })).not.toThrow();
    const holdings = computeHoldings(transactions, { strict: false });
    expect(holdings.length).toBe(0);
  });

  it('ignores voided transactions in holdings calculation', () => {
    const transactions: FinanceTransaction[] = [
      {
        id: 'tx-1',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        type: 'buy',
        quantity: '10',
        price: '100',
        amount: '1000',
        fee: '0',
        date: new Date('2024-01-01'),
      },
      {
        id: 'tx-2',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        type: 'buy',
        quantity: '10',
        price: '150',
        amount: '1500',
        fee: '0',
        date: new Date('2024-01-02'),
        voidedAt: new Date('2024-01-03'),
        voidedReason: 'Duplicate entry',
      },
    ];

    const holdings = computeHoldings(transactions);
    const aapl = holdings.find(
      (h) => h.accountId === 'acc-1' && h.instrumentId === 'inst-aapl'
    );

    expect(aapl).toBeDefined();
    expect(aapl?.quantity).toBe('10');
    expect(aapl?.averageCost).toBe('100');
    expect(aapl?.totalCost).toBe('1000');
  });
});

describe('Finance Module: computeCashBalances', () => {
  it('correctly tracks deposits, buys, sells, dividends, fees, and interest', () => {
    const transactions: FinanceTransaction[] = [
      // Deposit $5,000
      {
        id: 'tx-1',
        accountId: 'acc-1',
        instrumentId: 'inst-cash',
        type: 'deposit',
        quantity: '5000',
        price: '1',
        amount: '5000',
        fee: '0',
        date: new Date('2024-01-01'),
      },
      // Buy 10 AAPL @ $100 with $5 fee -> Cash outflow = $1,005
      {
        id: 'tx-2',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        type: 'buy',
        quantity: '10',
        price: '100',
        amount: '1000',
        fee: '5',
        date: new Date('2024-01-02'),
      },
      // Dividend received $25
      {
        id: 'tx-3',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        type: 'dividend',
        quantity: '0',
        price: '0',
        amount: '25',
        fee: '0',
        date: new Date('2024-01-03'),
      },
      // Sell 2 AAPL @ $120 with $2 fee -> Cash inflow = 2*120 - 2 = $238
      {
        id: 'tx-4',
        accountId: 'acc-1',
        instrumentId: 'inst-aapl',
        type: 'sell',
        quantity: '2',
        price: '120',
        amount: '240',
        fee: '2',
        date: new Date('2024-01-04'),
      },
      // Interest earned $10
      {
        id: 'tx-5',
        accountId: 'acc-1',
        instrumentId: 'inst-cash',
        type: 'interest',
        quantity: '0',
        price: '0',
        amount: '10',
        fee: '0',
        date: new Date('2024-01-05'),
      },
      // Withdrawal $500
      {
        id: 'tx-6',
        accountId: 'acc-1',
        instrumentId: 'inst-cash',
        type: 'withdrawal',
        quantity: '500',
        price: '1',
        amount: '500',
        fee: '0',
        date: new Date('2024-01-06'),
      },
      // Account fee $15
      {
        id: 'tx-7',
        accountId: 'acc-1',
        instrumentId: 'inst-cash',
        type: 'fee',
        quantity: '0',
        price: '0',
        amount: '15',
        fee: '15',
        date: new Date('2024-01-07'),
      },
      // Voided deposit $10,000 (must be ignored)
      {
        id: 'tx-8',
        accountId: 'acc-1',
        instrumentId: 'inst-cash',
        type: 'deposit',
        quantity: '10000',
        price: '1',
        amount: '10000',
        fee: '0',
        date: new Date('2024-01-08'),
        voidedAt: new Date('2024-01-09'),
      },
    ];

    // Math:
    // Start: 0
    // + 5000 (deposit) = 5000
    // - 1005 (buy 10*100 + 5 fee) = 3995
    // + 25 (dividend) = 4020
    // + 238 (sell 2*120 - 2 fee) = 4258
    // + 10 (interest) = 4268
    // - 500 (withdrawal) = 3768
    // - 15 (fee) = 3753
    const balances = computeCashBalances(transactions);
    expect(balances['acc-1']).toBe('3753');
  });

  it('handles crypto transfers and crypto fees with high precision', () => {
    const transactions: FinanceTransaction[] = [
      {
        id: 'tx-btc-1',
        accountId: 'acc-crypto',
        instrumentId: 'inst-btc',
        type: 'transfer_in',
        quantity: '0.75000000',
        price: '60000',
        amount: '45000',
        fee: '0',
        date: new Date('2024-01-01'),
      },
      {
        id: 'tx-btc-2',
        accountId: 'acc-crypto',
        instrumentId: 'inst-btc',
        type: 'crypto_fee',
        quantity: '0.00050000',
        price: '0',
        amount: '0',
        fee: '0',
        date: new Date('2024-01-02'),
      },
      {
        id: 'tx-btc-3',
        accountId: 'acc-crypto',
        instrumentId: 'inst-btc',
        type: 'transfer_out',
        quantity: '0.24950000',
        price: '65000',
        amount: '16217.50',
        fee: '0',
        date: new Date('2024-01-03'),
      },
    ];

    const holdings = computeHoldings(transactions);
    const btc = holdings.find((h) => h.instrumentId === 'inst-btc');
    expect(btc).toBeDefined();
    // 0.75000000 - 0.00050000 - 0.24950000 = 0.50000000
    expect(btc?.quantity).toBe('0.5');
    expect(btc?.averageCost).toBe('60000');
  });

  it('handles bond coupon and bond maturity in cash balances and holdings', () => {
    const transactions: FinanceTransaction[] = [
      {
        id: 'tx-bond-buy',
        accountId: 'acc-fixed',
        instrumentId: 'inst-ust-10y',
        type: 'buy',
        quantity: '10',
        price: '980',
        amount: '9800',
        fee: '10',
        date: new Date('2024-01-01'),
      },
      {
        id: 'tx-coupon-1',
        accountId: 'acc-fixed',
        instrumentId: 'inst-ust-10y',
        type: 'coupon',
        quantity: '0',
        price: '0',
        amount: '200',
        fee: '0',
        date: new Date('2024-06-01'),
      },
      {
        id: 'tx-maturity',
        accountId: 'acc-fixed',
        instrumentId: 'inst-ust-10y',
        type: 'maturity',
        quantity: '10',
        price: '1000',
        amount: '10000',
        fee: '5',
        date: new Date('2024-12-31'),
      },
    ];

    const holdings = computeHoldings(transactions);
    // Bond has matured and all 10 units redeemed -> holding should be 0 (omitted)
    const bondHolding = holdings.find((h) => h.instrumentId === 'inst-ust-10y');
    expect(bondHolding).toBeUndefined();

    // Cash balance:
    // - 9810 (buy 10*980 + 10 fee)
    // + 200 (coupon)
    // + 9995 (maturity 10000 - 5 fee)
    // = +385
    const cash = computeCashBalances(transactions);
    expect(cash['acc-fixed']).toBe('385');
  });
});

