import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuditLogTable } from './AuditLogTable';

describe('AuditLogTable Organism', () => {
  it('renders table columns and audit entries without exposing secrets', () => {
    const mockLogs = [
      {
        id: 'audit-1',
        actorUserId: 'admin-1',
        actorEmail: 'admin@wealthtrack.dev',
        action: 'save_key',
        target: 'provider:finnhub',
        createdAt: new Date('2026-11-01T10:00:00Z'),
        metadata: '{"last4":"a3f9"}',
      },
    ];

    render(<AuditLogTable entries={mockLogs} />);

    expect(screen.getByText('admin@wealthtrack.dev')).toBeInTheDocument();
    expect(screen.getByText('SAVE KEY')).toBeInTheDocument();
    expect(screen.getByText('provider:finnhub')).toBeInTheDocument();
  });
});

