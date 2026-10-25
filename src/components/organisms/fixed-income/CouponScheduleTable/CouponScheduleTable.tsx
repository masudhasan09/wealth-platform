'use client';

import React from 'react';
import { DataTable, type ColumnDef } from '@/components/organisms/shared/DataTable';
import { Badge } from '@/components/atoms/Badge';
import { MoneyText } from '@/components/atoms/MoneyText';
import { Button } from '@/components/atoms/Button';
import { couponSchedule, type BondModel, type CouponPayment } from '@/lib/finance/bonds';

export interface CouponScheduleTableProps {
  bond: BondModel;
  onRecordCoupon?: (coupon: CouponPayment) => void;
  className?: string;
}

export function CouponScheduleTable({
  bond,
  onRecordCoupon,
  className,
}: CouponScheduleTableProps) {
  const schedule = couponSchedule(bond);
  const now = new Date();

  const columns: ColumnDef<CouponPayment>[] = [
    {
      header: 'Period',
      accessorKey: 'periodNumber',
      align: 'left',
      className: 'w-20 font-mono',
      render: (item) => `#${item.periodNumber}`,
    },
    {
      header: 'Payment Date',
      align: 'left',
      render: (item) => (
        <span className="font-mono text-sm">
          {new Date(item.paymentDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Amount per Unit',
      align: 'right',
      render: (item) => (
        <span className="font-mono font-medium">
          <MoneyText value={parseFloat(item.amount)} />
        </span>
      ),
    },
    {
      header: 'Status',
      align: 'center',
      render: (item) => {
        const isPast = new Date(item.paymentDate) <= now;
        return (
          <Badge tone={isPast ? 'neutral' : 'success'}>
            {isPast ? 'Passed' : 'Upcoming'}
          </Badge>
        );
      },
    },
    ...(onRecordCoupon
      ? [
          {
            header: 'Actions',
            align: 'right' as const,
            render: (item: CouponPayment) => (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRecordCoupon(item)}
              >
                Record Cash Flow
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className={className}>
      <DataTable
        columns={columns}
        data={schedule}
        keyExtractor={(item) => `period-${item.periodNumber}`}
        emptyTitle="No Coupon Schedule"
        emptyDescription={
          bond.couponFrequency === 'zero_coupon'
            ? 'Zero coupon bonds do not pay regular coupons.'
            : 'No coupon dates were generated for this bond.'
        }
      />
    </div>
  );
}

