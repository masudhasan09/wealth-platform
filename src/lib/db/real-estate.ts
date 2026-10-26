import { prisma } from './client';
import type { PropertyInput, ValuationMarkInput, MortgageInput } from '@/lib/validation';
import { upsertPrice } from './prices';

export interface PropertyWithDetails {
  id: string;
  name: string;
  symbol: string | null;
  assetClass: string;
  details: {
    address: string;
    purchasePrice: string;
    purchaseDate: Date;
    ownershipPct: string;
    propertyType: string;
  } | null;
  valuationMarks: {
    id: string;
    date: Date;
    value: string;
    method: string;
    note: string | null;
  }[];
  liabilities: {
    id: string;
    name: string;
    principal: string;
    rate: string;
    termMonths: number;
    startDate: Date;
  }[];
  currentValuation: string;
}

export async function createProperty(
  userId: string,
  accountId: string,
  input: PropertyInput
) {
  // Verify account belongs to user
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) {
    throw new Error('Account not found or access denied');
  }

  // Generate unique symbol for internal reference if needed
  const propertyCode = `PROP-${Date.now().toString(36).toUpperCase()}`;

  // 1. Create Instrument
  const instrument = await prisma.instrument.create({
    data: {
      name: input.name,
      symbol: propertyCode,
      assetClass: 'real_estate',
      currency: 'USD',
      propertyDetails: {
        create: {
          address: input.address,
          purchasePrice: input.purchasePrice,
          purchaseDate: new Date(input.purchaseDate),
          ownershipPct: input.ownershipPct,
          propertyType: input.propertyType,
        },
      },
    },
    include: {
      propertyDetails: true,
    },
  });

  const valuationValue = input.currentValue || input.purchasePrice;

  // 2. Create initial ValuationMark (never overwriting, immutable historical audit trail)
  await prisma.valuationMark.create({
    data: {
      instrumentId: instrument.id,
      date: new Date(input.purchaseDate),
      value: valuationValue,
      method: 'manual',
      note: 'Initial property acquisition valuation',
    },
  });

  // 3. Store in Price table for generic portfolio valuation engine
  await upsertPrice({
    instrumentId: instrument.id,
    value: valuationValue,
    source: 'manual',
    method: 'manual',
    asOf: new Date(),
  });

  // 4. Create Ledger Transaction (BUY) to establish holdings quantity = 1.0 (or ownershipPct)
  await prisma.transaction.create({
    data: {
      accountId,
      instrumentId: instrument.id,
      type: 'buy',
      date: new Date(input.purchaseDate),
      quantity: input.ownershipPct,
      price: input.purchasePrice,
      amount: input.purchasePrice,
      fee: '0',
      note: `Acquisition of ${input.name}`,
    },
  });

  return instrument;
}

export async function addValuationMark(
  instrumentId: string,
  input: ValuationMarkInput
) {
  // Store point-in-time valuation mark
  const mark = await prisma.valuationMark.create({
    data: {
      instrumentId,
      date: new Date(input.date),
      value: input.value,
      method: input.method,
      note: input.note || null,
    },
  });

  // Also update latest price cache
  await upsertPrice({
    instrumentId,
    value: input.value,
    source: 'manual',
    method: input.method,
    asOf: new Date(input.date),
  });

  return mark;
}

export async function getPropertiesByUserId(userId: string): Promise<PropertyWithDetails[]> {
  // Find accounts of user
  const accounts = await prisma.account.findMany({
    where: { userId, closedAt: null },
    select: { id: true },
  });
  const accountIds = accounts.map((a) => a.id);

  if (accountIds.length === 0) return [];

  // Find all real estate instruments linked to user transactions
  const txs = await prisma.transaction.findMany({
    where: {
      accountId: { in: accountIds },
      voidedAt: null,
      instrument: { assetClass: 'real_estate' },
    },
    select: { instrumentId: true },
  });

  const instrumentIds = [...new Set(txs.map((t) => t.instrumentId))];
  if (instrumentIds.length === 0) return [];

  const instruments = await prisma.instrument.findMany({
    where: { id: { in: instrumentIds } },
    include: {
      propertyDetails: true,
      valuationMarks: {
        orderBy: { date: 'desc' },
      },
      liabilities: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return instruments.map((inst) => {
    const latestMark = inst.valuationMarks[0];
    const currentValuation = latestMark
      ? latestMark.value
      : inst.propertyDetails?.purchasePrice || '0.00';

    return {
      id: inst.id,
      name: inst.name,
      symbol: inst.symbol,
      assetClass: inst.assetClass,
      details: inst.propertyDetails
        ? {
            address: inst.propertyDetails.address,
            purchasePrice: inst.propertyDetails.purchasePrice,
            purchaseDate: inst.propertyDetails.purchaseDate,
            ownershipPct: inst.propertyDetails.ownershipPct,
            propertyType: inst.propertyDetails.propertyType,
          }
        : null,
      valuationMarks: inst.valuationMarks.map((m) => ({
        id: m.id,
        date: m.date,
        value: m.value,
        method: m.method,
        note: m.note,
      })),
      liabilities: inst.liabilities.map((l) => ({
        id: l.id,
        name: l.name,
        principal: l.principal,
        rate: l.rate,
        termMonths: l.termMonths,
        startDate: l.startDate,
      })),
      currentValuation,
    };
  });
}

export async function createLiability(
  userId: string,
  input: MortgageInput
) {
  const account = await prisma.account.findFirst({
    where: { id: input.accountId, userId },
  });
  if (!account) {
    throw new Error('Account not found or access denied');
  }

  return prisma.liability.create({
    data: {
      accountId: input.accountId,
      linkedInstrumentId: input.linkedInstrumentId || null,
      name: input.name,
      principal: input.principal,
      rate: input.rate,
      termMonths: input.termMonths,
      startDate: new Date(input.startDate),
      currency: 'USD',
    },
  });
}

export async function getLiabilitiesByUserId(userId: string) {
  return prisma.liability.findMany({
    where: {
      account: { userId, closedAt: null },
    },
    include: {
      account: { select: { id: true, name: true } },
      instrument: { select: { id: true, name: true, symbol: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
