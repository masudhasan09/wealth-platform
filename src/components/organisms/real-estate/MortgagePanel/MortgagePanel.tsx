'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/molecules/FormField';
import { formatCurrency } from '@/lib/format';
import { computeMonthlyMortgagePayment, computePropertyEquity } from '@/lib/finance/real-estate';
import { mortgageSchema, type MortgageInput } from '@/lib/validation';

export interface MortgageDetails {
  id: string;
  name: string;
  principal: string;
  rate: string; // e.g. "0.06"
  termMonths: number;
  startDate: string | Date;
  monthlyPayment?: string | null;
  outstandingBalance?: string;
}

export interface MortgagePanelProps {
  propertyId: string;
  propertyValue: string;
  ownershipPct?: string | number;
  mortgage?: MortgageDetails | null;
  accounts?: { id: string; name: string }[];
  onAddMortgage?: (accountId: string, data: MortgageInput) => Promise<{ error?: string } | void> | void;
  isLoading?: boolean;
}

export function MortgagePanel({
  propertyId,
  propertyValue,
  ownershipPct = 1.0,
  mortgage,
  accounts = [],
  onAddMortgage,
  isLoading = false,
}: MortgagePanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('Primary Mortgage');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [principal, setPrincipal] = useState('');
  const [interestRatePct, setInterestRatePct] = useState('6.5');
  const [termMonths, setTermMonths] = useState('360');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const equityData = computePropertyEquity({
    marketValue: propertyValue,
    ownershipPct: String(ownershipPct),
    mortgageBalance: mortgage ? mortgage.outstandingBalance || mortgage.principal : '0',
  });

  const computedMonthly = mortgage
    ? mortgage.monthlyPayment ||
      computeMonthlyMortgagePayment(mortgage.principal, mortgage.rate, mortgage.termMonths)
    : '0';

  const handleCreateMortgage = async (e: React.FormEvent) => {
    e.preventDefault();
    // Convert 6.5 -> "0.065000"
    const decimalRate = (parseFloat(interestRatePct) / 100).toFixed(6);

    const result = mortgageSchema.safeParse({
      name,
      accountId,
      linkedInstrumentId: propertyId,
      principal,
      rate: decimalRate,
      termMonths: Number(termMonths),
      startDate,
    });

    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        errs[field] = err.message;
      });
      setErrors(errs);
      return;
    }

    if (onAddMortgage && accountId) {
      await onAddMortgage(accountId, result.data);
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-text">Mortgage & Financing</h4>
          <p className="text-xs text-text-muted">Debt obligations and net equity structure</p>
        </div>
        {!mortgage && !isAdding && onAddMortgage && (
          <Button size="sm" variant="secondary" onClick={() => setIsAdding(true)}>
            + Link Mortgage
          </Button>
        )}
      </div>

      {/* Equity & LTV Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-surface-subtle border border-border rounded-lg">
          <p className="text-xs text-text-muted">Gross Asset Value</p>
          <p className="text-base font-semibold font-mono text-text mt-0.5">
            {formatCurrency(equityData.effectiveValue)}
          </p>
          <p className="text-xs text-text-muted">
            {Number(ownershipPct) < 1 ? `${Number(ownershipPct) * 100}% share` : '100% share'}
          </p>
        </div>

        <div className="p-3 bg-surface-subtle border border-border rounded-lg">
          <p className="text-xs text-text-muted">Outstanding Debt</p>
          <p className="text-base font-semibold font-mono text-danger mt-0.5">
            {mortgage ? `-${formatCurrency(mortgage.outstandingBalance || mortgage.principal)}` : '$0.00'}
          </p>
          <p className="text-xs text-text-muted">
            {mortgage ? `${mortgage.name}` : 'Unencumbered'}
          </p>
        </div>

        <div className="p-3 bg-surface-subtle border border-border rounded-lg">
          <p className="text-xs text-text-muted">Net Equity</p>
          <p className="text-base font-semibold font-mono text-success mt-0.5">
            {formatCurrency(equityData.equity)}
          </p>
          <p className="text-xs text-text-muted">Asset minus Debt</p>
        </div>

        <div className="p-3 bg-surface-subtle border border-border rounded-lg">
          <p className="text-xs text-text-muted">Loan to Value (LTV)</p>
          <p className="text-base font-semibold font-mono text-text mt-0.5">
            {equityData.ltvPct}%
          </p>
          <div className="w-full bg-border rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="bg-primary h-1.5 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, Number(equityData.ltvPct)))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mortgage Info if present */}
      {mortgage && (
        <div className="p-3 bg-surface border border-border rounded-lg text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className="text-text-muted block">Loan Principal</span>
            <span className="font-semibold text-text font-mono">
              {formatCurrency(mortgage.principal)}
            </span>
          </div>
          <div>
            <span className="text-text-muted block">Interest Rate</span>
            <span className="font-semibold text-text font-mono">
              {(parseFloat(mortgage.rate) * 100).toFixed(2)}% Fixed
            </span>
          </div>
          <div>
            <span className="text-text-muted block">Term Length</span>
            <span className="font-semibold text-text">
              {mortgage.termMonths / 12} Years ({mortgage.termMonths} mos)
            </span>
          </div>
          <div>
            <span className="text-text-muted block">Monthly P&I Payment</span>
            <span className="font-semibold text-primary font-mono">
              {formatCurrency(computedMonthly)}/mo
            </span>
          </div>
        </div>
      )}

      {/* Form to link mortgage */}
      {isAdding && (
        <form onSubmit={handleCreateMortgage} className="p-4 bg-surface-subtle border border-border rounded-lg space-y-3">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Add Mortgage Financing
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Mortgage / Lender Name" required error={errors.name}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chase 30-Yr Fixed"
                aria-invalid={Boolean(errors.name)}
              />
            </FormField>

            <FormField label="Assign to Liability Account" required>
              <select
                aria-label="Assign to Liability Account"
                className="w-full h-9 rounded-md border border-border bg-surface px-3 py-1 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Loan Amount / Principal" required error={errors.principal}>
              <Input
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="e.g. 360000"
                aria-invalid={Boolean(errors.principal)}
              />
            </FormField>

            <FormField label="Annual Interest Rate (%)" required error={errors.rate}>
              <Input
                value={interestRatePct}
                onChange={(e) => setInterestRatePct(e.target.value)}
                placeholder="e.g. 6.5"
                aria-invalid={Boolean(errors.rate)}
              />
            </FormField>

            <FormField label="Term in Months" required error={errors.termMonths}>
              <Input
                type="number"
                value={termMonths}
                onChange={(e) => setTermMonths(e.target.value)}
                placeholder="360"
                aria-invalid={Boolean(errors.termMonths)}
              />
            </FormField>
          </div>

          <FormField label="Loan Origination Date" required error={errors.startDate}>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-invalid={Boolean(errors.startDate)}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isLoading}>
              Save Mortgage
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
