import Decimal from 'decimal.js';
import { prisma } from './client';
import { findOrCreateInstrument } from './instruments';
import { computeHoldings, InsufficientHoldingsError } from '@/lib/finance';
import type { TransactionInput } from '@/lib/validation';
import type { TransactionType } from '@prisma/client';

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
    const existingTx = await prisma.transaction.findMany({
      where: {
        accountId: data.accountId,
        instrumentId: instrument.id,
        voidedAt: null,
      },
    });

    const activeTx = existingTx.map((tx) => ({
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
    }));

    const currentHoldings = computeHoldings(activeTx, { strict: false });
    const holding = currentHoldings.find((h) => h.instrumentId === instrument.id);
    const availableQty = new Decimal(holding?.quantity ?? '0');
    const requestedQty = new Decimal(data.quantity || '0');

    // Compare with Decimal semantics: 0.1 + 0.2 must not exceed 0.3.
    if (requestedQty.greaterThan(availableQty)) {
      throw new Error(
        `Cannot sell ${requestedQty.toString()} units of ${instrument.symbol || 'this asset'}. Account "${account.name}" currently holds ${availableQty.toString()} units.`
      );
    }
  }

  // 4. Calculate amount if not provided
  let amount = data.amount || '0';
  if ((!amount || amount === '0') && data.quantity && data.price) {
    amount = new Decimal(data.quantity).times(new Decimal(data.price)).toFixed(2);
  }

  // 5. Create immutable transaction
  return prisma.transaction.create({
    data: {
      accountId: data.accountId,
      instrumentId: instrument.id,
      type: data.type as TransactionType,
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

  // If voiding a BUY transaction, ensure subsequent sells do not become invalid
  if (transaction.type === 'buy') {
    const allAccountTx = await prisma.transaction.findMany({
      where: {
        accountId: transaction.accountId,
        instrumentId: transaction.instrumentId,
      },
    });

    const candidateTx = allAccountTx.map((tx) => ({
      id: tx.id,
      accountId: tx.accountId,
      instrumentId: tx.instrumentId,
      type: tx.type,
      quantity: tx.quantity,
      price: tx.price,
      amount: tx.amount,
      fee: tx.fee,
      date: tx.date,
      voidedAt: tx.id === id ? new Date() : tx.voidedAt,
    }));

    try {
      computeHoldings(candidateTx, { strict: true });
    } catch (err) {
      if (err instanceof InsufficientHoldingsError) {
        throw new Error(
          'Cannot void this buy transaction because subsequent sell transactions depend on these shares. Please void the dependent sell transactions first.'
        );
      }
      throw err;
    }
  }

  return prisma.transaction.update({
    where: { id },
    data: {
      voidedAt: new Date(),
      voidedReason: reason || 'Voided by user',
    },
  });
}
