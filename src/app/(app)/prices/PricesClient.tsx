'use client';

import React, { useState, useTransition } from 'react';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { Badge } from '@/components/atoms/Badge';
import { FreshnessBadge } from '@/components/atoms/FreshnessBadge';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Alert } from '@/components/molecules/Alert';
import { PriceForm } from '@/components/organisms/pricing/PriceForm';
import { setPriceAction } from '@/app/actions/prices';
import { getFreshnessVariant } from '@/lib/utils/freshness';
import type { FreshnessVariant } from '@/lib/utils/freshness';

interface InstrumentPrice {
  instrumentId: string;
  ticker: string;
  name: string;
  assetClass: string;
  currentPrice: string | null;
  priceSource: string | null;
  priceAsOf: string | null;
}

interface PricesClientProps {
  instruments: InstrumentPrice[];
}

export function PricesClient({ instruments }: PricesClientProps) {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successTicker, setSuccessTicker] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSetPrice = async (ticker: string, price: string) => {
    setError(null);
    setSuccessTicker(null);
    const res = await setPriceAction({ ticker, price });
    if (res.error) {
      setError(res.error);
      return { error: res.error };
    }
    setSuccessTicker(ticker);
    setSelectedTicker(null);
    startTransition(() => {
      window.location.reload();
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Heading level="h1">Market Prices</Heading>
        <Text tone="muted" variant="caption" className="mt-1">
          Prices are fetched automatically from Finnhub. Set a manual price for any instrument below.
        </Text>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}
      {successTicker && <Alert tone="success">Price updated for {successTicker}.</Alert>}

      {/* Add price for any ticker */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <Heading level="h3" className="mb-4">Add / Update Price</Heading>
        <PriceForm
          onSubmit={handleSetPrice}
          isLoading={isPending}
        />
      </div>

      {/* Instrument price table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <Heading level="h3">Portfolio Instruments</Heading>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted">
                <th className="text-left px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Symbol</th>
                <th className="text-left px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Name</th>
                <th className="text-left px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Asset Class</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Price (USD)</th>
                <th className="text-left px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Source</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {instruments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                    No instruments found. Add transactions to see prices here.
                  </td>
                </tr>
              )}
              {instruments.map((inst) => {
                const variant: FreshnessVariant = inst.priceSource && inst.priceAsOf
                  ? getFreshnessVariant(new Date(inst.priceAsOf), inst.priceSource)
                  : 'stale';
                const isSelected = selectedTicker === inst.ticker;

                return (
                  <React.Fragment key={inst.instrumentId}>
                    <tr className="border-b border-border hover:bg-surface-muted transition-colors">
                      <td className="px-4 py-3 font-mono font-medium">{inst.ticker}</td>
                      <td className="px-4 py-3 text-text-muted">{inst.name}</td>
                      <td className="px-4 py-3">
                        <Badge tone="info">{inst.assetClass}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {inst.currentPrice
                          ? `$${parseFloat(inst.currentPrice).toFixed(2)}`
                          : <span className="text-text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {inst.priceSource && inst.priceAsOf
                          ? <FreshnessBadge variant={variant} />
                          : <Badge tone="neutral">None</Badge>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTicker(isSelected ? null : inst.ticker)}
                          aria-label={`Set manual price for ${inst.ticker}`}
                        >
                          <Icon name="pencil" size="sm" />
                          <span className="ml-1">Set Price</span>
                        </Button>
                      </td>
                    </tr>
                    {isSelected && (
                      <tr className="border-b border-border bg-surface-muted">
                        <td colSpan={6} className="px-6 py-4">
                          <PriceForm
                            defaultTicker={inst.ticker}
                            onSubmit={handleSetPrice}
                            isLoading={isPending}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

