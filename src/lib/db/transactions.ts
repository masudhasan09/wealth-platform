import { prisma } from './client';
import { findOrCreateInstrument } from './instruments';
import { computeHoldings, InsufficientHoldingsError } from '@/lib/finance';
import type { TransactionInput } from '@/lib/validation';

export async function getTransactionsByUserId(
  userId: string,
  options?: { accountId?: string; search?: string }
) {
  return prisma.transaction.findMany({
    where: {
      account: {
        userId,
      },
      ...(options?.accountId ? { accountId: options.accountId } : {}),
      ...(options?.search
        ? {
            OR: [
              { instrument: { symbol: { contains: options.search } } },
              { instrument: { name: { contains: options.search } } },
              { note: { contains: options.search } },
            ],
          }
        : {}),
    },
    include: {
      account: true,
      instrument: true,
    },
    orderBy: { date: 'desc' },
  });
}

export async function createTransaction(userId: string, data: TransactionInput) {
  // 1. Verify account ownership
  const account = await prisma.account.findFirst({
    where: { id: data.accountId, userId },
  });

  if (!account) {
    throw new Error('Selected account not found or access denied');
  }

  // 2. Resolve instrument
  const instrument = await findOrCreateInstrument({
    symbol: data.symbol,
  });

  // 3. For sells: pre-validate that the user holds enough quantity
  if (data.type === 'sell') {
    // Fetch all active transactions for this account and instrument
    const existingTx = await prisma.transaction.findMany({
      where: {
        accountId: data.accountId,
        instrumentId: instrument.id,
      },
    });

    const candidateTx = [
      ...existingTx.map((tx) => ({
        id: tx.id,
        accountId: tx.accountId,
        instrumentId: tx.instrumentId,
        type: tx.type,
        quantity: tx.quantity,
        price: tx.price,
        amount: tx.amount,
        fee: tx.fee,
        date: tx.date,
        voidedAt: tx.voidedAt,
      })),
      {
        id: 'candidate',
        accountId: data.accountId,
        instrumentId: instrument.id,
        type: data.type,
        quantity: data.quantity || '0',
        price: data.price || '0',
        amount: data.amount || '0',
        fee: data.fee || '0',
        date: new Date(data.date),
      },
    ];

    try {
      computeHoldings(candidateTx);
    } catch (err) {
      if (err instanceof InsufficientHoldingsError) {
        throw new Error(err.message);
      }
      throw err;
    }
  }

  // 4. Calculate amount if not provided
  let amount = data.amount || '0';
  if ((!amount || amount === '0') && data.quantity && data.price) {
    const qty = parseFloat(data.quantity);
    const prc = parseFloat(data.price);
    if (!isNaN(qty) && !isNaN(prc)) {
      amount = (qty * prc).toFixed(2);
    }
  }

  // 5. Create immutable transaction
  return prisma.transaction.create({
    data: {
      accountId: data.accountId,
      instrumentId: instrument.id,
      type: data.type,
      date: new Date(data.date),
      quantity: data.quantity || '0',
      price: data.price || '0',
      amount,
      fee: data.fee || '0',
      note: data.note || null,
    },
    include: {
      account: true,
      instrument: true,
    },
  });
}

export async function voidTransaction(
  id: string,
  userId: string,
  reason?: string
) {
  // Verify transaction belongs to an account owned by user
  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      account: { userId },
    },
  });

  if (!transaction) {
    throw new Error('Transaction not found or access denied');
  }

  if (transaction.voidedAt) {
    throw new Error('Transaction is already voided');
  }

  return prisma.transaction.update({
    where: { id },
    data: {
      voidedAt: new Date(),
      voidedReason: reason || 'Voided by user',
    },
  });
}

