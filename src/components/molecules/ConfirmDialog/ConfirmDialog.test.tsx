import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ConfirmDialog } from './ConfirmDialog';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

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
});
