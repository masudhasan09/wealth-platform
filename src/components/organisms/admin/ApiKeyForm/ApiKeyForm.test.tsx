import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApiKeyForm } from './ApiKeyForm';

describe('ApiKeyForm Organism', () => {
  it('renders password input without prefilling and handles submission', async () => {
    const handleSave = vi.fn().mockResolvedValue({ ok: true, message: 'Saved' });
    const handleCancel = vi.fn();

    render(
      <ApiKeyForm
        provider="finnhub"
        providerName="Finnhub"
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );

    const input = screen.getByPlaceholderText('Enter API key or secret token...');
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('type', 'password');

    fireEvent.change(input, { target: { value: 'secret-token-123' } });
    expect(input).toHaveValue('secret-token-123');

    const submitBtn = screen.getByText('Encrypt & Save Key');
    fireEvent.click(submitBtn);

    expect(handleSave).toHaveBeenCalledWith('secret-token-123');
  });
});

