import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PriceForm } from './PriceForm';

describe('PriceForm Organism', () => {
  it('renders form fields with default values', () => {
    render(<PriceForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/Ticker symbol/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Manual price/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Price/i })).toBeInTheDocument();
  });

  it('allows fetching live market price via API button and populates price input', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      price: '245.50',
      source: 'finnhub',
    });

    render(
      <PriceForm
        defaultTicker="AAPL"
        onSubmit={vi.fn()}
        onFetchLiveQuote={mockFetch}
      />
    );

    const fetchBtn = screen.getByRole('button', { name: /Fetch live market price/i });
    expect(fetchBtn).toBeInTheDocument();

    fireEvent.click(fetchBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('AAPL');
    });

    expect(await screen.findByText(/Live market price: \$245.50 via FINNHUB/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Manual price/i)).toHaveValue(245.5);
  });

  it('validates required fields before submitting', async () => {
    const mockSubmit = vi.fn();
    render(<PriceForm onSubmit={mockSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /Save Price/i }));

    expect(mockSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/Ticker symbol is required/i)).toBeInTheDocument();
  });
});
