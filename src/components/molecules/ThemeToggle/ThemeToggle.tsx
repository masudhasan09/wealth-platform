'use client';

import React, { useSyncExternalStore } from 'react';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';

type StoredScheme = 'light' | 'dark' | null;
type ResolvedScheme = 'light' | 'dark';

const STORAGE_KEY = 'color-scheme';
const SYNC_EVENT = 'platform-color-scheme-change';

function readStoredScheme(): StoredScheme {
  if (typeof window === 'undefined') return null;
  try {
    const val = window.localStorage.getItem(STORAGE_KEY);
    return val === 'light' || val === 'dark' ? val : null;
  } catch {
    return null;
  }
}

function readSystemScheme(): ResolvedScheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applySchemeMeta(scheme: StoredScheme): void {
  if (typeof document === 'undefined') return;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (meta) {
    meta.content = scheme ?? 'light dark';
  }
}

function subscribeScheme(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mq =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      applySchemeMeta(readStoredScheme());
      onStoreChange();
    }
  };

  mq?.addEventListener('change', onStoreChange);
  window.addEventListener('storage', handleStorage);
  window.addEventListener(SYNC_EVENT, onStoreChange);

  return () => {
    mq?.removeEventListener('change', onStoreChange);
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(SYNC_EVENT, onStoreChange);
  };
}

function getSchemeSnapshot(): string {
  const stored = readStoredScheme() ?? 'system';
  const system = readSystemScheme();
  return `${stored}:${system}`;
}

function getServerSchemeSnapshot(): string {
  return 'system:light';
}

const subscribeNoop = () => () => {};
const getClientTrue = () => true;
const getServerFalse = () => false;

export interface ThemeToggleProps {
  variant?: 'compact' | 'settings';
  className?: string;
}

export function ThemeToggle({ variant = 'compact', className }: ThemeToggleProps) {
  const mounted = useSyncExternalStore(subscribeNoop, getClientTrue, getServerFalse);
  const snapshot = useSyncExternalStore(
    subscribeScheme,
    getSchemeSnapshot,
    getServerSchemeSnapshot
  );

  const [storedPart, systemPart] = snapshot.split(':');
  const stored: StoredScheme =
    storedPart === 'light' || storedPart === 'dark' ? storedPart : null;
  const system: ResolvedScheme = systemPart === 'dark' ? 'dark' : 'light';
  const rendered: ResolvedScheme = stored ?? system;

  const setExplicitChoice = (choice: StoredScheme) => {
    applySchemeMeta(choice);
    try {
      if (choice === null) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, choice);
      }
    } catch {
      // Non-fatal if storage is blocked
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(SYNC_EVENT));
    }
  };

  const handleCompactToggle = () => {
    const target: ResolvedScheme = rendered === 'dark' ? 'light' : 'dark';
    if (target === system) {
      setExplicitChoice(null);
    } else {
      setExplicitChoice(target);
    }
  };

  if (variant === 'settings') {
    const options: Array<{ id: StoredScheme; label: string; icon: string }> = [
      {
        id: null,
        label: mounted ? `System (${system === 'dark' ? 'Dark' : 'Light'})` : 'System',
        icon: 'Monitor',
      },
      { id: 'light', label: 'Light', icon: 'Sun' },
      { id: 'dark', label: 'Dark', icon: 'Moon' },
    ];

    return (
      <div
        role="group"
        aria-label="Color theme preference"
        className={cn(
          'inline-flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface-muted border border-border',
          className
        )}
      >
        {options.map((opt) => {
          const isActive = stored === opt.id;
          return (
            <button
              key={opt.id ?? 'system'}
              type="button"
              onClick={() => setExplicitChoice(opt.id)}
              aria-pressed={isActive}
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer select-none',
                isActive
                  ? 'bg-surface text-text shadow-xs border border-border'
                  : 'text-text-muted hover:text-text hover:bg-surface-hover'
              )}
            >
              <Icon
                name={opt.icon}
                size="sm"
                className={isActive ? 'text-primary' : 'text-text-muted'}
                aria-hidden="true"
              />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const nextLabel = rendered === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      onClick={handleCompactToggle}
      aria-label={mounted ? nextLabel : 'Toggle color theme'}
      title={mounted ? nextLabel : 'Toggle color theme'}
      className={cn(
        'inline-flex items-center justify-center h-control-sm w-control-sm rounded-lg border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer select-none',
        className
      )}
    >
      <Icon
        name={mounted && rendered === 'dark' ? 'Sun' : 'Moon'}
        size="sm"
        aria-hidden="true"
      />
    </button>
  );
}
