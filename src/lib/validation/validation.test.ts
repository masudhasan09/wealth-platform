import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  accountSchema,
  transactionSchema,
  voidTransactionSchema,
} from './index';

describe('Validation Schemas', () => {
  describe('auth schemas', () => {
    it('validates a correct login payload', () => {
      const res = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(res.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const res = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(res.success).toBe(false);
    });

    it('requires password to be at least 8 characters on registration', () => {
      const res = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'short',
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain('at least 8 characters');
      }
    });
  });

  describe('account schema', () => {
    it('accepts valid account data', () => {
      const res = accountSchema.safeParse({
        name: 'Roth IRA',
        type: 'roth_ira',
        currency: 'USD',
      });
      expect(res.success).toBe(true);
    });

    it('rejects invalid account type', () => {
      const res = accountSchema.safeParse({
        name: 'Savings',
        type: 'unknown_type',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('transaction schema', () => {
    it('accepts valid buy transaction', () => {
      const res = transactionSchema.safeParse({
        accountId: 'acc-1',
        type: 'buy',
        symbol: 'AAPL',
        date: '2024-01-01',
        quantity: '10',
        price: '150.00',
        amount: '1500.00',
        fee: '0',
      });
      expect(res.success).toBe(true);
    });

    it('requires symbol and positive quantity for buy', () => {
      const res = transactionSchema.safeParse({
        accountId: 'acc-1',
        type: 'buy',
        symbol: '',
        date: '2024-01-01',
        quantity: '0',
        price: '150.00',
      });
      expect(res.success).toBe(false);
    });

    it('accepts valid deposit transaction without symbol', () => {
      const res = transactionSchema.safeParse({
        accountId: 'acc-1',
        type: 'deposit',
        date: '2024-01-01',
        amount: '2000',
      });
      expect(res.success).toBe(true);
    });
  });

  describe('voidTransaction schema', () => {
    it('accepts valid void transaction request', () => {
      const res = voidTransactionSchema.safeParse({
        transactionId: 'tx-123',
        reason: 'Duplicate transaction recorded by mistake',
      });
      expect(res.success).toBe(true);
    });
  });
});

