/**
 * POST /api/onboarding/entrepreneur
 *
 * Webhook that turns a Google-Form (or any) submission into a fully-
 * provisioned entrepreneur account. Wire it from Zapier / Google Apps
 * Script / Make / cURL — anything that can POST JSON.
 *
 * SECURITY:
 *   Header `x-onboarding-secret` must match env `ONBOARDING_WEBHOOK_SECRET`.
 *   Without that, anyone could create accounts.
 *
 * REQUEST BODY (JSON):
 *   {
 *     "name":    "ישראלה ישראלי",        // required
 *     "email":   "x@example.com",        // required
 *     "phone":   "+972-50-123-4567",     // optional but recommended
 *     "company": "MyStartup",            // optional
 *     "message": "מה הם רוצים מאיתנו",   // optional
 *     "source":  "google_form",          // optional, defaults to 'webhook'
 *     "raw":     { ... }                 // optional, full form payload kept verbatim
 *   }
 *
 * RESPONSE 200:
 *   { ok: true, userId, created, emailSent }
 *
 * RESPONSE 401: bad secret.
 * RESPONSE 400: validation error.
 * RESPONSE 422: spam filter dropped the submission (returned silently so
 *               a misbehaving integration won't keep retrying).
 *
 * CURL EXAMPLE:
 *   curl -X POST https://weccelerate.co.il/api/onboarding/entrepreneur \
 *     -H "Content-Type: application/json" \
 *     -H "x-onboarding-secret: $ONBOARDING_WEBHOOK_SECRET" \
 *     -d '{"name":"Test User","email":"test@example.com","phone":"+972501234567"}'
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { provisionEntrepreneur } from '@/lib/onboarding/provision';
import { runSpamFilter } from '@/lib/leads/spam-filter';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BodySchema = z.object({
  name: z.string().min(2, 'name too short').max(200),
  email: z.string().email('invalid email').max(320),
  phone: z.string().max(40).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  message: z.string().max(4000).optional().nullable(),
  source: z.string().max(40).optional(),
  raw: z.record(z.string(), z.unknown()).optional(),
  /** If true, run the auth + spam filter but skip user creation and email. */
  dryRun: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  // 1. Auth check — never run without the shared secret.
  const expected = process.env.ONBOARDING_WEBHOOK_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'Server misconfigured: ONBOARDING_WEBHOOK_SECRET missing' },
      { status: 500 },
    );
  }
  const provided = req.headers.get('x-onboarding-secret');
  if (provided !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse body.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // 3. Spam filter — reuse the lead-form filter so onboarding can't be
  // abused as a spam vector either. No honeypot/timestamp on the webhook
  // path, so behavioral checks degrade gracefully and we rely on the
  // email/name/phone heuristics.
  const spam = runSpamFilter({
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    message: data.message,
    site: 'main',
  });

  if (spam.decision === 'drop') {
    // Log to the same audit log as lead spam — keeps the dashboard simple.
    // Skip the log entirely on dry-run so testing doesn't pollute the audit.
    if (!data.dryRun) {
      try {
        await prisma.activityLog.create({
          data: {
            action: 'onboarding.spam_blocked',
            description: `Onboarding spam blocked (score ${spam.score}): ${data.email}`,
            metadata: {
              email: data.email,
              name: data.name,
              phone: data.phone || null,
              company: data.company || null,
              spamScore: spam.score,
              spamCodes: spam.codes,
              spamReasons: spam.reasons,
              source: data.source ?? 'webhook',
            },
          },
        });
      } catch {
        /* swallow */
      }
    }
    // 422 so the integration shows "rejected" instead of retrying as if
    // it were a 500.
    return NextResponse.json(
      { ok: false, error: 'Submission rejected', reason: 'spam_filter', spamScore: spam.score, spamCodes: spam.codes },
      { status: 422 },
    );
  }

  // 4. Dry-run — connectivity check passed, exit before touching the DB.
  if (data.dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      spamScore: spam.score,
      spamDecision: spam.decision,
      message: 'dry-run passed: auth ok, spam filter ok, would have provisioned',
    });
  }

  // 5. Provision (idempotent on email).
  const result = await provisionEntrepreneur({
    name: data.name,
    email: data.email,
    phone: data.phone ?? undefined,
    company: data.company ?? undefined,
    message: data.message ?? undefined,
    rawFormData: data.raw,
    source: data.source ?? 'webhook',
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error ?? 'Provisioning failed' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    userId: result.userId,
    created: result.created,
    emailSent: result.emailSent,
    emailError: result.emailError,
    spamScore: spam.score,
    spamDecision: spam.decision,
  });
}

// GET = simple health-check so the integrator can verify the URL.
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: 'POST /api/onboarding/entrepreneur',
    auth: 'Header: x-onboarding-secret',
    requiredFields: ['name', 'email'],
    optionalFields: ['phone', 'company', 'message', 'source', 'raw'],
  });
}
