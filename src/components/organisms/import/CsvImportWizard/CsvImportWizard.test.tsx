import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CsvImportWizard } from './CsvImportWizard';

describe('CsvImportWizard Organism', () => {
  it('renders initial upload step with template download and file input', () => {
    const mockCommit = vi.fn().mockResolvedValue({ success: true, count: 5 });

    render(<CsvImportWizard onCommit={mockCommit} />);

    expect(screen.getByText('Upload File')).toBeInTheDocument();
    expect(screen.getByText('Standard CSV Format')).toBeInTheDocument();
    expect(screen.getByText('Download Template')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload CSV')).toBeInTheDocument();
  });
});

