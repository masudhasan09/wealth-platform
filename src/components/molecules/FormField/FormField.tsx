import React from 'react';
import { Label } from '@/components/atoms/Label';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/lib/utils/cn';

export interface FormFieldProps {
  id?: string;
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactElement<{
    id?: string;
    error?: boolean;
    'aria-describedby'?: string;
  }>;
}

export function FormField({
  id,
  label,
  required = false,
  hint,
  error,
  className,
  children,
}: FormFieldProps) {
  const generatedId = React.useId();
  const fieldId = id || children.props.id || generatedId;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;

  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(' ');

  const control = React.cloneElement(children, {
    id: fieldId,
    error: Boolean(error) || children.props.error,
    'aria-describedby': describedBy || undefined,
  });

  return (
    <div className={cn('w-full flex flex-col gap-1', className)}>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}

      {control}

      {error ? (
        <Text id={errorId} variant="caption" tone="danger" role="alert">
          {error}
        </Text>
      ) : hint ? (
        <Text id={hintId} variant="caption" tone="muted">
          {hint}
        </Text>
      ) : null}
    </div>
  );
}
