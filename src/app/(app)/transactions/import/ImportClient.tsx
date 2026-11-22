'use client';

import React from 'react';
import { PageLayout } from '@/components/templates/PageLayout';
import { CsvImportWizard } from '@/components/organisms/import/CsvImportWizard';
import { importTransactionsAction } from '@/app/actions/csv-import';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';

export interface ImportClientProps {
  existingTransactions: {
    date: string | Date;
    accountName?: string;
    accountId?: string;
    type: string;
    symbol?: string | null;
    quantity: string | number;
    amount: string | number;
  }[];
}

export function ImportClient({ existingTransactions }: ImportClientProps) {
  return (
    <PageLayout
      title="Import Transactions via CSV"
      description="Upload your broker or wallet transaction history using our standard CSV format. Includes validation, duplicate detection, and instant ledger reconciliation."
      actions={
        <a href="/transactions">
          <Button variant="secondary" size="sm">
            <Icon name="ArrowLeft" size="sm" className="mr-1.5" />
            Back to Ledger
          </Button>
        </a>
      }
    >
      <div className="max-w-4xl mx-auto">
        <CsvImportWizard
          onCommit={importTransactionsAction}
          existingTransactions={existingTransactions}
        />
      </div>
    </PageLayout>
  );
}

