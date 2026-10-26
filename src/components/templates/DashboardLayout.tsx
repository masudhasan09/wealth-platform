import React from 'react';
import { Sidebar } from '@/components/organisms/layout/Sidebar';
import { Navbar } from '@/components/organisms/layout/Navbar';
import { Footer } from '@/components/organisms/layout/Footer';
import { cn } from '@/lib/utils/cn';

export interface DashboardLayoutProps {
  currentPath?: string;
  user?: { name: string; email: string };
  logoutAction?: (formData: FormData) => void | Promise<void>;
  lastUpdated?: Date | string;
  className?: string;
  children: React.ReactNode;
}

export function DashboardLayout({
  currentPath,
  user,
  logoutAction,
  lastUpdated,
  className,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-row">
      <Sidebar
        currentPath={currentPath}
        user={user}
        logoutAction={logoutAction}
        className="hidden md:flex shrink-0"
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          user={user}
          logoutAction={logoutAction}
          currentPath={currentPath}
          lastUpdated={lastUpdated}
        />
        <main className={cn('flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto', className)}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
