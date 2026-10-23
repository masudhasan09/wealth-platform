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
  onSubmit: (values: TransactionInput) => Promise<{ error?: string } | void> | void;
  isLoading?: boolean;
  serverError?: string | null;
  onCancel?: () => void;
}

export function TransactionForm({
  accounts,
  defaultAccountId,
  onSubmit,
  isLoading = false,
  serverError,
  onCancel,
}: TransactionFormProps) {
  const [accountId, setAccountId] = useState(
    defaultAccountId || (accounts.length > 0 ? accounts[0].id : '')
  );
  const [type, setType] = useState<TransactionInput['type']>('buy');
  const [symbol, setSymbol] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('0');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleQuantityChange = (val: string) => {
    setQuantity(val);
    if (['buy', 'sell'].includes(type) && val && price) {
      const q = parseFloat(val);
      const p = parseFloat(price);
      if (!isNaN(q) && !isNaN(p)) {
        setAmount((q * p).toFixed(2));
      }
    }
  };

  const handlePriceChange = (val: string) => {
    setPrice(val);
    if (['buy', 'sell'].includes(type) && quantity && val) {
      const q = parseFloat(quantity);
      const p = parseFloat(val);
      if (!isNaN(q) && !isNaN(p)) {
        setAmount((q * p).toFixed(2));
      }
    }
  };

  const isTrade = ['buy', 'sell'].includes(type);

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

    if (isTrade) {
      payload.symbol = symbol.toUpperCase().trim();
      payload.quantity = quantity;
      payload.price = price;
      payload.amount = amount;
    } else {
      payload.amount = amount;
      payload.quantity = '0';
      payload.price = '0';
      payload.symbol = undefined;
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

    try {
      setSubmitting(true);
      await onSubmit(result.data);
    } finally {
      setSubmitting(false);
    }
  };

  const busy = isLoading || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {serverError && (
        <Alert tone="danger" title="Error recording transaction">
          {serverError}
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
            <option value="buy">Buy Asset</option>
            <option value="sell">Sell Asset</option>
            <option value="deposit">Deposit Cash</option>
            <option value="withdrawal">Withdrawal Cash</option>
            <option value="dividend">Dividend Income</option>
            <option value="interest">Interest Income</option>
            <option value="fee">Fee / Expense</option>
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

        {isTrade ? (
          <FormField
            label="Asset Symbol / Ticker"
            htmlFor="tx-symbol"
            hint="e.g. AAPL, MSFT, BTC"
            error={errors.symbol}
            required
          >
            <Input
              id="tx-symbol"
              placeholder="e.g. AAPL"
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

      {isTrade && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            label="Quantity"
            htmlFor="tx-qty"
            error={errors.quantity}
            required
          >
            <Input
              id="tx-qty"
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              disabled={busy}
              error={!!errors.quantity}
            />
          </FormField>

          <FormField
            label="Unit Price"
            htmlFor="tx-price"
            error={errors.price}
            required
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
            htmlFor="tx-total-amount"
            error={errors.amount}
          >
            <CurrencyInput
              id="tx-total-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={busy}
              error={!!errors.amount}
            />
          </FormField>
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

        <FormField
          label="Notes (Optional)"
          htmlFor="tx-note"
        >
          <Textarea
            id="tx-note"
            rows={1}
            placeholder="e.g. Dividend reinvestment or tax lot details"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={busy}
          />
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
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
          disabled={busy}
        >
          Record Transaction
        </Button>
      </div>
    </form>
  );
}
