/**
 * GET /api/admin/preview-welcome-email
 *
 * Renders + sends the entrepreneur welcome email to a chosen address so
 * the operator can preview the actual design as it lands in an inbox.
 *
 * Does NOT create a User, does NOT touch the DB. Pure email send.
 *
 * SECURITY
 *   Uses the same shared secret as the onboarding webhook (header
 *   `x-onboarding-secret` OR `?secret=` query param). No public access.
 *
 * USAGE
 *   curl 'https://weccelerate.co.il/api/admin/preview-welcome-email?to=you@example.com' \
 *     -H "x-onboarding-secret: $ONBOARDING_WEBHOOK_SECRET"
 *
 *   or browser-friendly:
 *   https://weccelerate.co.il/api/admin/preview-welcome-email
 *     ?to=you@example.com&secret=...
 *
 * Optional query params: name, tempPassword (defaults shown below).
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/onboarding/welcome-email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const expected = process.env.ONBOARDING_WEBHOOK_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'ONBOARDING_WEBHOOK_SECRET not configured' },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const provided =
    req.headers.get('x-onboarding-secret') ?? url.searchParams.get('secret');
  if (provided !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const to = url.searchParams.get('to');
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json(
      { ok: false, error: 'Missing or invalid ?to= email address' },
      { status: 400 },
    );
  }

  const name = url.searchParams.get('name') ?? 'מאור ארגמן';
  // Demo password — clearly fake so nobody confuses it with a real one.
  const tempPassword =
    url.searchParams.get('tempPassword') ?? 'DemoPass-9X4q!';

  const result = await sendWelcomeEmail({ to, name, tempPassword });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error ?? 'Resend send failed' },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    sentTo: to,
    note: 'A preview of the welcome email was sent. Check the inbox (and spam folder).',
  });
}
