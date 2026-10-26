import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PerformancePanel } from './PerformancePanel';

describe('PerformancePanel Organism', () => {
  it('renders TWR, MWR, and the appraisal smoothing note', () => {
    render(
      <PerformancePanel
        twrPct={21.0}
        mwrPct={19.5}
        liquidReturnPct={24.2}
        appraisedReturnPct={8.1}
      />
    );

    expect(screen.getByText('Time-Weighted Return (TWR)')).toBeInTheDocument();
    expect(screen.getByText('+21.00%')).toBeInTheDocument();
    expect(screen.getByText('Money-Weighted Return (MWR / XIRR)')).toBeInTheDocument();
    expect(screen.getByText('+19.50%')).toBeInTheDocument();
    expect(screen.getByText(/Appraisal Smoothing Note:/i)).toBeInTheDocument();
  });
});
