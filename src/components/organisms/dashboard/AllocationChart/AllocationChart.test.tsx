import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AllocationChart } from './AllocationChart';

const mockAssetClassData = [
  { id: 'equity', label: 'Equities', value: 60000, color: 'var(--asset-equity)' },
  { id: 'crypto', label: 'Digital Assets', value: 40000, color: 'var(--asset-crypto)' },
];

const mockAccountTypeData = [
  { id: 'brokerage', label: 'Taxable Brokerage', value: 70000 },
  { id: 'retirement', label: 'Retirement (401k/IRA)', value: 30000 },
];

describe('AllocationChart Organism', () => {
  it('renders allocation chart with legend and handles groupBy tab switching', () => {
    const handleGroupByChange = vi.fn();
    render(
      <AllocationChart
        assetClassData={mockAssetClassData}
        accountTypeData={mockAccountTypeData}
        onGroupByChange={handleGroupByChange}
      />
    );

    expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
    expect(screen.getByText(/Equities/)).toBeInTheDocument();
    expect(screen.getByText(/Digital Assets/)).toBeInTheDocument();

    // Click Account Type tab
    const accountTab = screen.getByRole('tab', { name: /Account Type/i });
    fireEvent.click(accountTab);
    expect(handleGroupByChange).toHaveBeenCalledWith('accountType');
  });

  it('renders empty state when data is empty', () => {
    render(<AllocationChart assetClassData={[]} />);
    expect(screen.getByText('No open investments to display.')).toBeInTheDocument();
  });
});

