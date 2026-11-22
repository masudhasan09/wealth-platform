'use server';

import { auth } from '@/auth';
import { upsertPrice } from '@/lib/db/prices';
import { findOrCreateInstrument } from '@/lib/db/instruments';
import { getPrice, getPrices } from '@/lib/services/price.service';
import { prisma } from '@/lib/db/client';
import { revalidatePath } from 'next/cache';
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
    revalidatePath('/prices');
    revalidatePath('/holdings');
    revalidatePath('/net-worth');
    revalidatePath('/dashboard');
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

// ---------------------------------------------------------------------------
// Live Market Data Fetch & Sync
// ---------------------------------------------------------------------------

export interface LiveQuoteResult {
  success: boolean;
  ticker?: string;
  price?: string;
  source?: string;
  error?: string;
}

export async function fetchLivePriceAction(ticker: string): Promise<LiveQuoteResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  const clean = ticker.trim().toUpperCase();
  if (!clean) return { success: false, error: 'Ticker is required' };

  try {
    const quote = await getPrice(clean, { forceRefresh: true });
    return {
      success: true,
      ticker: clean,
      price: quote.price,
      source: quote.source,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch live market price';
    return { success: false, error: msg };
  }
}

export async function syncLivePriceAction(ticker: string): Promise<LiveQuoteResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

  const clean = ticker.trim().toUpperCase();
  if (!clean) return { success: false, error: 'Ticker is required' };

  try {
    const quote = await getPrice(clean, { forceRefresh: true });
    const instrument = await findOrCreateInstrument({ symbol: clean });
    await upsertPrice({
      instrumentId: instrument.id,
      value: quote.price,
      source: quote.source,
      asOf: quote.asOf,
      method: quote.method,
    });

    revalidatePath('/prices');
    revalidatePath('/holdings');
    revalidatePath('/net-worth');
    revalidatePath('/dashboard');

    return {
      success: true,
      ticker: clean,
      price: quote.price,
      source: quote.source,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to sync live price';
    return { success: false, error: msg };
  }
}

export async function syncAllLivePricesAction(): Promise<{
  success: boolean;
  syncedCount: number;
  failedTickers: string[];
}> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, syncedCount: 0, failedTickers: [] };

  const instruments = await prisma.instrument.findMany({
    where: {
      assetClass: { in: ['equity', 'crypto'] },
      symbol: { not: null },
    },
    select: { symbol: true },
  });

  let syncedCount = 0;
  const failedTickers: string[] = [];

  for (const inst of instruments) {
    if (!inst.symbol) continue;
    try {
      const quote = await getPrice(inst.symbol, { forceRefresh: true });
      const instrument = await findOrCreateInstrument({ symbol: inst.symbol });
      await upsertPrice({
        instrumentId: instrument.id,
        value: quote.price,
        source: quote.source,
        asOf: quote.asOf,
        method: quote.method,
      });
      syncedCount++;
    } catch {
      failedTickers.push(inst.symbol);
    }
  }

  revalidatePath('/prices');
  revalidatePath('/holdings');
  revalidatePath('/net-worth');
  revalidatePath('/dashboard');

  return { success: true, syncedCount, failedTickers };
}
