import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getAccountsByUserId, getTransactionsByUserId } from '@/lib/db';
import { DashboardLayout } from '@/components/templates';
import { TransactionsClient } from './TransactionsClient';
import type { TransactionViewModel } from '@/lib/view-models';

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [accounts, transactions] = await Promise.all([
    getAccountsByUserId(session.user.id),
    getTransactionsByUserId(session.user.id),
  ]);

  const transactionViewModels: TransactionViewModel[] = transactions.map((tx) => ({
    id: tx.id,
    accountId: tx.accountId,
    accountName: tx.account.name,
    instrumentId: tx.instrumentId,
    symbol: tx.instrument.symbol || '',
    instrumentName: tx.instrument.name,
    type: tx.type,
    date: tx.date.toISOString(),
    quantity: tx.quantity,
    price: tx.price,
    amount: tx.amount,
    fee: tx.fee,
    isVoided: !!tx.voidedAt,
    voidedAt: tx.voidedAt ? tx.voidedAt.toISOString() : null,
    voidedReason: tx.voidedReason,
    note: tx.note,
  }));

  const accountOptions = accounts.map((a) => ({
    id: a.id,
    name: a.name,
  }));

  return (
    <DashboardLayout
      currentPath="/transactions"
      user={{
        name: session.user.name || 'User',
        email: session.user.email || '',
      }}
    >
      <TransactionsClient
        initialTransactions={transactionViewModels}
        accounts={accountOptions}
      />
    </DashboardLayout>
  );
}

