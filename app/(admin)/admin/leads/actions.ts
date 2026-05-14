'use server';

/**
 * Admin actions for the lead-review queue.
 *
 * approveLead   — soft-held lead is legit → forward to Zapier in arrears,
 *                 flip its activity-log row to status='approved'.
 * rejectLead    — lead isn't worth a callback but isn't spam (e.g. wrong
 *                 segment) → flip to status='rejected'. No Zapier call.
 * markAsSpam    — adds the email (and IP, if known) to SpamBlocklist so
 *                 future submissions from them are blocked at the door.
 *
 * All three only do something if the caller is an admin.
 */

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

async function requireAdmin(): Promise<{ ok: false; reason: string } | { ok: true; userId: string }> {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session?.user as any)?.id;
  if (role !== 'ADMIN') return { ok: false, reason: 'Admin only' };
  return { ok: true, userId };
}

/** Forwards the lead to Zapier and marks it approved. */
export async function approveLeadAction(activityLogId: string): Promise<{ success: boolean; error?: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { success: false, error: gate.reason };

  const row = await prisma.activityLog.findUnique({
    where: { id: activityLogId },
    select: { id: true, action: true, metadata: true },
  });
  if (!row) return { success: false, error: 'Lead not found' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = (row.metadata as any) ?? {};

  // Send to Zapier in arrears.
  if (process.env.ZAPIER_WEBHOOK_URL) {
    try {
      const now = new Date();
      await fetch(process.env.ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'תאריך': now.toLocaleDateString('he-IL') + ' ' + now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          'שם מלא': meta.name ?? '',
          'טלפון': meta.phone ?? '',
          'אימייל': meta.email ?? '',
          'מודעה': meta.sourceLabel ?? '',
          'מקור': meta.sourceLabel ?? '',
          'סאבדומיין': meta.site ?? 'main',
          'סוג טופס': meta.formType ?? 'contact',
          'כתובת מקור': meta.sourceUrl ?? '',
          'הודעה': meta.message ?? '',
          'חברה': meta.company ?? '',
          'מקור-משני': 'approved_after_review',
        }),
      });
    } catch (err) {
      console.error('[approveLead] Zapier failed:', err);
      // Don't block the approval — admin can resend.
    }
  }

  // Flip the row to status='approved' and change action so dashboard counters
  // count it as a legit lead.
  await prisma.activityLog.update({
    where: { id: activityLogId },
    data: {
      action: meta.formType ? `form.${meta.formType}` : 'form.contact_submit',
      metadata: { ...meta, status: 'approved', reviewedAt: new Date().toISOString(), reviewedByUserId: gate.userId },
    },
  });

  revalidatePath('/admin/leads');
  revalidatePath('/admin/leads/spam-review');
  return { success: true };
}

export async function rejectLeadAction(activityLogId: string): Promise<{ success: boolean; error?: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { success: false, error: gate.reason };

  const row = await prisma.activityLog.findUnique({
    where: { id: activityLogId },
    select: { metadata: true },
  });
  if (!row) return { success: false, error: 'Lead not found' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = (row.metadata as any) ?? {};

  await prisma.activityLog.update({
    where: { id: activityLogId },
    data: {
      action: 'lead.rejected',
      metadata: { ...meta, status: 'rejected', reviewedAt: new Date().toISOString(), reviewedByUserId: gate.userId },
    },
  });

  revalidatePath('/admin/leads');
  revalidatePath('/admin/leads/spam-review');
  return { success: true };
}

/** Adds email + ipHash to the permanent blocklist. */
export async function markAsSpamAction(
  activityLogId: string,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { success: false, error: gate.reason };

  const row = await prisma.activityLog.findUnique({
    where: { id: activityLogId },
    select: { metadata: true },
  });
  if (!row) return { success: false, error: 'Lead not found' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = (row.metadata as any) ?? {};
  const email = typeof meta.email === 'string' ? meta.email.toLowerCase() : null;
  const ipHash = typeof meta.ipHash === 'string' ? meta.ipHash : null;

  try {
    if (email) {
      await prisma.spamBlocklist.upsert({
        where: { email },
        create: {
          email,
          reason: reason ?? 'Admin marked as spam',
          addedByUserId: gate.userId,
        },
        update: {
          reason: reason ?? 'Admin marked as spam',
          addedByUserId: gate.userId,
          addedAt: new Date(),
          expiresAt: null,
        },
      });
    }
    if (ipHash) {
      await prisma.spamBlocklist.upsert({
        where: { ipHash },
        create: {
          ipHash,
          reason: reason ?? 'Admin marked as spam',
          addedByUserId: gate.userId,
        },
        update: {
          reason: reason ?? 'Admin marked as spam',
          addedByUserId: gate.userId,
          addedAt: new Date(),
          expiresAt: null,
        },
      });
    }
  } catch (err) {
    return { success: false, error: `Blocklist upsert failed: ${err instanceof Error ? err.message : String(err)}` };
  }

  // Mark the lead row itself as spam too.
  await prisma.activityLog.update({
    where: { id: activityLogId },
    data: {
      action: 'lead.spam_blocked',
      metadata: { ...meta, status: 'spam', reviewedAt: new Date().toISOString(), reviewedByUserId: gate.userId, blocklistReason: reason },
    },
  });

  revalidatePath('/admin/leads');
  revalidatePath('/admin/leads/spam-review');
  return { success: true };
}

/** Removes an entry from the blocklist — undo on accidental spam mark. */
export async function unblockAction(
  identifier: { email?: string; ipHash?: string },
): Promise<{ success: boolean; error?: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { success: false, error: gate.reason };

  try {
    if (identifier.email) {
      await prisma.spamBlocklist.deleteMany({ where: { email: identifier.email.toLowerCase() } });
    }
    if (identifier.ipHash) {
      await prisma.spamBlocklist.deleteMany({ where: { ipHash: identifier.ipHash } });
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }

  revalidatePath('/admin/leads/spam-review');
  return { success: true };
}
