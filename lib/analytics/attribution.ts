/**
 * Client-side traffic-source attribution.
 *
 * Classifies where a visitor came from — an LLM (ChatGPT / Claude / Gemini /
 * Perplexity / Copilot), a search engine, a social/ad platform, a tagged
 * campaign, or direct — from the referrer + URL params, and persists it so
 * every later event (WhatsApp click, form submit) can carry the ORIGINAL
 * source even after the visitor browses around.
 *
 * Two touches are kept:
 *  - first touch (localStorage)  — "how did this person discover us"
 *  - session touch (sessionStorage) — "what brought them in this time"
 * Marketing reads the first touch; campaign optimization reads the session.
 */

export interface Attribution {
  /** Coarse bucket: llm-chatgpt | llm-claude | llm-gemini | llm-perplexity |
   *  llm-copilot | google-organic | google-ads | bing-organic | facebook |
   *  instagram | tiktok | linkedin | youtube | campaign | referral | direct */
  channel: string;
  /** Referrer host, utm_source, or '' when direct. */
  detail: string;
  /** utm_campaign when present — ties the visit to a specific ad/post. */
  campaign: string;
  /** First page seen in this visit. */
  landingPage: string;
  /** ISO timestamp of the touch. */
  ts: string;
}

const FIRST_KEY = 'wecc_attr_first';
const SESSION_KEY = 'wecc_attr_session';

/** Referrer-host → channel map. Order matters: more specific hosts first. */
const REFERRER_RULES: Array<[RegExp, string]> = [
  [/chatgpt\.com|chat\.openai\.com/i, 'llm-chatgpt'],
  [/claude\.ai/i, 'llm-claude'],
  [/gemini\.google\.com|bard\.google\.com/i, 'llm-gemini'],
  [/perplexity\.ai/i, 'llm-perplexity'],
  [/copilot\.microsoft\.com/i, 'llm-copilot'],
  [/(^|\.)google\./i, 'google-organic'],
  [/(^|\.)bing\.com/i, 'bing-organic'],
  [/duckduckgo\.com/i, 'search-other'],
  [/facebook\.com|(^|\.)fb\.com|l\.messenger\.com/i, 'facebook'],
  [/instagram\.com/i, 'instagram'],
  [/tiktok\.com/i, 'tiktok'],
  [/linkedin\.com|lnkd\.in/i, 'linkedin'],
  [/youtube\.com|youtu\.be/i, 'youtube'],
  [/(^|\.)t\.co$|twitter\.com|(^|\.)x\.com/i, 'twitter-x'],
  [/whatsapp\.com|wa\.me/i, 'whatsapp'],
];

function classify(): Attribution {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const referrer = document.referrer || '';
  let refHost = '';
  try { refHost = referrer ? new URL(referrer).hostname : ''; } catch { /* malformed referrer */ }

  const utmSource = (params.get('utm_source') || '').toLowerCase();
  const utmMedium = (params.get('utm_medium') || '').toLowerCase();
  const campaign = params.get('utm_campaign') || '';

  let channel = 'direct';
  let detail = refHost;

  if (params.get('gclid')) {
    channel = 'google-ads';
    detail = utmSource || 'gclid';
  } else if (params.get('fbclid')) {
    // fbclid alone = organic FB share; paid campaigns should also carry UTMs.
    channel = utmMedium.includes('paid') || utmMedium === 'cpc' ? 'facebook-ads' : 'facebook';
    detail = utmSource || 'fbclid';
  } else if (utmSource) {
    // Tagged link — trust the tag, normalize the big platforms.
    const known = REFERRER_RULES.find(([re]) => re.test(utmSource));
    channel = known ? known[1] : 'campaign';
    if (utmMedium === 'cpc' || utmMedium.includes('paid')) channel += channel.includes('-ads') ? '' : '-ads';
    detail = utmSource;
  } else if (refHost && !refHost.endsWith(url.hostname)) {
    const match = REFERRER_RULES.find(([re]) => re.test(refHost));
    channel = match ? match[1] : 'referral';
    detail = refHost;
  }

  return {
    channel,
    detail,
    campaign,
    landingPage: url.pathname,
    ts: new Date().toISOString(),
  };
}

function readStore(storage: Storage, key: string): Attribution | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch { return null; }
}

/**
 * Resolve (and persist) attribution for the current visitor. Safe to call on
 * every page — it only WRITES on the first call of a session / lifetime, and
 * an external touch (non-direct) upgrades a stale 'direct' first touch.
 */
export function getAttribution(): { first: Attribution; session: Attribution } {
  const current = classify();

  let session = readStore(sessionStorage, SESSION_KEY);
  if (!session) {
    session = current;
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* quota/private mode */ }
  }

  let first = readStore(localStorage, FIRST_KEY);
  if (!first || (first.channel === 'direct' && current.channel !== 'direct')) {
    first = first && first.channel !== 'direct' ? first : current;
    try { localStorage.setItem(FIRST_KEY, JSON.stringify(first)); } catch { /* quota/private mode */ }
  }

  return { first, session };
}

/** Flat key/value view of the session touch, for event metadata payloads. */
export function attributionMetadata(): Record<string, string> {
  try {
    const { first, session } = getAttribution();
    return {
      channel: session.channel,
      channelDetail: session.detail,
      campaign: session.campaign,
      firstChannel: first.channel,
      landingPage: session.landingPage,
    };
  } catch {
    return {};
  }
}
