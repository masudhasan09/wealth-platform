import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { InputGroup } from './InputGroup';
import { Input } from '@/components/atoms/Input';

describe('InputGroup', () => {
  it('renders prefix and suffix elements', () => {
    render(
      <InputGroup prefix="$" suffix="USD">
        <Input placeholder="0.00" />
      </InputGroup>
    );
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });
});
