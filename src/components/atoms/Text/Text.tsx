import React from 'react';
import { cn } from '@/lib/utils/cn';

const variants = {
  body: 'text-base font-normal',
  caption: 'text-xs font-normal',
  label: 'text-sm font-medium',
  overline: 'text-xs font-semibold tracking-wider uppercase',
} as const;

const tones = {
  default: 'text-text',
  muted: 'text-text-muted',
  disabled: 'text-text-disabled',
  primary: 'text-primary',
  danger: 'text-danger',
  success: 'text-success',
  warning: 'text-warning',
  gain: 'text-gain',
  loss: 'text-loss',
} as const;

export type TextVariant = keyof typeof variants;
export type TextTone = keyof typeof tones;

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
  tone?: TextTone;
  as?: 'p' | 'span' | 'div';
}

export function Text({
  variant = 'body',
  tone = 'default',
  as: Component = 'p',
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(variants[variant], tones[tone], className)}
      {...props}
    >
      {children}
    </Component>
  );
}
