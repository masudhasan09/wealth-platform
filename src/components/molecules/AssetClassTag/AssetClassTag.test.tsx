import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AssetClassTag } from './AssetClassTag';

describe('AssetClassTag', () => {
  it('renders correct label for equity', () => {
    render(<AssetClassTag assetClass="equity" />);
    expect(screen.getByText('Equity')).toBeInTheDocument();
  });

  it('renders correct label for crypto', () => {
    render(<AssetClassTag assetClass="crypto" />);
    expect(screen.getByText('Crypto')).toBeInTheDocument();
  });
});
