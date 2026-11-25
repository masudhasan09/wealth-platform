'use client';

import React, { useState } from 'react';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Alert } from '@/components/molecules/Alert';

export interface ApiKeyFormProps {
  provider: string;
  providerName: string;
  onSave: (key: string) => Promise<{ ok: boolean; message: string }>;
  onCancel: () => void;
  className?: string;
}

export function ApiKeyForm({
  provider,
  providerName,
  onSave,
  onCancel,
  className,
}: ApiKeyFormProps) {
  const [key, setKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError('API key cannot be empty.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await onSave(key.trim());
      if (!res.ok) {
        setError(res.message);
      } else {
        setKey('');
        onCancel();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save API key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form data-provider={provider} onSubmit={handleSubmit} className={className}>
      <div className="p-5 rounded-xl border border-border bg-surface-muted/50 space-y-4">
        <div>
          <h4 className="font-semibold text-text text-sm">
            Configure API Key for {providerName}
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            Key is encrypted via AES-256-GCM before storage. It is never logged or returned to the browser.
          </p>
        </div>

        {error && (
          <Alert tone="danger" title="Save Error" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        <FormField
          label="API Secret Key"
          hint="Input will remain masked for security"
        >
          <Input
            type="password"
            placeholder="Enter API key or secret token..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            disabled={isLoading}
            autoComplete="new-password"
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isLoading || !key.trim()}
          >
            {isLoading ? (
              'Encrypting & Saving...'
            ) : (
              <>
                <Icon name="Lock" size="sm" className="mr-1.5" />
                Encrypt &amp; Save Key
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
