'use client';

import React, { useState } from 'react';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { CurrencyInput } from '@/components/molecules/CurrencyInput';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Alert } from '@/components/molecules/Alert';

export interface PriceFormProps {
  /** Pre-fill the ticker field (e.g. from holdings table row). */
  defaultTicker?: string;
  onSubmit: (ticker: string, price: string) => Promise<{ error?: string } | void> | void;
  onFetchLiveQuote?: (ticker: string) => Promise<{ price?: string; source?: string; error?: string }>;
  isLoading?: boolean;
  serverError?: string | null;
}

/**
 * PriceForm — allows users to set a manual price or fetch live market price for any instrument.
 * Used on the /prices page and as an inline panel in holdings.
 */
export function PriceForm({
  defaultTicker = '',
  onSubmit,
  onFetchLiveQuote,
  isLoading = false,
  serverError,
}: PriceFormProps) {
  const [ticker, setTicker] = useState(defaultTicker.toUpperCase());
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [fetchingLive, setFetchingLive] = useState(false);
  const [liveNotice, setLiveNotice] = useState<{ price: string; source: string } | null>(null);
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

  const handleFetchLive = async () => {
    if (!ticker.trim() || !onFetchLiveQuote) return;
    setFetchingLive(true);
    setLiveNotice(null);
    setErrors((prev) => ({ ...prev, ticker: '', submit: '' }));

    try {
      const res = await onFetchLiveQuote(ticker.trim().toUpperCase());
      if (res.error) {
        setErrors((prev) => ({ ...prev, ticker: res.error || 'Failed to fetch live price' }));
      } else if (res.price) {
        setPrice(res.price);
        setLiveNotice({ price: res.price, source: res.source || 'market API' });
      }
    } catch (err: unknown) {
      setErrors((prev) => ({
        ...prev,
        ticker: err instanceof Error ? err.message : 'Error fetching quote',
      }));
    } finally {
      setFetchingLive(false);
    }
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
        setLiveNotice(null);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = submitting || isLoading || fetchingLive;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {(serverError ?? errors.submit) && (
        <Alert tone="danger">{serverError ?? errors.submit}</Alert>
      )}
      {success && (
        <Alert tone="success">Price saved successfully.</Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <FormField label="Asset Symbol / Ticker" error={errors.ticker} required>
              <Input
                value={ticker}
                onChange={(e) => {
                  setTicker(e.target.value.toUpperCase());
                  setLiveNotice(null);
                }}
                placeholder="e.g. AAPL, BTC, MSFT"
                maxLength={20}
                disabled={!!defaultTicker || isDisabled}
                aria-label="Ticker symbol"
              />
            </FormField>
          </div>
          {onFetchLiveQuote && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleFetchLive}
              disabled={!ticker.trim() || isDisabled}
              loading={fetchingLive}
              className="shrink-0 h-10 mb-0.5"
              aria-label="Fetch live market price"
            >
              <Icon name="TrendingUp" size="sm" />
              <span className="ml-1.5 hidden sm:inline">Fetch Live Price</span>
            </Button>
          )}
        </div>
        {liveNotice && (
          <p className="text-xs text-success font-medium flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-success" />
            Live market price: ${parseFloat(liveNotice.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} via {liveNotice.source.toUpperCase()}
          </p>
        )}
      </div>

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

