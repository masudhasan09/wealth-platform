'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db/client';
import { CsvTransactionRow } from '@/lib/finance/csv-import';
import { revalidatePath } from 'next/cache';
import type { AssetClass, TransactionType } from '@prisma/client';

/** Tickers that should be created as crypto rather than equity during import. */
const CRYPTO_SYMBOLS = new Set([
  'BTC', 'ETH', 'SOL', 'USDT', 'USDC', 'ADA', 'AVAX', 'DOT', 'LINK',
  'MATIC', 'POL', 'DOGE', 'XRP', 'BNB',
]);

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

          // Resolved through `txDb` (never the global client) so every write in
          // this import participates in the same transaction.
          if (targetSymbol) {
            const symbol = targetSymbol.toUpperCase().trim();
            const existingInstrument = await txDb.instrument.findFirst({
              where: { symbol },
              select: { id: true },
            });

            if (existingInstrument) {
              instrumentId = existingInstrument.id;
            } else {
              const assetClass: AssetClass =
                symbol === 'USD' ? 'cash' : CRYPTO_SYMBOLS.has(symbol) ? 'crypto' : 'equity';
              const createdInstrument = await txDb.instrument.create({
                data: { symbol, name: symbol, assetClass, currency: 'USD' },
              });
              instrumentId = createdInstrument.id;
            }
          } else {
            // Default cash instrument
            const existingCash = await txDb.instrument.findFirst({
              where: { symbol: 'USD', assetClass: 'cash' },
              select: { id: true },
            });

            if (existingCash) {
              instrumentId = existingCash.id;
            } else {
              const createdCash = await txDb.instrument.create({
                data: { symbol: 'USD', name: 'US Dollar Cash', assetClass: 'cash', currency: 'USD' },
              });
              instrumentId = createdCash.id;
            }
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
