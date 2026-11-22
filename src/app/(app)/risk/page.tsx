import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getPortfolioRiskAction } from '@/app/actions/risk';
import { RiskClient } from './RiskClient';

export const dynamic = 'force-dynamic';

export default async function RiskPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const riskData = await getPortfolioRiskAction();

  if ('error' in riskData) {
    return (
      <div className="p-8 text-center text-text-muted">
        <p>Failed to load risk analysis: {riskData.error}</p>
      </div>
    );
  }

  return <RiskClient riskData={riskData} />;
}

