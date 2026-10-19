import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DateText } from './DateText';

describe('DateText', () => {
  it('renders time element with formatted date', () => {
    const d = new Date('2024-03-15T00:00:00Z');
    render(<DateText value={d} options={{ format: 'iso' }} />);
    const timeEl = screen.getByText('2024-03-15');
    expect(timeEl).toBeInTheDocument();
    expect(timeEl.tagName).toBe('TIME');
  });
});
