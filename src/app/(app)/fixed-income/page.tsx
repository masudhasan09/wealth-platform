import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getAccountsByUserId, getTransactionsByUserId } from '@/lib/db';
import { getBondInstruments } from '@/lib/db/bonds';
import { computeHoldings } from '@/lib/finance/holdings';
import { getPrices } from '@/lib/services/price.service';
import { DashboardLayout } from '@/components/templates';
import { FixedIncomeClient } from './FixedIncomeClient';
import type { BondModel, BondHoldingItem } from '@/lib/finance/bonds';

export const dynamic = 'force-dynamic';

export default async function FixedIncomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [accounts, transactions, bondInstruments] = await Promise.all([
    getAccountsByUserId(session.user.id),
    getTransactionsByUserId(session.user.id),
    getBondInstruments(),
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

  const rawHoldings = computeHoldings(financeTx, { strict: false });
  const holdingsMap = new Map(rawHoldings.map((h) => [h.instrumentId, h]));

  const bondSymbols = bondInstruments
    .map((b) => b.symbol)
    .filter((s): s is string => !!s);
  const priceMap = await getPrices(bondSymbols);

  // Map to BondModel and BondHoldingItem
  const bondModels: BondModel[] = bondInstruments
    .filter((b) => b.bondDetails !== null)
    .map((b) => {
      const d = b.bondDetails!;
      let subType = 'treasury_note';
      try {
        const parsed = JSON.parse(b.identifiers);
        if (parsed.subType) subType = parsed.subType;
      } catch {
        // fallback
      }

      return {
        id: b.id,
        symbol: b.symbol || 'BOND',
        name: b.name,
        faceValue: d.faceValue,
        couponRate: d.couponRate,
        couponFrequency: d.couponFrequency as BondModel['couponFrequency'],
        maturityDate: d.maturityDate.toISOString(),
        issueDate: d.issueDate?.toISOString() || null,
        dayCount: d.dayCount as BondModel['dayCount'],
        callDate: d.callDate?.toISOString() || null,
        callPrice: d.callPrice,
        subType,
      };
    });

  // Extract held bonds
  const heldBonds: BondHoldingItem[] = [];
  for (const b of bondInstruments) {
    if (!b.bondDetails) continue;
    const holding = holdingsMap.get(b.id);
    if (!holding || parseFloat(holding.quantity) <= 0) continue;

    const sym = b.symbol || 'BOND';
    const quote = priceMap.get(sym.toUpperCase());
    const mPrice = quote?.price || b.bondDetails.faceValue;

    heldBonds.push({
      id: b.id,
      symbol: sym,
      name: b.name,
      maturityDate: b.bondDetails.maturityDate.toISOString(),
      faceValue: b.bondDetails.faceValue,
      marketPrice: mPrice,
      quantity: holding.quantity,
      couponRate: b.bondDetails.couponRate,
    });
  }

  const accountOptions = accounts.map((a) => ({
    id: a.id,
    name: a.name,
  }));

  return (
    <DashboardLayout
      currentPath="/fixed-income"
      user={{
        name: session.user.name || 'User',
        email: session.user.email || '',
      }}
    >
      <FixedIncomeClient
        bonds={bondModels}
        heldBonds={heldBonds}
        accounts={accountOptions}
      />
    </DashboardLayout>
  );
}

