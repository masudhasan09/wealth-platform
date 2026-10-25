'use client';

import React, { useState } from 'react';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { CurrencyInput } from '@/components/molecules/CurrencyInput';
import { Button } from '@/components/atoms/Button';
import { Alert } from '@/components/molecules/Alert';
import { bondSchema, type BondInput } from '@/lib/validation/bond';

export interface BondFormProps {
  onSubmit: (values: BondInput) => Promise<{ error?: string } | void> | void;
  isLoading?: boolean;
  serverError?: string | null;
  onCancel?: () => void;
}

export function BondForm({
  onSubmit,
  isLoading = false,
  serverError,
  onCancel,
}: BondFormProps) {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [faceValue, setFaceValue] = useState('1000');
  const [couponRate, setCouponRate] = useState('0.045');
  const [couponFrequency, setCouponFrequency] = useState<BondInput['couponFrequency']>('semi_annual');
  const [dayCount, setDayCount] = useState<BondInput['dayCount']>('actual_actual');
  const [subType, setSubType] = useState<BondInput['subType']>('treasury_note');
  const [maturityDate, setMaturityDate] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      symbol: symbol.toUpperCase().trim(),
      name: name.trim(),
      faceValue,
      couponRate,
      couponFrequency,
      dayCount,
      subType,
      maturityDate,
      issueDate: issueDate || undefined,
    };

    const result = bondSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as string;
        if (path) fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await onSubmit(result.data);
      if (res && res.error) {
        setErrors({ form: res.error });
      }
    } catch {
      setErrors({ form: 'An unexpected error occurred while saving the bond.' });
    } finally {
      setSubmitting(false);
    }
  };

  const busy = isLoading || submitting;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {(serverError || errors.form) && (
        <Alert tone="danger" title="Error saving bond">
          {serverError || errors.form}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Bond Identifier / Symbol"
          htmlFor="bond-symbol"
          hint="e.g. US91282CDJ72 or UST-10Y"
          error={errors.symbol}
          required
        >
          <Input
            id="bond-symbol"
            placeholder="e.g. UST-10Y"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            disabled={busy}
            error={!!errors.symbol}
          />
        </FormField>

        <FormField
          label="Bond Description / Name"
          htmlFor="bond-name"
          error={errors.name}
          required
        >
          <Input
            id="bond-name"
            placeholder="e.g. US Treasury 4.5% 2034"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
            error={!!errors.name}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField
          label="Bond Type"
          htmlFor="bond-subtype"
          error={errors.subType}
          required
        >
          <Select
            id="bond-subtype"
            value={subType}
            onChange={(e) => setSubType(e.target.value as BondInput['subType'])}
            disabled={busy}
          >
            <option value="treasury_bill">US Treasury Bill (T-Bill)</option>
            <option value="treasury_note">US Treasury Note (T-Note)</option>
            <option value="treasury_bond">US Treasury Bond (T-Bond)</option>
            <option value="tips">TIPS (Inflation Protected)</option>
            <option value="corporate">Corporate Bond</option>
            <option value="municipal">Municipal Bond</option>
          </Select>
        </FormField>

        <FormField
          label="Face / Par Value"
          htmlFor="bond-face"
          error={errors.faceValue}
          required
        >
          <CurrencyInput
            id="bond-face"
            value={faceValue}
            onChange={(e) => setFaceValue(e.target.value)}
            disabled={busy}
            error={!!errors.faceValue}
          />
        </FormField>

        <FormField
          label="Annual Coupon Rate"
          htmlFor="bond-coupon-rate"
          hint="e.g. 0.05 for 5%"
          error={errors.couponRate}
          required
        >
          <Input
            id="bond-coupon-rate"
            type="text"
            inputMode="decimal"
            placeholder="0.045"
            value={couponRate}
            onChange={(e) => setCouponRate(e.target.value)}
            disabled={busy}
            error={!!errors.couponRate}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Coupon Payment Frequency"
          htmlFor="bond-freq"
          error={errors.couponFrequency}
          required
        >
          <Select
            id="bond-freq"
            value={couponFrequency}
            onChange={(e) => setCouponFrequency(e.target.value as BondInput['couponFrequency'])}
            disabled={busy}
          >
            <option value="semi_annual">Semi-Annual (Standard US Treasuries)</option>
            <option value="annual">Annual</option>
            <option value="quarterly">Quarterly</option>
            <option value="monthly">Monthly</option>
            <option value="zero_coupon">Zero Coupon (Discount T-Bills)</option>
          </Select>
        </FormField>

        <FormField
          label="Day-Count Convention"
          htmlFor="bond-daycount"
          error={errors.dayCount}
          required
        >
          <Select
            id="bond-daycount"
            value={dayCount}
            onChange={(e) => setDayCount(e.target.value as BondInput['dayCount'])}
            disabled={busy}
          >
            <option value="actual_actual">Actual/Actual (US Treasuries)</option>
            <option value="thirty_360">30/360 (Corporate & Municipal)</option>
            <option value="actual_360">Actual/360 (Money Market / Commercial Paper)</option>
            <option value="actual_365">Actual/365 (Eurobonds / UK Gilts)</option>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Issue Date"
          htmlFor="bond-issue"
          error={errors.issueDate}
        >
          <Input
            id="bond-issue"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            disabled={busy}
          />
        </FormField>

        <FormField
          label="Maturity Date"
          htmlFor="bond-maturity"
          error={errors.maturityDate}
          required
        >
          <Input
            id="bond-maturity"
            type="date"
            value={maturityDate}
            onChange={(e) => setMaturityDate(e.target.value)}
            disabled={busy}
            error={!!errors.maturityDate}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-border">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={busy}
          disabled={busy}
        >
          Save Bond Instrument
        </Button>
      </div>
    </form>
  );
}
