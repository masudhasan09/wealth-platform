import React from 'react';
import { Sidebar } from '@/components/organisms/layout/Sidebar';
import { Header } from '@/components/organisms/layout/Header';
import { Footer } from '@/components/organisms/layout/Footer';
import { cn } from '@/lib/utils/cn';

export interface DashboardLayoutProps {
  currentPath?: string;
  user?: { name: string; email: string };
  lastUpdated?: Date | string;
  onSearch?: (query: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function DashboardLayout({
  currentPath,
  user,
  lastUpdated,
  onSearch,
  className,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-row">
      <Sidebar currentPath={currentPath} user={user} className="hidden md:flex shrink-0" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header lastUpdated={lastUpdated} onSearch={onSearch} />
        <main className={cn('flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto', className)}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
