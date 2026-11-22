import { auth } from '@/auth';

export interface AdminSessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: 'admin';
}

export interface InvestorSessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: 'user';
}

/**
 * Server-side guard to enforce admin role.
 * Throws an Error or returns not found for non-admin users.
 * Never allow regular users or unauthenticated visitors to bypass.
 */
export async function requireAdmin(): Promise<AdminSessionUser> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized: Authentication required.');
  }

  const role = (session.user as unknown as { role?: string }).role;
  if (role !== 'admin') {
    throw new Error('Forbidden: Administrative privileges required.');
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: 'admin',
  };
}

/**
 * Server-side guard to enforce investor user role.
 * Prevents administrators from accessing or mutating personal investor portfolios.
 */
export async function requireInvestor(): Promise<InvestorSessionUser> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized: Authentication required.');
  }

  const role = (session.user as unknown as { role?: string }).role;
  if (role === 'admin') {
    throw new Error('Forbidden: Administrators are strictly isolated from user financial portfolios.');
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: 'user',
  };
}

