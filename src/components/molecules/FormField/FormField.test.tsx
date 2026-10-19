import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FormField } from './FormField';
import { Input } from '@/components/atoms/Input';

describe('FormField', () => {
  it('associates label with input', () => {
    render(
      <FormField label="Email Address">
        <Input placeholder="user@example.com" />
      </FormField>
    );
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
  });

  it('renders error message with alert role and aria-describedby', () => {
    render(
      <FormField label="Password" error="Password is required">
        <Input type="password" />
      </FormField>
    );
    const input = screen.getByLabelText('Password');
    const alert = screen.getByRole('alert');

    expect(alert).toHaveTextContent('Password is required');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')).toContain(alert.id);
  });
});
