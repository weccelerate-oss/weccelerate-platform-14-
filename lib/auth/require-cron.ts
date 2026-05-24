/**
 * requireCron — shared auth guard for every /api/cron/* route.
 *
 * Returns `null` if the caller passed the correct `Authorization: Bearer
 * $CRON_SECRET` header. Returns a Response (401 or 503) otherwise — the
 * caller should short-circuit by returning that Response.
 *
 * Why a 503 when the secret is unset: a missing CRON_SECRET means the
 * route is effectively open to the public internet. Failing closed (503)
 * is safer than allowing every cron to be invoked anonymously, which
 * would let anyone burn through our Anthropic / Resend / Perplexity
 * spend by hitting the endpoints in a loop.
 */
import { NextRequest } from 'next/server';

export function requireCron(req: NextRequest): Response | null {
  if (!process.env.CRON_SECRET) {
    return new Response('CRON_SECRET not configured', { status: 503 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  return null; // pass
}
