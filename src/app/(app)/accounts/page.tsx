import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getAccountsByUserId, getTransactionsByUserId } from '@/lib/db';
import { computeCashBalances } from '@/lib/finance';
import { AccountsClient } from './AccountsClient';
import type { AccountViewModel } from '@/lib/view-models';

export const dynamic = 'force-dynamic';

export default async function AccountsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [accounts, transactions] = await Promise.all([
    getAccountsByUserId(session.user.id),
    getTransactionsByUserId(session.user.id),
  ]);

  // Map transactions to finance transactions for cash balance derivation
  const financeTx = transactions.map((tx) => ({
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
    assetClass: tx.instrument.assetClass,
  }));

  const cashBalances = computeCashBalances(financeTx);

  const accountViewModels: AccountViewModel[] = accounts.map((acct) => ({
    id: acct.id,
    name: acct.name,
    type: acct.type,
    currency: acct.currency,
    description: acct.description,
    cashBalance: cashBalances[acct.id] || '0',
  }));

  return <AccountsClient initialAccounts={accountViewModels} />;
}
