import bcrypt from 'bcryptjs';
import { prisma } from './client';
import type { RegisterInput } from '@/lib/validation';

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(data: RegisterInput) {
  const existing = await getUserByEmail(data.email);
  if (existing) {
    throw new Error('A user with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      name: data.name,
      passwordHash,
    },
  });
}

export async function verifyUserPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

