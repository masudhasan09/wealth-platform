import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DashboardSection } from './DashboardSection';

describe('DashboardSection Organism', () => {
  it('renders section title, subtitle, and children', () => {
    render(
      <DashboardSection
        title="Asset Allocation"
        subtitle="Distribution across asset classes"
      >
        <p>Section Content</p>
      </DashboardSection>
    );

    expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
    expect(screen.getByText('Distribution across asset classes')).toBeInTheDocument();
    expect(screen.getByText('Section Content')).toBeInTheDocument();
  });
});
