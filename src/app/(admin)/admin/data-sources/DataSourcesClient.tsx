'use client';

import React, { useState, useTransition } from 'react';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { Alert } from '@/components/molecules/Alert';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { ProviderList } from '@/components/organisms/admin/ProviderList';
import { ApiKeyForm } from '@/components/organisms/admin/ApiKeyForm';
import { AuditLogTable } from '@/components/organisms/admin/AuditLogTable';
import type { ProviderConfigView, AuditEntry } from '@/components/organisms/admin/types';
import {
  saveProviderKeyAction,
  removeProviderKeyAction,
  setProviderEnabledAction,
  testProviderConnectionAction,
} from '@/app/actions/providers';
import { useRouter } from 'next/navigation';

export interface DataSourcesClientProps {
  initialProviders: ProviderConfigView[];
  initialAuditLogs: AuditEntry[];
}

export function DataSourcesClient({
  initialProviders,
  initialAuditLogs,
}: DataSourcesClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [activeEditingProvider, setActiveEditingProvider] = useState<ProviderConfigView | null>(
    null
  );
  const [providerToRemoveKey, setProviderToRemoveKey] = useState<string | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  const [notice, setNotice] = useState<{
    type: 'success' | 'danger' | 'info';
    message: string;
  } | null>(null);

  const handleTestConnection = async (provider: string) => {
    setTestingProvider(provider);
    setNotice(null);
    try {
      const res = await testProviderConnectionAction(provider);
      if (res.ok) {
        setNotice({ type: 'success', message: `${provider}: ${res.message}` });
      } else {
        setNotice({ type: 'danger', message: `${provider}: ${res.message}` });
      }
      startTransition(() => {
        router.refresh();
      });
    } catch (err: unknown) {
      setNotice({
        type: 'danger',
        message: err instanceof Error ? err.message : 'Connection test failed',
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleToggleEnabled = async (provider: string, enabled: boolean) => {
    try {
      const res = await setProviderEnabledAction(provider, enabled);
      if (!res.ok) {
        setNotice({ type: 'danger', message: res.message });
      } else {
        setNotice({ type: 'success', message: res.message });
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err: unknown) {
      setNotice({
        type: 'danger',
        message: err instanceof Error ? err.message : 'Failed to update provider status',
      });
    }
  };

  const handleSaveKey = async (key: string): Promise<{ ok: boolean; message: string }> => {
    if (!activeEditingProvider) {
      return { ok: false, message: 'No provider selected.' };
    }
    const res = await saveProviderKeyAction(activeEditingProvider.provider, key);
    if (res.ok) {
      setNotice({ type: 'success', message: res.message });
      setActiveEditingProvider(null);
      startTransition(() => {
        router.refresh();
      });
    }
    return res;
  };

  const handleConfirmRemoveKey = async () => {
    if (!providerToRemoveKey) return;
    try {
      const res = await removeProviderKeyAction(providerToRemoveKey);
      if (res.ok) {
        setNotice({ type: 'success', message: res.message });
        startTransition(() => {
          router.refresh();
        });
      } else {
        setNotice({ type: 'danger', message: res.message });
      }
    } catch (err: unknown) {
      setNotice({
        type: 'danger',
        message: err instanceof Error ? err.message : 'Failed to remove key',
      });
    } finally {
      setProviderToRemoveKey(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-2">
        <Heading level="h2" className="text-2xl font-bold tracking-tight text-text">
          Market Data Sources &amp; Secret Vault
        </Heading>
        <Text variant="body" className="text-text-muted">
          Configure real-time market data APIs and benchmark yield curves. All API keys are encrypted
          using AES-256-GCM authenticated encryption at rest and masked in memory.
        </Text>
      </div>

      {/* Status Notice Banner */}
      {notice && (
        <Alert
          tone={notice.type}
          title={notice.type === 'success' ? 'Success' : notice.type === 'danger' ? 'Error' : 'Notice'}
          onDismiss={() => setNotice(null)}
        >
          {notice.message}
        </Alert>
      )}

      {/* Editing Key Modal / Dialog */}
      {activeEditingProvider && (
        <div
          role="dialog"
          aria-modal="true"
          data-modal-open="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-md p-4 animate-in fade-in duration-150"
        >
          <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <ApiKeyForm
              provider={activeEditingProvider.provider}
              providerName={activeEditingProvider.name}
              onSave={handleSaveKey}
              onCancel={() => setActiveEditingProvider(null)}
            />
          </div>
        </div>
      )}

      {/* Remove Key Confirm Dialog */}
      <ConfirmDialog
        open={!!providerToRemoveKey}
        title="Remove API Key"
        description={`Are you sure you want to delete the encrypted API key for ${providerToRemoveKey}? Data ingestion from this provider will fall back to environment variables or fail if none are defined.`}
        confirmLabel="Remove Key"
        variant="danger"
        onConfirm={handleConfirmRemoveKey}
        onCancel={() => setProviderToRemoveKey(null)}
      />

      {/* Providers Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Heading level="h3" className="text-lg font-semibold text-text">
            Configured Providers
          </Heading>
          <span className="text-xs text-text-muted font-mono">
            {initialProviders.filter((p) => p.isConfigured).length} of {initialProviders.length} active
          </span>
        </div>

        <ProviderList
          providers={initialProviders}
          onEditKey={(prov) => {
            const found = initialProviders.find((p) => p.provider === prov);
            if (found) setActiveEditingProvider(found);
          }}
          onRemoveKey={(prov) => setProviderToRemoveKey(prov)}
          onToggleEnabled={handleToggleEnabled}
          onTestConnection={handleTestConnection}
          testingProvider={testingProvider}
        />
      </section>

      {/* Audit Logs Section */}
      <section className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h3" className="text-lg font-semibold text-text">
              Administrative Audit Log
            </Heading>
            <Text variant="caption" className="text-text-muted">
              Immutable ledger of recent configuration actions, key rotations, and connection tests.
            </Text>
          </div>
          <span className="text-xs font-mono text-text-muted">
            {initialAuditLogs.length} recent events
          </span>
        </div>

        <AuditLogTable entries={initialAuditLogs} />
      </section>
    </div>
  );
}
