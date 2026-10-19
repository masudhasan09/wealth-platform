import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Heading } from './Heading';

describe('Heading', () => {
  it('renders correct heading tag and decoupled visual size', () => {
    render(<Heading level="h1" size="h2">Portfolio</Heading>);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-2xl');
  });
});
