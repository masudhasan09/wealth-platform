import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders title and description when open', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Void Transaction?"
        description="This action cannot be undone."
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('Void Transaction?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('triggers onConfirm when confirm button clicked', () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        title="Delete"
        description="Delete item"
        confirmLabel="Yes, delete"
        onConfirm={handleConfirm}
        onCancel={() => {}}
      />
    );
    const confirmBtn = screen.getByRole('button', { name: /yes, delete/i });
    fireEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not render when closed', () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        title="Delete"
        description="Delete item"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('calls onCancel when backdrop is clicked', () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        title="Remove"
        description="Remove this item?"
        onConfirm={() => {}}
        onCancel={handleCancel}
      />
    );
    const backdrop = screen.getByRole('presentation');
    fireEvent.click(backdrop);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
