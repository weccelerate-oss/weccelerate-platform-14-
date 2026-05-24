/**
 * Entrepreneur auto-provisioning.
 *
 * Called by /api/onboarding/entrepreneur (webhook from Google Form via
 * Zapier or any other integration). Idempotent on email — second call
 * with the same email returns the existing user, doesn't re-create.
 */

import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { sendWelcomeEmail } from './welcome-email';
import { generateTempPassword } from '@/lib/security/generate-password';

/**
 * Schema for the public onboarding webhook body. Owned here (not in the
 * route) so callers that hit `provisionEntrepreneur` directly (tests,
 * future internal API) validate against the same contract.
 */
export const OnboardingBodySchema = z.object({
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

export type OnboardingBody = z.infer<typeof OnboardingBodySchema>;

export interface ProvisionInput {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message?: string | null;
  /** Verbatim payload from the form — stored for the admin's reference. */
  rawFormData?: Record<string, unknown>;
  /** Tag the source so we can audit later. */
  source?: string;
  /** Set when the spam filter returned `decision: 'review'` — provision the
   *  account but flag it in the audit log + intakeFormData so the admin can
   *  audit the borderline submission. (Schema has no boolean column for
   *  this; lives in metadata until the field is added.) */
  mustReview?: boolean;
}

export interface ProvisionResult {
  ok: boolean;
  userId?: string;
  /** True when a brand-new account was created (vs. matched an existing one). */
  created?: boolean;
  /** Email status — separate from user creation so admin sees if the welcome failed. */
  emailSent?: boolean;
  emailError?: string;
  error?: string;
}

export async function provisionEntrepreneur(input: ProvisionInput): Promise<ProvisionResult> {
  // Validate input — same Zod schema used by the public route, applied
  // again here to defend internal callers from passing partially-filled
  // objects. Throws-but-recovers so a misshapen payload returns a clean
  // ProvisionResult instead of crashing.
  const validation = OnboardingBodySchema.safeParse({
    name: input.name,
    email: input.email,
    phone: input.phone,
    company: input.company,
    message: input.message,
    source: input.source,
    raw: input.rawFormData,
  });
  if (!validation.success) {
    return {
      ok: false,
      error: `Invalid provision input: ${validation.error.issues.map((i) => i.message).join(', ')}`,
    };
  }

  const email = input.email.trim().toLowerCase();

  // Idempotency check — same email submitted twice shouldn't error or
  // overwrite. Common case: the same lead fills the form twice, or Zapier
  // retries.
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, mustChangePassword: true, isActive: true },
  });

  if (existing) {
    return {
      ok: true,
      userId: existing.id,
      created: false,
      emailSent: false,
      // Tell the caller why we didn't email — caller may want to manually
      // resend the welcome via /admin if the existing user got stuck.
      emailError: 'User already exists — welcome email NOT resent automatically. Use admin → reset password to resend.',
    };
  }

  // Create the user with role=ENTREPRENEUR + mustChangePassword=true so the
  // portal forces the password change on first login.
  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  // Pack `mustReview` into intakeFormData since there's no dedicated column.
  // Keys are prefixed with `_` so they don't collide with real form fields.
  const intakePayload: Record<string, unknown> = {
    ...(input.rawFormData ?? {}),
    ...(input.mustReview ? { _mustReview: true, _flaggedAt: new Date().toISOString() } : {}),
  };

  let userId: string;
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: input.name.trim(),
        password: hashedPassword,
        phone: input.phone || null,
        company: input.company || null,
        role: 'ENTREPRENEUR',
        isActive: true,
        mustChangePassword: true,
        provisionedAt: new Date(),
        provisionedSource: input.source ?? 'webhook',
        intakeFormData: intakePayload,
      },
      select: { id: true },
    });
    userId = user.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `User create failed: ${msg}` };
  }

  // Audit trail. We intentionally do NOT swallow errors here anymore — an
  // audit-log write that fails silently is the exact bug class that turned
  // "auto-provisioned via webhook" into an unverifiable status (AO-7).
  try {
    await prisma.activityLog.create({
      data: {
        action: 'user.provisioned',
        description: `Entrepreneur ${email} auto-provisioned from ${input.source ?? 'webhook'}`,
        userId,
        metadata: {
          source: input.source ?? 'webhook',
          name: input.name,
          email,
          phone: input.phone || null,
          company: input.company || null,
          mustReview: input.mustReview ?? false,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    // Log to console so the failure is visible in server logs even though
    // we don't fail the request — the user is already created and we
    // shouldn't roll back over an audit issue.
    console.error('[provisionEntrepreneur] audit log (user.provisioned) failed:', err);
  }

  // Send welcome email (Resend) — fire and capture status separately.
  const emailResult = await sendWelcomeEmail({
    to: email,
    name: input.name.trim(),
    tempPassword,
  });

  // Audit the email outcome either way — the admin needs to see who
  // actually received credentials in their inbox vs. who needs a
  // manual resend.
  try {
    await prisma.activityLog.create({
      data: {
        action: emailResult.ok ? 'user.welcome_email_sent' : 'user.welcome_email_failed',
        description: emailResult.ok
          ? `Welcome email sent to ${email} (source: ${input.source ?? 'webhook'})`
          : `Welcome email failed for ${email}: ${emailResult.error}`,
        userId,
        metadata: {
          email,
          source: input.source ?? 'webhook',
          error: emailResult.ok ? null : emailResult.error,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    // Same rationale as above — surface the failure in server logs.
    console.error('[provisionEntrepreneur] audit log (welcome_email outcome) failed:', err);
  }

  return {
    ok: true,
    userId,
    created: true,
    emailSent: emailResult.ok,
    emailError: emailResult.ok ? undefined : emailResult.error,
  };
}
