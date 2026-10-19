import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders known icon without crashing', () => {
    const { container } = render(<Icon name="Check" aria-label="Success" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders fallback for unknown icon', () => {
    const { container } = render(<Icon name="NonExistentIconXYZ" />);
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});
