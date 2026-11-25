import React from 'react';
import { Text } from '@/components/atoms/Text';
import { MoneyText } from '@/components/atoms/MoneyText';
import { GainLossIndicator } from '@/components/molecules/GainLossIndicator';
import { cn } from '@/lib/utils/cn';

export interface StatCardProps {
  label: string;
  value: number | string;
  change?: number | string;
  changeIsPercent?: boolean;
  currencyValue?: number | string;
  helperText?: string;
  accentDotClass?: string;
  featured?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeIsPercent = true,
  currencyValue,
  helperText,
  accentDotClass,
  featured = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'p-5 rounded-xl border transition-all flex flex-col justify-between',
        featured
          ? 'border-primary bg-primary-muted shadow-sm'
          : 'border-border bg-surface shadow-xs hover:border-border-strong',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Text
          variant="caption"
          tone={featured ? 'default' : 'muted'}
          className={cn(
            'font-semibold uppercase tracking-wider text-xs',
            featured && 'text-primary'
          )}
        >
          {label}
        </Text>
        {accentDotClass && (
          <span
            className={cn('h-2.5 w-2.5 rounded-full shrink-0', accentDotClass)}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2 flex-wrap">
        <span
          className={cn(
            'font-bold tracking-tight font-mono tabular-nums',
            featured ? 'text-3xl text-text' : 'text-2xl text-text'
          )}
        >
          {typeof value === 'number' ? <MoneyText value={value} /> : value}
        </span>
      </div>

      {(change !== undefined || helperText) && (
        <div className="mt-2.5 pt-2.5 border-t border-border flex items-center justify-between gap-2 text-xs">
          {change !== undefined ? (
            <GainLossIndicator
              value={change}
              isPercent={changeIsPercent}
              currencyValue={currencyValue}
            />
          ) : (
            <span />
          )}

          {helperText && (
            <Text variant="caption" tone="muted" className="font-medium tabular-nums">
              {helperText}
            </Text>
          )}
        </div>
      )}
    </div>
  );
}
