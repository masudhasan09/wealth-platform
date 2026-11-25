'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/atoms/Icon';
import { NavItem } from '@/components/molecules/NavItem';
import { UserInfo } from '@/components/molecules/UserInfo';
import { cn } from '@/lib/utils/cn';

export interface NavRoute {
  label: string;
  href: string;
  icon: string;
  group?: 'Overview' | 'Ledger & Assets' | 'Analytics & Tax' | 'System';
}

export const MAIN_NAV_ROUTES: NavRoute[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', group: 'Overview' },
  { label: 'Net Worth', href: '/net-worth', icon: 'TrendingUp', group: 'Overview' },
  { label: 'Holdings', href: '/holdings', icon: 'PieChart', group: 'Overview' },
  { label: 'Accounts', href: '/accounts', icon: 'Wallet', group: 'Ledger & Assets' },
  { label: 'Transactions', href: '/transactions', icon: 'ArrowLeftRight', group: 'Ledger & Assets' },
  { label: 'Market Prices', href: '/prices', icon: 'LineChart', group: 'Ledger & Assets' },
  { label: 'Fixed Income', href: '/fixed-income', icon: 'Landmark', group: 'Ledger & Assets' },
  { label: 'Real Estate', href: '/real-estate', icon: 'Building2', group: 'Ledger & Assets' },
  { label: 'Tax & Gains', href: '/gains', icon: 'Receipt', group: 'Analytics & Tax' },
  { label: 'Risk & Allocation', href: '/risk', icon: 'ShieldCheck', group: 'Analytics & Tax' },
  { label: 'Reports', href: '/reports', icon: 'FileText', group: 'Analytics & Tax' },
  { label: 'Settings', href: '/settings', icon: 'Settings', group: 'System' },
];

const NAV_GROUPS: Array<'Overview' | 'Ledger & Assets' | 'Analytics & Tax' | 'System'> = [
  'Overview',
  'Ledger & Assets',
  'Analytics & Tax',
  'System',
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
      <div className="flex flex-col gap-5 overflow-y-auto pr-1">
        <Link
          href={adminOnly ? '/admin/data-sources' : '/dashboard'}
          className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-surface-hover transition-colors"
        >
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs shrink-0">
            <Icon name="TrendingUp" size="sm" aria-hidden="true" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm tracking-tight text-text leading-tight truncate">
              Multi-Asset Portfolio
            </span>
            <span className={cn(
              'text-xs font-medium tracking-wide truncate',
              adminOnly ? 'text-warning font-semibold uppercase' : 'text-text-muted'
            )}>
              {adminOnly ? 'Admin Console' : 'Tracking Platform'}
            </span>
          </div>
        </Link>

        {adminOnly ? (
          <nav aria-label="Admin Navigation" className="flex flex-col gap-1">
            <div className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
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
          <nav aria-label="Main Navigation" className="flex flex-col gap-4">
            {NAV_GROUPS.map((group) => {
              const routes = MAIN_NAV_ROUTES.filter((r) => r.group === group);
              return (
                <div key={group} className="flex flex-col gap-0.5">
                  <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    {group}
                  </div>
                  {routes.map((route) => (
                    <NavItem
                      key={route.href}
                      href={route.href}
                      label={route.label}
                      icon={route.icon}
                      active={activePath === route.href || activePath.startsWith(`${route.href}/`)}
                    />
                  ))}
                </div>
              );
            })}

            {isAdmin && (
              <div className="pt-3 border-t border-border flex flex-col gap-0.5">
                <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
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

      <div className="border-t border-border pt-3.5 mt-2">
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
