'use server';

import { auth } from '@/auth';
import { createTransaction, voidTransaction } from '@/lib/db';
import {
  transactionSchema,
  voidTransactionSchema,
  type TransactionInput,
  type VoidTransactionInput,
} from '@/lib/validation';
import { revalidatePath } from 'next/cache';

export async function createTransactionAction(values: TransactionInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be signed in to record a transaction.' };
  }

  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid transaction data.' };
  }

  try {
    const transaction = await createTransaction(session.user.id, parsed.data);
    revalidatePath('/transactions');
    revalidatePath('/holdings');
    revalidatePath('/accounts');
    revalidatePath('/');
    return { success: true, transaction };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'Failed to record transaction.' };
  }
}

export async function voidTransactionAction(values: VoidTransactionInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be signed in to void a transaction.' };
  }

  const parsed = voidTransactionSchema.safeParse(values);
  if (!parsed.success) {
    return { error: 'Invalid void transaction request.' };
  }

  try {
    const transaction = await voidTransaction(
      parsed.data.transactionId,
      session.user.id,
      parsed.data.reason
    );
    revalidatePath('/transactions');
    revalidatePath('/holdings');
    revalidatePath('/accounts');
    revalidatePath('/');
    return { success: true, transaction };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'Failed to void transaction.' };
  }
}

