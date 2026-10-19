import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DisclaimerNotice, DISCLAIMER_TEXT } from './DisclaimerNotice';

describe('DisclaimerNotice', () => {
  it('renders required disclaimer text', () => {
    render(<DisclaimerNotice variant="banner" />);
    expect(screen.getByText(DISCLAIMER_TEXT)).toBeInTheDocument();
  });
});
