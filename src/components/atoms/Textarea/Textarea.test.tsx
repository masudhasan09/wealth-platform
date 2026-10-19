import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders textarea with placeholder', () => {
    render(<Textarea placeholder="Notes" />);
    expect(screen.getByPlaceholderText('Notes')).toBeInTheDocument();
  });

  it('renders with error attribute', () => {
    render(<Textarea error placeholder="Error note" />);
    expect(screen.getByPlaceholderText('Error note')).toHaveAttribute('aria-invalid', 'true');
  });
});
