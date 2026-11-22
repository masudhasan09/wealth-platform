import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Tabs } from './Tabs';

const mockTabs = [
  { id: 'assetClass', label: 'By Asset Class' },
  { id: 'accountType', label: 'By Account Type', badge: 5 },
];

describe('Tabs Molecule', () => {
  it('renders tabs with role=tab and selected state', () => {
    const handleChange = vi.fn();
    render(
      <Tabs
        items={mockTabs}
        activeTab="assetClass"
        onChange={handleChange}
      />
    );

    const tab1 = screen.getByRole('tab', { name: /By Asset Class/i });
    const tab2 = screen.getByRole('tab', { name: /By Account Type/i });

    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(tab2).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('5')).toBeInTheDocument();

    fireEvent.click(tab2);
    expect(handleChange).toHaveBeenCalledWith('accountType');
  });
});

