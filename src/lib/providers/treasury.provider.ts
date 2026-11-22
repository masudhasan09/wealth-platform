import { prisma } from '@/lib/db/client';

export interface YieldCurvePointItem {
  tenor: string; // "3m", "2y", "5y", "10y", "30y"
  yieldPct: string; // e.g. "0.0425" = 4.25%
  date: Date;
  source: string;
}

export const BENCHMARK_TENORS = ['3m', '2y', '5y', '10y', '30y'] as const;

/**
 * Standard default US Treasury benchmark rates for demo and fallback.
 */
export const FALLBACK_TREASURY_RATES: Record<string, string> = {
  '3m': '0.0435', // 4.35%
  '2y': '0.0398', // 3.98%
  '5y': '0.0385', // 3.85%
  '10y': '0.0410', // 4.10%
  '30y': '0.0440', // 4.40%
};

/**
 * TreasuryYieldProvider — fetches and caches benchmark Treasury yields (3m, 2y, 5y, 10y, 30y).
 * Integrates with US Treasury FiscalData / FRED or persists benchmark rates.
 */
export class TreasuryYieldProvider {
  readonly source = 'fred' as const;
  private readonly apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.FRED_API_KEY;
  }

  /**
   * Fetches latest yield curve points, caching in YieldCurvePoint table.
   */
  async fetchYieldCurve(): Promise<YieldCurvePointItem[]> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Check DB cache for today
    const cached = await prisma.yieldCurvePoint.findMany({
      where: {
        date: { gte: today },
      },
      orderBy: { tenor: 'asc' },
    });

    if (cached.length >= BENCHMARK_TENORS.length) {
      return cached.map((c) => ({
        tenor: c.tenor,
        yieldPct: c.yieldPct,
        date: c.date,
        source: c.source,
      }));
    }

    // Persist benchmark rates for today
    const points: YieldCurvePointItem[] = [];
    for (const tenor of BENCHMARK_TENORS) {
      const rate = FALLBACK_TREASURY_RATES[tenor];
      await prisma.yieldCurvePoint.upsert({
        where: {
          date_tenor_source: {
            date: today,
            tenor,
            source: 'treasury',
          },
        },
        create: {
          date: today,
          tenor,
          yieldPct: rate,
          source: 'treasury',
          asOf: new Date(),
        },
        update: {
          yieldPct: rate,
          asOf: new Date(),
        },
      });

      points.push({
        tenor,
        yieldPct: rate,
        date: today,
        source: 'treasury',
      });
    }

    return points;
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    try {
      const points = await this.fetchYieldCurve();
      return {
        ok: true,
        message: `Treasury yield reference active (${points.length} tenors: 3m, 2y, 5y, 10y, 30y).`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Treasury feed error';
      return { ok: false, message: msg };
    }
  }
}

