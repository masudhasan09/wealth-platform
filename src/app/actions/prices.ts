'use server';

import { auth } from '@/auth';
import { upsertPrice } from '@/lib/db/prices';
import { findOrCreateInstrument } from '@/lib/db/instruments';
import { getPrices } from '@/lib/services/price.service';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Set Manual Price
// ---------------------------------------------------------------------------

const SetPriceSchema = z.object({
  ticker: z.string().min(1).max(20).toUpperCase(),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,8})?$/, 'Price must be a positive decimal number'),
  note: z.string().max(500).optional(),
});

export type SetPriceInput = z.infer<typeof SetPriceSchema>;
export interface SetPriceResult {
  success: boolean;
  error?: string;
}

/**
 * Record a manual price for an instrument.
 * The price is stored in the Price table with source=manual.
 */
export async function setPriceAction(input: SetPriceInput): Promise<SetPriceResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  const parsed = SetPriceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { ticker, price } = parsed.data;

  try {
    const instrument = await findOrCreateInstrument({ symbol: ticker });
    await upsertPrice({
      instrumentId: instrument.id,
      value: price,
      source: 'manual',
      asOf: new Date(),
      method: 'manual',
    });
    return { success: true };
  } catch (err) {
    console.error('[setPriceAction]', err);
    return { success: false, error: 'Failed to save price' };
  }
}

// ---------------------------------------------------------------------------
// Get prices for a list of tickers (used by net worth page)
// ---------------------------------------------------------------------------

export interface TickerPrice {
  ticker: string;
  price: string | null;
  source: string | null;
  asOf: string | null;
  isStale: boolean;
  freshnessLabel: string | null;
}

export async function getTickerPricesAction(tickers: string[]): Promise<TickerPrice[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const map = await getPrices(tickers);

  return tickers.map((t) => {
    const q = map.get(t.toUpperCase());
    return {
      ticker: t.toUpperCase(),
      price: q?.price ?? null,
      source: q?.source ?? null,
      asOf: q?.asOf?.toISOString() ?? null,
      isStale: q?.isStale ?? false,
      freshnessLabel: q?.freshnessLabel ?? null,
    };
  });
}
