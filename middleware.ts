import { NextRequest, NextResponse } from 'next/server';

const SUBDOMAIN_MAP: Record<string, string> = {
  leumit: 'leumit',
  biz: 'biz',
  landing: 'landing',
};

const ROOT_DOMAINS = ['weccelerate.co.il', 'www.weccelerate.co.il', 'localhost:3000', 'localhost', 'vercel.app'];

// Only run middleware on page routes — skip ALL static files
export const config = {
  matcher: ['/((?!api|_next|favicon\\.ico|.*\\..+$).*)'],
};

function getSubdomain(hostname: string): string | null {
  const cleanHost = hostname.split(':')[0];
  const parts = cleanHost.split('.');

  // localhost subdomain support: e.g. leumit.localhost:3000
  if (parts.length >= 2 && parts[parts.length - 1] === 'localhost' && SUBDOMAIN_MAP[parts[0]]) {
    return parts[0];
  }

  if (ROOT_DOMAINS.some(d => hostname.includes(d))) {
    return null;
  }
  if (parts.length > 2 && SUBDOMAIN_MAP[parts[0]]) {
    return parts[0];
  }
  return null;
}

const SITE_COOKIE = 'wec-site';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  // Skip any path that has a file extension (static assets)
  if (/\.\w+$/.test(pathname)) {
    return NextResponse.next();
  }

  // Skip for auth, admin, portal, login routes
  if (pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/portal') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/register')) {
    return NextResponse.next();
  }

  // Skip if already in sites path
  if (pathname.startsWith('/sites/')) {
    return NextResponse.next();
  }

  // Redirect legacy/alternate paths to canonical URLs
  const REDIRECTS: Record<string, string> = {
    '/news': '/blog',
    '/leads': '/contact',
  };
  if (REDIRECTS[pathname]) {
    url.pathname = REDIRECTS[pathname];
    return NextResponse.redirect(url, 301);
  }

  // Site selection priority:
  // 1. Real subdomain (production / *.localhost)
  // 2. ?site= query param (Vercel preview URL fallback) — also persisted as cookie
  // 3. Persisted cookie (so user keeps the site after first visit)
  // 4. Fallback to 'main'
  const fromHost = getSubdomain(hostname);
  const fromQuery = url.searchParams.get('site');
  const fromCookie = request.cookies.get(SITE_COOKIE)?.value;

  let siteFolder = 'main';
  let shouldSetCookie: string | null = null;

  if (fromHost) {
    siteFolder = SUBDOMAIN_MAP[fromHost];
  } else if (fromQuery && SUBDOMAIN_MAP[fromQuery]) {
    siteFolder = SUBDOMAIN_MAP[fromQuery];
    shouldSetCookie = fromQuery;
  } else if (fromCookie && SUBDOMAIN_MAP[fromCookie]) {
    siteFolder = SUBDOMAIN_MAP[fromCookie];
  }

  // Rewrite to site folder
  url.pathname = `/sites/${siteFolder}${pathname === '/' ? '' : pathname}`;
  // Strip ?site= from the rewritten URL (we keep it in user-visible URL via NextResponse though)
  url.searchParams.delete('site');
  const response = NextResponse.rewrite(url);
  response.headers.set('x-site', siteFolder);

  if (shouldSetCookie) {
    // Persist site selection for 30 days so user doesn't have to re-add ?site
    response.cookies.set(SITE_COOKIE, shouldSetCookie, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    });
  }

  return response;
}
