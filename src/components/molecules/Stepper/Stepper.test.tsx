import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Stepper } from './Stepper';

describe('Stepper', () => {
  const steps = [
    { id: 'upload', label: 'Upload CSV' },
    { id: 'map', label: 'Map Columns' },
    { id: 'review', label: 'Review' },
  ];

  it('renders all steps and marks current step', () => {
    render(<Stepper steps={steps} currentStep={1} />);
    expect(screen.getByText('Upload CSV')).toBeInTheDocument();
    expect(screen.getByText('Map Columns')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();

    const currentStepIndicator = screen.getByText('2');
    expect(currentStepIndicator).toHaveAttribute('aria-current', 'step');
  });
});
