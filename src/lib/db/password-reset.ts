import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from './client';
import { getUserByEmail } from './users';

export interface PasswordResetTokenRecord {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface PasswordResetTokenDelegate {
  deleteMany(args: { where: { userId?: string } }): Promise<{ count: number }>;
  create(args: {
    data: {
      token: string;
      userId: string;
      expiresAt: Date;
    };
  }): Promise<PasswordResetTokenRecord>;
  findUnique(args: {
    where: { token?: string; id?: string };
    include?: {
      user?: {
        select?: { id?: boolean; email?: boolean; name?: boolean };
      };
    };
  }): Promise<PasswordResetTokenRecord | null>;
  delete(args: { where: { id?: string; token?: string } }): Promise<PasswordResetTokenRecord>;
}

// Safely access the passwordResetToken delegate on prisma without ts(2339) errors
function getPasswordResetTokenModel(): PasswordResetTokenDelegate {
  const clientObj = prisma as unknown as Record<string, unknown>;
  const model = clientObj['passwordResetToken'] as PasswordResetTokenDelegate | undefined;
  if (!model) {
    throw new Error(
      'Database schema was recently updated. Please restart the Next.js dev server (Ctrl+C then npm run dev) to load the new database tables.'
    );
  }
  return model;
}

export async function createPasswordResetToken(email: string) {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }

  const model = getPasswordResetTokenModel();

  // Clean up existing tokens for this user
  await model.deleteMany({
    where: { userId: user.id },
  });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

  const record = await model.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  return { token: record.token, email: user.email, expiresAt: record.expiresAt };
}

export async function verifyPasswordResetToken(token: string) {
  if (!token) {
    return { valid: false, error: 'Invalid reset token.' };
  }

  const model = getPasswordResetTokenModel();

  const record = await model.findUnique({
    where: { token },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  if (!record) {
    return { valid: false, error: 'Password reset link is invalid or has already been used.' };
  }

  if (record.expiresAt < new Date()) {
    await model.delete({ where: { id: record.id } }).catch(() => {});
    return { valid: false, error: 'Password reset link has expired. Please request a new one.' };
  }

  return { valid: true, user: record.user, tokenId: record.id };
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const verification = await verifyPasswordResetToken(token);
  if (!verification.valid || !verification.user) {
    return { success: false, error: verification.error || 'Invalid reset token.' };
  }

  const model = getPasswordResetTokenModel();
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update user password and clean up used tokens in an atomic transaction
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: verification.user!.id },
      data: { passwordHash },
    });

    const txObj = tx as unknown as Record<string, unknown>;
    const txModel = txObj['passwordResetToken'] as PasswordResetTokenDelegate | undefined;
    if (txModel) {
      await txModel.deleteMany({
        where: { userId: verification.user!.id },
      });
    } else {
      await model.deleteMany({
        where: { userId: verification.user!.id },
      });
    }
  });

  return { success: true };
}
