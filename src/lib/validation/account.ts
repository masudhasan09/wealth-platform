import { z } from 'zod';

export const accountTypes = [
  'brokerage',
  'retirement_401k',
  'ira',
  'roth_ira',
  'hsa',
  'bank',
  'crypto_wallet',
  'property',
] as const;

export const accountSchema = z.object({
  name: z.string().min(2, 'Account name must be at least 2 characters').max(50),
  type: z.enum(accountTypes, {
    message: 'Please select a valid account type',
  }),
  currency: z.string().default('USD'),
  description: z.string().max(200).optional(),
});

export type AccountInput = z.infer<typeof accountSchema>;

