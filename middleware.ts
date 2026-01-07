import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * WeCcelerate Multi-Domain Middleware with Authentication
 * 
 * Routes requests to appropriate site folders based on subdomain:
 * - weccelerate.co.il (main) → /app/sites/main
 * - leumit.weccelerate.co.il → /app/sites/leumit
 * - biz.weccelerate.co.il → /app/sites/biz
 * - landing.weccelerate.co.il → /app/sites/landing
 * 
 * Also handles:
 * - Authentication checks for protected routes
 * - Role-based access control
 */

// Define valid subdomains and their corresponding site folders
const SUBDOMAIN_MAP: Record<string, string> = {
  leumit: 'leumit',
  biz: 'biz',
  landing: 'landing',
};

// Domains to exclude from subdomain parsing (apex/main domains)
const ROOT_DOMAINS = [
  'weccelerate.co.il',
  'www.weccelerate.co.il',
  'localhost:3000',
  'localhost',
];

// Protected routes requiring authentication
const PROTECTED_ROUTES = ['/portal', '/dashboard', '/settings'];

// Admin-only routes
const ADMIN_ROUTES = ['/admin'];

// Auth pages (redirect if already logged in)
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - API routes (/api/...)
     * - Static files (/_next/static/...)
     * - Image optimization files (/_next/image/...)
     * - Favicon and other root-level static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

/**
 * Extract subdomain from hostname
 */
function getSubdomain(hostname: string): string | null {
  // Remove port if present
  const cleanHost = hostname.split(':')[0];
  
  // Check if it's a root domain
  if (ROOT_DOMAINS.some(domain => hostname.includes(domain.split(':')[0]) && !hostname.startsWith('leumit') && !hostname.startsWith('biz') && !hostname.startsWith('landing'))) {
    // For localhost development, check for subdomain simulation via query param or header
    return null;
  }
  
  // Extract subdomain from production domains
  // Format: subdomain.weccelerate.co.il
  const parts = cleanHost.split('.');
  
  // If we have more than 2 parts (subdomain.domain.tld) or 3 parts for .co.il
  if (parts.length > 2) {
    const potentialSubdomain = parts[0];
    
    // Verify it's a valid subdomain
    if (SUBDOMAIN_MAP[potentialSubdomain]) {
      return potentialSubdomain;
    }
  }
  
  return null;
}

/**
 * Get subdomain from development query parameter
 * Allows testing subdomains locally: localhost:3000?site=biz
 */
function getDevSubdomain(request: NextRequest): string | null {
  const siteParam = request.nextUrl.searchParams.get('site');
  if (siteParam && SUBDOMAIN_MAP[siteParam]) {
    return siteParam;
  }
  
  // Also check for x-subdomain header (useful for testing with tools like Postman)
  const headerSubdomain = request.headers.get('x-subdomain');
  if (headerSubdomain && SUBDOMAIN_MAP[headerSubdomain]) {
    return headerSubdomain;
  }
  
  return null;
}

/**
 * Check if path matches any of the given routes
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;
  
  // Get subdomain (production) or dev subdomain (development)
  const subdomain = getSubdomain(hostname) || getDevSubdomain(request);
  
  // Determine target site folder
  const siteFolder = subdomain ? SUBDOMAIN_MAP[subdomain] : 'main';
  
  // =========================================================================
  // AUTHENTICATION CHECK
  // =========================================================================
  
  // Check if this is a protected route
  const isProtectedRoute = matchesRoute(pathname, PROTECTED_ROUTES);
  const isAdminRoute = matchesRoute(pathname, ADMIN_ROUTES);
  const isAuthRoute = matchesRoute(pathname, AUTH_ROUTES);
  
  if (isProtectedRoute || isAdminRoute || isAuthRoute) {
    // Get session
    const session = await auth();
    const isLoggedIn = !!session?.user;
    const userRole = session?.user?.role;
    
    // Redirect unauthenticated users from protected routes
    if ((isProtectedRoute || isAdminRoute) && !isLoggedIn) {
      const callbackUrl = encodeURIComponent(pathname);
      const loginUrl = new URL(`/login?callbackUrl=${callbackUrl}`, request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Check admin access
    if (isAdminRoute && userRole !== 'ADMIN') {
      const portalUrl = new URL('/portal?error=unauthorized', request.url);
      return NextResponse.redirect(portalUrl);
    }
    
    // Redirect authenticated users away from auth pages
    if (isAuthRoute && isLoggedIn) {
      const callbackUrl = url.searchParams.get('callbackUrl');
      const redirectUrl = callbackUrl ? decodeURIComponent(callbackUrl) : '/portal';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }
  
  // =========================================================================
  // SUBDOMAIN ROUTING
  // =========================================================================
  
  // Skip rewriting if already in a sites path
  if (pathname.startsWith('/sites/')) {
    return NextResponse.next();
  }
  
  // Skip rewriting for special paths (auth routes handled at root level)
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }
  
  // Don't rewrite auth routes - they live at root level
  if (isAuthRoute) {
    return NextResponse.next();
  }
  
  // Don't rewrite admin and portal routes - they live at root level
  if (isAdminRoute || isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Rewrite to the appropriate site folder
  // e.g., /about → /sites/main/about or /dashboard → /sites/biz/dashboard
  const newPathname = `/sites/${siteFolder}${pathname === '/' ? '' : pathname}`;
  
  url.pathname = newPathname;
  
  // Add site context to headers for use in components
  const response = NextResponse.rewrite(url);
  response.headers.set('x-site', siteFolder);
  response.headers.set('x-subdomain', subdomain || 'main');
  
  return response;
}