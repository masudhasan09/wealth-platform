'use server';

import { auth } from '@/auth';
import {
  getUserById,
  verifyUserPassword,
  updateUserName,
  updateUserPassword,
} from '@/lib/db';
import {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileInput,
  type ChangePasswordInput,
} from '@/lib/validation';
import { revalidatePath } from 'next/cache';

export async function updateProfileNameAction(input: UpdateProfileInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be signed in to update your profile.' };
  }

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid name provided.' };
  }

  try {
    const updated = await updateUserName(session.user.id, parsed.data.name);
    revalidatePath('/settings');
    revalidatePath('/dashboard');
    return { success: true, name: updated.name };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update name.';
    return { error: msg };
  }
}

export async function changePasswordAction(input: ChangePasswordInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be signed in to change your password.' };
  }

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid password data.' };
  }

  try {
    const user = await getUserById(session.user.id);
    if (!user || !user.passwordHash) {
      return { error: 'User account not found.' };
    }

    const isMatch = await verifyUserPassword(parsed.data.currentPassword, user.passwordHash);
    if (!isMatch) {
      return { error: 'Current password is incorrect.' };
    }

    await updateUserPassword(session.user.id, parsed.data.newPassword);
    revalidatePath('/settings');
    return { success: true, message: 'Password changed successfully.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update password.';
    return { error: msg };
  }
}
