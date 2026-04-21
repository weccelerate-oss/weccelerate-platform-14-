/**
 * Authentication Middleware
 * 
 * Protects routes based on authentication status and user roles.
 * 
 * Security Strategy:
 * - Unauthenticated users are redirected to /login
 * - Admin routes require ADMIN role
 * - Portal routes require any authenticated user
 * - Auth pages redirect authenticated users to portal
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

// =============================================================================
// ROUTE CONFIGURATION
// =============================================================================

const config = {
  // Routes that require authentication
  protectedRoutes: [
    '/portal',
    '/dashboard',
    '/settings',
  ],

  // Routes that require admin role
  adminRoutes: [
    '/admin',
  ],

  // Auth routes (should redirect if already logged in)
  authRoutes: [
    '/login',
    '/forgot-password',
    '/reset-password',
  ],

  // Public routes that should never be blocked
  publicRoutes: [
    '/',
    '/about',
    '/services',
    '/contact',
    '/events',
    '/blog',
    '/api/health',
    '/api/webhooks',
  ],
};

// =============================================================================
// MIDDLEWARE FUNCTION
// =============================================================================

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public assets and API routes (except auth)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') || // Files with extensions
    (pathname.startsWith('/api') && !pathname.startsWith('/api/auth'))
  ) {
    return NextResponse.next();
  }

  // Get the session
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role;

  // Check if current path matches any protected route
  const isProtectedRoute = config.protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current path matches any admin route
  const isAdminRoute = config.adminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current path matches any auth route
  const isAuthRoute = config.authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Handle protected routes
  if (isProtectedRoute || isAdminRoute) {
    if (!isLoggedIn) {
      // Store the original URL to redirect back after login
      const callbackUrl = encodeURIComponent(pathname);
      const loginUrl = new URL(`/login?callbackUrl=${callbackUrl}`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin access
    if (isAdminRoute && userRole !== 'ADMIN') {
      // Redirect non-admin users to portal with error
      const portalUrl = new URL('/portal?error=unauthorized', request.url);
      return NextResponse.redirect(portalUrl);
    }
  }

  // Handle auth routes - redirect logged-in users
  if (isAuthRoute && isLoggedIn) {
    // Check for callback URL
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    const redirectUrl = callbackUrl ? decodeURIComponent(callbackUrl) : '/portal';
    
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

// =============================================================================
// MATCHER CONFIG
// =============================================================================

// Export config for middleware
export const authMiddlewareConfig = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/health|api/webhooks).*)',
  ],
};
