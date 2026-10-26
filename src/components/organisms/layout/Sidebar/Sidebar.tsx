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
  className?: string;
}

export function Sidebar({
  currentPath,
  user = { name: 'Demo User', email: 'demo@wealthtrack.dev' },
  logoutAction,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const activePath = currentPath || pathname || '/dashboard';

  return (
    <aside
      className={cn(
        'w-64 border-r border-border bg-surface flex flex-col justify-between h-screen sticky top-0 p-4',
        className
      )}
    >
      <div className="flex flex-col gap-6">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center text-base">
            W
          </div>
          <span className="font-bold text-lg tracking-tight text-text">
            WealthTrack
          </span>
        </Link>

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
        </nav>
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
