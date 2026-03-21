import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('roundup_session');

  // Public routes that don't need auth
  const publicRoutes = ['/', '/login', '/signup', '/api/auth/login', '/api/auth/signup', '/api/early-access'];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => pathname === route) ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/icons/') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js';

  if (!isPublicRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect logged-in users from landing/auth pages to dashboard
  if (sessionCookie && (pathname === '/' || pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
