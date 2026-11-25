'use client';

import React, { useState } from 'react';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Textarea } from '@/components/atoms/Textarea';
import { Button } from '@/components/atoms/Button';
import { Alert } from '@/components/molecules/Alert';
import { accountSchema, type AccountInput } from '@/lib/validation';

export interface AccountFormProps {
  onSubmit: (values: AccountInput) => Promise<{ error?: string } | void> | void;
  initialData?: Partial<AccountInput>;
  isLoading?: boolean;
  serverError?: string | null;
  onCancel?: () => void;
}

export function AccountForm({
  onSubmit,
  initialData,
  isLoading = false,
  serverError,
  onCancel,
}: AccountFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<AccountInput['type']>(
    initialData?.type || 'brokerage'
  );
  const [currency] = useState(initialData?.currency || 'USD');
  const [description, setDescription] = useState(initialData?.description || '');
  const [errors, setErrors] = useState<{
    name?: string;
    type?: string;
    currency?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = accountSchema.safeParse({
      name,
      type,
      currency,
      description: description || undefined,
    });

    if (!result.success) {
      const fieldErrors: { name?: string; type?: string; currency?: string } = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as 'name' | 'type' | 'currency';
        if (path) fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(result.data);
    } finally {
      setSubmitting(false);
    }
  };

  const busy = isLoading || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {serverError && (
        <Alert tone="danger" title="Error saving account">
          {serverError}
        </Alert>
      )}

      <FormField
        label="Account Name"
        htmlFor="acct-name"
        hint="e.g. Fidelity Brokerage, Vanguard 401(k), Chase Checking"
        error={errors.name}
        required
      >
        <Input
          id="acct-name"
          placeholder="e.g. Taxable Brokerage"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!errors.name}
          disabled={busy}
        />
      </FormField>

      <FormField
        label="Account Type"
        htmlFor="acct-type"
        error={errors.type}
        required
      >
        <Select
          id="acct-type"
          value={type}
          onChange={(e) => setType(e.target.value as AccountInput['type'])}
          disabled={busy}
        >
          <option value="brokerage">Brokerage (Taxable)</option>
          <option value="retirement_401k">401(k) / Employer Plan</option>
          <option value="ira">Traditional IRA</option>
          <option value="roth_ira">Roth IRA</option>
          <option value="hsa">Health Savings Account (HSA)</option>
          <option value="bank">Bank Checking / Savings</option>
          <option value="crypto_wallet">Crypto Wallet / Custody</option>
          <option value="property">Real Estate Asset Account</option>
        </Select>
      </FormField>

      <FormField
        label="Base Currency"
        htmlFor="acct-currency"
        error={errors.currency}
      >
        <Input
          id="acct-currency"
          value={currency}
          disabled
          aria-readonly
        />
      </FormField>

      <FormField
        label="Notes & Description (Optional)"
        htmlFor="acct-desc"
      >
        <Textarea
          id="acct-desc"
          placeholder="Optional notes regarding institution, purpose or tax status..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={busy}
        />
      </FormField>

      <div className="flex items-center justify-end gap-3 pt-2">
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
          {initialData?.name ? 'Update Account' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
}
