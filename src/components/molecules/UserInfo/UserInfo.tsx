'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/atoms/Avatar';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { LogoutButton } from '@/components/molecules/LogoutButton';
import { cn } from '@/lib/utils/cn';

export interface UserInfoProps {
  name: string;
  email: string;
  avatarSrc?: string;
  logoutAction?: (formData: FormData) => void | Promise<void>;
  showDropdown?: boolean;
  dropdownPosition?: 'top' | 'bottom';
  className?: string;
}

export function UserInfo({
  name,
  email,
  avatarSrc,
  logoutAction,
  showDropdown = true,
  dropdownPosition = 'top',
  className,
}: UserInfoProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDetailsElement>) => {
    if (e.key === 'Escape' && detailsRef.current?.open) {
      e.preventDefault();
      detailsRef.current.open = false;
      detailsRef.current.querySelector('summary')?.focus();
    }
  };

  const closeDropdown = () => {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  const userBlock = (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar name={name} src={avatarSrc} size="sm" />
      <div className="flex flex-col min-w-0 text-left">
        <Text variant="label" className="truncate font-semibold text-text">
          {name}
        </Text>
        <Text variant="caption" tone="muted" className="truncate">
          {email}
        </Text>
      </div>
    </div>
  );

  if (!showDropdown) {
    return <div className={cn('flex items-center gap-3', className)}>{userBlock}</div>;
  }

  return (
    <details
      ref={detailsRef}
      onKeyDown={handleKeyDown}
      className={cn('relative w-full group', className)}
    >
      <summary
        className="flex items-center justify-between gap-2 p-1.5 -m-1.5 rounded-lg cursor-pointer list-none select-none hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring [&::-webkit-details-marker]:hidden"
        aria-label={`User menu for ${name}`}
      >
        <div className="flex-1 min-w-0">{userBlock}</div>
        <Icon
          name="ChevronDown"
          size="sm"
          className="text-text-muted transition-transform group-open:rotate-180 shrink-0"
          aria-hidden="true"
        />
      </summary>

      {/* Dropdown Menu */}
      <div
        role="menu"
        aria-label="User account actions"
        className={cn(
          'absolute w-56 rounded-lg border border-border bg-surface p-1 shadow-md z-50 flex flex-col gap-0.5',
          dropdownPosition === 'top' ? 'bottom-full left-0 mb-2' : 'top-full right-0 mt-2'
        )}
      >
        <div className="px-3 py-2 border-b border-border mb-1">
          <p className="text-xs font-semibold text-text truncate">{name}</p>
          <p className="text-xs text-text-muted truncate">{email}</p>
        </div>

        <Link
          href="/settings"
          onClick={closeDropdown}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-text rounded-md hover:bg-surface-hover hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-focus-ring"
          role="menuitem"
        >
          <Icon name="Settings" size="sm" aria-hidden="true" />
          <span>Settings</span>
        </Link>

        <div className="border-t border-border mt-1 pt-1" role="none">
          <LogoutButton action={logoutAction} variant="ghost" size="sm" />
        </div>
      </div>
    </details>
  );
}
