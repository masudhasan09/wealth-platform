'use server';

import { auth } from '@/auth';
import { getNetWorthAction } from './net-worth';
import { computePortfolioRisk, RiskAnalysisResult } from '@/lib/finance/risk';

export async function getPortfolioRiskAction(): Promise<RiskAnalysisResult | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be signed in to view portfolio risk analysis.' };
  }

  try {
    const netWorthData = await getNetWorthAction();
    if ('error' in netWorthData) {
      return { error: netWorthData.error };
    }

    const positions = netWorthData.positions.map((p) => ({
      instrumentId: p.instrumentId,
      symbol: p.symbol || 'Unknown',
      name: p.symbol || 'Unknown',
      assetClass: p.assetClass,
      value: p.marketValue || '0',
    }));

    return computePortfolioRisk(positions);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Failed to calculate portfolio risk.' };
  }
}
