/**
 * POST /api/admin/invite-veterans
 *
 * One-off bulk tool: migrate the Smoove "תוכן העשרה ליזמים" alumni list into
 * the new portal. For each valid row it provisions an ENTREPRENEUR account
 * (idempotent on email) and sends the SHORT "veteran" welcome email telling
 * them their course content moved to the portal.
 *
 * SECURITY:
 *   Header `x-onboarding-secret` must match env `ONBOARDING_WEBHOOK_SECRET`
 *   (same shared secret as the onboarding webhook). Fail-closed if unset.
 *
 * SAFETY:
 *   Defaults to DRY RUN. It will NOT create accounts or send email unless you
 *   pass `?dryRun=false` explicitly. Dry run reports exactly who would be
 *   emailed, who already exists, and what was skipped.
 *
 * BODY: raw CSV text (content-type text/csv or text/plain). Columns:
 *   שם משפחה, שם פרטי, הצטרפות לרשימה, טלפון נייד, מייל
 *
 * CURL (dry run — safe):
 *   curl -X POST "https://weccelerate.co.il/api/admin/invite-veterans?dryRun=true" \
 *     -H "x-onboarding-secret: $ONBOARDING_WEBHOOK_SECRET" \
 *     -H "content-type: text/csv" \
 *     --data-binary @"ListId_938978_ListName_תוכןהעשרהליזמים.csv"
 *
 * CURL (REAL send):
 *   ...same but ?dryRun=false
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { provisionEntrepreneur } from '@/lib/onboarding/provision';
import { parseVeteransCsv } from '@/lib/onboarding/parse-veterans-csv';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// ~137 sends × (~1s each: bcrypt + insert + Resend) needs a generous ceiling.
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  // 1. Auth — fail-closed.
  const expected = process.env.ONBOARDING_WEBHOOK_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'Server misconfigured: ONBOARDING_WEBHOOK_SECRET missing' },
      { status: 500 },
    );
  }
  if (req.headers.get('x-onboarding-secret') !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Read the CSV from the raw body.
  const csv = await req.text();
  if (!csv || !csv.trim()) {
    return NextResponse.json(
      { ok: false, error: 'Empty body. POST the CSV as text/csv.' },
      { status: 400 },
    );
  }

  // 3. Parse + clean.
  const { valid, skipped } = parseVeteransCsv(csv);

  // dryRun defaults to TRUE. Only an explicit ?dryRun=false sends for real.
  const dryRun = req.nextUrl.searchParams.get('dryRun') !== 'false';

  // 4. Which of these already have accounts? (Both modes report this.)
  const existingRows = await prisma.user.findMany({
    where: { email: { in: valid.map((v) => v.email) } },
    select: { email: true },
  });
  const existing = new Set(existingRows.map((r) => r.email));
  const toCreate = valid.filter((v) => !existing.has(v.email));

  // 5. DRY RUN — report and stop.
  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      summary: {
        validInCsv: valid.length,
        alreadyHaveAccount: existing.size,
        wouldCreateAndEmail: toCreate.length,
        skipped: skipped.length,
      },
      wouldEmail: toCreate.map((v) => v.email),
      alreadyHaveAccount: [...existing],
      skipped,
    });
  }

  // 6. REAL SEND — provision + email each new entrant, sequentially so we
  //    don't burst Resend and so one failure doesn't abort the rest.
  const sent: string[] = [];
  const failed: { email: string; error: string }[] = [];
  const skippedExisting: string[] = [...existing];

  for (const v of toCreate) {
    try {
      const result = await provisionEntrepreneur({
        name: v.name,
        email: v.email,
        source: 'veteran_migration',
        emailVariant: 'veteran',
      });
      if (result.ok && result.emailSent) {
        sent.push(v.email);
      } else if (result.ok && !result.emailSent) {
        failed.push({ email: v.email, error: result.emailError ?? 'account created but email not sent' });
      } else {
        failed.push({ email: v.email, error: result.error ?? 'provision failed' });
      }
    } catch (err) {
      failed.push({ email: v.email, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun: false,
    summary: {
      validInCsv: valid.length,
      alreadyHadAccount: skippedExisting.length,
      attempted: toCreate.length,
      sent: sent.length,
      failed: failed.length,
      skippedFromCsv: skipped.length,
    },
    sent,
    failed,
    alreadyHadAccount: skippedExisting,
    skipped,
  });
}
