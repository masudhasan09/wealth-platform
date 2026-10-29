'use client';

import React, { useState } from 'react';
import { Stepper, StepItem } from '@/components/molecules/Stepper';
import { FileInput } from '@/components/atoms/FileInput';
import { Button } from '@/components/atoms/Button';
import { Alert } from '@/components/molecules/Alert';
import { Badge } from '@/components/atoms/Badge';
import { DataTable, type ColumnDef } from '@/components/organisms/shared/DataTable';
import { MoneyText } from '@/components/atoms/MoneyText';
import { Icon } from '@/components/atoms/Icon';
import {
  parseAndValidateCsv,
  CsvTransactionRow,
  CsvParseResult,
  CSV_TEMPLATE_SAMPLE,
} from '@/lib/finance/csv-import';

export interface CsvImportWizardProps {
  onCommit: (rows: CsvTransactionRow[]) => Promise<{ success: boolean; count: number; error?: string }>;
  existingTransactions?: {
    date: string | Date;
    accountName?: string;
    accountId?: string;
    type: string;
    symbol?: string | null;
    quantity: string | number;
    amount: string | number;
  }[];
}

const STEPS: StepItem[] = [
  { id: 'upload', label: 'Upload File' },
  { id: 'preview', label: 'Preview & Validate' },
  { id: 'confirm', label: 'Confirm Import' },
];

