'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem } from '@/components/molecules/NavItem';
import { UserInfo } from '@/components/molecules/UserInfo';
import { cn } from '@/lib/utils/cn';

export interface NavRoute {
  label: string;
  href: string;
  icon: string;
}

export const MAIN_NAV_ROUTES: NavRoute[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Accounts', href: '/accounts', icon: 'Wallet' },
  { label: 'Transactions', href: '/transactions', icon: 'ArrowLeftRight' },
  { label: 'Holdings', href: '/holdings', icon: 'PieChart' },
  { label: 'Net Worth', href: '/net-worth', icon: 'TrendingUp' },
  { label: 'Market Prices', href: '/prices', icon: 'LineChart' },
  { label: 'Fixed Income', href: '/fixed-income', icon: 'Landmark' },
  { label: 'Real Estate', href: '/real-estate', icon: 'Building2' },
  { label: 'Tax & Gains', href: '/gains', icon: 'Receipt' },
  { label: 'Risk & Allocation', href: '/risk', icon: 'ShieldCheck' },
  { label: 'Reports', href: '/reports', icon: 'FileText' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
];

export interface SidebarProps {
  currentPath?: string;
  user?: { name: string; email: string };
  logoutAction?: (formData: FormData) => void | Promise<void>;
  isAdmin?: boolean;
  adminOnly?: boolean;
  className?: string;
}

export function Sidebar({
  currentPath,
  user = { name: 'Demo User', email: 'demo@wealthtrack.dev' },
  logoutAction,
  isAdmin,
  adminOnly = false,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const activePath = currentPath || pathname || (adminOnly ? '/admin/data-sources' : '/dashboard');

  return (
    <aside
      className={cn(
        'w-64 border-r border-border bg-surface flex flex-col justify-between h-screen sticky top-0 p-4',
        className
      )}
    >
      <div className="flex flex-col gap-6 overflow-y-auto">
        <Link href={adminOnly ? '/admin/data-sources' : '/dashboard'} className="flex items-center gap-2 px-2 py-1">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center text-base">
            W
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-text leading-tight">
              WealthTrack
            </span>
            {adminOnly && (
              <span className="text-xs font-semibold text-warning uppercase tracking-wider">
                Admin Console
              </span>
            )}
          </div>
        </Link>

        {adminOnly ? (
          <nav aria-label="Admin Navigation" className="flex flex-col gap-1">
            <div className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              Security &amp; Data
            </div>
            <NavItem
              href="/admin/data-sources"
              label="Data Sources &amp; Keys"
              icon="Shield"
              active={activePath.startsWith('/admin')}
            />
          </nav>
        ) : (
          <nav aria-label="Main Navigation" className="flex flex-col gap-1">
            {MAIN_NAV_ROUTES.map((route) => (
              <NavItem
                key={route.href}
                href={route.href}
                label={route.label}
                icon={route.icon}
                active={activePath === route.href || activePath.startsWith(`${route.href}/`)}
              />
            ))}

            {isAdmin && (
              <div className="pt-4 mt-2 border-t border-border">
                <div className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                  Admin Console
                </div>
                <NavItem
                  href="/admin/data-sources"
                  label="Data Sources"
                  icon="Shield"
                  active={activePath.startsWith('/admin')}
                />
              </div>
            )}
          </nav>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <UserInfo
          name={user.name}
          email={user.email}
          logoutAction={logoutAction}
          dropdownPosition="top"
        />
      </div>
    </aside>
  );
}
