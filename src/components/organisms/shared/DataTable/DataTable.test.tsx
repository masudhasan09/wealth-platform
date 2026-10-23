import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DataTable, type ColumnDef } from './DataTable';

interface DemoItem {
  id: string;
  name: string;
  value: string;
}

const columns: ColumnDef<DemoItem>[] = [
  { header: 'Item Name', accessorKey: 'name' },
  { header: 'Value', accessorKey: 'value', align: 'right' },
];

const mockData: DemoItem[] = [
  { id: '1', name: 'Alpha', value: '100' },
  { id: '2', name: 'Beta', value: '200' },
];

describe('DataTable Organism', () => {
  it('renders table headers and data rows correctly', () => {
    render(
      <DataTable
        columns={columns}
        data={mockData}
        keyExtractor={(item) => item.id}
      />
    );

    expect(screen.getByText('Item Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('renders custom empty state when data array is empty', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        keyExtractor={(item) => item.id}
        emptyTitle="Custom Empty Title"
      />
    );

    expect(screen.getByText('Custom Empty Title')).toBeInTheDocument();
  });
});

