'use client';

import React from 'react';
import { PageLayout } from '@/components/templates/PageLayout';
import { ReportExportPanel } from '@/components/organisms/reports/ReportExportPanel';
import type { HoldingViewModel } from '@/lib/view-models';
import type { RealizedGainsReportSummary } from '@/lib/finance/tax-lots';
import type { RiskAnalysisResult } from '@/lib/finance/risk';

export interface ReportsClientProps {
  user: { name: string; email: string };
  holdings: HoldingViewModel[];
  gainsSummary: RealizedGainsReportSummary;
  netWorthTotal: string;
  riskData?: RiskAnalysisResult;
  initialReportType?: 'portfolio' | 'gains' | 'risk';
}

export function ReportsClient({
  user,
  holdings,
  gainsSummary,
  netWorthTotal,
  riskData,
  initialReportType = 'portfolio',
}: ReportsClientProps) {
  return (
    <PageLayout
      title="Financial Reports & Exports"
      description="Generate and export audit-ready statements for portfolio valuation, realized capital gains, and risk diversification."
    >
      <ReportExportPanel
        user={user}
        holdings={holdings}
        gainsSummary={gainsSummary}
        netWorthTotal={netWorthTotal}
        riskData={riskData}
        initialReportType={initialReportType}
      />
    </PageLayout>
  );
}
