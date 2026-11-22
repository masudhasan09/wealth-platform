import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProviderStatusCard } from './ProviderStatusCard';

describe('ProviderStatusCard Molecule', () => {
  it('renders provider name, status badge and masked key', () => {
    render(
      <ProviderStatusCard
        provider="finnhub"
        name="Finnhub Stock API"
        kind="equity"
        requiresKey={true}
        isConfigured={true}
        keyMasked="••••a3f9"
        enabled={true}
        priority={1}
      />
    );

    expect(screen.getByText('Finnhub Stock API')).toBeInTheDocument();
    expect(screen.getByText('equity')).toBeInTheDocument();
    expect(screen.getByText('Priority #1')).toBeInTheDocument();
    expect(screen.getByText('••••a3f9')).toBeInTheDocument();
  });

  it('renders public API label when no key is required', () => {
    render(
      <ProviderStatusCard
        provider="coingecko"
        name="CoinGecko Public"
        kind="crypto"
        requiresKey={false}
        isConfigured={true}
        enabled={true}
        priority={1}
      />
    );

    expect(screen.getByText('CoinGecko Public')).toBeInTheDocument();
    expect(screen.getByText('Public API (Free tier)')).toBeInTheDocument();
  });
});

