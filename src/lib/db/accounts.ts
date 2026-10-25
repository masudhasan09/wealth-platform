import { prisma } from './client';
import type { AccountInput } from '@/lib/validation';

export async function getAccountsByUserId(userId: string) {
  return prisma.account.findMany({
    where: { userId, closedAt: null },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAccountById(id: string, userId: string) {
  return prisma.account.findFirst({
    where: { id, userId },
  });
}

export async function createAccount(userId: string, data: AccountInput) {
  return prisma.account.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      currency: data.currency || 'USD',
      description: data.description || null,
    },
  });
}

export async function updateAccount(
  id: string,
  userId: string,
  data: Partial<AccountInput>
) {
  // Ensure the account belongs to this user
  const account = await getAccountById(id, userId);
  if (!account) {
    throw new Error('Account not found or access denied');
  }

  return prisma.account.update({
    where: { id },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.type ? { type: data.type } : {}),
      ...(data.currency ? { currency: data.currency } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
    },
  });
}

export async function deleteAccount(id: string, userId: string) {
  const account = await getAccountById(id, userId);
  if (!account) {
    throw new Error('Account not found or access denied');
  }

  const txCount = await prisma.transaction.count({
    where: { accountId: id },
  });

  if (txCount > 0) {
    return prisma.account.update({
      where: { id },
      data: { closedAt: new Date() },
    });
  }

  return prisma.account.delete({
    where: { id },
  });
}

