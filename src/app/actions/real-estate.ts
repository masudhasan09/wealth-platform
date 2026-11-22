'use server';

import { auth } from '@/auth';
import {
  createProperty,
  addValuationMark,
  createLiability,
} from '@/lib/db';
import {
  propertySchema,
  valuationMarkSchema,
  mortgageSchema,
  type PropertyInput,
  type ValuationMarkInput,
  type MortgageInput,
} from '@/lib/validation';
import { revalidatePath } from 'next/cache';

export async function createPropertyAction(accountId: string, values: PropertyInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be signed in to add real estate.' };
  }

  const parsed = propertySchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid property data.' };
  }

  try {
    const property = await createProperty(session.user.id, accountId, parsed.data);
    revalidatePath('/real-estate');
    revalidatePath('/dashboard');
    revalidatePath('/holdings');
    revalidatePath('/net-worth');
    return { success: true, property };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'Failed to create property.' };
  }
}

export async function addValuationMarkAction(
  instrumentId: string,
  values: ValuationMarkInput
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be signed in to add an appraisal mark.' };
  }

  const parsed = valuationMarkSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid appraisal data.' };
  }

  try {
    const mark = await addValuationMark(instrumentId, parsed.data);
    revalidatePath('/real-estate');
    revalidatePath('/dashboard');
    revalidatePath('/holdings');
    revalidatePath('/net-worth');
    return { success: true, mark };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'Failed to record valuation mark.' };
  }
}

export async function createMortgageAction(values: MortgageInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be signed in to add a mortgage.' };
  }

  const parsed = mortgageSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid mortgage data.' };
  }

  try {
    const liability = await createLiability(session.user.id, parsed.data);
    revalidatePath('/real-estate');
    revalidatePath('/dashboard');
    revalidatePath('/net-worth');
    return { success: true, liability };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'Failed to create mortgage.' };
  }
}
