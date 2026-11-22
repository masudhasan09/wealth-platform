import { describe, it, expect, vi } from 'vitest';
import { requireAdmin, requireInvestor } from './roles';
import * as authModule from '@/auth';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

const mockAuth = authModule.auth as unknown as ReturnType<typeof vi.fn>;

describe('Role Security & requireAdmin Guard', () => {
  it('throws Unauthorized when there is no authenticated session', async () => {
    mockAuth.mockResolvedValueOnce(null);
    await expect(requireAdmin()).rejects.toThrow(/Unauthorized/i);
  });

  it('throws Forbidden when authenticated user has user role', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', name: 'Regular User', email: 'user@wealthtrack.dev', role: 'user' },
      expires: '2099-01-01',
    });

    await expect(requireAdmin()).rejects.toThrow(/Forbidden/i);
  });

  it('succeeds and returns admin user context when user has admin role', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', name: 'Admin User', email: 'admin@wealthtrack.dev', role: 'admin' },
      expires: '2099-01-01',
    });

    const admin = await requireAdmin();
    expect(admin.id).toBe('admin-1');
    expect(admin.role).toBe('admin');
  });
});

describe('Role Security & requireInvestor Guard', () => {
  it('throws Unauthorized when session is missing', async () => {
    mockAuth.mockResolvedValueOnce(null);
    await expect(requireInvestor()).rejects.toThrow(/Unauthorized/i);
  });

  it('throws Forbidden when admin attempts to access investor functions', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', name: 'Admin User', email: 'admin@wealthtrack.dev', role: 'admin' },
      expires: '2099-01-01',
    });

    await expect(requireInvestor()).rejects.toThrow(/Administrators are strictly isolated/i);
  });

  it('succeeds for regular investor user', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', name: 'Regular User', email: 'user@wealthtrack.dev', role: 'user' },
      expires: '2099-01-01',
    });

    const investor = await requireInvestor();
    expect(investor.id).toBe('user-1');
    expect(investor.role).toBe('user');
  });
});
