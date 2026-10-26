import { z } from 'zod';

export const propertySchema = z.object({
  name: z.string().min(2, 'Property name must be at least 2 characters').max(100),
  address: z.string().min(5, 'Address must be at least 5 characters').max(200),
  purchasePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid purchase price'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  ownershipPct: z.string().regex(/^(0(\.\d{1,4})?|1(\.0{1,4})?)$/, 'Ownership percentage must be between 0 and 1.0 (e.g. 0.50 for 50%)'),
  propertyType: z.enum(['residential', 'commercial', 'multi_family', 'land', 'industrial']).default('residential'),
  currentValue: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid current valuation').optional(),
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const valuationMarkSchema = z.object({
  instrumentId: z.string().min(1, 'Instrument ID is required'),
  value: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid valuation'),
  date: z.string().min(1, 'Valuation date is required'),
  method: z.enum(['manual', 'model', 'market']).default('manual'),
  note: z.string().max(300).optional(),
});

export type ValuationMarkInput = z.infer<typeof valuationMarkSchema>;

export const mortgageSchema = z.object({
  name: z.string().min(2, 'Mortgage name must be at least 2 characters').max(100),
  accountId: z.string().min(1, 'Account is required'),
  linkedInstrumentId: z.string().optional(),
  principal: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid loan amount'),
  rate: z.string().regex(/^(0(\.\d{1,6})?|1(\.0{1,6})?)$/, 'Annual rate must be a decimal fraction (e.g. 0.065 for 6.5%)'),
  termMonths: z.number().int().min(12).max(480),
  startDate: z.string().min(1, 'Start date is required'),
});

export type MortgageInput = z.infer<typeof mortgageSchema>;
