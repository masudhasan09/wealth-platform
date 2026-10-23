import { prisma } from './client';
import type { AssetClass } from '@prisma/client';

export async function findOrCreateInstrument(params: {
  symbol?: string;
  name?: string;
  assetClass?: AssetClass;
}) {
  const symbol = params.symbol ? params.symbol.toUpperCase().trim() : null;

  if (symbol) {
    const existing = await prisma.instrument.findFirst({
      where: { symbol },
    });
    if (existing) {
      return existing;
    }

    // Auto-detect assetClass if not specified
    let detectedClass: AssetClass = params.assetClass || 'equity';
    if (['BTC', 'ETH', 'SOL', 'USDT', 'USDC'].includes(symbol)) {
      detectedClass = 'crypto';
    } else if (symbol === 'USD') {
      detectedClass = 'cash';
    }

    return prisma.instrument.create({
      data: {
        symbol,
        name: params.name || symbol,
        assetClass: detectedClass,
        currency: 'USD',
      },
    });
  }

  // If no symbol (e.g. general cash or real estate)
  const defaultCash = await prisma.instrument.findFirst({
    where: { assetClass: 'cash', symbol: 'USD' },
  });

  if (defaultCash) {
    return defaultCash;
  }

  return prisma.instrument.create({
    data: {
      symbol: 'USD',
      name: 'US Dollar Cash',
      assetClass: 'cash',
      currency: 'USD',
    },
  });
}

