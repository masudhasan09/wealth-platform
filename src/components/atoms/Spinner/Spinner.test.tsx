import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with role status and accessible label', () => {
    render(<Spinner label="Calculating net worth..." />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Calculating net worth...')).toBeInTheDocument();
  });
});
