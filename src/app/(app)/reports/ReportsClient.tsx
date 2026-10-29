'use client';

import React from 'react';
import { PageLayout } from '@/components/templates/PageLayout';
import { ReportExportPanel } from '@/components/organisms/reports/ReportExportPanel';
import type { HoldingViewModel } from '@/lib/view-models';
import type { RealizedGainsReportSummary } from '@/lib/finance/tax-lots';

export interface ReportsClientProps {
  user: { name: string; email: string };
  holdings: HoldingViewModel[];
  gainsSummary: RealizedGainsReportSummary;
  netWorthTotal: string;
}

export function ReportsClient({
  user,
  holdings,
  gainsSummary,
  netWorthTotal,
}: ReportsClientProps) {
  return (
    <PageLayout
      title="Financial Reports & Exports"
      description="Generate and export audit-ready statements for portfolio valuation, holdings breakdown, and realized capital gains."
    >
      <ReportExportPanel
        user={user}
        holdings={holdings}
        gainsSummary={gainsSummary}
        netWorthTotal={netWorthTotal}
      />
    </PageLayout>
  );
}

