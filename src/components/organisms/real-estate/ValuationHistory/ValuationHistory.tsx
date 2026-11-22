'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { FormField } from '@/components/molecules/FormField';
import { formatCurrency, formatDate } from '@/lib/format';
import { valuationMarkSchema, type ValuationMarkInput } from '@/lib/validation';

export interface ValuationRecord {
  id: string;
  date: string | Date;
  value: string;
  method: string;
  source?: string | null;
  note?: string | null;
}

export interface ValuationHistoryProps {
  propertyId: string;
  propertyName: string;
  records: ValuationRecord[];
  onAddMark: (propertyId: string, mark: ValuationMarkInput) => Promise<{ error?: string } | void> | void;
  isLoading?: boolean;
}

export function ValuationHistory({
  propertyId,
  propertyName,
  records,
  onAddMark,
  isLoading = false,
}: ValuationHistoryProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [value, setValue] = useState('');
  const [method, setMethod] = useState<'market' | 'model' | 'manual'>('manual');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = valuationMarkSchema.safeParse({
      instrumentId: propertyId,
      value,
      method,
      note: note || undefined,
      date,
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

    setErrors({});
    await onAddMark(propertyId, result.data);
    setValue('');
    setNote('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-text">Valuation & Appraisal History</h4>
          <p className="text-xs text-text-muted">
            Immutable valuation marks recorded for {propertyName}
          </p>
        </div>
        {!isAdding && (
          <Button size="sm" variant="secondary" onClick={() => setIsAdding(true)}>
            + Record New Appraisal
          </Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 bg-surface-subtle border border-border rounded-lg space-y-3">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Add New Valuation Mark
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Valuation Date" required error={errors.date}>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-invalid={Boolean(errors.date)}
              />
            </FormField>
            <FormField label="Appraised Value (USD)" required error={errors.value}>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 520000"
                aria-invalid={Boolean(errors.value)}
              />
            </FormField>
            <FormField label="Method" required error={errors.method}>
              <Select
                value={method}
                onChange={(e) => setMethod(e.target.value as 'manual' | 'model' | 'market')}
              >
                <option value="manual">Third-party Appraisal / Manual</option>
                <option value="model">Automated Valuation Model (AVM)</option>
                <option value="market">Market Comparable</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Notes / Assessor details" error={errors.note}>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Completed by Texas Metro Appraisal Services"
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
              Save Valuation Mark
            </Button>
          </div>
        </form>
      )}

      {sortedRecords.length === 0 ? (
        <p className="text-xs text-text-muted py-3">No appraisal marks recorded yet.</p>
      ) : (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-subtle text-text-muted uppercase font-semibold">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Valuation</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-surface-subtle/50">
                  <td className="py-2.5 px-3 font-medium text-text">{formatDate(rec.date)}</td>
                  <td className="py-2.5 px-3 font-mono text-text font-semibold">
                    {formatCurrency(rec.value)}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge tone={rec.method === 'manual' ? 'neutral' : 'info'}>
                      {rec.method}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-text-muted">{rec.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
