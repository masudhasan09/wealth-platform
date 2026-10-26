import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getTransactionsByUserId } from '@/lib/db/transactions';
import { computeHoldings } from '@/lib/finance/holdings';
import { getLatestPrice, getLatestPriceById } from '@/lib/db/prices';
import { prisma } from '@/lib/db/client';
import { PricesClient } from './PricesClient';

export const dynamic = 'force-dynamic';

export default async function PricesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const transactions = await getTransactionsByUserId(session.user.id);

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
    voidedReason: null,
  }));

  const holdings = computeHoldings(financeTx, { strict: false });

  // Get unique instrument IDs held in portfolio
  const holdingInstrumentIds = [...new Set(holdings.map((h) => h.instrumentId))];

  // Fetch instruments that are held in portfolio OR have recorded prices
  const instruments = await prisma.instrument.findMany({
    where: {
      OR: [
        { id: { in: holdingInstrumentIds } },
        { prices: { some: {} } },
      ],
    },
    select: { id: true, symbol: true, name: true, assetClass: true },
    orderBy: { updatedAt: 'desc' },
  });

  // Fetch latest price for each instrument
  const instrumentPrices = await Promise.all(
    instruments.map(async (inst) => {
      const sym = inst.symbol ?? '';
      const p = sym ? await getLatestPrice(sym) : await getLatestPriceById(inst.id);
      return {
        instrumentId: inst.id,
        ticker: sym,
        name: inst.name ?? sym,
        assetClass: inst.assetClass,
        currentPrice: p?.value ?? null,
        priceSource: p?.source ?? null,
        priceAsOf: p?.asOf?.toISOString() ?? null,
      };
    }),
  );

  return <PricesClient instruments={instrumentPrices} />;
}
