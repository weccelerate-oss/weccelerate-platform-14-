import type { NextRequest } from 'next/server';

/**
 * CSRF guard for portal write endpoints.
 *
 * Extracted from app/api/portal/journey/answer/route.ts, where it had been
 * copy-pasted into three sibling routes. Behaviour is unchanged.
 *
 * When neither Origin nor Host is present we fall back to Referer, and a
 * request with no Referer at all is allowed — same-origin fetches from older
 * browsers and server-side calls land here, and the session check behind this
 * is the real authorization.
 */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');

  if (!origin || !host) {
    const referer = req.headers.get('referer');
    if (!referer) return true;
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
