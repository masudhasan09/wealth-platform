'use client';

import React from 'react';
import { Button } from '@/components/atoms/Button';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/lib/utils/cn';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
  className,
}: ConfirmDialogProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && typeof dialog.showModal === 'function' && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        // Fallback for jsdom
      }
    } else if (!open && typeof dialog.close === 'function' && dialog.open) {
      try {
        dialog.close();
      } catch {
        // Fallback for jsdom
      }
    }
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      open={open}
      onClose={onCancel}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
      className={cn(
        'm-auto p-6 rounded-lg bg-surface text-text border border-border shadow-xl backdrop:bg-overlay max-w-md w-full',
        className
      )}
    >
      <Heading id="dialog-title" level="h3" size="h4" className="mb-2">
        {title}
      </Heading>

      <Text id="dialog-desc" variant="body" tone="muted" className="mb-6">
        {description}
      </Text>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
