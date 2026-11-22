'use client';

import React from 'react';
import { ProviderStatusCard } from '@/components/molecules/ProviderStatusCard';
import type { ProviderConfigView } from '../types';

export interface ProviderListProps {
  providers: ProviderConfigView[];
  onEditKey: (provider: string) => void;
  onRemoveKey: (provider: string) => void;
  onToggleEnabled: (provider: string, enabled: boolean) => void;
  onTestConnection: (provider: string) => void;
  testingProvider?: string | null;
  className?: string;
}

export function ProviderList({
  providers,
  onEditKey,
  onRemoveKey,
  onToggleEnabled,
  onTestConnection,
  testingProvider,
  className,
}: ProviderListProps) {
  return (
    <div className={className || 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
      {providers.map((p) => (
        <ProviderStatusCard
          key={p.provider}
          provider={p.provider}
          name={p.name}
          kind={p.kind as 'equity' | 'crypto' | 'yield'}
          requiresKey={p.requiresKey}
          isConfigured={p.isConfigured}
          keyMasked={p.keyMasked ?? undefined}
          enabled={p.enabled}
          priority={p.priority}
          lastSuccessAt={p.lastSuccessAt}
          lastError={p.lastError}
          onEditKey={() => onEditKey(p.provider)}
          onRemoveKey={() => onRemoveKey(p.provider)}
          onToggleEnabled={(enabled) => onToggleEnabled(p.provider, enabled)}
          onTestConnection={() => onTestConnection(p.provider)}
          isTesting={testingProvider === p.provider}
        />
      ))}
    </div>
  );
}
