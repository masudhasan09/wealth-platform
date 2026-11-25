import React from 'react';
import Link from 'next/link';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';

export interface NavItemProps {
  href: string;
  label: string;
  icon: string;
  active?: boolean;
  className?: string;
  onClick?: () => void;
}

export function NavItem({
  href,
  label,
  icon,
  active = false,
  className,
  onClick,
}: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all select-none',
        active
          ? 'bg-primary-muted text-primary font-semibold shadow-2xs'
          : 'font-medium text-text-muted hover:bg-surface-hover hover:text-text',
        className
      )}
    >
      <Icon
        name={icon}
        size="md"
        className={cn('shrink-0', active ? 'text-primary' : 'text-text-muted')}
        aria-hidden="true"
      />
      <span>{label}</span>
    </Link>
  );
}
