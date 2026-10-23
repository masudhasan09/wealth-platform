import { z } from 'zod';

export const transactionTypes = [
  'deposit',
  'withdrawal',
  'buy',
  'sell',
  'dividend',
  'fee',
  'interest',
] as const;

export const transactionSchema = z
  .object({
    accountId: z.string().min(1, 'Please select an account'),
    type: z.enum(transactionTypes, {
      message: 'Please select a valid transaction type',
    }),
    symbol: z.string().trim().optional(),
    date: z.string().min(1, 'Please select a date'),
    quantity: z
      .string()
      .regex(/^\d*(\.\d+)?$/, 'Quantity must be a valid positive number')
      .default('0'),
    price: z
      .string()
      .regex(/^\d*(\.\d+)?$/, 'Price must be a valid positive number')
      .default('0'),
    amount: z
      .string()
      .regex(/^\d*(\.\d+)?$/, 'Amount must be a valid positive number')
      .default('0'),
    fee: z
      .string()
      .regex(/^\d*(\.\d+)?$/, 'Fee must be a valid positive number')
      .default('0'),
    note: z.string().max(250).optional(),
  })
  .refine(
    (data) => {
      // For buy or sell, symbol is required
      if (['buy', 'sell'].includes(data.type)) {
        return !!data.symbol && data.symbol.length > 0;
      }
      return true;
    },
    {
      message: 'Symbol is required for buy and sell transactions',
      path: ['symbol'],
    }
  )
  .refine(
    (data) => {
      // For buy or sell, quantity must be > 0
      if (['buy', 'sell'].includes(data.type)) {
        const qty = parseFloat(data.quantity || '0');
        return qty > 0;
      }
      return true;
    },
    {
      message: 'Quantity must be greater than zero',
      path: ['quantity'],
    }
  )
  .refine(
    (data) => {
      // For buy or sell, price must be > 0
      if (['buy', 'sell'].includes(data.type)) {
        const price = parseFloat(data.price || '0');
        return price > 0;
      }
      return true;
    },
    {
      message: 'Price must be greater than zero',
      path: ['price'],
    }
  )
  .refine(
    (data) => {
      // For deposit, withdrawal, dividend, interest, amount must be > 0
      if (['deposit', 'withdrawal', 'dividend', 'interest'].includes(data.type)) {
        const amt = parseFloat(data.amount || '0');
        return amt > 0;
      }
      return true;
    },
    {
      message: 'Amount must be greater than zero',
      path: ['amount'],
    }
  );

export type TransactionInput = z.infer<typeof transactionSchema>;

export const voidTransactionSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  reason: z.string().max(200).optional(),
});

export type VoidTransactionInput = z.infer<typeof voidTransactionSchema>;

