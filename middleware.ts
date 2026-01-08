import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const SUBDOMAIN_MAP: Record<string, string> = {
  leumit: 'leumit',
  biz: 'biz',
  landing: 'landing',
};

const ROOT_DOMAINS = ['weccelerate.co.il', 'www.weccelerate.co.il', 'localhost:3000', 'localhost'];
const PROTECTED_ROUTES = ['/portal', '/dashboard', '/settings'];
const ADMIN_ROUTES = ['/admin'];
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};

function getSubdomain(hostname: string): string | null {
  const cleanHost = hostname.split(':')[0];
  if (ROOT_DOMAINS.some(d => hostname.includes(d.split(':')[0]) && !hostname.startsWith('leumit') && !hostname.startsWith('biz') && !hostname.startsWith('landing'))) {
    return null;
  }
  const parts = cleanHost.split('.');
  if (parts.length > 2 && SUBDOMAIN_MAP[parts[0]]) {
    return parts[0];
  }
  return null;
}

function getDevSubdomain(request: NextRequest): string | null {
  const siteParam = request.nextUrl.searchParams.get('site');
  if (siteParam && SUBDOMAIN_MAP[siteParam]) return siteParam;
  const headerSubdomain = request.headers.get('x-subdomain');
  if (headerSubdomain && SUBDOMAIN_MAP[headerSubdomain]) return headerSubdomain;
  return null;
}

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  const subdomain = getSubdomain(hostname) || getDevSubdomain(request);
  const siteFolder = subdomain ? SUBDOMAIN_MAP[subdomain] : 'main';

  const isProtectedRoute = matchesRoute(pathname, PROTECTED_ROUTES);
  const isAdminRoute = matchesRoute(pathname, ADMIN_ROUTES);
  const isAuthRoute = matchesRoute(pathname, AUTH_ROUTES);

  if (isProtectedRoute || isAdminRoute || isAuthRoute) {
    const token = await getToken({ 
      req: request,
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    });
    
    const isLoggedIn = !!token;
    const userRole = token?.role as string | undefined;

    if ((isProtectedRoute || isAdminRoute) && !isLoggedIn) {
      const loginUrl = new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminRoute && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/portal?error=unauthorized', request.url));
    }

    if (isAuthRoute && isLoggedIn) {
      const callbackUrl = url.searchParams.get('callbackUrl');
      const redirectUrl = callbackUrl ? decodeURIComponent(callbackUrl) : '/portal';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  if (pathname.startsWith('/sites/') || pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  if (isAuthRoute || isAdminRoute || isProtectedRoute) {
    return NextResponse.next();
  }

  url.pathname = `/sites/${siteFolder}${pathname === '/' ? '' : pathname}`;
  const response = NextResponse.rewrite(url);
  response.headers.set('x-site', siteFolder);
  response.headers.set('x-subdomain', subdomain || 'main');
  return response;
}