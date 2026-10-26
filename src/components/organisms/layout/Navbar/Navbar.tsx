'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserInfo } from '@/components/molecules/UserInfo';
import { LogoutButton } from '@/components/molecules/LogoutButton';
import { FreshnessBadge } from '@/components/molecules/FreshnessBadge';
import { NavItem } from '@/components/molecules/NavItem';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { MAIN_NAV_ROUTES } from '@/components/organisms/layout/Sidebar';
import { cn } from '@/lib/utils/cn';

export interface NavbarProps {
  user?: { name: string; email: string };
  logoutAction?: (formData: FormData) => void | Promise<void>;
  currentPath?: string;
  lastUpdated?: Date | string;
  actions?: React.ReactNode;
  className?: string;
}

export function Navbar({
  user = { name: 'Demo User', email: 'demo@wealthtrack.dev' },
  logoutAction,
  currentPath,
  lastUpdated = '2024-01-01T00:00:00.000Z',
  actions,
  className,
}: NavbarProps) {
  const pathname = usePathname();
  const activePath = currentPath || pathname || '/dashboard';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Main App Header"
        className={cn(
          'h-16 border-b border-border bg-surface px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-20',
          className
        )}
      >
        {/* Mobile branding + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile navigation menu"
            className="p-1.5"
          >
            <Icon name="Menu" size="md" />
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm">
              W
            </div>
            <span className="font-bold text-base tracking-tight text-text">
              WealthTrack
            </span>
          </Link>
        </div>

        {/* Right side: FreshnessBadge and Actions */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden sm:flex items-center">
            <FreshnessBadge
              source="market cache"
              asOf={lastUpdated}
              method="market"
              freshness="delayed"
            />
          </div>

          {actions}
        </div>
      </nav>

      {/* Mobile Drawer / Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-50 md:hidden flex"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-surface border-r border-border p-4 shadow-xl justify-between z-10">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center text-base">
                    W
                  </div>
                  <span className="font-bold text-lg tracking-tight text-text">
                    WealthTrack
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5"
                >
                  <Icon name="X" size="sm" />
                </Button>
              </div>

              {/* Navigation links */}
              <nav aria-label="Mobile Routes" className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-260px)]">
                {MAIN_NAV_ROUTES.map((route) => (
                  <div key={route.href} onClick={() => setMobileMenuOpen(false)}>
                    <NavItem
                      href={route.href}
                      label={route.label}
                      icon={route.icon}
                      active={activePath === route.href || activePath.startsWith(`${route.href}/`)}
                    />
                  </div>
                ))}
              </nav>
            </div>

            {/* Mobile Footer with UserInfo and LogoutButton */}
            <div className="border-t border-border pt-4 space-y-3">
              <UserInfo
                name={user.name}
                email={user.email}
                logoutAction={logoutAction}
                dropdownPosition="top"
              />

              <div className="pt-2 border-t border-border">
                <LogoutButton action={logoutAction} variant="secondary" size="md" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
