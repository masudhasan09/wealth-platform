'use client';

import React, { useState, useTransition } from 'react';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/atoms/Button';
import { Select } from '@/components/atoms/Select';
import { Alert } from '@/components/molecules/Alert';
import {
  BondForm,
  BondDetailsPanel,
  CouponScheduleTable,
  MaturityLadder,
} from '@/components/organisms/fixed-income';
import { createBondAction, recordBondCouponAction } from '@/app/actions/bonds';
import type { BondModel, BondHoldingItem, CouponPayment } from '@/lib/finance/bonds';
import type { BondInput } from '@/lib/validation/bond';

export interface FixedIncomeClientProps {
  bonds: BondModel[];
  heldBonds: BondHoldingItem[];
  accounts: { id: string; name: string }[];
}

export function FixedIncomeClient({
  bonds,
  heldBonds,
  accounts,
}: FixedIncomeClientProps) {
  const [selectedBondId, setSelectedBondId] = useState<string>(
    bonds.length > 0 ? bonds[0].id || '' : ''
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedBond = bonds.find((b) => b.id === selectedBondId) || bonds[0];
  const selectedHeld = heldBonds.find((hb) => hb.id === selectedBondId);
  const currentPrice = selectedHeld?.marketPrice || selectedBond?.faceValue || '1000';

  const handleCreateBond = async (values: BondInput) => {
    setNotification(null);
    const res = await createBondAction(values);
    if (res.error) {
      return { error: res.error };
    }
    setShowAddModal(false);
    setNotification({ type: 'success', message: `Bond ${values.symbol} created successfully.` });
    startTransition(() => {
      window.location.reload();
    });
  };

  const handleRecordCoupon = async (coupon: CouponPayment) => {
    if (!selectedBond?.id || accounts.length === 0) {
      setNotification({
        type: 'danger',
        message: 'No active accounts found to credit coupon payment.',
      });
      return;
    }

    const defaultAcctId = accounts[0].id;
    const res = await recordBondCouponAction({
      accountId: defaultAcctId,
      instrumentId: selectedBond.id,
      amount: coupon.amount,
      date: new Date(coupon.paymentDate).toISOString().split('T')[0],
      note: `Coupon #${coupon.periodNumber} for ${selectedBond.symbol}`,
    });

    if (res.error) {
      setNotification({ type: 'danger', message: res.error });
    } else {
      setNotification({
        type: 'success',
        message: `Recorded coupon flow of $${coupon.amount} to ${accounts[0].name}.`,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Heading level="h2">Fixed Income Analytics</Heading>
          <Text variant="caption" tone="muted" className="mt-1">
            US Treasuries, corporate and municipal bonds, yield-to-maturity, accrued interest, and maturity ladder
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
          >
            Add Bond Instrument
          </Button>
        </div>
      </div>

      {notification && (
        <Alert tone={notification.type}>
          {notification.message}
        </Alert>
      )}

      {/* Add Bond Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface rounded-xl border border-border shadow-xl max-w-2xl w-full p-6 max-h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <Heading level="h3">Add Fixed Income Instrument</Heading>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </Button>
            </div>
            <BondForm
              onSubmit={handleCreateBond}
              isLoading={isPending}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {/* Portfolio Maturity Ladder */}
      <div className="space-y-4">
        <MaturityLadder bonds={heldBonds} />
      </div>

      {/* Bond Analytics & Inspector */}
      {bonds.length > 0 ? (
        <div className="space-y-6 rounded-xl border border-border bg-surface p-6 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border">
            <div>
              <Heading level="h3">Bond Instrument Inspector</Heading>
              <p className="text-xs text-text-muted mt-0.5">
                Select any tracked bond to inspect its yield-to-maturity, accrued interest, and cash flow schedule
              </p>
            </div>

            <div className="w-full sm:w-72">
              <Select
                value={selectedBondId}
                onChange={(e) => setSelectedBondId(e.target.value)}
              >
                {bonds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.symbol} — {b.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {selectedBond && (
            <div className="space-y-6">
              <BondDetailsPanel
                bond={selectedBond}
                currentPrice={currentPrice}
              />

              <div className="pt-4 border-t border-border">
                <Heading level="h4" className="mb-3">
                  Projected Coupon Payment Schedule
                </Heading>
                <CouponScheduleTable
                  bond={selectedBond}
                  onRecordCoupon={handleRecordCoupon}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-8 text-center space-y-3">
          <p className="text-base font-semibold text-text">No Fixed Income Instruments Tracked</p>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Add a US Treasury bill, note, bond, or corporate debt instrument to begin tracking yields, schedules, and maturity buckets.
          </p>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Add Your First Bond
          </Button>
        </div>
      )}
    </div>
  );
}
