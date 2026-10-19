import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export interface NavbarProps {
  className?: string;
  actions?: React.ReactNode;
}

export function Navbar({ className, actions }: NavbarProps) {
  return (
    <nav
      className={cn(
        'h-16 border-b border-border bg-surface px-6 flex items-center justify-between',
        className
      )}
    >
      <Link href="/" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center text-base">
          W
        </div>
        <span className="font-bold text-lg tracking-tight text-text">
          WealthTrack
        </span>
      </Link>

      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </nav>
  );
}
