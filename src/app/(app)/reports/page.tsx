import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getReportDataAction } from '@/app/actions/reports';
import { ReportsClient } from './ReportsClient';

export const dynamic = 'force-dynamic';

type ReportType = 'portfolio' | 'gains' | 'risk';

function resolveReportType(raw?: string): ReportType {
  if (raw === 'gains' || raw === 'risk' || raw === 'portfolio') {
    return raw;
  }
  return 'portfolio';
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const resolvedParams = searchParams ? await searchParams : undefined;
  const initialReportType = resolveReportType(resolvedParams?.type);

  const reportData = await getReportDataAction();

  if ('error' in reportData) {
    return (
      <div className="p-8 text-center text-text-muted">
        <p>Failed to load report data: {reportData.error}</p>
      </div>
    );
  }

  return (
    <ReportsClient
      user={reportData.user}
      holdings={reportData.holdings}
      gainsSummary={reportData.gainsSummary}
      netWorthTotal={reportData.netWorthTotal}
      riskData={reportData.riskData}
      initialReportType={initialReportType}
    />
  );
}
