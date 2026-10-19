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
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeIsPercent = true,
  currencyValue,
  helperText,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'p-5 rounded-lg border border-border bg-surface shadow-sm flex flex-col justify-between',
        className
      )}
    >
      <Text variant="caption" tone="muted" className="font-medium uppercase tracking-wider">
        {label}
      </Text>

      <div className="mt-2 flex items-baseline gap-2 flex-wrap">
        <span className="text-2xl font-bold tracking-tight text-text font-mono">
          {typeof value === 'number' ? <MoneyText value={value} /> : value}
        </span>
      </div>

      {(change !== undefined || helperText) && (
        <div className="mt-2 flex items-center justify-between text-xs">
          {change !== undefined ? (
            <GainLossIndicator
              value={change}
              isPercent={changeIsPercent}
              currencyValue={currencyValue}
            />
          ) : <span />}

          {helperText && (
            <Text variant="caption" tone="muted">
              {helperText}
            </Text>
          )}
        </div>
      )}
    </div>
  );
}
