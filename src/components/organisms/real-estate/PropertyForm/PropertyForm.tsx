'use client';

import React, { useState } from 'react';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Button } from '@/components/atoms/Button';
import { Alert } from '@/components/molecules/Alert';
import { propertySchema, type PropertyInput } from '@/lib/validation';

export interface PropertyFormProps {
  accounts: { id: string; name: string }[];
  onSubmit: (accountId: string, values: PropertyInput) => Promise<{ error?: string } | void> | void;
  isLoading?: boolean;
  serverError?: string | null;
  onCancel?: () => void;
}

export function PropertyForm({
  accounts,
  onSubmit,
  isLoading = false,
  serverError,
  onCancel,
}: PropertyFormProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [ownershipPct, setOwnershipPct] = useState('1.0');
  const [propertyType, setPropertyType] = useState<PropertyInput['propertyType']>('residential');
  const [currentValue, setCurrentValue] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const values: PropertyInput = {
      name,
      address,
      purchasePrice,
      purchaseDate,
      ownershipPct,
      propertyType,
      currentValue: currentValue || undefined,
    };

    const res = propertySchema.safeParse(values);
    if (!res.success) {
      const errMap: Record<string, string> = {};
      res.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        errMap[field] = issue.message;
      });
      setErrors(errMap);
      return false;
    }

    if (!accountId) {
      setErrors({ accountId: 'Please select an account for this property.' });
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit(accountId, {
      name,
      address,
      purchasePrice,
      purchaseDate,
      ownershipPct,
      propertyType,
      currentValue: currentValue || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {serverError && <Alert tone="danger">{serverError}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Property Name" required error={errors.name}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Austin Rental Duplex"
            aria-invalid={Boolean(errors.name)}
          />
        </FormField>

        <FormField label="Assign to Account" required error={errors.accountId}>
          <Select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            aria-invalid={Boolean(errors.accountId)}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Property Address" required error={errors.address}>
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. 123 Congress Ave, Austin, TX 78701"
          aria-invalid={Boolean(errors.address)}
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label="Property Type" required>
          <Select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value as PropertyInput['propertyType'])}
          >
            <option value="residential">Residential (Single Family)</option>
            <option value="multi_family">Multi-Family</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="land">Land</option>
          </Select>
        </FormField>

        <FormField label="Purchase Price (USD)" required error={errors.purchasePrice}>
          <Input
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="e.g. 450000.00"
            aria-invalid={Boolean(errors.purchasePrice)}
          />
        </FormField>

        <FormField label="Purchase Date" required error={errors.purchaseDate}>
          <Input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            aria-invalid={Boolean(errors.purchaseDate)}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Ownership Share (0.0 to 1.0)"
          required
          hint="e.g. 1.0 for 100% full ownership, 0.5 for 50% co-ownership"
          error={errors.ownershipPct}
        >
          <Input
            value={ownershipPct}
            onChange={(e) => setOwnershipPct(e.target.value)}
            placeholder="1.0"
            aria-invalid={Boolean(errors.ownershipPct)}
          />
        </FormField>

        <FormField
          label="Current Appraised Value (USD)"
          hint="Optional initial appraisal. Defaults to purchase price."
          error={errors.currentValue}
        >
          <Input
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder="e.g. 485000.00"
            aria-invalid={Boolean(errors.currentValue)}
          />
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={isLoading}>
          Save Property
        </Button>
      </div>
    </form>
  );
}
