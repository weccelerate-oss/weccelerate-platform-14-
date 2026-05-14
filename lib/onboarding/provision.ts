/**
 * Entrepreneur auto-provisioning.
 *
 * Called by /api/onboarding/entrepreneur (webhook from Google Form via
 * Zapier or any other integration). Idempotent on email — second call
 * with the same email returns the existing user, doesn't re-create.
 */

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { sendWelcomeEmail } from './welcome-email';

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

/** Generate an 8-char temp password — alphanumeric + 1 special, easy to type. */
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const specialChars = '!@#$%';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  return password;
}

export async function provisionEntrepreneur(input: ProvisionInput): Promise<ProvisionResult> {
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
        intakeFormData: (input.rawFormData ?? {}) as object,
      },
      select: { id: true },
    });
    userId = user.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `User create failed: ${msg}` };
  }

  // Audit trail.
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
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch {
    /* swallow — audit failure shouldn't block onboarding */
  }

  // Send welcome email (Resend) — fire and capture status separately.
  const emailResult = await sendWelcomeEmail({
    to: email,
    name: input.name.trim(),
    tempPassword,
  });

  if (!emailResult.ok) {
    // Log the email failure so the admin can resend manually.
    try {
      await prisma.activityLog.create({
        data: {
          action: 'user.welcome_email_failed',
          description: `Welcome email failed for ${email}: ${emailResult.error}`,
          userId,
          metadata: { email, error: emailResult.error, timestamp: new Date().toISOString() },
        },
      });
    } catch {
      /* swallow */
    }
  }

  return {
    ok: true,
    userId,
    created: true,
    emailSent: emailResult.ok,
    emailError: emailResult.ok ? undefined : emailResult.error,
  };
}
