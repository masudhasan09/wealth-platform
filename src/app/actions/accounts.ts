'use server';

import { auth } from '@/auth';
import { createAccount, deleteAccount, getUserById } from '@/lib/db';
import { accountSchema, type AccountInput } from '@/lib/validation';
import { revalidatePath } from 'next/cache';

export async function createAccountAction(values: AccountInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Your session has expired. Please sign in again.' };
  }

  const user = await getUserById(session.user.id);
  if (!user) {
    return { error: 'User session is not recognized. Please sign out and sign in again.' };
  }

  const parsed = accountSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid account details.' };
  }

  try {
    const account = await createAccount(session.user.id, parsed.data);
    revalidatePath('/accounts');
    revalidatePath('/transactions');
    revalidatePath('/holdings');
    revalidatePath('/');
    return { success: true, account };
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes('Foreign key constraint') || err.message.includes('foreign key')) {
        return { error: 'User session is out of sync with the database. Please sign out and sign back in.' };
      }
      return { error: err.message };
    }
    return { error: 'Failed to create account.' };
  }
}

export async function deleteAccountAction(accountId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Your session has expired. Please sign in again.' };
  }

  try {
    await deleteAccount(accountId, session.user.id);
    revalidatePath('/accounts');
    revalidatePath('/transactions');
    revalidatePath('/holdings');
    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'Failed to remove account.' };
  }
}

