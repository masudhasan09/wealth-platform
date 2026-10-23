'use server';

import { auth } from '@/auth';
import { createAccount } from '@/lib/db';
import { accountSchema, type AccountInput } from '@/lib/validation';
import { revalidatePath } from 'next/cache';

export async function createAccountAction(values: AccountInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be signed in to create an account.' };
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
      return { error: err.message };
    }
    return { error: 'Failed to create account.' };
  }
}

