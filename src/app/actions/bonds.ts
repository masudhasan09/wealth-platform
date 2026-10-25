'use server';

import { auth } from '@/auth';
import { createBondInstrument, getBondInstruments, getBondById } from '@/lib/db/bonds';
import { createTransaction } from '@/lib/db/transactions';
import { bondSchema, type BondInput } from '@/lib/validation/bond';
import { revalidatePath } from 'next/cache';

export async function createBondAction(input: BondInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be logged in to create a bond.' };
  }

  const parsed = bondSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid bond data.' };
  }

  try {
    const data = parsed.data;
    const bond = await createBondInstrument({
      symbol: data.symbol,
      name: data.name,
      faceValue: data.faceValue,
      couponRate: data.couponRate,
      couponFrequency: data.couponFrequency,
      maturityDate: new Date(data.maturityDate),
      issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
      dayCount: data.dayCount,
      callDate: data.callDate ? new Date(data.callDate) : undefined,
      callPrice: data.callPrice || undefined,
      subType: data.subType,
    });

    revalidatePath('/fixed-income');
    revalidatePath('/holdings');
    revalidatePath('/transactions');
    return { success: true, bond };
  } catch (err: unknown) {
    console.error('createBondAction error:', err);
    return { error: err instanceof Error ? err.message : 'Failed to create bond instrument.' };
  }
}

export async function getBondsAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized', bonds: [] };
  }

  try {
    const bonds = await getBondInstruments();
    return { bonds };
  } catch (err: unknown) {
    console.error('getBondsAction error:', err);
    return { error: 'Failed to fetch bonds.', bonds: [] };
  }
}

export async function recordBondCouponAction(params: {
  accountId: string;
  instrumentId: string;
  amount: string;
  date: string;
  fee?: string;
  note?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const bond = await getBondById(params.instrumentId);
    if (!bond) {
      return { error: 'Bond instrument not found.' };
    }

    const tx = await createTransaction(session.user.id, {
      accountId: params.accountId,
      symbol: bond.symbol || 'BOND',
      type: 'coupon',
      quantity: '0',
      price: '0',
      amount: params.amount,
      fee: params.fee || '0',
      date: params.date,
      note: params.note || `Coupon payment for ${bond.symbol}`,
    });

    revalidatePath('/fixed-income');
    revalidatePath('/transactions');
    revalidatePath('/holdings');
    revalidatePath('/accounts');
    revalidatePath('/net-worth');

    return { success: true, transaction: tx };
  } catch (err: unknown) {
    console.error('recordBondCouponAction error:', err);
    return { error: err instanceof Error ? err.message : 'Failed to record coupon.' };
  }
}

export async function recordBondMaturityAction(params: {
  accountId: string;
  instrumentId: string;
  quantity: string;
  price: string;
  amount: string;
  date: string;
  fee?: string;
  note?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const bond = await getBondById(params.instrumentId);
    if (!bond) {
      return { error: 'Bond instrument not found.' };
    }

    const tx = await createTransaction(session.user.id, {
      accountId: params.accountId,
      symbol: bond.symbol || 'BOND',
      type: 'maturity',
      quantity: params.quantity,
      price: params.price,
      amount: params.amount,
      fee: params.fee || '0',
      date: params.date,
      note: params.note || `Principal redemption at maturity for ${bond.symbol}`,
    });

    revalidatePath('/fixed-income');
    revalidatePath('/transactions');
    revalidatePath('/holdings');
    revalidatePath('/accounts');
    revalidatePath('/net-worth');

    return { success: true, transaction: tx };
  } catch (err: unknown) {
    console.error('recordBondMaturityAction error:', err);
    return { error: err instanceof Error ? err.message : 'Failed to record bond maturity.' };
  }
}
