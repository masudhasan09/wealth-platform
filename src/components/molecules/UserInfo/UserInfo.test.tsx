import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { UserInfo } from './UserInfo';

describe('UserInfo', () => {
  it('renders user name and email', () => {
    render(<UserInfo name="Jane Doe" email="jane@example.com" />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });
});
