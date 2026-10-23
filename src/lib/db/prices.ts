/**
 * DB helpers for the Price table.
 * All monetary values stored as decimal strings.
 */
import { prisma } from './client';
import type { PriceSource } from '@/lib/providers/types';

export interface PriceRow {
  id: string;
  instrumentId: string;
  /** Ticker/symbol from the Instrument row (the `symbol` field). */
  symbol: string;
  value: string;
  source: PriceSource;
  asOf: Date;
  method: string;
}

/** Fetch the most recent price row for an instrument by its symbol field. */
export async function getLatestPrice(
  symbol: string,
  source?: PriceSource,
): Promise<PriceRow | null> {
  const instrument = await prisma.instrument.findFirst({
    where: { symbol: symbol.toUpperCase() },
    select: { id: true, symbol: true },
  });
  if (!instrument) return null;

  const row = await prisma.price.findFirst({
    where: {
      instrumentId: instrument.id,
      ...(source ? { source } : {}),
    },
    orderBy: { asOf: 'desc' },
  });

  if (!row) return null;

  return {
    id: row.id,
    instrumentId: row.instrumentId,
    symbol: instrument.symbol ?? symbol.toUpperCase(),
    value: row.value,
    source: row.source as PriceSource,
    asOf: row.asOf,
    method: row.method,
  };
}

/** Fetch the most recent price row for an instrument by its DB id. */
export async function getLatestPriceById(
  instrumentId: string,
  source?: PriceSource,
): Promise<PriceRow | null> {
  const instrument = await prisma.instrument.findUnique({
    where: { id: instrumentId },
    select: { id: true, symbol: true },
  });
  if (!instrument) return null;

  const row = await prisma.price.findFirst({
    where: {
      instrumentId,
      ...(source ? { source } : {}),
    },
    orderBy: { asOf: 'desc' },
  });

  if (!row) return null;

  return {
    id: row.id,
    instrumentId: row.instrumentId,
    symbol: instrument.symbol ?? '',
    value: row.value,
    source: row.source as PriceSource,
    asOf: row.asOf,
    method: row.method,
  };
}

export interface UpsertPriceInput {
  instrumentId: string;
  value: string;
  source: PriceSource;
  asOf: Date;
  method: string;
}

/**
 * Upsert a price record — updates value/asOf if a row for (instrumentId, date, source)
 * already exists, otherwise creates a new row.
 */
export async function upsertPrice(input: UpsertPriceInput): Promise<PriceRow> {
  // Truncate asOf to the day for the unique key
  const dateKey = new Date(input.asOf);
  dateKey.setUTCHours(0, 0, 0, 0);

  const instrument = await prisma.instrument.findUnique({
    where: { id: input.instrumentId },
    select: { symbol: true },
  });

  const row = await prisma.price.upsert({
    where: {
      instrumentId_date_source: {
        instrumentId: input.instrumentId,
        date: dateKey,
        source: input.source,
      },
    },
    update: {
      value: input.value,
      asOf: input.asOf,
      method: input.method as never,
    },
    create: {
      instrumentId: input.instrumentId,
      date: dateKey,
      value: input.value,
      source: input.source,
      asOf: input.asOf,
      method: input.method as never,
    },
  });

  return {
    id: row.id,
    instrumentId: row.instrumentId,
    symbol: instrument?.symbol ?? '',
    value: row.value,
    source: row.source as PriceSource,
    asOf: row.asOf,
    method: row.method,
  };
}

/** Get all price history for an instrument (for chart / audit). */
export async function getPriceHistory(
  symbol: string,
  limit = 90,
): Promise<PriceRow[]> {
  const instrument = await prisma.instrument.findFirst({
    where: { symbol: symbol.toUpperCase() },
    select: { id: true, symbol: true },
  });
  if (!instrument) return [];

  const rows = await prisma.price.findMany({
    where: { instrumentId: instrument.id },
    orderBy: { date: 'desc' },
    take: limit,
  });

  return rows.map((r) => ({
    id: r.id,
    instrumentId: r.instrumentId,
    symbol: instrument.symbol ?? symbol.toUpperCase(),
    value: r.value,
    source: r.source as PriceSource,
    asOf: r.asOf,
    method: r.method,
  }));
}
