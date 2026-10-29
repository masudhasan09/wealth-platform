'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/components/templates/PageLayout';
import { Tabs } from '@/components/molecules/Tabs';
import { TaxLotTable, OpenTaxLotViewModel } from '@/components/organisms/gains/TaxLotTable';
import { RealizedGainsReport } from '@/components/organisms/gains/RealizedGainsReport';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { RealizedGainsReportSummary, computeRealizedGainsReport, RealizedLot } from '@/lib/finance/tax-lots';

export interface GainsClientProps {
  openLots: OpenTaxLotViewModel[];
  allRealizedLots: RealizedLot[];
  availableYears: number[];
  initialYear: number;
}

export function GainsClient({
  openLots,
  allRealizedLots,
  availableYears,
  initialYear,
}: GainsClientProps) {
  const [activeTab, setActiveTab] = useState<'open-lots' | 'realized'>('open-lots');
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);

  const realizedSummary: RealizedGainsReportSummary = React.useMemo(() => {
    return computeRealizedGainsReport(allRealizedLots, selectedYear);
  }, [allRealizedLots, selectedYear]);

  const tabs = [
    { id: 'open-lots', label: `Open Tax Lots (${openLots.length})` },
    { id: 'realized', label: `Realized Gains (${realizedSummary.lots.length})` },
  ];

  return (
    <PageLayout
      title="Capital Gains & Tax Lots"
      description="FIFO cost-basis tracking, unrealized positions, and holding period classification (short-term vs. long-term)."
      actions={
        <a href="/transactions/import">
          <Button variant="secondary" size="sm">
            <Icon name="Upload" size="sm" className="mr-1.5" />
            Import CSV
          </Button>
        </a>
      }
    >
      <div className="space-y-6">
        <Tabs
          items={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as 'open-lots' | 'realized')}
        />

        {activeTab === 'open-lots' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-text-muted">
              <span>
                Each lot tracks remaining quantity from buy transactions and identifies long-term eligibility (&gt; 365 days).
              </span>
            </div>
            <TaxLotTable lots={openLots} />
          </div>
        ) : (
          <RealizedGainsReport
            summary={realizedSummary}
            availableYears={availableYears}
            selectedYear={selectedYear}
            onYearChange={(year) => setSelectedYear(year)}
          />
        )}
      </div>
    </PageLayout>
  );
}
