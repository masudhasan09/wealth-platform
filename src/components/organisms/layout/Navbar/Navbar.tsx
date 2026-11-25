'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserInfo } from '@/components/molecules/UserInfo';
import { LogoutButton } from '@/components/molecules/LogoutButton';
import { NavItem } from '@/components/molecules/NavItem';
import { ThemeToggle } from '@/components/molecules/ThemeToggle';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { MAIN_NAV_ROUTES } from '@/components/organisms/layout/Sidebar';
import { cn } from '@/lib/utils/cn';

export interface NavbarProps {
  user?: { name: string; email: string };
  logoutAction?: (formData: FormData) => void | Promise<void>;
  currentPath?: string;
  isAdmin?: boolean;
  adminOnly?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function Navbar({
  user = { name: 'Demo User', email: 'demo@wealthtrack.dev' },
  logoutAction,
  currentPath,
  isAdmin,
  adminOnly = false,
  actions,
  className,
}: NavbarProps) {
  const pathname = usePathname();
  const activePath = currentPath || pathname || (adminOnly ? '/admin/data-sources' : '/dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const matchedRoute = adminOnly
    ? { label: 'Data Sources & Keys', icon: 'Shield' }
    : MAIN_NAV_ROUTES.find(
        (r) => activePath === r.href || activePath.startsWith(`${r.href}/`)
      );

  return (
    <>
      <nav
        aria-label="Main App Header"
        className={cn(
          'h-16 border-b border-border bg-surface/90 backdrop-blur-md px-4 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-20',
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
          <Link
            href={adminOnly ? '/admin/data-sources' : '/dashboard'}
            className="flex items-center gap-2"
          >
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
              <Icon name="TrendingUp" size="sm" aria-hidden="true" />
            </div>
            <span className="font-bold text-sm tracking-tight text-text truncate">
              Multi-Asset Portfolio{' '}
              {adminOnly && <span className="text-xs text-warning font-normal ml-1">Admin</span>}
            </span>
          </Link>
        </div>

        {/* Desktop current section indicator */}
        <div className="hidden md:flex items-center gap-2.5 text-sm">
          {matchedRoute && (
            <>
              <Icon name={matchedRoute.icon} size="sm" className="text-primary" aria-hidden="true" />
              <span className="font-semibold text-text">{matchedRoute.label}</span>
            </>
          )}
        </div>

        {/* Right side Actions + Theme Toggle */}
        <div className="flex items-center gap-2.5 ml-auto">
          {actions}
          {!adminOnly && (
            <Link href="/transactions" className="hidden sm:inline-flex">
              <Button variant="secondary" size="sm">
                <Icon name="Plus" size="xs" className="mr-1.5" aria-hidden="true" />
                Record Trade
              </Button>
            </Link>
          )}
          <ThemeToggle variant="compact" />
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
            className="fixed inset-0 bg-overlay transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-surface border-r border-border p-4 shadow-xl justify-between z-10 h-full overflow-hidden">
            <div className="flex flex-col gap-5 flex-1 min-h-0">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                    <Icon name="TrendingUp" size="sm" aria-hidden="true" />
                  </div>
                  <span className="font-bold text-sm tracking-tight text-text">
                    Multi-Asset Portfolio Tracking Platform
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
              <nav aria-label="Mobile Routes" className="flex flex-col gap-1 overflow-y-auto flex-1 pr-1">
                {adminOnly ? (
                  <div className="pt-2">
                    <div className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                      Admin Console
                    </div>
                    <div onClick={() => setMobileMenuOpen(false)}>
                      <NavItem
                        href="/admin/data-sources"
                        label="Data Sources &amp; Keys"
                        icon="Shield"
                        active={activePath.startsWith('/admin')}
                      />
                    </div>
                  </div>
                ) : (
                  <>
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

                    {isAdmin && (
                      <div className="pt-3 mt-2 border-t border-border">
                        <div className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                          Admin Console
                        </div>
                        <div onClick={() => setMobileMenuOpen(false)}>
                          <NavItem
                            href="/admin/data-sources"
                            label="Data Sources"
                            icon="Shield"
                            active={activePath.startsWith('/admin')}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </nav>
            </div>

            {/* Mobile Footer with UserInfo and LogoutButton */}
            <div className="border-t border-border pt-4 space-y-3 shrink-0">
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
