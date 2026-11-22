'use server';

import { signIn, signOut } from '@/auth';
import {
  createUser,
  createPasswordResetToken,
  verifyPasswordResetToken,
  resetPasswordWithToken,
} from '@/lib/db';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from '@/lib/validation';
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

export async function requestPasswordResetAction(values: ForgotPasswordInput) {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: 'Please provide a valid email address.' };
  }

  try {
    const result = await createPasswordResetToken(parsed.data.email);
    if (!result) {
      return {
        error: `No account found with email "${parsed.data.email}". Please check the spelling or register first.`,
      };
    }

    return {
      success: true,
      message: 'Password reset link generated successfully.',
      resetUrl: `/reset-password?token=${result.token}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to process request.';
    return { error: msg };
  }
}

export async function verifyResetTokenAction(token: string) {
  try {
    const res = await verifyPasswordResetToken(token);
    if (!res.valid) {
      return { valid: false, error: res.error };
    }
    return { valid: true, email: res.user?.email };
  } catch {
    return { valid: false, error: 'Failed to verify reset token.' };
  }
}

export async function resetPasswordAction(values: ResetPasswordInput) {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid password data.' };
  }

  try {
    const res = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
    if (!res.success) {
      return { error: res.error || 'Failed to reset password.' };
    }
    return {
      success: true,
      message: 'Your password has been reset successfully. You can now sign in.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'An error occurred while resetting password.';
    return { error: msg };
  }
}


