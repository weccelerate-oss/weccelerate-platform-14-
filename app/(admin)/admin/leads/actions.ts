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
import { deliverLead, type ZapierLead } from '@/lib/leads/zapier';

/** Rebuild the Zapier lead from an ActivityLog metadata blob. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function leadFromMeta(id: string, meta: any, note: string): ZapierLead {
  return {
    name: meta.name ?? '',
    email: meta.email ?? '',
    phone: meta.phone ?? null,
    company: meta.company ?? null,
    message: meta.message ?? null,
    formType: meta.formType ?? 'contact',
    site: meta.site ?? 'main',
    sourceUrl: meta.sourceUrl ?? null,
    stage: meta.stage ?? null,
    service: meta.service ?? null,
    attribution: {
      channel: meta.channel ?? null,
      channelDetail: meta.channelDetail ?? null,
      campaign: meta.campaign ?? null,
      firstChannel: meta.firstChannel ?? null,
      landingPage: meta.landingPage ?? null,
      referrerUrl: meta.referrerUrl ?? null,
      utmSource: meta.utmSource ?? null,
      utmMedium: meta.utmMedium ?? null,
      utmCampaign: meta.utmCampaign ?? null,
      utmContent: meta.utmContent ?? null,
      utmTerm: meta.utmTerm ?? null,
      gclid: meta.gclid ?? null,
      fbclid: meta.fbclid ?? null,
    },
    leadId: id,
    spamScore: typeof meta.spamScore === 'number' ? meta.spamScore : null,
    note,
  };
}

/**
 * Re-send a lead that never reached Zapier (or that the admin wants pushed
 * again). Records the new delivery result on the row.
 */
export async function resendLeadAction(activityLogId: string): Promise<{ success: boolean; error?: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { success: false, error: gate.reason };

  const row = await prisma.activityLog.findUnique({
    where: { id: activityLogId },
    select: { id: true, metadata: true },
  });
  if (!row) return { success: false, error: 'Lead not found' };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = (row.metadata as any) ?? {};

  const delivery = await deliverLead(leadFromMeta(row.id, meta, 'admin_resend'));
  await prisma.activityLog.update({
    where: { id: row.id },
    data: {
      metadata: {
        ...meta,
        delivery,
        resentAt: new Date().toISOString(),
        resentByUserId: gate.userId,
      },
    },
  });
  revalidatePath('/admin/leads');
  if (delivery.status !== 'sent') return { success: false, error: delivery.error || delivery.status };
  return { success: true };
}

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

  // Send to Zapier (= Pipedrive) in arrears, through the shared delivery path.
  const delivery = await deliverLead(leadFromMeta(row.id, meta, 'approved_after_review'));

  // Flip the row to status='approved' and change action so dashboard counters
  // count it as a legit lead.
  await prisma.activityLog.update({
    where: { id: activityLogId },
    data: {
      action: meta.formType ? `form.${meta.formType}` : 'form.contact_submit',
      metadata: { ...meta, status: 'approved', delivery, reviewedAt: new Date().toISOString(), reviewedByUserId: gate.userId },
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
