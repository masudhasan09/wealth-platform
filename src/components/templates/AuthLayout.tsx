import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/atoms/Icon';
import { DisclaimerNotice } from '@/components/molecules/DisclaimerNotice';
import { ThemeToggle } from '@/components/molecules/ThemeToggle';
import { cn } from '@/lib/utils/cn';

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const ASSET_PILLS = [
  { label: 'Equities & ETFs', dotClass: 'bg-asset-equity' },
  { label: 'Crypto & BTC', dotClass: 'bg-asset-crypto' },
  { label: 'Fixed Income', dotClass: 'bg-asset-fixed-income' },
  { label: 'Real Estate', dotClass: 'bg-asset-real-estate' },
];

export function AuthLayout({
  title,
  subtitle,
  children,
  className,
}: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen bg-background flex flex-col lg:grid lg:grid-cols-12"
      suppressHydrationWarning
    >
      {/* Left Money & Crypto Visual Showcase Panel */}
      <aside className="hidden lg:flex lg:col-span-6 bg-primary text-primary-foreground p-10 xl:p-14 flex-col justify-between">
        <div className="space-y-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-surface text-primary flex items-center justify-center shadow-sm shrink-0">
              <Icon name="TrendingUp" size="md" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight leading-tight">
                Multi-Asset Portfolio Tracking Platform
              </span>
              <span className="text-xs opacity-80">
                Institutional Wealth Ledger &amp; Valuation Engine
              </span>
            </div>
          </Link>

          <div className="space-y-3 max-w-xl">
            <h2 className="text-3xl xl:text-4xl font-bold tracking-tight leading-tight">
              Money, Crypto &amp; Multi-Asset Wealth in One Ledger.
            </h2>
            <p className="text-sm opacity-90 leading-relaxed">
              Unify equities, digital assets, government bonds, real estate appraisals, and mortgage liabilities with zero-drift decimal accounting.
            </p>
          </div>

          {/* Money & Crypto Hero Artwork */}
          <div className="rounded-2xl overflow-hidden border border-primary-foreground/20 shadow-2xl bg-background">
            <Image
              src="/images/auth-wealth-hero.svg"
              alt="Multi-Asset Portfolio Tracking Platform illustration showcasing money, stock growth chart, Bitcoin, and Ethereum assets"
              width={640}
              height={420}
              priority
              className="w-full h-auto block"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {ASSET_PILLS.map((pill) => (
              <span
                key={pill.label}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/15 text-xs font-medium"
              >
                <span className={cn('h-2 w-2 rounded-full', pill.dotClass)} aria-hidden="true" />
                {pill.label}
              </span>
            ))}
          </div>
        </div>

        <div className="text-xs opacity-80 pt-6 border-t border-primary-foreground/20 flex items-center justify-between gap-4">
          <span>AES-256-GCM Secret Vault &bull; FIFO Tax Lots</span>
          <span>Read-Only Tracking</span>
        </div>
      </aside>

      {/* Right Auth Form Panel */}
      <div
        className="flex-1 lg:col-span-6 flex flex-col justify-between p-4 sm:p-8"
        suppressHydrationWarning
      >
        <div className="flex items-center justify-between w-full max-w-md mx-auto lg:max-w-none lg:px-4 pt-2">
          <Link href="/" className="flex lg:hidden items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs shrink-0">
              <Icon name="TrendingUp" size="sm" aria-hidden="true" />
            </div>
            <span className="font-bold text-sm tracking-tight text-text truncate">
              Multi-Asset Portfolio Tracking Platform
            </span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle variant="compact" />
          </div>
        </div>

        <div className="w-full max-w-md mx-auto my-6 space-y-5" suppressHydrationWarning>
          {/* Compact Money & Crypto Banner on Mobile/Tablet */}
          <div className="lg:hidden rounded-2xl overflow-hidden border border-border shadow-sm bg-surface">
            <Image
              src="/images/auth-wealth-hero.svg"
              alt="Multi-Asset Portfolio Tracking Platform money and crypto overview"
              width={640}
              height={420}
              className="w-full h-auto block"
            />
          </div>

          <div
            className={cn(
              'p-7 sm:p-8 rounded-2xl border border-border bg-surface shadow-sm',
              className
            )}
            suppressHydrationWarning
          >
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-text">{title}</h1>
              {subtitle && (
                <p className="text-sm text-text-muted mt-1.5">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </div>

        <div className="max-w-md mx-auto w-full pb-4 text-center">
          <DisclaimerNotice variant="compact" />
        </div>
      </div>
    </div>
  );
}
