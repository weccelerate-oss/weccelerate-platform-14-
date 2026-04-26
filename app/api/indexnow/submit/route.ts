/**
 * POST /api/indexnow/submit
 *
 * Admin-gated endpoint that forwards one or more URLs to IndexNow
 * (Bing + Yandex — which feeds ChatGPT Search, Perplexity, and Copilot).
 *
 * AUTH:
 *   Header `x-admin-token` must match `process.env.ADMIN_TOKEN`.
 *   This prevents random visitors from flooding our IndexNow quota.
 *
 * REQUEST:
 *   POST /api/indexnow/submit
 *   x-admin-token: $ADMIN_TOKEN
 *   { "urls": ["https://weccelerate.co.il/guides/rayon-le-startup", ...] }
 *
 * RESPONSE:
 *   200 { ok, status, submitted, skipped, message }
 *   401 Unauthorized — missing or wrong admin token
 *   400 Bad Request  — invalid body
 *
 * USAGE FROM CLI (after publishing a new guide):
 *   curl -X POST https://weccelerate.co.il/api/indexnow/submit \
 *     -H "x-admin-token: $ADMIN_TOKEN" \
 *     -H "Content-Type: application/json" \
 *     -d '{"urls":["https://weccelerate.co.il/guides/new-slug"]}'
 */

import { NextRequest, NextResponse } from 'next/server';
import { submitUrls } from '@/lib/seo/indexnow';

// Do not cache — always hit the handler.
export const dynamic = 'force-dynamic';

function unauthorized(reason: string) {
  return NextResponse.json({ ok: false, error: 'unauthorized', reason }, { status: 401 });
}

function badRequest(reason: string) {
  return NextResponse.json({ ok: false, error: 'bad_request', reason }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-admin-token');
  const expected = process.env.ADMIN_TOKEN;

  if (!expected) {
    // Defensive: refuse to serve when ADMIN_TOKEN is unset, rather than
    // running wide open. Ops must configure this explicitly.
    return unauthorized('ADMIN_TOKEN is not configured on the server');
  }
  if (!token || token !== expected) {
    return unauthorized('invalid or missing x-admin-token header');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('invalid JSON body');
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !Array.isArray((body as { urls?: unknown }).urls)
  ) {
    return badRequest('expected { urls: string[] }');
  }

  const urls = (body as { urls: unknown[] }).urls.filter(
    (u): u is string => typeof u === 'string' && u.length > 0,
  );

  if (urls.length === 0) {
    return badRequest('urls array is empty or contains no strings');
  }
  if (urls.length > 10_000) {
    return badRequest('IndexNow accepts at most 10,000 URLs per request');
  }

  const result = await submitUrls(urls);

  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

/**
 * GET /api/indexnow/submit — health check only. Does not submit.
 * Useful for verifying the endpoint is live and ADMIN_TOKEN is configured.
 */
export async function GET(req: NextRequest) {
  const token = req.headers.get('x-admin-token');
  const expected = process.env.ADMIN_TOKEN;

  if (!expected) {
    return NextResponse.json(
      { ok: false, configured: false, message: 'ADMIN_TOKEN not set' },
      { status: 503 },
    );
  }
  if (token !== expected) {
    return unauthorized('invalid or missing x-admin-token header');
  }
  return NextResponse.json({
    ok: true,
    configured: true,
    endpoint: 'POST /api/indexnow/submit',
    indexnowKeyPresent: Boolean(process.env.INDEXNOW_KEY),
    message: 'ready',
  });
}
