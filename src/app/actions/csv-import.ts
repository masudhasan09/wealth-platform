'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db/client';
import { findOrCreateInstrument } from '@/lib/db/instruments';
import { CsvTransactionRow } from '@/lib/finance/csv-import';
import { revalidatePath } from 'next/cache';
import type { TransactionType } from '@prisma/client';

export async function importTransactionsAction(
  rows: CsvTransactionRow[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, count: 0, error: 'You must be signed in to import transactions.' };
  }

  const userId = session.user.id;

  if (!rows || rows.length === 0) {
    return { success: false, count: 0, error: 'No valid rows provided for import.' };
  }

  try {
    // 1. Fetch user's existing accounts
    const userAccounts = await prisma.account.findMany({
      where: { userId },
    });

    const accountMap = new Map<string, string>();
    for (const acc of userAccounts) {
      accountMap.set(acc.name.toLowerCase().trim(), acc.id);
    }

    // Default account if none matches
    let defaultAccountId = userAccounts[0]?.id;
    if (!defaultAccountId) {
      const createdDefault = await prisma.account.create({
        data: {
          userId,
          name: 'Primary Brokerage',
          type: 'brokerage',
          currency: 'USD',
        },
      });
      defaultAccountId = createdDefault.id;
      accountMap.set('primary brokerage', defaultAccountId);
    }

    let importedCount = 0;

    // Process transactions sequentially or in transaction
    await prisma.$transaction(
      async (txDb) => {
        for (const row of rows) {
          // Resolve Account
          const targetAccName = (row.account || '').toLowerCase().trim();
          let accountId = accountMap.get(targetAccName);

          if (!accountId && row.account) {
            // Create account for user matching CSV name
            const newAcc = await txDb.account.create({
              data: {
                userId,
                name: row.account.trim(),
                type: row.type.includes('crypto') ? 'crypto_wallet' : 'brokerage',
                currency: 'USD',
              },
            });
            accountId = newAcc.id;
            accountMap.set(targetAccName, accountId);
          } else if (!accountId) {
            accountId = defaultAccountId;
          }

          // Resolve Instrument
          const targetSymbol = (row.symbol || '').trim();
          let instrumentId: string;

          if (targetSymbol) {
            const inst = await findOrCreateInstrument({
              symbol: targetSymbol,
            });
            instrumentId = inst.id;
          } else {
            // Default cash instrument
            const cashInst = await findOrCreateInstrument({
              symbol: 'USD',
              name: 'US Dollar',
              assetClass: 'cash',
            });
            instrumentId = cashInst.id;
          }

          // Insert Transaction
          await txDb.transaction.create({
            data: {
              accountId,
              instrumentId,
              type: row.type.toLowerCase() as TransactionType,
              date: new Date(row.date),
              quantity: row.quantity || '0',
              price: row.price || '0',
              amount: row.amount || '0',
              fee: row.fee || '0',
              note: row.note || 'Imported via CSV',
            },
          });

          importedCount++;
        }
      },
      {
        timeout: 30000,
      }
    );

    revalidatePath('/transactions');
    revalidatePath('/holdings');
    revalidatePath('/net-worth');
    revalidatePath('/dashboard');
    revalidatePath('/gains');
    revalidatePath('/risk');
    revalidatePath('/reports');

    return {
      success: true,
      count: importedCount,
    };
  } catch (err: unknown) {
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : 'Failed to import transactions to database.',
    };
  }
}

