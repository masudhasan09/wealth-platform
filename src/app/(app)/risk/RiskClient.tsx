'use client';

import React from 'react';
import { PageLayout } from '@/components/templates/PageLayout';
import { RiskPanel } from '@/components/organisms/risk/RiskPanel';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { RiskAnalysisResult } from '@/lib/finance/risk';

export interface RiskClientProps {
  riskData: RiskAnalysisResult;
}

export function RiskClient({ riskData }: RiskClientProps) {
  return (
    <PageLayout
      title="Portfolio Risk & Diversification"
      description="Evaluates single-holding concentration, asset class allocation, and portfolio resilience using deterministic diagnostics."
      actions={
        <a href="/reports">
          <Button variant="secondary" size="sm">
            <Icon name="FileText" size="sm" className="mr-1.5" />
            Generate Risk Report
          </Button>
        </a>
      }
    >
      <RiskPanel riskData={riskData} />
    </PageLayout>
  );
}

