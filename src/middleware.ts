import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/accounts',
  '/transactions',
  '/holdings',
  '/net-worth',
  '/prices',
  '/fixed-income',
  '/real-estate',
  '/gains',
  '/risk',
  '/reports',
  '/settings',
];

export default auth((req) => {
  const isAuth = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !isAuth) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  if (isProtected) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  return response;
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/accounts/:path*',
    '/transactions/:path*',
    '/holdings/:path*',
    '/net-worth/:path*',
    '/prices/:path*',
    '/fixed-income/:path*',
    '/real-estate/:path*',
    '/gains/:path*',
    '/risk/:path*',
    '/reports/:path*',
    '/settings/:path*',
  ],
};
