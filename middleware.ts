import { NextRequest, NextResponse, after } from 'next/server';

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

// Referer hostnames used by LLM web UIs. When a *real user* (not a bot) lands
// on the site with one of these in the Referer header, it means they clicked
// through from an LLM answer that cited us. This is the conversion event —
// a citation that actually drove a visit.
const LLM_REFERER_PATTERNS: ReadonlyArray<{ name: string; match: RegExp }> = [
  { name: 'ChatGPT', match: /(^|\.)(chat\.openai\.com|chatgpt\.com)$/i },
  { name: 'Perplexity', match: /(^|\.)perplexity\.ai$/i },
  { name: 'Claude', match: /(^|\.)(claude\.ai|anthropic\.com)$/i },
  { name: 'Gemini', match: /(^|\.)(gemini\.google\.com|bard\.google\.com)$/i },
  { name: 'Copilot', match: /(^|\.)(copilot\.microsoft\.com|bing\.com)$/i },
  { name: 'You.com', match: /(^|\.)you\.com$/i },
  { name: 'DuckDuckGo-AI', match: /(^|\.)duckduckgo\.com$/i },
  { name: 'Phind', match: /(^|\.)phind\.com$/i },
];

function detectLlmReferral(referer: string | null): string | null {
  if (!referer) return null;
  try {
    const host = new URL(referer).hostname;
    for (const pat of LLM_REFERER_PATTERNS) {
      if (pat.match.test(host)) return pat.name;
    }
  } catch {
    // Malformed Referer header — ignore.
  }
  return null;
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;
  const userAgent = request.headers.get('user-agent') || '';

  // ==========================================================================
  // 0. AI-related visit detection — two distinct events:
  //    - "crawl"    : an AI bot fetched the page (e.g. ChatGPT-User reading
  //                   the page mid-answer)
  //    - "referral" : a real user clicked through from an LLM answer
  //                   (Referer hostname == chatgpt.com / perplexity.ai / …)
  //    Both persist to bot_visits via /api/bot/log; the dashboard splits them.
  // ==========================================================================
  const aiBot = detectAiBot(userAgent);
  const referer = request.headers.get('referer');
  // Only count referrals when the visitor is NOT itself a bot — otherwise we'd
  // attribute crawler hops between LLM-controlled pages as user traffic.
  const llmReferral = !aiBot ? detectLlmReferral(referer) : null;

  if (aiBot || llmReferral) {
    const kind = aiBot ? 'crawl' : 'referral';
    const botLabel = aiBot ?? llmReferral!;
    const country = request.headers.get('x-vercel-ip-country') ?? null;
    const region = request.headers.get('x-vercel-ip-country-region') ?? null;
    // Vercel URL-encodes city names with spaces ("Tel%20Aviv"); decode safely.
    const rawCity = request.headers.get('x-vercel-ip-city');
    let city: string | null = null;
    if (rawCity) {
      try {
        city = decodeURIComponent(rawCity);
      } catch {
        city = rawCity;
      }
    }

    console.log(
      JSON.stringify({
        event: kind === 'crawl' ? 'ai-bot' : 'llm-referral',
        bot: botLabel,
        kind,
        path: pathname,
        host: hostname,
        country,
        city,
        ts: new Date().toISOString(),
      }),
    );

    // Persist via /api/bot/log. We use `after()` (Next.js 15+) so the
    // request to /api/bot/log runs AFTER our response is sent to the bot —
    // zero added latency, but the edge worker stays alive until the fetch
    // resolves. A plain `void fetch(...)` was being killed by Vercel
    // before the request reached our API route.
    //
    // We can't import prisma directly here (Edge runtime, Node-only),
    // hence the indirection through the Node-runtime route handler.
    const origin =
      request.headers.get('x-forwarded-proto') && hostname
        ? `${request.headers.get('x-forwarded-proto')}://${hostname}`
        : request.nextUrl.origin;
    const logPayload = JSON.stringify({
      bot: botLabel,
      kind,
      path: pathname,
      host: hostname,
      method: request.method,
      referer: referer ?? null,
      country,
      region,
      city,
      userAgent: userAgent.slice(0, 512),
    });
    after(async () => {
      try {
        await fetch(`${origin}/api/bot/log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: logPayload,
          signal: AbortSignal.timeout(5_000),
        });
      } catch {
        /* swallow — console log above is our backup */
      }
    });
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
      // /leumit/ is a static landing page served from public/leumit/.
      // Without this skip it would get rewritten to /sites/main/leumit/ → 404.
      pathname === '/leumit' ||
      pathname.startsWith('/leumit/') ||
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
