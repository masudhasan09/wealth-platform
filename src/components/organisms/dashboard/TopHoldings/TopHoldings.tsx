import React from 'react';
import { AssetClassTag, type AssetClassType } from '@/components/molecules/AssetClassTag';
import { MoneyText } from '@/components/atoms/MoneyText';
import { PercentText } from '@/components/atoms/PercentText';
import { GainLossIndicator } from '@/components/molecules/GainLossIndicator';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/lib/utils/cn';

export interface TopHoldingItem {
  symbol: string;
  name: string;
  assetClass: string;
  quantity: string;
  marketValue: string;
  totalCost: string;
  unrealisedPnL: string;
  unrealisedPnLPct: string;
  allocationPct: string;
}

export interface TopHoldingsProps {
  holdings: TopHoldingItem[];
  className?: string;
}

export function TopHoldings({ holdings, className }: TopHoldingsProps) {
  if (holdings.length === 0) {
    return (
      <div className={cn('p-6 text-center text-text-muted', className)}>
        <Text variant="body" tone="muted">No holdings found.</Text>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted">
            <th className="text-left px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Asset</th>
            <th className="text-left px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Class</th>
            <th className="text-right px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Quantity</th>
            <th className="text-right px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Market Value</th>
            <th className="text-right px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Allocation</th>
            <th className="text-right px-4 py-3 font-medium text-text-muted uppercase tracking-wide text-xs">Unrealized P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const pnl = parseFloat(h.unrealisedPnL);
            const pnlPct = parseFloat(h.unrealisedPnLPct);

            return (
              <tr key={h.symbol} className="border-b border-border hover:bg-surface-muted transition-colors">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-mono font-bold text-text">{h.symbol}</span>
                    <span className="text-xs text-text-muted truncate max-w-xs">{h.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <AssetClassTag assetClass={(h.assetClass?.toLowerCase() as AssetClassType) || 'equity'} />
                </td>
                <td className="px-4 py-3 text-right font-mono text-text-muted">
                  {parseFloat(h.quantity).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-text">
                  <MoneyText value={parseFloat(h.marketValue)} />
                </td>
                <td className="px-4 py-3 text-right font-mono text-text">
                  <PercentText value={parseFloat(h.allocationPct)} />
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  <GainLossIndicator value={pnlPct} isPercent currencyValue={pnl} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
