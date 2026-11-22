'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Select } from '@/components/atoms/Select';
import { Icon } from '@/components/atoms/Icon';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { DisclaimerNotice } from '@/components/molecules/DisclaimerNotice';
import { MoneyText } from '@/components/atoms/MoneyText';
import { GainLossIndicator } from '@/components/molecules/GainLossIndicator';
import { AssetClassTag, type AssetClassType } from '@/components/molecules/AssetClassTag';
import { Badge } from '@/components/atoms/Badge';
import { DateText } from '@/components/atoms/DateText';
import type { HoldingViewModel } from '@/lib/view-models';
import type { RealizedGainsReportSummary } from '@/lib/finance/tax-lots';

export interface ReportExportPanelProps {
  user: { name: string; email: string };
  holdings: HoldingViewModel[];
  gainsSummary: RealizedGainsReportSummary;
  netWorthTotal: string;
}

export function ReportExportPanel({
  user,
  holdings,
  gainsSummary,
  netWorthTotal,
}: ReportExportPanelProps) {
  const [reportType, setReportType] = useState<'portfolio' | 'gains'>('portfolio');

  const downloadHoldingsCsv = () => {
    const headers = 'Symbol,Name,Asset Class,Account,Quantity,Average Cost,Current Price,Current Value\n';
    const rows = holdings
      .map(
        (h) =>
          `"${h.symbol || ''}","${h.instrumentName || ''}","${h.assetClass}","${h.accountName}","${h.quantity}","${h.averageCost}","${h.currentPrice || ''}","${h.marketValue || ''}"`
      )
      .join('\n');
    const footer = '\n# Disclaimer: Informational only. Not investment, legal or tax advice.\n';
    const content = headers + rows + footer;

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wealthtrack_portfolio_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const downloadGainsCsv = () => {
    const headers = 'Close Date,Symbol,Quantity,Gross Proceeds,Cost Basis,Gain/Loss,Term,Holding Days\n';
    const rows = gainsSummary.lots
      .map(
        (l) =>
          `"${new Date(l.closeDate).toISOString().slice(0, 10)}","${l.symbol || ''}","${l.quantity}","${l.proceeds}","${l.costBasis}","${l.gainLoss}","${l.term}","${l.holdingDays}"`
      )
      .join('\n');
    const footer = '\n# Disclaimer: Informational only. Not investment, legal or tax advice.\n';
    const content = headers + rows + footer;

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wealthtrack_capital_gains_${gainsSummary.taxYear}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface shadow-xs">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-text whitespace-nowrap">Report Type:</label>
          <div className="w-56">
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'portfolio' | 'gains')}
            >
              <option value="portfolio">Portfolio & Holdings Summary</option>
              <option value="gains">Capital Gains (Schedule D)</option>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={reportType === 'portfolio' ? downloadHoldingsCsv : downloadGainsCsv}
          >
            <Icon name="Download" size="sm" className="mr-1.5" />
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
          >
            <Icon name="Printer" size="sm" className="mr-1.5" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Report Document Presentation */}
      <div className="max-w-4xl mx-auto p-8 bg-surface rounded-xl border border-border text-text font-sans shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div>
            <Heading level="h1">
              {reportType === 'portfolio'
                ? 'Portfolio Valuation & Holdings Report'
                : `Capital Gains Tax Report (${gainsSummary.taxYear})`}
            </Heading>
            <Text variant="caption" tone="muted" className="mt-1">
              Generated on {new Date().toLocaleDateString()} for {user.name} ({user.email})
            </Text>
          </div>

          <div className="no-print">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (typeof window !== 'undefined') window.print();
              }}
            >
              <Icon name="Printer" size="sm" className="mr-1.5" />
              Print Report
            </Button>
          </div>
        </div>
        {reportType === 'portfolio' ? (
          <div className="space-y-6">
            {/* Top Net Worth Banner */}
            <div className="p-4 rounded-lg bg-surface-muted border border-border flex justify-between items-center">
              <div>
                <span className="text-xs text-text-muted">Total Portfolio Net Worth</span>
                <p className="text-2xl font-bold text-text mt-1">
                  <MoneyText value={netWorthTotal} />
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-text-muted">Total Active Holdings</span>
                <p className="text-xl font-semibold text-text mt-1">{holdings.length}</p>
              </div>
            </div>

            {/* Holdings Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-surface-muted border-b border-border text-text-muted">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">Asset</th>
                    <th className="py-2.5 px-3 font-medium">Class</th>
                    <th className="py-2.5 px-3 font-medium">Account</th>
                    <th className="py-2.5 px-3 font-medium text-right">Quantity</th>
                    <th className="py-2.5 px-3 font-medium text-right">Avg Cost</th>
                    <th className="py-2.5 px-3 font-medium text-right">Current Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {holdings.map((h) => (
                    <tr key={`${h.accountId}-${h.instrumentId}`}>
                      <td className="py-2.5 px-3 font-semibold text-text">
                        {h.symbol}
                        {h.instrumentName && h.instrumentName !== h.symbol && (
                          <span className="font-normal text-text-muted ml-2">({h.instrumentName})</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <AssetClassTag assetClass={h.assetClass as AssetClassType} />
                      </td>
                      <td className="py-2.5 px-3 text-text-muted">{h.accountName}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{h.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        <MoneyText value={h.averageCost} />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium">
                        {h.marketValue ? <MoneyText value={h.marketValue} /> : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Gains Summary Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-surface-muted border border-border">
                <span className="text-xs text-text-muted">Net Realized Gain</span>
                <p className="text-xl font-bold mt-1">
                  <GainLossIndicator value={gainsSummary.totalGain} isPercent={false} currencyValue={gainsSummary.totalGain} />
                </p>
              </div>
              <div className="p-4 rounded-lg bg-surface-muted border border-border">
                <span className="text-xs text-text-muted">Short-Term Gain (≤ 1 yr)</span>
                <p className="text-xl font-bold mt-1">
                  <MoneyText value={gainsSummary.shortTermGain} />
                </p>
              </div>
              <div className="p-4 rounded-lg bg-surface-muted border border-border">
                <span className="text-xs text-text-muted">Long-Term Gain (&gt; 1 yr)</span>
                <p className="text-xl font-bold mt-1">
                  <MoneyText value={gainsSummary.longTermGain} />
                </p>
              </div>
            </div>

            {/* Realized Lots Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-surface-muted border-b border-border text-text-muted">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">Close Date</th>
                    <th className="py-2.5 px-3 font-medium">Asset</th>
                    <th className="py-2.5 px-3 font-medium text-right">Qty</th>
                    <th className="py-2.5 px-3 font-medium text-right">Proceeds</th>
                    <th className="py-2.5 px-3 font-medium text-right">Cost Basis</th>
                    <th className="py-2.5 px-3 font-medium text-right">Gain / Loss</th>
                    <th className="py-2.5 px-3 font-medium text-right">Holding Term</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {gainsSummary.lots.map((l) => (
                    <tr key={l.id}>
                      <td className="py-2.5 px-3 font-mono">
                        <DateText value={l.closeDate} />
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-text">{l.symbol}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{l.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        <MoneyText value={l.proceeds} />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        <MoneyText value={l.costBasis} />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        <GainLossIndicator value={l.gainLoss} isPercent={false} currencyValue={l.gainLoss} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Badge tone={l.term === 'long_term' ? 'success' : 'warning'}>
                          {l.term === 'long_term' ? 'Long-Term' : 'Short-Term'} ({l.holdingDays}d)
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-border">
          <DisclaimerNotice variant="compact" />
        </div>
      </div>
    </div>
  );
}
