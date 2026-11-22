'use client';

import React from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';

export interface ProviderStatusCardProps {
  provider: string;
  name: string;
  kind: 'equity' | 'crypto' | 'yield';
  requiresKey: boolean;
  isConfigured: boolean;
  keyMasked?: string;
  enabled: boolean;
  priority: number;
  lastSuccessAt?: Date | string | null;
  lastError?: string | null;
  onEditKey?: () => void;
  onRemoveKey?: () => void;
  onToggleEnabled?: (enabled: boolean) => void;
  onTestConnection?: () => void;
  isTesting?: boolean;
  className?: string;
}

export function ProviderStatusCard({
  name,
  kind,
  requiresKey,
  isConfigured,
  keyMasked,
  enabled,
  priority,
  lastSuccessAt,
  lastError,
  onEditKey,
  onRemoveKey,
  onToggleEnabled,
  onTestConnection,
  isTesting = false,
  className,
}: ProviderStatusCardProps) {
  // Determine status tone and label
  let statusTone: 'success' | 'warning' | 'danger' | 'neutral' = 'neutral';
  let statusLabel = 'Not configured';

  if (!enabled) {
    statusTone = 'neutral';
    statusLabel = 'Disabled';
  } else if (lastError) {
    statusTone = 'danger';
    statusLabel = 'Error';
  } else if (isConfigured) {
    statusTone = 'success';
    statusLabel = lastSuccessAt ? 'Working' : 'Configured';
  } else if (!requiresKey) {
    statusTone = 'neutral';
    statusLabel = 'No key required';
  } else {
    statusTone = 'warning';
    statusLabel = 'Not configured';
  }

  return (
    <div
      className={cn(
        'p-5 rounded-xl border border-border bg-surface shadow-xs flex flex-col justify-between gap-4',
        !enabled && 'opacity-75 bg-surface-muted/50',
        className
      )}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text text-base">{name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted text-text-muted capitalize border border-border">
                {kind}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5 font-mono">
              Priority #{priority}
            </p>
          </div>

          <Badge tone={statusTone} dot>
            {statusLabel}
          </Badge>
        </div>

        {/* Credentials & Details */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between py-1 border-t border-border/50">
            <span className="text-text-muted">API Secret:</span>
            {keyMasked ? (
              <span className="font-mono font-medium text-text">
                {keyMasked}
              </span>
            ) : requiresKey ? (
              <span className="font-mono font-medium text-text">
                Not set
              </span>
            ) : (
              <span className="text-text-muted italic">Public API (Free tier)</span>
            )}
          </div>

          {lastSuccessAt && (
            <div className="flex items-center justify-between py-1 border-t border-border/50">
              <span className="text-text-muted">Last Verified:</span>
              <span className="font-mono text-text">
                {new Date(lastSuccessAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          {lastError && (
            <div className="p-2 rounded bg-danger-muted border border-danger/30 text-danger text-xs mt-2">
              <p className="font-semibold">Provider Error:</p>
              <p className="truncate font-mono mt-0.5">{lastError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          {onEditKey && (
            <Button variant="secondary" size="sm" onClick={onEditKey}>
              {isConfigured ? 'Replace Key' : requiresKey ? 'Add Key' : 'Add Key (Optional)'}
            </Button>
          )}

          {isConfigured && onRemoveKey && (
            <Button variant="ghost" size="sm" onClick={onRemoveKey} className="text-danger hover:text-danger">
              Remove
            </Button>
          )}

          {onToggleEnabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleEnabled(!enabled)}
            >
              {enabled ? 'Disable' : 'Enable'}
            </Button>
          )}
        </div>

        {onTestConnection && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onTestConnection}
            disabled={isTesting || (!isConfigured && requiresKey)}
          >
            {isTesting ? (
              'Testing...'
            ) : (
              <>
                <Icon name="Activity" size="sm" className="mr-1.5" />
                Test Connection
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
