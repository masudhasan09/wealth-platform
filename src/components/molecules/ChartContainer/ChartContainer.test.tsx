import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ChartContainer } from './ChartContainer';

describe('ChartContainer', () => {
  it('renders title, subtitle and children', () => {
    render(
      <ChartContainer title="Allocation" subtitle="By Class">
        <div data-testid="chart-dummy">Chart Mock</div>
      </ChartContainer>
    );
    expect(screen.getByText('Allocation')).toBeInTheDocument();
    expect(screen.getByText('By Class')).toBeInTheDocument();
    expect(screen.getByTestId('chart-dummy')).toBeInTheDocument();
  });
});
