import { z } from 'zod';

export const couponFrequencyTypes = [
  'annual',
  'semi_annual',
  'quarterly',
  'monthly',
  'zero_coupon',
] as const;

export const dayCountTypes = [
  'actual_actual',
  'thirty_360',
  'actual_360',
  'actual_365',
] as const;

export const bondSubTypes = [
  'treasury_bill',
  'treasury_note',
  'treasury_bond',
  'tips',
  'corporate',
  'municipal',
] as const;

export const bondSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Bond symbol/identifier is required')
    .max(30)
    .trim(),
  name: z
    .string()
    .min(1, 'Bond name/description is required')
    .max(100)
    .trim(),
  faceValue: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'Face value must be a positive number')
    .default('1000'),
  couponRate: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'Coupon rate must be a decimal (e.g. 0.05 for 5%)')
    .default('0'),
  couponFrequency: z.enum(couponFrequencyTypes, {
    message: 'Please select a valid coupon frequency',
  }),
  maturityDate: z.string().min(1, 'Maturity date is required'),
  issueDate: z.string().optional(),
  dayCount: z.enum(dayCountTypes).default('actual_actual'),
  subType: z.enum(bondSubTypes).default('treasury_note'),
  callDate: z.string().optional(),
  callPrice: z.string().optional(),
});

export type BondInput = z.infer<typeof bondSchema>;
