import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FileInput } from './FileInput';

describe('FileInput', () => {
  it('renders file input with accept attribute', () => {
    render(<FileInput accept=".csv" aria-label="CSV file upload" />);
    const input = screen.getByLabelText('CSV file upload');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', '.csv');
  });

  it('renders disabled state', () => {
    render(<FileInput disabled aria-label="Upload disabled" />);
    expect(screen.getByLabelText('Upload disabled')).toBeDisabled();
  });
});
