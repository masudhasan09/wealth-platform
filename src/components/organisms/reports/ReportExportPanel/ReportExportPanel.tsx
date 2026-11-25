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
import type { RiskAnalysisResult } from '@/lib/finance/risk';

export type ReportKind = 'portfolio' | 'gains' | 'risk';

export interface ReportExportPanelProps {
  user: { name: string; email: string };
  holdings: HoldingViewModel[];
  gainsSummary: RealizedGainsReportSummary;
  netWorthTotal: string;
  riskData?: RiskAnalysisResult;
  initialReportType?: ReportKind;
}

export function ReportExportPanel({
  user,
  holdings,
  gainsSummary,
  netWorthTotal,
  riskData,
  initialReportType = 'portfolio',
}: ReportExportPanelProps) {
  const [reportType, setReportType] = useState<ReportKind>(initialReportType);

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
    link.download = `portfolio_valuation_${new Date().toISOString().slice(0, 10)}.csv`;
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
    link.download = `capital_gains_${gainsSummary.taxYear}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const downloadRiskCsv = () => {
    if (!riskData) return;
    const summaryRows = [
      `Metric,Value`,
      `"Total Portfolio Value","${riskData.totalPortfolioValue}"`,
      `"Diversification Score","${riskData.diversificationScore}/100 (${riskData.diversificationRating})"`,
      `"Top 1 Holding","${riskData.topHoldingSymbol} (${riskData.topHoldingPct}%)"`,
      `"Top 5 Concentration","${riskData.top5Pct}%"`,
      `"Estimated Annual Volatility","${riskData.estimatedAnnualVolatility}"`,
      ``,
      `Rank,Symbol,Asset Class,Market Value,Portfolio Share (%)`,
      ...riskData.topHoldings.map(
        (h, idx) =>
          `"${idx + 1}","${h.symbol}","${h.assetClass}","${h.value}","${h.percentage}"`
      ),
    ];
    const footer = '\n# Disclaimer: Informational only. Not investment, legal or tax advice.\n';
    const content = summaryRows.join('\n') + footer;

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `risk_diversification_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleExportCsv = () => {
    if (reportType === 'portfolio') return downloadHoldingsCsv();
    if (reportType === 'gains') return downloadGainsCsv();
    return downloadRiskCsv();
  };

  const reportTitle =
    reportType === 'portfolio'
      ? 'Portfolio Valuation & Holdings Report'
      : reportType === 'gains'
      ? `Capital Gains Tax Report (${gainsSummary.taxYear})`
      : 'Portfolio Risk & Diversification Report';

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface shadow-xs no-print">
        <div className="flex items-center gap-3">
          <label htmlFor="report-type-select" className="text-xs font-semibold text-text whitespace-nowrap">
            Report Type:
          </label>
          <div className="w-64">
            <Select
              id="report-type-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportKind)}
            >
              <option value="portfolio">Portfolio &amp; Holdings Summary</option>
              <option value="gains">Capital Gains (Schedule D)</option>
              <option value="risk">Risk &amp; Diversification Report</option>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            disabled={reportType === 'risk' && !riskData}
          >
            <Icon name="Download" size="sm" aria-hidden="true" />
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
          >
            <Icon name="Printer" size="sm" aria-hidden="true" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Report Document Presentation */}
      <div className="max-w-4xl mx-auto p-8 bg-surface rounded-2xl border border-border text-text font-sans shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div>
            <Heading level="h1">{reportTitle}</Heading>
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
              <Icon name="Printer" size="sm" aria-hidden="true" />
              Print Report
            </Button>
          </div>
        </div>

        {reportType === 'portfolio' && (
          <div className="space-y-6">
            {/* Top Net Worth Banner */}
            <div className="p-4 rounded-xl bg-surface-muted border border-border flex justify-between items-center">
              <div>
                <span className="text-xs text-text-muted">Total Portfolio Net Worth</span>
                <p className="text-2xl font-bold text-text mt-1 tabular-nums">
                  <MoneyText value={netWorthTotal} />
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-text-muted">Total Active Holdings</span>
                <p className="text-xl font-semibold text-text mt-1 tabular-nums">{holdings.length}</p>
              </div>
            </div>

            {/* Holdings Table */}
            <div className="border border-border rounded-xl overflow-hidden">
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
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{h.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        <MoneyText value={h.averageCost} />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium tabular-nums">
                        {h.marketValue ? <MoneyText value={h.marketValue} /> : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'gains' && (
          <div className="space-y-6">
            {/* Gains Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-surface-muted border border-border">
                <span className="text-xs text-text-muted">Net Realized Gain</span>
                <p className="text-xl font-bold mt-1 tabular-nums">
                  <GainLossIndicator value={gainsSummary.totalGain} isPercent={false} currencyValue={gainsSummary.totalGain} />
                </p>
              </div>
              <div className="p-4 rounded-xl bg-surface-muted border border-border">
                <span className="text-xs text-text-muted">Short-Term Gain (&le; 1 yr)</span>
                <p className="text-xl font-bold mt-1 tabular-nums">
                  <MoneyText value={gainsSummary.shortTermGain} />
                </p>
              </div>
              <div className="p-4 rounded-xl bg-surface-muted border border-border">
                <span className="text-xs text-text-muted">Long-Term Gain (&gt; 1 yr)</span>
                <p className="text-xl font-bold mt-1 tabular-nums">
                  <MoneyText value={gainsSummary.longTermGain} />
                </p>
              </div>
            </div>

            {/* Realized Lots Table */}
            <div className="border border-border rounded-xl overflow-hidden">
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
                      <td className="py-2.5 px-3 font-mono tabular-nums">
                        <DateText value={l.closeDate} />
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-text">{l.symbol}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{l.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        <MoneyText value={l.proceeds} />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        <MoneyText value={l.costBasis} />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
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

        {reportType === 'risk' && (
          <div className="space-y-6">
            {riskData ? (
              <>
                {/* Risk KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-surface-muted border border-border">
                    <span className="text-xs text-text-muted">Diversification Score</span>
                    <p className="text-xl font-bold mt-1 tabular-nums text-text">
                      {riskData.diversificationScore}/100 ({riskData.diversificationRating})
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-muted border border-border">
                    <span className="text-xs text-text-muted">Top 1 Concentration</span>
                    <p className="text-xl font-bold mt-1 tabular-nums text-text">
                      {riskData.topHoldingPct}% ({riskData.topHoldingSymbol})
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-muted border border-border">
                    <span className="text-xs text-text-muted">Top 5 Concentration</span>
                    <p className="text-xl font-bold mt-1 tabular-nums text-text">
                      {riskData.top5Pct}%
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-muted border border-border">
                    <span className="text-xs text-text-muted">Estimated Volatility</span>
                    <p className="text-xl font-bold mt-1 tabular-nums text-text">
                      {riskData.estimatedAnnualVolatility}
                    </p>
                  </div>
                </div>

                {/* Asset Class Risk Exposure */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-surface-muted border-b border-border text-xs font-semibold text-text">
                    Asset Class Exposure
                  </div>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-surface border-b border-border text-text-muted">
                      <tr>
                        <th className="py-2 px-3 font-medium">Asset Class</th>
                        <th className="py-2 px-3 font-medium text-right">Market Value</th>
                        <th className="py-2 px-3 font-medium text-right">Portfolio Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {riskData.assetClassBreakdown.map((cls) => (
                        <tr key={cls.assetClass}>
                          <td className="py-2.5 px-3">
                            <AssetClassTag assetClass={cls.assetClass as AssetClassType} />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                            <MoneyText value={cls.value} />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium tabular-nums">
                            {cls.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Consolidated Top Holdings Concentration */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-surface-muted border-b border-border text-xs font-semibold text-text">
                    Consolidated Holdings Concentration
                  </div>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-surface border-b border-border text-text-muted">
                      <tr>
                        <th className="py-2 px-3 font-medium">Rank</th>
                        <th className="py-2 px-3 font-medium">Asset</th>
                        <th className="py-2 px-3 font-medium">Class</th>
                        <th className="py-2 px-3 font-medium text-right">Market Value</th>
                        <th className="py-2 px-3 font-medium text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {riskData.topHoldings.map((h, idx) => (
                        <tr key={`${h.instrumentId}-${idx}`}>
                          <td className="py-2.5 px-3 font-mono text-text-muted">#{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-text">{h.symbol}</td>
                          <td className="py-2.5 px-3">
                            <AssetClassTag assetClass={h.assetClass as AssetClassType} />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                            <MoneyText value={h.value} />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium tabular-nums">
                            {h.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Deterministic Risk Diagnostics */}
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-text uppercase tracking-wider">
                    Diagnostic Findings
                  </div>
                  {riskData.deterministicInsights.map((ins) => (
                    <div
                      key={ins.id}
                      className="p-3 rounded-xl border border-border bg-surface-muted text-xs"
                    >
                      <div className="flex items-center gap-2 font-semibold text-text">
                        <Badge
                          tone={
                            ins.type === 'success'
                              ? 'success'
                              : ins.type === 'warning'
                              ? 'warning'
                              : 'info'
                          }
                        >
                          {ins.type.toUpperCase()}
                        </Badge>
                        <span>{ins.title}</span>
                      </div>
                      <p className="text-text-muted mt-1">{ins.description}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-sm text-text-muted">
                No risk analysis data available. Add valued holdings to generate a risk report.
              </div>
            )}
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-border">
          <DisclaimerNotice variant="compact" />
        </div>
      </div>
    </div>
  );
}
