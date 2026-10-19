import React from 'react';
import { Icon } from '@/components/atoms/Icon';
import { PercentText } from '@/components/atoms/PercentText';
import { MoneyText } from '@/components/atoms/MoneyText';
import { cn } from '@/lib/utils/cn';

export interface GainLossIndicatorProps {
  value: number | string;
  isPercent?: boolean;
  currencyValue?: number | string;
  showIcon?: boolean;
  className?: string;
}

export function GainLossIndicator({
  value,
  isPercent = true,
  currencyValue,
  showIcon = true,
  className,
}: GainLossIndicatorProps) {
  const num = typeof value === 'number' ? value : Number(value);
  const isGain = num > 0;
  const isLoss = num < 0;

  const colorClass = isGain ? 'text-gain' : isLoss ? 'text-loss' : 'text-neutral-change';
  const iconName = isGain ? 'TrendingUp' : isLoss ? 'TrendingDown' : 'Minus';
  const accessibilityPrefix = isGain ? 'Gain of ' : isLoss ? 'Loss of ' : 'No change: ';

  return (
    <span
      className={cn('inline-flex items-center gap-1 font-mono font-medium', colorClass, className)}
      aria-label={`${accessibilityPrefix}${value}${isPercent ? '%' : ''}`}
    >
      {showIcon && (
        <Icon
          name={iconName}
          size="sm"
          className="shrink-0"
          aria-hidden="true"
        />
      )}

      {currencyValue !== undefined && (
        <>
          <MoneyText value={currencyValue} />
          <span className="text-text-muted text-xs font-normal">{' ('}</span>
        </>
      )}

      {isPercent ? (
        <PercentText
          value={num}
          options={{ signDisplay: 'always' }}
        />
      ) : (
        <MoneyText
          value={num}
          options={{ signDisplay: 'always' }}
        />
      )}

      {currencyValue !== undefined && (
        <span className="text-text-muted text-xs font-normal">{')'}</span>
      )}
    </span>
  );
}
