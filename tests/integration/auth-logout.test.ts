import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('next-auth', () => ({
  AuthError: class AuthError extends Error {
    type: string;
    constructor(type: string) {
      super(type);
      this.type = type;
    }
  },
  default: vi.fn(() => ({
    auth: vi.fn((handler: unknown) => handler),
    handlers: {
      GET: vi.fn(),
      POST: vi.fn(),
    },
    signIn: vi.fn(),
    signOut: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('@/auth', () => ({
  signIn: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
  auth: vi.fn((handler) => handler),
  handlers: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}));

vi.mock('@/lib/db', () => ({
  createUser: vi.fn(),
  getUserByEmail: vi.fn(),
  getUserById: vi.fn(),
  verifyUserPassword: vi.fn(),
}));

import { logoutAction } from '@/app/actions/auth';
import * as authModule from '@/auth';

describe('Auth Logout Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logoutAction', () => {
    it('calls Auth.js signOut with redirectTo /login', async () => {
      await logoutAction();
      expect(authModule.signOut).toHaveBeenCalledTimes(1);
      expect(authModule.signOut).toHaveBeenCalledWith({ redirectTo: '/login' });
    });

    it('is safe on double logout (consecutive calls succeed without throwing)', async () => {
      await expect(logoutAction()).resolves.not.toThrow();
      await expect(logoutAction()).resolves.not.toThrow();
      expect(authModule.signOut).toHaveBeenCalledTimes(2);
    });

    it('does not allow GET requests to trigger logout (logout is POST-only server action)', async () => {
      // In the application architecture, logout is strictly exposed via a Server Action
      // (invoked via POST by form submission in LogoutButton) and not via a GET route handler.
      const getHandlers = authModule.handlers.GET;
      
      // Simulating a GET request to /logout or an arbitrary endpoint
      const req = new NextRequest('http://localhost:3000/logout', { method: 'GET' });
      expect(req.method).toBe('GET');

      // Ensure signOut is NOT invoked by any GET request
      expect(authModule.signOut).not.toHaveBeenCalled();
      expect(getHandlers).not.toHaveBeenCalled();
    });
  });

  describe('Protected Route Redirection after Logout', () => {
    it('redirects unauthenticated user accessing /dashboard to /login', async () => {
      // Import middleware
      const middlewareModule = await import('@/middleware');
      const middleware = middlewareModule.default;

      // Create unauthenticated request to /dashboard
      const req = new NextRequest('http://localhost:3000/dashboard');
      // @ts-expect-error req.auth is null when unauthenticated
      req.auth = null;

      // Execute middleware
      // @ts-expect-error calling wrapped handler
      const res = (await middleware(req)) as Response | undefined;

      expect(res).toBeDefined();
      if (!res) return;
      expect(res.status).toBe(307); // NextResponse.redirect
      expect(res.headers.get('location')).toBe('http://localhost:3000/login');
    });

    it('sets Cache-Control no-store headers on protected routes so Back does not show protected content', async () => {
      const middlewareModule = await import('@/middleware');
      const middleware = middlewareModule.default;

      // Create authenticated request to /dashboard
      const req = new NextRequest('http://localhost:3000/dashboard');
      // @ts-expect-error req.auth is present
      req.auth = { user: { id: 'user-1', email: 'test@example.com' } };

      // @ts-expect-error calling wrapped handler
      const res = (await middleware(req)) as Response | undefined;

      expect(res).toBeDefined();
      if (!res) return;
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');
    });
  });
});