export function CsvImportWizard({ onCommit, existingTransactions = [] }: CsvImportWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [csvText, setCsvText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commitResult, setCommitResult] = useState<{ success: boolean; count: number; error?: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      const parsed = parseAndValidateCsv(text, existingTransactions);
      setParseResult(parsed);
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([CSV_TEMPLATE_SAMPLE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'wealthtrack_transactions_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCommit = async () => {
    if (!parseResult) return;
    setIsSubmitting(true);
    try {
      const rowsToImport = skipDuplicates
        ? parseResult.validRows.filter((r) => !r.isDuplicate)
        : parseResult.validRows;

      const res = await onCommit(rowsToImport);
      setCommitResult(res);
      if (res.success) {
        setCurrentStep(2);
      }
    } catch (err: unknown) {
      setCommitResult({
        success: false,
        count: 0,
        error: err instanceof Error ? err.message : 'Failed to import transactions',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewColumns: ColumnDef<CsvTransactionRow>[] = [
    {
      header: 'Row',
      accessorKey: 'rowNumber',
      id: 'rowNumber',
      align: 'right',
    },
    {
      header: 'Date',
      accessorKey: 'date',
      id: 'date',
    },
    {
      header: 'Account',
      accessorKey: 'account',
      id: 'account',
    },
    {
      header: 'Type',
      id: 'type',
      render: (r) => (
        <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-surface-muted border border-border">
          {r.type}
        </span>
      ),
    },
    {
      header: 'Symbol',
      id: 'symbol',
      render: (r) => <span className="font-semibold text-text">{r.symbol || '—'}</span>,
    },
    {
      header: 'Quantity',
      accessorKey: 'quantity',
      id: 'quantity',
      align: 'right',
    },
    {
      header: 'Amount',
      id: 'amount',
      align: 'right',
      render: (r) => <MoneyText value={r.amount} />,
    },
    {
      header: 'Status',
      id: 'status',
      align: 'right',
      render: (r) =>
        r.isDuplicate ? (
          <Badge tone="warning">Duplicate</Badge>
        ) : (
          <Badge tone="success">Valid</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-8 bg-surface rounded-xl border border-border p-6 shadow-xs">
      <Stepper steps={STEPS} currentStep={currentStep} />

      {/* Step 0: Upload */}
      {currentStep === 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-surface-muted border border-border">
            <div>
              <h3 className="text-sm font-semibold text-text">Standard CSV Format</h3>
              <p className="text-xs text-text-muted mt-1">
                Columns: <code className="font-mono text-primary font-medium">date, account, type, symbol, quantity, price, amount, fee, note</code>
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleDownloadSample}>
              <Icon name="Download" size="sm" className="mr-1.5" />
              Download Template
            </Button>
          </div>

          <div className="p-8 border-2 border-dashed border-border rounded-xl text-center space-y-4 hover:border-primary transition-colors">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary-muted flex items-center justify-center text-primary">
              <Icon name="Upload" size="lg" />
            </div>
            <div>
              <p className="text-sm font-medium text-text">
                Select your transaction CSV file to upload
              </p>
              <p className="text-xs text-text-muted mt-1">UTF-8 formatted .csv files up to 10MB</p>
            </div>

            <div className="max-w-xs mx-auto">
              <FileInput
                accept=".csv,text/csv"
                onChange={handleFileChange}
                aria-label="Upload CSV"
              />
            </div>

            {fileName && (
              <p className="text-xs font-mono text-primary font-medium">
                Loaded: {fileName} ({csvText.split('\n').length - 1} rows)
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              disabled={!parseResult}
              onClick={() => setCurrentStep(1)}
            >
              Continue to Preview & Validate
              <Icon name="ArrowRight" size="sm" className="ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Preview & Validate */}
      {currentStep === 1 && parseResult && (
        <div className="space-y-6">
          {/* Summary Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-border bg-surface-muted">
              <span className="text-xs text-text-muted">Total Rows</span>
              <p className="text-xl font-bold text-text mt-1">{parseResult.totalRows}</p>
            </div>
            <div className="p-4 rounded-lg border border-success/30 bg-success-muted">
              <span className="text-xs text-success">Valid Rows</span>
              <p className="text-xl font-bold text-success mt-1">{parseResult.validRows.length}</p>
            </div>
            <div className="p-4 rounded-lg border border-warning/30 bg-warning-muted">
              <span className="text-xs text-warning">Duplicates</span>
              <p className="text-xl font-bold text-warning mt-1">{parseResult.duplicateRows.length}</p>
            </div>
            <div className="p-4 rounded-lg border border-danger/30 bg-danger-muted">
              <span className="text-xs text-danger">Errors</span>
              <p className="text-xl font-bold text-danger mt-1">{parseResult.errorRows.length}</p>
            </div>
          </div>

          {/* Row-level Errors Alert */}
          {parseResult.errorRows.length > 0 && (
            <Alert tone="danger" title={`Row-Level Errors Detected (${parseResult.errorRows.length})`}>
              <p className="text-xs mb-2">The following rows cannot be imported due to validation errors:</p>
              <ul className="text-xs space-y-1 list-disc list-inside max-h-40 overflow-y-auto font-mono">
                {parseResult.errorRows.map((err) => (
                  <li key={err.rowNumber}>
                    Row {err.rowNumber}: {err.errors.join(', ')}
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Duplicate Notice */}
          {parseResult.duplicateRows.length > 0 && (
            <Alert tone="warning" title="Duplicate Transactions Detected">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
                <span className="text-xs">
                  {parseResult.duplicateRows.length} transaction(s) match existing records in your ledger.
                </span>
                <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  Skip duplicates automatically
                </label>
              </div>
            </Alert>
          )}

          {/* Preview Table */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-text">Parsed Transactions Preview</h4>
            <DataTable
              columns={previewColumns}
              data={parseResult.validRows}
              keyExtractor={(r) => `${r.rowNumber}-${r.date}-${r.symbol}`}
              emptyTitle="No valid rows"
              emptyDescription="No valid rows parsed from the CSV."
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setCurrentStep(0)}>
              <Icon name="ArrowLeft" size="sm" className="mr-1.5" />
              Back
            </Button>

            <Button
              variant="primary"
              disabled={parseResult.validRows.length === 0 || isSubmitting}
              onClick={handleCommit}
            >
              {isSubmitting ? (
                'Importing...'
              ) : (
                <>
                  Confirm and Commit{' '}
                  {skipDuplicates
                    ? parseResult.validRows.filter((r) => !r.isDuplicate).length
                    : parseResult.validRows.length}{' '}
                  Transactions
                  <Icon name="Check" size="sm" className="ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Confirmed */}
      {currentStep === 2 && commitResult && (
        <div className="space-y-6 text-center py-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-success-muted border border-success flex items-center justify-center text-success">
            <Icon name="CheckCircle2" size="xl" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-text">Import Successfully Completed</h3>
            <p className="text-sm text-text-muted">
              {commitResult.count} transactions have been committed to your immutable ledger and will immediately reflect across your holdings, net worth, and tax lots.
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setCsvText('');
                setFileName('');
                setParseResult(null);
                setCommitResult(null);
                setCurrentStep(0);
              }}
            >
              Import Another File
            </Button>

            <a href="/transactions">
              <Button variant="primary">
                View Transactions Ledger
                <Icon name="ArrowRight" size="sm" className="ml-1.5" />
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
