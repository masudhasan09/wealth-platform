import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Text } from './Text';

describe('Text', () => {
  it('renders with variants and tones', () => {
    render(<Text variant="caption" tone="muted">Secondary info</Text>);
    const el = screen.getByText('Secondary info');
    expect(el).toHaveClass('text-xs');
    expect(el).toHaveClass('text-text-muted');
  });

  it('renders as span when requested', () => {
    render(<Text as="span">Inline text</Text>);
    expect(screen.getByText('Inline text').tagName).toBe('SPAN');
  });
});
