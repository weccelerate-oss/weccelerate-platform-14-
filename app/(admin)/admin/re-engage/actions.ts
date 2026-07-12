/**
 * Re-engagement batch: send every ENTREPRENEUR who never logged in a fresh
 * temp password + the "veteran" welcome email ("your course content moved
 * to the portal"). One-click from /admin/re-engage, admin-gated, idempotent:
 * a user who already got a re-engage email in the last 30 days is skipped,
 * so re-running after a partial failure never double-sends.
 */

'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateTempPassword } from '@/lib/security/generate-password';
import { sendWelcomeEmail } from '@/lib/onboarding/welcome-email';

const RE_ENGAGE_ACTION = 'admin.user.re_engaged';

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }
  return session.user as { id?: string; email?: string };
}

export interface ReEngageResult {
  eligible: number;
  sent: number;
  skippedRecentlySent: number;
  failed: Array<{ email: string; error: string }>;
}

/** Who would receive the batch right now (page preview + the actual send share this). */
export async function getEligibleUsers() {
  const recentlyEngaged = await prisma.activityLog.findMany({
    where: {
      action: RE_ENGAGE_ACTION,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) },
    },
    select: { userId: true },
  });
  const recentIds = new Set(recentlyEngaged.map((r: { userId: string | null }) => r.userId).filter(Boolean));

  const users = await prisma.user.findMany({
    where: { role: 'ENTREPRENEUR', isActive: true, lastLoginAt: null },
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: 'asc' },
  });

  return {
    toSend: users.filter((u: { id: string }) => !recentIds.has(u.id)),
    skippedRecentlySent: users.length - users.filter((u: { id: string }) => !recentIds.has(u.id)).length,
  };
}

export async function reEngageBatchAction(): Promise<ReEngageResult> {
  const actor = await verifyAdmin();
  const { toSend, skippedRecentlySent } = await getEligibleUsers();

  let sent = 0;
  const failed: Array<{ email: string; error: string }> = [];

  // Sequential on purpose: no Resend rate-limit bursts, and a mid-batch crash
  // leaves a clean audit trail of exactly who was reached (re-run skips them).
  for (const user of toSend) {
    try {
      const tempPassword = generateTempPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, mustChangePassword: true },
      });

      const result = await sendWelcomeEmail({
        to: user.email,
        name: user.name,
        tempPassword,
        variant: 'veteran',
      });
      if (!result.ok) throw new Error(result.error ?? 'email send failed');

      await prisma.activityLog.create({
        data: {
          action: RE_ENGAGE_ACTION,
          description: `Re-engagement email sent to ${user.email} (batch by ${actor.email ?? '?'})`,
          userId: user.id,
          metadata: { actorEmail: actor.email ?? null },
        },
      });
      sent++;
    } catch (err) {
      failed.push({ email: user.email, error: err instanceof Error ? err.message : String(err) });
    }
  }

  revalidatePath('/admin/re-engage');
  revalidatePath('/admin/users');
  return { eligible: toSend.length, sent, skippedRecentlySent, failed };
}
