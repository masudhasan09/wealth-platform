'use client';

import React from 'react';
import { Sidebar } from '@/components/organisms/layout/Sidebar';
import { Navbar } from '@/components/organisms/layout/Navbar';
import { Footer } from '@/components/organisms/layout/Footer';
import { cn } from '@/lib/utils/cn';

export interface AdminLayoutProps {
  currentPath?: string;
  user?: { name: string; email: string };
  logoutAction?: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function AdminLayout({
  currentPath,
  user,
  logoutAction,
  children,
  className,
}: AdminLayoutProps) {
  return (
    <div className={cn('min-h-screen flex bg-background text-text', className)}>
      {/* Desktop Sidebar (hidden on mobile, Navbar has drawer) */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          currentPath={currentPath}
          user={user}
          logoutAction={logoutAction}
          isAdmin={true}
          adminOnly={true}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          user={user}
          logoutAction={logoutAction}
          currentPath={currentPath}
          isAdmin={true}
          adminOnly={true}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}
