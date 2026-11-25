'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { StatCard } from '@/components/molecules/StatCard';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Icon } from '@/components/atoms/Icon';
import { Alert } from '@/components/molecules/Alert';
import { Tabs } from '@/components/molecules/Tabs';
import { formatMoney, formatDate } from '@/lib/format';
import {
  PropertyForm,
  ValuationHistory,
  MortgagePanel,
  AmortizationTable,
} from '@/components/organisms/real-estate';
import {
  createPropertyAction,
  addValuationMarkAction,
  createMortgageAction,
} from '@/app/actions/real-estate';
import type { PropertyInput, ValuationMarkInput, MortgageInput } from '@/lib/validation';
import type { PropertyWithDetails } from '@/lib/db/real-estate';

export interface RealEstateClientProps {
  properties: PropertyWithDetails[];
  accounts: { id: string; name: string }[];
}

export function RealEstateClient({ properties, accounts }: RealEstateClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    properties[0]?.id || ''
  );
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('valuations');
  const [isLoading, setIsLoading] = useState(false);

  const selectedProperty =
    properties.find((p) => p.id === selectedPropertyId) || properties[0];

  // Aggregates
  let totalGross = 0;
  let totalDebt = 0;

  properties.forEach((p) => {
    const val = parseFloat(p.currentValuation || '0');
    const own = parseFloat(p.details?.ownershipPct || '1.0');
    totalGross += val * own;

    p.liabilities.forEach((l) => {
      totalDebt += parseFloat(l.principal || '0');
    });
  });

  const totalEquity = totalGross - totalDebt;

  const handleCreateProperty = async (accountId: string, values: PropertyInput) => {
    setIsLoading(true);
    setActionError(null);
    try {
      const res = await createPropertyAction(accountId, values);
      if (res.error) {
        setActionError(res.error);
      } else {
        setIsAddPropertyOpen(false);
        if (res.property) {
          setSelectedPropertyId(res.property.id);
        }
        startTransition(() => {
          router.refresh();
        });
      }
    } catch {
      setActionError('An unexpected error occurred while creating the property.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddValuationMark = async (
    propId: string,
    mark: ValuationMarkInput
  ) => {
    setIsLoading(true);
    setActionError(null);
    try {
      const res = await addValuationMarkAction(propId, mark);
      if (res.error) {
        setActionError(res.error);
      } else {
        startTransition(() => {
          router.refresh();
        });
      }
    } catch {
      setActionError('Failed to record valuation mark.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMortgage = async (
    _accountId: string,
    data: MortgageInput
  ) => {
    setIsLoading(true);
    setActionError(null);
    try {
      const res = await createMortgageAction(data);
      if (res.error) {
        setActionError(res.error);
      } else {
        startTransition(() => {
          router.refresh();
        });
      }
    } catch {
      setActionError('Failed to record mortgage.');
    } finally {
      setIsLoading(false);
    }
  };

  const primaryMortgage = selectedProperty?.liabilities[0]
    ? {
        id: selectedProperty.liabilities[0].id,
        name: selectedProperty.liabilities[0].name,
        principal: selectedProperty.liabilities[0].principal,
        rate: selectedProperty.liabilities[0].rate,
        termMonths: selectedProperty.liabilities[0].termMonths,
        startDate: selectedProperty.liabilities[0].startDate,
      }
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Heading level="h1">Real Estate Portfolio</Heading>
          <Text variant="body" tone="muted" className="mt-1">
            Physical assets, manual appraisal records, equity calculations, and mortgage amortization schedules.
          </Text>
        </div>
        <Button variant="primary" onClick={() => setIsAddPropertyOpen(true)}>
          + Add Property
        </Button>
      </div>

      {actionError && (
        <Alert tone="danger">
          {actionError}
        </Alert>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Gross Property Value"
          value={formatMoney(totalGross)}
          helperText={`${properties.length} active assets`}
        />
        <StatCard
          label="Total Mortgage Debt"
          value={formatMoney(totalDebt)}
          helperText="Outstanding liabilities"
        />
        <StatCard
          label="Total Net Equity"
          value={formatMoney(totalEquity)}
          helperText="Gross share minus debt"
        />
        <StatCard
          label="Average Leverage (LTV)"
          value={
            totalGross > 0
              ? `${((totalDebt / totalGross) * 100).toFixed(1)}%`
              : '0.0%'
          }
          helperText="Portfolio-level debt ratio"
        />
      </div>

      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-surface-muted border border-border text-xs text-text-muted">
        <Icon name="Info" size="sm" className="text-info shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="font-semibold text-text">Appraisal Smoothing Note: </span>
          <span>
            Real estate values rely on point-in-time appraisals and automated valuation models, which introduce appraisal smoothing bias. Volatility is naturally dampened compared to daily public markets.
          </span>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-border rounded-xl space-y-4">
          <div className="h-12 w-12 rounded-full bg-surface-subtle text-text-muted flex items-center justify-center mx-auto text-xl">
            🏢
          </div>
          <h3 className="text-base font-semibold text-text">No Real Estate Properties Recorded</h3>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Track residential, multi-family, or commercial properties, monitor appraised valuations, and manage mortgage amortization schedules.
          </p>
          <Button variant="primary" onClick={() => setIsAddPropertyOpen(true)}>
            Add Your First Property
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property Selector Column */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
              Properties ({properties.length})
            </h3>
            <div className="space-y-2">
              {properties.map((prop) => {
                const isSelected = prop.id === selectedProperty?.id;
                const propVal = parseFloat(prop.currentValuation || '0');
                const ownPct = parseFloat(prop.details?.ownershipPct || '1.0');
                const grossVal = propVal * ownPct;
                const debt = prop.liabilities.reduce(
                  (sum, l) => sum + parseFloat(l.principal || '0'),
                  0
                );
                const equity = grossVal - debt;

                return (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => setSelectedPropertyId(prop.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-surface border-primary ring-1 ring-primary shadow-xs'
                        : 'bg-surface border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-sm text-text truncate">
                        {prop.name}
                      </span>
                      <Badge tone={isSelected ? 'info' : 'neutral'}>
                        {prop.details?.propertyType || 'residential'}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted truncate mb-3">
                      {prop.details?.address || 'Address unrecorded'}
                    </p>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                      <div>
                        <span className="text-text-muted block text-xs">Net Equity</span>
                        <span className="font-mono font-semibold text-success">
                          {formatMoney(equity)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-text-muted block text-xs">Appraised</span>
                        <span className="font-mono text-text">
                          {formatMoney(prop.currentValuation)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Property Details & Tabs */}
          {selectedProperty && (
            <div className="lg:col-span-2 space-y-6">
              <div className="p-5 bg-surface border border-border rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-text">
                        {selectedProperty.name}
                      </h2>
                      <Badge tone="info">
                        {selectedProperty.details?.propertyType || 'residential'}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      {selectedProperty.details?.address}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-text-muted block">Current Valuation</span>
                    <span className="text-xl font-bold font-mono text-text">
                      {formatMoney(selectedProperty.currentValuation)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-text-muted block">Acquired Date</span>
                    <span className="font-medium text-text">
                      {selectedProperty.details?.purchaseDate
                        ? formatDate(selectedProperty.details.purchaseDate)
                        : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Purchase Price</span>
                    <span className="font-mono font-medium text-text">
                      {formatMoney(selectedProperty.details?.purchasePrice || '0')}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Ownership Share</span>
                    <span className="font-mono font-medium text-text">
                      {parseFloat(selectedProperty.details?.ownershipPct || '1.0') * 100}%
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Appraisal Marks</span>
                    <span className="font-medium text-text">
                      {selectedProperty.valuationMarks.length} record{selectedProperty.valuationMarks.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {/* Tabs for Valuations, Mortgage, Amortization */}
                <div className="pt-2">
                  <Tabs
                    items={[
                      { id: 'valuations', label: 'Valuation & Appraisals' },
                      { id: 'mortgage', label: 'Mortgage & Equity' },
                      {
                        id: 'amortization',
                        label: 'Amortization Table',
                      },
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                  />

                  <div className="pt-4">
                    {activeTab === 'valuations' && (
                      <ValuationHistory
                        propertyId={selectedProperty.id}
                        propertyName={selectedProperty.name}
                        records={selectedProperty.valuationMarks}
                        onAddMark={handleAddValuationMark}
                        isLoading={isLoading}
                      />
                    )}

                    {activeTab === 'mortgage' && (
                      <MortgagePanel
                        propertyId={selectedProperty.id}
                        propertyValue={selectedProperty.currentValuation}
                        ownershipPct={selectedProperty.details?.ownershipPct || '1.0'}
                        mortgage={primaryMortgage}
                        accounts={accounts}
                        onAddMortgage={handleAddMortgage}
                        isLoading={isLoading}
                      />
                    )}

                    {activeTab === 'amortization' && primaryMortgage && (
                      <AmortizationTable
                        principal={primaryMortgage.principal}
                        annualInterestRatePct={primaryMortgage.rate}
                        termMonths={primaryMortgage.termMonths}
                        startDate={primaryMortgage.startDate}
                      />
                    )}

                    {activeTab === 'amortization' && !primaryMortgage && (
                      <div className="p-8 text-center text-xs text-text-muted">
                        No mortgage linked to this property yet. Add a mortgage in the Mortgage &amp; Equity tab to view its amortization schedule.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Property Modal */}
      {isAddPropertyOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-property-dialog-title"
          data-modal-open="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-md p-4"
        >
          <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <Heading id="add-property-dialog-title" level="h3">Add New Real Estate Property</Heading>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddPropertyOpen(false)}
                aria-label="Close"
              >
                ✕
              </Button>
            </div>

            <PropertyForm
              accounts={accounts}
              onSubmit={handleCreateProperty}
              onCancel={() => setIsAddPropertyOpen(false)}
              isLoading={isLoading}
              serverError={actionError}
            />
          </div>
        </div>
      )}
    </div>
  );
}

