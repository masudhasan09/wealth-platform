import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SearchBox } from './SearchBox';

describe('SearchBox', () => {
  it('renders search input with placeholder', () => {
    render(<SearchBox placeholder="Search assets..." />);
    expect(screen.getByPlaceholderText('Search assets...')).toBeInTheDocument();
  });

  it('shows clear button and invokes onClear when has value', () => {
    const handleClear = vi.fn();
    render(<SearchBox value="AAPL" onChange={() => {}} onClear={handleClear} />);
    const clearBtn = screen.getByLabelText('Clear search');
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});
