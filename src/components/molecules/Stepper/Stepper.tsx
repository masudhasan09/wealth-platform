import React from 'react';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils/cn';

export interface StepItem {
  id: string | number;
  label: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number; // 0-indexed
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={cn('w-full', className)}>
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <li
              key={step.id}
              className={cn(
                'flex items-center gap-2 flex-1',
                idx !== steps.length - 1 && 'after:content-[""] after:h-0.5 after:flex-1 after:bg-border after:mx-2',
                isCompleted && 'after:bg-primary'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold shrink-0 select-none border',
                  isCompleted
                    ? 'bg-primary text-primary-foreground border-primary'
                    : isCurrent
                    ? 'border-primary text-primary bg-primary-muted ring-2 ring-focus-ring'
                    : 'border-border text-text-muted bg-surface'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? (
                  <Icon name="Check" size="sm" aria-hidden="true" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium truncate hidden sm:inline',
                  isCurrent ? 'text-primary font-semibold' : 'text-text-muted'
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
