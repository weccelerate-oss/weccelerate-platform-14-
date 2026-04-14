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

  const subdomain = getSubdomain(hostname);
  const siteFolder = subdomain ? SUBDOMAIN_MAP[subdomain] : 'main';

  // Rewrite to site folder
  url.pathname = `/sites/${siteFolder}${pathname === '/' ? '' : pathname}`;
  const response = NextResponse.rewrite(url);
  response.headers.set('x-site', siteFolder);
  return response;
}
