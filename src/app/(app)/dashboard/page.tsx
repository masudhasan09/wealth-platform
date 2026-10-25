import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { DashboardLayout } from '@/components/templates';
import { getAccountsByUserId, getTransactionsByUserId } from '@/lib/db';
import { computeCashBalances } from '@/lib/finance/holdings';
import { getNetWorthAction, getSnapshotHistoryAction } from '@/app/actions/net-worth';
import { DashboardClient } from './DashboardClient';
import type { PositionItem, AccountBalanceItem, SnapshotPoint } from './DashboardClient';

export const dynamic = 'force-dynamic';

function formatDate(iso: Date | string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Load all required portfolio data concurrently
  const [accounts, netWorthData, rawSnapshots, txRows] = await Promise.all([
    getAccountsByUserId(userId),
    getNetWorthAction(),
    getSnapshotHistoryAction(90),
    getTransactionsByUserId(userId),
  ]);

  const hasData = !('error' in netWorthData);
  const totalNetWorth = hasData ? parseFloat(netWorthData.result.total) : 0;
  const byAsset = hasData ? netWorthData.result.byAssetClass : {};

  const equitiesVal = parseFloat(byAsset['EQUITY'] || byAsset['equity'] || byAsset['ETF'] || '0');
  const cryptoVal = parseFloat(byAsset['CRYPTO'] || byAsset['crypto'] || '0');
  const fixedIncomeVal = parseFloat(byAsset['BOND'] || byAsset['bond'] || byAsset['FIXED_INCOME'] || '0');
  const realEstateVal = parseFloat(byAsset['REAL_ESTATE'] || byAsset['real_estate'] || '0');
  const cashVal = parseFloat(byAsset['CASH'] || byAsset['cash'] || '0');

  // Compute cash balances across accounts
  const enrichedTx = txRows.map((tx) => ({
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
  const cashBalances = computeCashBalances(enrichedTx);

  // Position items
  const positions: PositionItem[] = hasData
    ? netWorthData.positions.map((p) => ({
        symbol: p.symbol,
        assetClass: p.assetClass,
        quantity: p.quantity,
        marketValue: parseFloat(p.marketValue) || 0,
        totalCost: parseFloat(p.totalCost) || 0,
        unrealisedPnL: parseFloat(p.unrealisedPnL) || 0,
        unrealisedPnLPct: parseFloat(p.unrealisedPnLPct) || 0,
      }))
    : [];

  // Account balance distribution items
  const accountBalances: AccountBalanceItem[] = accounts.map((acc) => {
    const cash = parseFloat(cashBalances[acc.id] || '0');
    const invested = hasData
      ? netWorthData.positions
          .filter((p) => p.accountId === acc.id)
          .reduce((sum, p) => sum + (parseFloat(p.marketValue) || 0), 0)
      : 0;

    return {
      name: acc.name,
      type: acc.type,
      cash,
      invested,
      total: cash + invested,
    };
  });

  // Snapshots formatted for AreaChart
  const snapshots: SnapshotPoint[] = [...rawSnapshots].reverse().map((s) => ({
    date: formatDate(s.snapshotAt),
    value: parseFloat(s.total) || 0,
  }));

  return (
    <DashboardLayout
      currentPath="/dashboard"
      user={{
        name: session.user.name || 'User',
        email: session.user.email || '',
      }}
    >
      <DashboardClient
        user={{
          name: session.user.name || 'User',
          email: session.user.email || '',
        }}
        totalNetWorth={totalNetWorth}
        totalCash={cashVal}
        equitiesVal={equitiesVal}
        cryptoVal={cryptoVal}
        fixedIncomeVal={fixedIncomeVal}
        realEstateVal={realEstateVal}
        positions={positions}
        accountBalances={accountBalances}
        snapshots={snapshots}
        accountsCount={accounts.length}
      />
    </DashboardLayout>
  );
}
