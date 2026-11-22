'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';
import { Button, type ButtonVariant, type ButtonSize } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';

export interface LogoutButtonProps {
  action?: (formData: FormData) => void | Promise<void>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
  label?: string;
}

interface SubmitButtonProps {
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  label?: string;
  className?: string;
}

export function SubmitButton({
  disabled = false,
  variant = 'ghost',
  size = 'sm',
  label = 'Log out',
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      loading={pending}
      disabled={pending || disabled}
      aria-disabled={pending || disabled}
      className={cn('w-full justify-start gap-2', className)}
    >
      <Icon name="LogOut" size="sm" aria-hidden="true" />
      <span>{pending ? 'Logging out...' : label}</span>
    </Button>
  );
}

export function LogoutButton({
  action,
  variant = 'ghost',
  size = 'sm',
  disabled = false,
  className,
  label = 'Log out',
}: LogoutButtonProps) {
  return (
    <form action={action} className="w-full">
      <SubmitButton
        disabled={disabled}
        variant={variant}
        size={size}
        label={label}
        className={className}
      />
    </form>
  );
}

