import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getTransactionsByUserId } from '@/lib/db/transactions';
import { ImportClient } from './ImportClient';

export const dynamic = 'force-dynamic';

export default async function ImportPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const existingTx = await getTransactionsByUserId(session.user.id);
  const formattedExisting = existingTx.map((tx) => ({
    date: tx.date,
    accountName: tx.account.name,
    accountId: tx.accountId,
    type: tx.type,
    symbol: tx.instrument.symbol,
    quantity: tx.quantity,
    amount: tx.amount,
  }));

  return <ImportClient existingTransactions={formattedExisting} />;
}

