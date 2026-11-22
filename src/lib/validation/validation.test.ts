import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
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

    it('validates profile name updates', () => {
      const valid = updateProfileSchema.safeParse({ name: 'Alice Smith' });
      expect(valid.success).toBe(true);

      const invalid = updateProfileSchema.safeParse({ name: ' ' });
      expect(invalid.success).toBe(false);
    });

    it('validates password change requirements and confirmation matching', () => {
      const valid = changePasswordSchema.safeParse({
        currentPassword: 'oldPassword123',
        newPassword: 'newSecretPassword123',
        confirmPassword: 'newSecretPassword123',
      });
      expect(valid.success).toBe(true);

      const mismatch = changePasswordSchema.safeParse({
        currentPassword: 'oldPassword123',
        newPassword: 'newSecretPassword123',
        confirmPassword: 'differentPassword123',
      });
      expect(mismatch.success).toBe(false);
      if (!mismatch.success) {
        expect(mismatch.error.issues[0].message).toContain('do not match');
      }

      const tooShort = changePasswordSchema.safeParse({
        currentPassword: 'oldPassword123',
        newPassword: 'short',
        confirmPassword: 'short',
      });
      expect(tooShort.success).toBe(false);
    });

    it('validates forgot password email input', () => {
      const valid = forgotPasswordSchema.safeParse({ email: 'user@example.com' });
      expect(valid.success).toBe(true);

      const invalid = forgotPasswordSchema.safeParse({ email: 'not-an-email' });
      expect(invalid.success).toBe(false);
    });

    it('validates reset password inputs', () => {
      const valid = resetPasswordSchema.safeParse({
        token: 'valid-reset-token-123',
        password: 'newSecretPassword123',
        confirmPassword: 'newSecretPassword123',
      });
      expect(valid.success).toBe(true);

      const mismatch = resetPasswordSchema.safeParse({
        token: 'valid-reset-token-123',
        password: 'newSecretPassword123',
        confirmPassword: 'differentPassword123',
      });
      expect(mismatch.success).toBe(false);

      const missingToken = resetPasswordSchema.safeParse({
        token: '',
        password: 'newSecretPassword123',
        confirmPassword: 'newSecretPassword123',
      });
      expect(missingToken.success).toBe(false);
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

