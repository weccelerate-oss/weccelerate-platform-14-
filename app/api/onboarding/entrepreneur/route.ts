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
import crypto from 'crypto';
import { provisionEntrepreneur, OnboardingBodySchema } from '@/lib/onboarding/provision';
import { runSpamFilter } from '@/lib/leads/spam-filter';
import { checkRateLimit } from '@/lib/leads/rate-limit';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Re-exported from provision.ts so callers have a single source of truth.
const BodySchema = OnboardingBodySchema;

/** sha256(secret).slice(0,8) — irreversible fingerprint safe to write to logs. */
function fingerprintSecret(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 8);
}

/** Hash PII so the audit log can correlate without storing the raw value. */
function hashPii(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex').slice(0, 16);
}

/** Extract client IP from common proxy headers (Vercel, Cloudflare, nginx). */
function extractIp(req: NextRequest): string | null {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) {
    // x-forwarded-for can be a comma-separated chain; the original client is first.
    const first = fwd.split(',')[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return null;
}

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
    // Audit the auth failure so the admin can see misconfigured
    // integrations (wrong secret, wrong URL) in the webhook activity
    // panel — otherwise these would fail silently.
    try {
      await prisma.activityLog.create({
        data: {
          action: 'onboarding.unauthorized',
          description: `Onboarding webhook rejected: missing/wrong x-onboarding-secret`,
          metadata: {
            // SECURITY: never log the literal prefix — that's enough to
            // start guessing the real secret. Store an sha256 fingerprint
            // + length so the admin can still tell two wrong secrets apart.
            providedFingerprint: provided ? fingerprintSecret(provided) : null,
            providedLength: provided ? provided.length : 0,
            userAgent: req.headers.get('user-agent') ?? null,
            referer: req.headers.get('referer') ?? null,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch {
      /* swallow */
    }
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
    // Same logic as auth: log validation errors so the admin sees a
    // mis-mapped Apps Script that's sending the wrong field names.
    try {
      await prisma.activityLog.create({
        data: {
          action: 'onboarding.validation_failed',
          description: 'Onboarding webhook validation failed',
          metadata: {
            issues: parsed.error.flatten(),
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch {
      /* swallow */
    }
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
    //
    // PRIVACY: high-confidence spam (score >= 80) is almost certainly a
    // bot or scraper, so we don't keep their raw PII indefinitely — we
    // store sha256-truncated fingerprints instead. This still lets the
    // admin de-dup repeat offenders without giving us a giant directory
    // of bot-controlled mailboxes.
    // TODO(maintenance): add a scheduled job that purges spam_blocked
    // rows older than 30 days regardless of hashing.
    if (!data.dryRun) {
      const highConfidence = spam.score >= 80;
      try {
        await prisma.activityLog.create({
          data: {
            action: 'onboarding.spam_blocked',
            description: highConfidence
              ? `Onboarding spam blocked (score ${spam.score}, PII hashed)`
              : `Onboarding spam blocked (score ${spam.score}): ${data.email}`,
            metadata: {
              email: highConfidence ? null : data.email,
              emailHash: highConfidence ? hashPii(data.email) : null,
              name: highConfidence ? null : data.name,
              phone: highConfidence ? null : data.phone || null,
              phoneHash: highConfidence && data.phone ? hashPii(data.phone) : null,
              company: highConfidence ? null : data.company || null,
              piiHashed: highConfidence,
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

  // 3b. Rate limit — runs after spam to avoid wasting blocklist queries on
  // obvious junk. Blocks abusive IPs / emails that bypass the heuristic
  // filter via slow drip.
  const clientIp = extractIp(req);
  try {
    const rate = await checkRateLimit({ email: data.email, ip: clientIp });
    if (!rate.allowed) {
      // Same 422 semantics as the spam path: don't tell the bot it can retry.
      if (!data.dryRun) {
        try {
          await prisma.activityLog.create({
            data: {
              action: 'onboarding.spam_blocked',
              description: `Onboarding rate-limited (${rate.reason}): ${rate.detail}`,
              metadata: {
                email: data.email,
                reason: rate.reason,
                detail: rate.detail,
                source: data.source ?? 'webhook',
              },
            },
          });
        } catch {
          /* swallow */
        }
      }
      return NextResponse.json(
        { ok: false, error: 'Submission rejected', reason: rate.reason },
        { status: 422 },
      );
    }
  } catch {
    // Rate-limit infra down — fail open rather than block legitimate signups.
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
  // If the spam filter flagged the submission as borderline (31-60), still
  // create the account but mark `mustReview` so the admin can audit it.
  const result = await provisionEntrepreneur({
    name: data.name,
    email: data.email,
    phone: data.phone ?? undefined,
    company: data.company ?? undefined,
    message: data.message ?? undefined,
    rawFormData: data.raw,
    source: data.source ?? 'webhook',
    mustReview: spam.decision === 'review',
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
