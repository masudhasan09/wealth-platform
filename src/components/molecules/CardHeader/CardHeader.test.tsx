import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CardHeader } from './CardHeader';

describe('CardHeader', () => {
  it('renders title and subtitle', () => {
    render(<CardHeader title="Asset Allocation" subtitle="By asset class" />);
    expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
    expect(screen.getByText('By asset class')).toBeInTheDocument();
  });
});
