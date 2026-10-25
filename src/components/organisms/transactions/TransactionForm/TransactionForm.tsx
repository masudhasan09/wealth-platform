'use client';

import React, { useState } from 'react';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { CurrencyInput } from '@/components/molecules/CurrencyInput';
import { Textarea } from '@/components/atoms/Textarea';
import { Button } from '@/components/atoms/Button';
import { Alert } from '@/components/molecules/Alert';
import { transactionSchema, type TransactionInput } from '@/lib/validation';

export interface TransactionFormProps {
  accounts: { id: string; name: string }[];
  defaultAccountId?: string;
  defaultType?: TransactionInput['type'];
  defaultSymbol?: string;
  onSubmit: (values: TransactionInput) => Promise<{ error?: string } | void> | void;
  isLoading?: boolean;
  serverError?: string | null;
  onCancel?: () => void;
}

export function TransactionForm({
  accounts,
  defaultAccountId,
  defaultType = 'buy',
  defaultSymbol = '',
  onSubmit,
  isLoading = false,
  serverError,
  onCancel,
}: TransactionFormProps) {
  const [accountId, setAccountId] = useState(
    defaultAccountId || (accounts.length > 0 ? accounts[0].id : '')
  );
  const [type, setType] = useState<TransactionInput['type']>(defaultType);
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('0');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const isTrade = ['buy', 'sell'].includes(type);
  const isTransfer = ['transfer_in', 'transfer_out'].includes(type);
  const isCoupon = type === 'coupon';
  const isMaturity = type === 'maturity';
  const isCryptoFee = type === 'crypto_fee';
  const isUnitBased = isTrade || isTransfer || isMaturity;
  const requiresSymbol = isTrade || isTransfer || isCoupon || isMaturity || isCryptoFee;

  const handleQuantityChange = (val: string) => {
    setQuantity(val);
    if ((isTrade || isMaturity) && val && price) {
      const q = parseFloat(val);
      const p = parseFloat(price);
      if (!isNaN(q) && !isNaN(p)) {
        setAmount((q * p).toFixed(2));
      }
    }
  };

  const handlePriceChange = (val: string) => {
    setPrice(val);
    if ((isTrade || isMaturity) && quantity && val) {
      const q = parseFloat(quantity);
      const p = parseFloat(val);
      if (!isNaN(q) && !isNaN(p)) {
        setAmount((q * p).toFixed(2));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: Record<string, string | undefined> = {
      accountId,
      type,
      date,
      note: note || undefined,
      fee: fee || '0',
    };

    if (requiresSymbol) {
      payload.symbol = symbol.toUpperCase().trim();
    } else {
      payload.symbol = undefined;
    }

    if (isUnitBased) {
      payload.quantity = quantity || '0';
      payload.price = price || '0';
      payload.amount = amount || '0';
    } else if (isCryptoFee) {
      payload.quantity = quantity || '0';
      payload.amount = amount || '0';
      payload.price = '0';
    } else {
      // Cash-based transactions (deposit, withdrawal, dividend, interest, coupon)
      payload.amount = amount || '0';
      payload.quantity = '0';
      payload.price = '0';
    }

    const result = transactionSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as string;
        if (path) fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await onSubmit(result.data);
      if (res && res.error) {
        setErrors({ form: res.error });
      }
    } catch {
      setErrors({ form: 'An unexpected error occurred while saving the transaction.' });
    } finally {
      setSubmitting(false);
    }
  };

  const busy = isLoading || submitting;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {(serverError || errors.form) && (
        <Alert tone="danger" title="Error recording transaction">
          {serverError || errors.form}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Account"
          htmlFor="tx-account"
          error={errors.accountId}
          required
        >
          <Select
            id="tx-account"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            disabled={busy || accounts.length === 0}
          >
            {accounts.length === 0 ? (
              <option value="">No accounts available</option>
            ) : (
              accounts.map((acct) => (
                <option key={acct.id} value={acct.id}>
                  {acct.name}
                </option>
              ))
            )}
          </Select>
        </FormField>

        <FormField
          label="Transaction Type"
          htmlFor="tx-type"
          error={errors.type}
          required
        >
          <Select
            id="tx-type"
            value={type}
            onChange={(e) => setType(e.target.value as TransactionInput['type'])}
            disabled={busy}
          >
            <optgroup label="Trading">
              <option value="buy">Buy Asset (Equity / Crypto / Bond)</option>
              <option value="sell">Sell Asset</option>
            </optgroup>
            <optgroup label="Cash & Income">
              <option value="deposit">Deposit Cash</option>
              <option value="withdrawal">Withdrawal Cash</option>
              <option value="dividend">Dividend Income</option>
              <option value="interest">Interest Income</option>
              <option value="fee">Fee / Expense</option>
            </optgroup>
            <optgroup label="Digital Assets (Crypto)">
              <option value="transfer_in">Crypto Transfer In</option>
              <option value="transfer_out">Crypto Transfer Out</option>
              <option value="crypto_fee">Crypto Network Gas Fee</option>
            </optgroup>
            <optgroup label="Fixed Income (Bonds)">
              <option value="coupon">Bond Coupon Payment</option>
              <option value="maturity">Bond Principal Maturity</option>
            </optgroup>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Transaction Date"
          htmlFor="tx-date"
          error={errors.date}
          required
        >
          <Input
            id="tx-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={busy}
            error={!!errors.date}
          />
        </FormField>

        {requiresSymbol ? (
          <FormField
            label="Asset Symbol / Ticker"
            htmlFor="tx-symbol"
            hint={
              isCoupon || isMaturity
                ? 'e.g. UST-10Y, US-TNOTE'
                : 'e.g. AAPL, BTC, SOL, SPY'
            }
            error={errors.symbol}
            required
          >
            <Input
              id="tx-symbol"
              placeholder={isCoupon || isMaturity ? 'e.g. UST-10Y' : 'e.g. AAPL, BTC'}
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              disabled={busy}
              error={!!errors.symbol}
            />
          </FormField>
        ) : (
          <FormField
            label="Cash Amount"
            htmlFor="tx-amount"
            error={errors.amount}
            required
          >
            <CurrencyInput
              id="tx-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={busy}
              error={!!errors.amount}
            />
          </FormField>
        )}
      </div>

      {/* Asset-Class Specific Field Groups */}
      {isUnitBased && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            label={isMaturity ? 'Redeemed Quantity' : 'Quantity'}
            htmlFor="tx-qty"
            error={errors.quantity}
            required
          >
            <Input
              id="tx-qty"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              disabled={busy}
              error={!!errors.quantity}
            />
          </FormField>

          <FormField
            label={isMaturity ? 'Redemption Price' : 'Unit Price'}
            htmlFor="tx-price"
            error={errors.price}
            required={isTrade}
          >
            <CurrencyInput
              id="tx-price"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              disabled={busy}
              error={!!errors.price}
            />
          </FormField>

          <FormField
            label="Total Amount"
            htmlFor="tx-amount-total"
            error={errors.amount}
            required
          >
            <CurrencyInput
              id="tx-amount-total"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={busy}
              error={!!errors.amount}
            />
          </FormField>
        </div>
      )}

      {(isCoupon || isCryptoFee) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label={isCoupon ? 'Coupon Income Amount' : 'Fee Amount (USD)'}
            htmlFor="tx-amount-cf"
            error={errors.amount}
            required={isCoupon}
          >
            <CurrencyInput
              id="tx-amount-cf"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={busy}
              error={!!errors.amount}
            />
          </FormField>

          {isCryptoFee && (
            <FormField
              label="Fee in Crypto Units"
              htmlFor="tx-crypto-qty"
              hint="e.g. 0.0005 BTC gas fee"
              error={errors.quantity}
            >
              <Input
                id="tx-crypto-qty"
                type="text"
                inputMode="decimal"
                placeholder="0.00000000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={busy}
                error={!!errors.quantity}
              />
            </FormField>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Transaction Fee (Optional)"
          htmlFor="tx-fee"
          error={errors.fee}
        >
          <CurrencyInput
            id="tx-fee"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            disabled={busy}
            error={!!errors.fee}
          />
        </FormField>

        <FormField label="Notes (Optional)" htmlFor="tx-note">
          <Textarea
            id="tx-note"
            rows={2}
            placeholder="e.g. Tax lot details, bond series, or network tx hash"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={busy}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-border">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={busy}
          disabled={busy || accounts.length === 0}
        >
          Record Transaction
        </Button>
      </div>
    </form>
  );
}
