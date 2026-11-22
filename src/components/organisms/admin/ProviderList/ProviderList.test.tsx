import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProviderList } from './ProviderList';

describe('ProviderList Organism', () => {
  it('renders list of provider status cards', () => {
    const mockProviders = [
      {
        provider: 'finnhub',
        name: 'Finnhub Stock API',
        kind: 'equity' as const,
        requiresKey: true,
        isConfigured: true,
        keyMasked: '••••a3f9',
        enabled: true,
        priority: 1,
        lastSuccessAt: null,
        lastError: null,
      },
    ];

    render(
      <ProviderList
        providers={mockProviders}
        onEditKey={vi.fn()}
        onRemoveKey={vi.fn()}
        onToggleEnabled={vi.fn()}
        onTestConnection={vi.fn()}
      />
    );

    expect(screen.getByText('Finnhub Stock API')).toBeInTheDocument();
  });
});
