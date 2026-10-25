/**
 * Database access layer for Fixed Income & Bonds.
 */
import { prisma } from './client';
import type { CouponFrequency, DayCount } from '@prisma/client';

export interface CreateBondInput {
  symbol: string;
  name: string;
  faceValue: string; // Decimal string, e.g. "1000"
  couponRate: string; // Decimal string annual rate, e.g. "0.045"
  couponFrequency: CouponFrequency;
  maturityDate: Date;
  issueDate?: Date;
  dayCount?: DayCount;
  callDate?: Date;
  callPrice?: string;
  currency?: string;
  subType?: string; // treasury_bill, treasury_note, treasury_bond, tips, corporate, municipal
}

/**
 * Creates or updates a fixed income Instrument along with its BondDetails.
 */
export async function createBondInstrument(input: CreateBondInput) {
  const symbol = input.symbol.toUpperCase().trim();

  const existing = await prisma.instrument.findFirst({
    where: { symbol, assetClass: 'fixed_income' },
    include: { bondDetails: true },
  });

  const identifiersObj = {
    subType: input.subType || 'treasury_note',
  };

  if (existing) {
    // Update bond details if existing
    const updatedDetails = await prisma.bondDetails.upsert({
      where: { instrumentId: existing.id },
      update: {
        faceValue: input.faceValue,
        couponRate: input.couponRate,
        couponFrequency: input.couponFrequency,
        maturityDate: input.maturityDate,
        issueDate: input.issueDate,
        dayCount: input.dayCount || 'actual_actual',
        callDate: input.callDate,
        callPrice: input.callPrice,
      },
      create: {
        instrumentId: existing.id,
        faceValue: input.faceValue,
        couponRate: input.couponRate,
        couponFrequency: input.couponFrequency,
        maturityDate: input.maturityDate,
        issueDate: input.issueDate,
        dayCount: input.dayCount || 'actual_actual',
        callDate: input.callDate,
        callPrice: input.callPrice,
      },
    });

    return {
      ...existing,
      bondDetails: updatedDetails,
    };
  }

  // Create new instrument + bondDetails
  return prisma.instrument.create({
    data: {
      symbol,
      name: input.name,
      assetClass: 'fixed_income',
      currency: input.currency || 'USD',
      identifiers: JSON.stringify(identifiersObj),
      bondDetails: {
        create: {
          faceValue: input.faceValue,
          couponRate: input.couponRate,
          couponFrequency: input.couponFrequency,
          maturityDate: input.maturityDate,
          issueDate: input.issueDate,
          dayCount: input.dayCount || 'actual_actual',
          callDate: input.callDate,
          callPrice: input.callPrice,
        },
      },
    },
    include: {
      bondDetails: true,
    },
  });
}

/**
 * Get all fixed income instruments with their bond details.
 */
export async function getBondInstruments() {
  return prisma.instrument.findMany({
    where: { assetClass: 'fixed_income' },
    include: {
      bondDetails: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get bond instrument by ID.
 */
export async function getBondById(instrumentId: string) {
  return prisma.instrument.findUnique({
    where: { id: instrumentId },
    include: {
      bondDetails: true,
    },
  });
}
