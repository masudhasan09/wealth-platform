import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getAccountsByUserId, getTransactionsByUserId } from '@/lib/db';
import { computeHoldings, computeCashBalances } from '@/lib/finance';
import { DashboardLayout } from '@/components/templates';
import { HoldingsClient } from './HoldingsClient';
import type { HoldingViewModel, AccountViewModel } from '@/lib/view-models';

export default async function HoldingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [accounts, transactions] = await Promise.all([
    getAccountsByUserId(session.user.id),
    getTransactionsByUserId(session.user.id),
  ]);

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
  }));

  const computedHoldingsList = computeHoldings(financeTx);
  const cashBalances = computeCashBalances(financeTx);

  // Map to lookup accounts and instruments
  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const instrumentMap = new Map(
    transactions.map((t) => [t.instrumentId, t.instrument])
  );

  const holdingViewModels: HoldingViewModel[] = computedHoldingsList.map((h) => {
    const acct = accountMap.get(h.accountId);
    const inst = instrumentMap.get(h.instrumentId);

    return {
      accountId: h.accountId,
      accountName: acct?.name || 'Unknown Account',
      instrumentId: h.instrumentId,
      symbol: inst?.symbol || '',
      instrumentName: inst?.name || inst?.symbol || '',
      assetClass: inst?.assetClass || 'equity',
      quantity: h.quantity,
      averageCost: h.averageCost,
      totalCost: h.totalCost,
    };
  });

  const accountViewModels: AccountViewModel[] = accounts.map((acct) => ({
    id: acct.id,
    name: acct.name,
    type: acct.type,
    currency: acct.currency,
    description: acct.description,
    cashBalance: cashBalances[acct.id] || '0',
  }));

  return (
    <DashboardLayout
      currentPath="/holdings"
      user={{
        name: session.user.name || 'User',
        email: session.user.email || '',
      }}
    >
      <HoldingsClient
        holdings={holdingViewModels}
        accounts={accountViewModels}
      />
    </DashboardLayout>
  );
}

