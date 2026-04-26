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

// Legacy / alternate domains that should 308-redirect to the canonical
// weccelerate.co.il, preserving subdomain, path and query string.
const ALTERNATE_DOMAINS = ['wecc-ltd.com', 'www.wecc-ltd.com'];
const CANONICAL_DOMAIN = 'weccelerate.co.il';

// AI crawler user-agent fragments. Case-insensitive substring match.
// Sources: official docs for each crawler + robots.txt exclusion lists.
const AI_BOT_SIGNATURES: ReadonlyArray<{ name: string; match: string }> = [
  { name: 'GPTBot', match: 'gptbot' }, // OpenAI training
  { name: 'ChatGPT-User', match: 'chatgpt-user' }, // ChatGPT live browse
  { name: 'OAI-SearchBot', match: 'oai-searchbot' }, // ChatGPT Search
  { name: 'ClaudeBot', match: 'claudebot' }, // Anthropic training
  { name: 'Claude-Web', match: 'claude-web' }, // Claude live browse
  { name: 'anthropic-ai', match: 'anthropic-ai' }, // Anthropic generic
  { name: 'PerplexityBot', match: 'perplexitybot' }, // Perplexity crawl
  { name: 'Perplexity-User', match: 'perplexity-user' }, // Perplexity live
  { name: 'Google-Extended', match: 'google-extended' }, // Gemini training
  { name: 'GoogleOther', match: 'googleother' }, // Google AI Overviews
  { name: 'Applebot-Extended', match: 'applebot-extended' }, // Apple Intelligence
  { name: 'CCBot', match: 'ccbot' }, // Common Crawl (feeds many LLMs)
  { name: 'Meta-ExternalAgent', match: 'meta-externalagent' }, // Meta AI
  { name: 'FacebookBot', match: 'facebookbot' }, // Meta (legacy)
  { name: 'Bytespider', match: 'bytespider' }, // TikTok / Doubao
  { name: 'cohere-ai', match: 'cohere-ai' }, // Cohere
  { name: 'DuckAssistBot', match: 'duckassistbot' }, // DuckDuckGo AI
  { name: 'Amazonbot', match: 'amazonbot' }, // Alexa / Amazon AI
];

function detectAiBot(userAgent: string): string | null {
  const ua = userAgent.toLowerCase();
  for (const sig of AI_BOT_SIGNATURES) {
    if (ua.includes(sig.match)) return sig.name;
  }
  return null;
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;
  const userAgent = request.headers.get('user-agent') || '';

  // ==========================================================================
  // 0. AI crawler detection — logs to Vercel runtime AND persists to DB for
  //    long-term analytics. Both paths are fire-and-forget — if the DB
  //    POST fails, the request still completes normally.
  //
  //    - Console log  → `vercel logs --since=7d | grep ai-bot` (short-term)
  //    - DB write     → /admin/bot-analytics dashboard (long-term trends)
  // ==========================================================================
  const aiBot = detectAiBot(userAgent);
  if (aiBot) {
    console.log(
      JSON.stringify({
        event: 'ai-bot',
        bot: aiBot,
        path: pathname,
        host: hostname,
        ts: new Date().toISOString(),
      }),
    );

    // Fire-and-forget POST to /api/bot/log. We intentionally do NOT await:
    //   (a) middleware must not add latency to the request
    //   (b) a DB outage must not break the bot's ability to index us
    // The `catch` swallows errors — the console log above is our backup.
    //
    // Edge runtime limitation: we can't import prisma directly here (it's
    // Node-only). So we call our own API route, which runs on Node.
    try {
      const origin =
        request.headers.get('x-forwarded-proto') && hostname
          ? `${request.headers.get('x-forwarded-proto')}://${hostname}`
          : request.nextUrl.origin;
      void fetch(`${origin}/api/bot/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot: aiBot,
          path: pathname,
          host: hostname,
          method: request.method,
          referer: request.headers.get('referer') ?? null,
          country: request.headers.get('x-vercel-ip-country') ?? null,
          userAgent: userAgent.slice(0, 512),
        }),
        // Important: don't hold the edge worker for long
        signal: AbortSignal.timeout(2_000),
      }).catch(() => {
        /* swallow — console log above is our backup */
      });
    } catch {
      /* never block on the telemetry path */
    }
  }

  // ==========================================================================
  // 1. Alternate-domain redirect (wecc-ltd.com → weccelerate.co.il)
  //    Preserves: subdomain, path, query string. Uses 308 (permanent, method-
  //    preserving) so POST → POST and search engines treat it as canonical.
  // ==========================================================================
  const hostnameNoPort = hostname.split(':')[0].toLowerCase();
  const matchedAlt = ALTERNATE_DOMAINS.find(
    (d) => hostnameNoPort === d || hostnameNoPort.endsWith('.' + d)
  );
  if (matchedAlt) {
    // If a subdomain existed on the old host (e.g. leumit.wecc-ltd.com),
    // carry it over (→ leumit.weccelerate.co.il). Strip www as it redirects
    // to the apex.
    let sub = hostnameNoPort.slice(0, -matchedAlt.length).replace(/\.$/, '');
    if (sub === 'www') sub = '';
    const targetHost = sub ? `${sub}.${CANONICAL_DOMAIN}` : CANONICAL_DOMAIN;
    const target = new URL(
      pathname + url.search,
      `https://${targetHost}`
    );
    return NextResponse.redirect(target, 308);
  }

  // Skip any path that has a file extension (static assets)
  if (/\.\w+$/.test(pathname)) {
    return NextResponse.next();
  }

  // Skip for auth, admin, portal, login routes
  // Also skip Next.js metadata routes (opengraph-image, twitter-image, icon,
  // apple-icon) so social share previews work without being rewritten into
  // /sites/main and 404-ing.
  if (pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/portal') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/forgot-password') ||
      pathname.startsWith('/reset-password') ||
      pathname === '/opengraph-image' ||
      pathname === '/twitter-image' ||
      pathname === '/icon' ||
      pathname === '/apple-icon') {
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
  if (aiBot) {
    response.headers.set('x-ai-bot', aiBot);
  }

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
