import { prisma } from './client';
import {
  computeTaxLots,
  enrichOpenLotsWithPrices,
  computeRealizedGainsReport,
  OpenTaxLot,
  RealizedGainsReportSummary,
} from '@/lib/finance/tax-lots';
import { getPrices } from '@/lib/services/price.service';

export interface UserTaxLotsResult {
  openLots: OpenTaxLot[];
  realizedReport: RealizedGainsReportSummary;
  availableYears: number[];
}

export async function getUserTaxLotsAndGains(
  userId: string,
  targetYear?: number
): Promise<UserTaxLotsResult> {
  // Fetch non-voided transactions for user
  const txRows = await prisma.transaction.findMany({
    where: {
      account: { userId },
      voidedAt: null,
    },
    include: {
      account: true,
      instrument: true,
    },
    orderBy: { date: 'asc' },
  });

  const transactions = txRows.map((tx) => ({
    id: tx.id,
    accountId: tx.accountId,
    accountName: tx.account.name,
    instrumentId: tx.instrumentId,
    type: tx.type,
    quantity: tx.quantity,
    price: tx.price,
    amount: tx.amount,
    fee: tx.fee,
    date: tx.date,
    voidedAt: tx.voidedAt,
    symbol: tx.instrument.symbol || undefined,
    name: tx.instrument.name,
  }));

  const fifoResult = computeTaxLots(transactions);

  // Fetch prices for active open lots by symbol
  const symbols = Array.from(
    new Set(fifoResult.openLots.map((l) => l.symbol).filter((s): s is string => !!s))
  );
  const priceMap: Record<string, string> = {};

  if (symbols.length > 0) {
    try {
      const priceQuoteMap = await getPrices(symbols);
      for (const [sym, quote] of priceQuoteMap.entries()) {
        priceMap[sym] = quote.price;
      }
    } catch {
      // Fallback: continue without market prices if service is unavailable
    }
  }

  // Enrich open lots with prices and unrealized gains
  const enrichedOpenLots = enrichOpenLotsWithPrices(fifoResult.openLots, priceMap);

  // Determine available tax years from realized lots
  const years = Array.from(
    new Set(fifoResult.realizedLots.map((l) => new Date(l.closeDate).getFullYear()))
  ).sort((a, b) => b - a);

  const currentYear = new Date().getFullYear();
  if (!years.includes(currentYear)) {
    years.unshift(currentYear);
  }

  const selectedYear = targetYear ?? years[0] ?? currentYear;
  const realizedReport = computeRealizedGainsReport(fifoResult.realizedLots, selectedYear);

  return {
    openLots: enrichedOpenLots,
    realizedReport,
    availableYears: years,
  };
}
