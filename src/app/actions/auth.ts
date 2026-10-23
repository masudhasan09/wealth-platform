'use server';

import { signIn, signOut } from '@/auth';
import { createUser } from '@/lib/db';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '@/lib/validation';
import { AuthError } from 'next-auth';

export async function loginAction(values: LoginInput) {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: 'Invalid email or password format.' };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid email or password.' };
        default:
          return { error: 'An unexpected authentication error occurred.' };
      }
    }
    return { error: 'Failed to sign in. Please check your credentials.' };
  }
}

export async function registerAction(values: RegisterInput) {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid registration data.' };
  }

  try {
    await createUser(parsed.data);
    // Automatically sign in the user upon successful registration
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: 'Failed to register account.' };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/login' });
}

