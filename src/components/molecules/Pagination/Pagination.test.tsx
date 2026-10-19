import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders page info and fires onPageChange on next', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        page={1}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /next page/i });
    expect(nextBtn).toBeEnabled();
    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(2);

    const prevBtn = screen.getByRole('button', { name: /previous page/i });
    expect(prevBtn).toBeDisabled();
  });
});
