/**
 * IndexNow — instant URL submission to Bing + Yandex (and their AI engines).
 *
 * WHY THIS EXISTS (GEO/AEO ANGLE):
 *   ChatGPT Search runs on Bing's index. Perplexity runs on Bing + Google.
 *   Gemini uses Google's index. If our guides/pages aren't indexed quickly,
 *   LLM answers quote stale data. IndexNow pushes new/updated URLs to Bing
 *   and Yandex in seconds instead of waiting for crawlers (days-weeks).
 *
 * HOW IT WORKS:
 *   1. We publish a hex key at `public/${INDEXNOW_KEY}.txt` (the file contents
 *      MUST equal the key — this is how Bing verifies we own the domain).
 *   2. We POST {host, key, keyLocation, urlList} to api.indexnow.org.
 *   3. Bing & Yandex share submissions, so one call indexes both.
 *   4. There is no Google IndexNow — Google uses Google Search Console /
 *      URL Inspection / Indexing API. For Google we rely on sitemap + GSC.
 *
 * KEY ROTATION:
 *   - Default key below is committed to git. It's NOT a secret (the same key
 *     is served publicly at /${KEY}.txt, that's the whole verification model).
 *   - To rotate: set INDEXNOW_KEY env var to a new hex string (8–128 chars,
 *     [a-f0-9] only) and rename `public/<old>.txt` to `public/<new>.txt` with
 *     the new key as its contents. Both can coexist while Bing re-verifies.
 *
 * USAGE:
 *   import { submitUrls } from '@/lib/seo/indexnow';
 *   await submitUrls(['https://weccelerate.co.il/guides/rayon-le-startup']);
 *
 *   Or via the admin endpoint: POST /api/indexnow/submit
 *   with header `x-admin-token: $ADMIN_TOKEN` and body { urls: [...] }.
 *
 * @see https://www.indexnow.org/documentation
 * @see https://www.bing.com/indexnow/getstarted
 */

import { SITE_CONFIG } from '@/lib/seo';

/**
 * IndexNow verification key.
 *
 * Default is a committed value (public by design — see file comment).
 * Override with INDEXNOW_KEY env var in Vercel/prod if rotating.
 *
 * IMPORTANT: whatever value this resolves to, `public/${KEY}.txt` must exist
 * and contain the same string. A key with no matching file causes silent
 * submission failures (Bing returns 403).
 */
export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY ?? 'a7f3c912b8e04d569f1a2c3b4d5e6f78';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow';

/** Derive host (no protocol, no trailing slash) from SITE_CONFIG.url. */
function getHost(): string {
  return new URL(SITE_CONFIG.url).host;
}

function getKeyLocation(): string {
  return `${SITE_CONFIG.url.replace(/\/$/, '')}/${INDEXNOW_KEY}.txt`;
}

export interface SubmitOptions {
  /** Abort the fetch after this many ms. Default: 10s. */
  timeoutMs?: number;
  /** If true, return the raw Response; otherwise a summarized result. */
  raw?: boolean;
}

export interface SubmitResult {
  ok: boolean;
  status: number;
  submitted: number;
  skipped: number;
  message: string;
}

/**
 * Validate that every URL belongs to our domain — IndexNow rejects
 * cross-domain submissions with 422. Filtering client-side saves a round-trip.
 */
function filterValidUrls(urls: string[]): { valid: string[]; invalid: string[] } {
  const host = getHost();
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const raw of urls) {
    try {
      const parsed = new URL(raw);
      // Accept the apex + any subdomain on our host (leumit., biz., landing.)
      if (parsed.host === host || parsed.host.endsWith(`.${host}`)) {
        valid.push(parsed.toString());
      } else {
        invalid.push(raw);
      }
    } catch {
      invalid.push(raw);
    }
  }
  return { valid, invalid };
}

/**
 * Submit one or more URLs to IndexNow (Bing + Yandex).
 *
 * Returns a structured result; never throws. Designed to be fire-and-forget
 * from build hooks / admin endpoints — don't let a flaky index service break
 * your deploys.
 */
export async function submitUrls(
  urls: string[],
  options: SubmitOptions = {},
): Promise<SubmitResult> {
  const { timeoutMs = 10_000 } = options;

  if (urls.length === 0) {
    return { ok: true, status: 200, submitted: 0, skipped: 0, message: 'no urls' };
  }

  const { valid, invalid } = filterValidUrls(urls);

  if (valid.length === 0) {
    return {
      ok: false,
      status: 0,
      submitted: 0,
      skipped: invalid.length,
      message: `all ${invalid.length} urls rejected (cross-domain or malformed)`,
    };
  }

  // IndexNow caps each request at 10,000 URLs. Chunk defensively.
  const CHUNK_SIZE = 9_000;
  let totalSubmitted = 0;
  let lastStatus = 0;
  let lastMessage = '';

  for (let i = 0; i < valid.length; i += CHUNK_SIZE) {
    const chunk = valid.slice(i, i + CHUNK_SIZE);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: getHost(),
          key: INDEXNOW_KEY,
          keyLocation: getKeyLocation(),
          urlList: chunk,
        }),
        signal: controller.signal,
      });

      lastStatus = res.status;
      // IndexNow returns 200 (accepted), 202 (accepted, pending), 400
      // (invalid), 403 (key mismatch), 422 (invalid urls), 429 (rate limit).
      if (res.status === 200 || res.status === 202) {
        totalSubmitted += chunk.length;
        lastMessage = 'accepted';
      } else {
        lastMessage = `IndexNow rejected chunk: HTTP ${res.status}`;
        return {
          ok: false,
          status: res.status,
          submitted: totalSubmitted,
          skipped: valid.length - totalSubmitted + invalid.length,
          message: lastMessage,
        };
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown error';
      return {
        ok: false,
        status: lastStatus,
        submitted: totalSubmitted,
        skipped: valid.length - totalSubmitted + invalid.length,
        message: `fetch failed: ${msg}`,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    ok: true,
    status: lastStatus || 200,
    submitted: totalSubmitted,
    skipped: invalid.length,
    message: invalid.length > 0 ? `${invalid.length} urls skipped (off-domain)` : lastMessage,
  };
}

/**
 * Convenience: submit a single URL. Use this from content-publish hooks.
 */
export function pingOne(url: string, options?: SubmitOptions): Promise<SubmitResult> {
  return submitUrls([url], options);
}
