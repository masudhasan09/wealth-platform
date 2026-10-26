'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/atoms/Button';
import { formatCurrency, formatDate } from '@/lib/format';
import { generateAmortizationSchedule, type AmortizationPayment } from '@/lib/finance/real-estate';

export interface AmortizationTableProps {
  principal: string;
  annualInterestRatePct: string;
  termMonths: number;
  startDate: string | Date;
}

export function AmortizationTable({
  principal,
  annualInterestRatePct,
  termMonths,
  startDate,
}: AmortizationTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 12; // 1 year per page

  const schedule = useMemo(() => {
    const rawRate = Number(annualInterestRatePct);
    const annualRate = rawRate >= 1 ? (rawRate / 100).toString() : annualInterestRatePct;
    return generateAmortizationSchedule({
      principal,
      annualRate,
      termMonths,
      startDate: new Date(startDate),
    });
  }, [principal, annualInterestRatePct, termMonths, startDate]);

  const totalPayments = useMemo(() => {
    return schedule.reduce((acc, curr) => acc + Number(curr.payment), 0);
  }, [schedule]);

  const totalInterest = useMemo(() => {
    return schedule.reduce((acc, curr) => acc + Number(curr.interest), 0);
  }, [schedule]);

  const totalPages = Math.ceil(schedule.length / pageSize);
  const currentPayments = schedule.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-text">Amortization Schedule</h4>
          <p className="text-xs text-text-muted">
            {termMonths} months full amortization breakdown
          </p>
        </div>
        <div className="flex gap-4 text-xs font-mono">
          <div>
            <span className="text-text-muted">Total Interest: </span>
            <span className="font-semibold text-danger">{formatCurrency(totalInterest)}</span>
          </div>
          <div>
            <span className="text-text-muted">Total Cost: </span>
            <span className="font-semibold text-text">{formatCurrency(totalPayments)}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-subtle text-text-muted uppercase font-semibold">
              <th className="py-2.5 px-3">Mo #</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Payment</th>
              <th className="py-2.5 px-3">Principal</th>
              <th className="py-2.5 px-3">Interest</th>
              <th className="py-2.5 px-3">Remaining Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currentPayments.map((item: AmortizationPayment) => (
              <tr key={item.month} className="hover:bg-surface-subtle/50">
                <td className="py-2 px-3 text-text-muted font-mono">{item.month}</td>
                <td className="py-2 px-3 text-text">{formatDate(item.date)}</td>
                <td className="py-2 px-3 text-text font-mono font-medium">
                  {formatCurrency(item.payment)}
                </td>
                <td className="py-2 px-3 text-success font-mono">
                  {formatCurrency(item.principal)}
                </td>
                <td className="py-2 px-3 text-danger font-mono">
                  {formatCurrency(item.interest)}
                </td>
                <td className="py-2 px-3 text-text font-mono font-semibold">
                  {formatCurrency(item.remainingBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>
            Year {page} of {totalPages} (Months {(page - 1) * pageSize + 1} -{' '}
            {Math.min(page * pageSize, schedule.length)})
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous Year
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next Year
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
