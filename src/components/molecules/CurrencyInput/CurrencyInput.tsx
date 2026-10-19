import React from 'react';
import { Input, InputProps } from '@/components/atoms/Input';
import { InputGroup } from '@/components/molecules/InputGroup';

export interface CurrencyInputProps extends Omit<InputProps, 'type'> {
  currencySymbol?: string;
  currencyCode?: string;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ currencySymbol = '$', currencyCode = 'USD', className, ...props }, ref) => {
    return (
      <InputGroup prefix={currencySymbol} suffix={currencyCode} className={className}>
        <Input
          ref={ref}
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...props}
        />
      </InputGroup>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
