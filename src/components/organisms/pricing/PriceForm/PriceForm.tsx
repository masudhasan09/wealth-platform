'use client';

import React, { useState } from 'react';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { CurrencyInput } from '@/components/molecules/CurrencyInput';
import { Button } from '@/components/atoms/Button';
import { Alert } from '@/components/molecules/Alert';

export interface PriceFormProps {
  /** Pre-fill the ticker field (e.g. from holdings table row). */
  defaultTicker?: string;
  onSubmit: (ticker: string, price: string) => Promise<{ error?: string } | void> | void;
  isLoading?: boolean;
  serverError?: string | null;
}

/**
 * PriceForm — allows users to set a manual price for any instrument.
 * Used on the /prices page and as an inline panel in holdings.
 */
export function PriceForm({
  defaultTicker = '',
  onSubmit,
  isLoading = false,
  serverError,
}: PriceFormProps) {
  const [ticker, setTicker] = useState(defaultTicker.toUpperCase());
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!ticker.trim()) newErrors.ticker = 'Ticker symbol is required.';
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      newErrors.price = 'Enter a valid positive price.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await onSubmit(ticker.trim().toUpperCase(), price);
      if (res && 'error' in res && res.error) {
        setErrors({ submit: res.error });
      } else {
        setSuccess(true);
        setPrice('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = submitting || isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {(serverError ?? errors.submit) && (
        <Alert tone="danger">{serverError ?? errors.submit}</Alert>
      )}
      {success && (
        <Alert tone="success">Price saved successfully.</Alert>
      )}

      <FormField label="Asset Symbol / Ticker" error={errors.ticker} required>
        <Input
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="e.g. AAPL, BTC, MSFT"
          maxLength={20}
          disabled={!!defaultTicker || isDisabled}
          aria-label="Ticker symbol"
        />
      </FormField>

      <FormField label="Price (USD)" error={errors.price} required>
        <CurrencyInput
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          currencyCode="USD"
          disabled={isDisabled}
          aria-label="Manual price"
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={isDisabled} loading={submitting}>
          Save Price
        </Button>
      </div>
    </form>
  );
}

