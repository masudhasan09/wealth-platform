import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getAccountsByUserId, getTransactionsByUserId } from '@/lib/db';
import { computeCashBalances } from '@/lib/finance/holdings';
import { partitionPositionsByLiquidity, computeMWR } from '@/lib/finance/performance';
import Decimal from 'decimal.js';
import { getNetWorthAction, getSnapshotHistoryAction } from '@/app/actions/net-worth';
import { DashboardClient } from './DashboardClient';
import type { SnapshotPoint } from './DashboardClient';
import type { AllocationItem, MonthlyIncomeItem, TopHoldingItem } from '@/components/organisms/dashboard';

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
  const fixedIncomeVal = parseFloat(byAsset['BOND'] || byAsset['bond'] || byAsset['FIXED_INCOME'] || byAsset['fixed_income'] || '0');
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
    note: tx.note,
    assetClass: tx.instrument.assetClass,
  }));
  const cashBalances = computeCashBalances(enrichedTx);

  // 1. Allocation by Asset Class
  const assetClassAllocation: AllocationItem[] = [
    { id: 'equity', label: 'Equities & ETFs', value: Math.max(0, equitiesVal), color: 'var(--asset-equity)' },
    { id: 'crypto', label: 'Digital Assets', value: Math.max(0, cryptoVal), color: 'var(--asset-crypto)' },
    { id: 'fixed_income', label: 'Fixed Income', value: Math.max(0, fixedIncomeVal), color: 'var(--asset-fixed-income)' },
    { id: 'real_estate', label: 'Real Estate', value: Math.max(0, realEstateVal), color: 'var(--asset-real-estate)' },
    { id: 'cash', label: 'Cash & Reserves', value: Math.max(0, cashVal), color: 'var(--asset-cash)' },
  ].filter((item) => item.value > 0);

  // 2. Allocation by Account Type
  const accountTypeMap: Record<string, { label: string; value: number }> = {};
  accounts.forEach((acc) => {
    const cash = parseFloat(cashBalances[acc.id] || '0');
    const invested = hasData
      ? netWorthData.positions
          .filter((p) => p.accountId === acc.id)
          .reduce((sum, p) => sum + (parseFloat(p.marketValue) || 0), 0)
      : 0;
    const total = Math.max(0, cash + invested);

    const typeKey = acc.type || 'brokerage';
    if (!accountTypeMap[typeKey]) {
      // Keys mirror the Prisma AccountType enum exactly.
      const typeLabels: Record<string, string> = {
        brokerage: 'Taxable Brokerage',
        retirement_401k: 'Retirement (401k)',
        ira: 'Traditional IRA',
        roth_ira: 'Roth IRA',
        hsa: 'Health Savings (HSA)',
        bank: 'Bank Checking & Savings',
        crypto_wallet: 'Crypto Custody',
        property: 'Real Estate Holding',
      };
      accountTypeMap[typeKey] = {
        label: typeLabels[typeKey] || acc.type,
        value: 0,
      };
    }
    accountTypeMap[typeKey].value += total;
  });

  const accountTypeAllocation: AllocationItem[] = Object.entries(accountTypeMap)
    .filter(([, item]) => item.value > 0)
    .map(([key, item]) => ({
      id: key,
      label: item.label,
      value: item.value,
    }));

  // 3. Top Holdings
  const totalPositiveAssets = assetClassAllocation.reduce((acc, curr) => acc + curr.value, 0);

  const topHoldings: TopHoldingItem[] = hasData
    ? netWorthData.positions
        .filter((p) => parseFloat(p.marketValue) > 0)
        .sort((a, b) => parseFloat(b.marketValue) - parseFloat(a.marketValue))
        .slice(0, 10)
        .map((p) => {
          const val = parseFloat(p.marketValue);
          const allocPct = totalPositiveAssets > 0 ? ((val / totalPositiveAssets) * 100).toFixed(1) : '0.0';
          return {
            symbol: p.symbol || 'ASSET',
            name: p.symbol,
            assetClass: p.assetClass,
            quantity: p.quantity,
            marketValue: p.marketValue,
            totalCost: p.totalCost,
            unrealisedPnL: p.unrealisedPnL,
            unrealisedPnLPct: p.unrealisedPnLPct,
            allocationPct: allocPct,
          };
        })
    : [];

  // 4. Monthly Income Calculation from transactions
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const incomeByMonth: Record<string, { dividends: number; interest: number; coupons: number; rent: number }> = {};

  // Initialize last 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
    incomeByMonth[key] = { dividends: 0, interest: 0, coupons: 0, rent: 0 };
  }

  txRows.forEach((tx) => {
    if (tx.voidedAt) return;
    const txDate = new Date(tx.date);
    const key = `${monthNames[txDate.getMonth()]} ${txDate.getFullYear().toString().slice(2)}`;
    if (!incomeByMonth[key]) return;

    const amt = Math.abs(parseFloat(tx.amount || '0'));
    const note = (tx.note || '').toLowerCase();

    if (tx.type === 'dividend') {
      incomeByMonth[key].dividends += amt;
    } else if (tx.type === 'interest') {
      if (note.includes('coupon') || note.includes('bond') || note.includes('treasury')) {
        incomeByMonth[key].coupons += amt;
      } else {
        incomeByMonth[key].interest += amt;
      }
    } else if (note.includes('rent') || note.includes('lease')) {
      incomeByMonth[key].rent += amt;
    }
  });

  const incomeData: MonthlyIncomeItem[] = Object.entries(incomeByMonth).map(([month, item]) => ({
    month,
    dividends: Math.round(item.dividends),
    interest: Math.round(item.interest),
    coupons: Math.round(item.coupons),
    rent: Math.round(item.rent),
    total: Math.round(item.dividends + item.interest + item.coupons + item.rent),
  }));

  // Only real recorded income is charted. An empty ledger renders a zero chart
  // rather than an invented payment schedule.
  const finalIncomeData = incomeData;

  // 5. Performance Metrics (TWR and MWR)
  // Every figure is derived from the ledger. With no positions the whole panel
  // reports zero rather than a placeholder return.
  let twrVal = 0;
  let mwrVal = 0;
  let liquidReturn = 0;
  let appraisedReturn = 0;

  if (hasData && netWorthData.positions.length > 0) {
    const partitioned = partitionPositionsByLiquidity(
      netWorthData.positions.map((p) => ({
        symbol: p.symbol,
        assetClass: p.assetClass,
        marketValue: p.marketValue,
        totalCost: p.totalCost,
      }))
    );

    const calcReturn = (items: typeof partitioned.liquid) => {
      const cost = items.reduce((sum, i) => sum + parseFloat(i.totalCost || '0'), 0);
      const val = items.reduce((sum, i) => sum + parseFloat(i.marketValue || '0'), 0);
      return cost > 0 ? ((val - cost) / cost) * 100 : 0;
    };

    const liqRet = calcReturn(partitioned.liquid);
    const appRet = calcReturn(partitioned.illiquid);
    if (partitioned.liquid.length > 0) liquidReturn = Number(liqRet.toFixed(2));
    if (partitioned.illiquid.length > 0) appraisedReturn = Number(appRet.toFixed(2));

    const totalCost = netWorthData.positions.reduce((sum, p) => sum + parseFloat(p.totalCost || '0'), 0);
    const totalVal = netWorthData.positions.reduce((sum, p) => sum + parseFloat(p.marketValue || '0'), 0);
    if (totalCost > 0) {
      twrVal = Number((((totalVal - totalCost) / totalCost) * 100).toFixed(2));
    }

    // Money-weighted return (XIRR) from real external cash flows:
    // deposits are money the investor put in, withdrawals money taken out,
    // and current net worth is the terminal value.
    const externalFlows = txRows
      .filter((tx) => !tx.voidedAt && (tx.type === 'deposit' || tx.type === 'withdrawal'))
      .map((tx) => ({
        date: tx.date,
        amount: new Decimal(tx.amount || '0')
          .times(tx.type === 'deposit' ? -1 : 1)
          .toFixed(2),
      }));

    if (externalFlows.length > 0) {
      const mwr = computeMWR({
        cashFlows: externalFlows,
        terminalValue: netWorthData.result.total,
        terminalDate: new Date(),
      });
      if (mwr.converged) mwrVal = Number(mwr.mwrPct);
    }
  }

  // 6. Snapshots for AreaChart
  const snapshots: SnapshotPoint[] = [...rawSnapshots].reverse().map((s) => ({
    date: formatDate(s.snapshotAt),
    value: parseFloat(s.total) || 0,
  }));

  return (
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
      accountsCount={accounts.length}
      snapshots={snapshots}
      assetClassAllocation={assetClassAllocation}
      accountTypeAllocation={accountTypeAllocation}
      incomeData={finalIncomeData}
      topHoldings={topHoldings}
      performance={{
        twrPct: twrVal,
        mwrPct: mwrVal,
        liquidReturnPct: liquidReturn,
        appraisedReturnPct: appraisedReturn,
      }}
    />
  );
}
