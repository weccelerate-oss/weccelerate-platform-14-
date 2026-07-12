/**
 * Admin server actions for David's draft guides — the human half of the
 * quality gate. Gate-rejected articles land here as status='draft'; the
 * admin reviews, then publishes (with the same side effects as an
 * auto-publish: IndexNow ping + Katrin email) or discards.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logDecision } from '@/lib/agents/decision-log';
import { notifyKatrinAboutArticle, pingIndexNow } from '@/lib/agents/content-writer';

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }
  return session.user;
}

export async function publishDraftAction(id: string): Promise<void> {
  await verifyAdmin();

  const guide = await prisma.generatedGuide.update({
    where: { id, status: 'draft' },
    data: { status: 'published', publishedAt: new Date() },
  });

  // Resolve the gap this article was written for (finalize left it with a
  // rejectReason but not 'published').
  await prisma.contentGap.updateMany({
    where: { generatedGuideId: id },
    data: { status: 'published', resolvedAt: new Date(), rejectReason: null },
  });

  await logDecision({
    agent: 'content-writer',
    action: 'draft-approved',
    reasoning: `המפעיל אישר ופרסם את הטיוטה "${guide.titleHe}" → /guides/${guide.slug}.`,
    payload: { guideId: id, slug: guide.slug },
    success: true,
  });

  // Same side effects as an auto-publish — best-effort, never block the UI.
  pingIndexNow(`https://weccelerate.co.il/guides/${guide.slug}`).catch(() => {});
  notifyKatrinAboutArticle({
    titleHe: guide.titleHe,
    slug: guide.slug,
    bodyExcerpt: guide.contentHe.slice(0, 2000),
    sourceQuery: null,
    category: guide.category,
    wordCount: guide.wordCount ?? 0,
  }).catch(() => {});

  revalidatePath('/admin/drafts');
  revalidatePath('/guides');
  revalidatePath('/llms.txt');
  revalidatePath('/sitemap.xml');
}

export async function discardDraftAction(id: string): Promise<void> {
  await verifyAdmin();

  const guide = await prisma.generatedGuide.update({
    where: { id, status: 'draft' },
    data: { status: 'retracted', retractedAt: new Date(), retractReason: 'discarded by admin from /admin/drafts' },
  });

  await logDecision({
    agent: 'content-writer',
    action: 'draft-discarded',
    reasoning: `המפעיל דחה את הטיוטה "${guide.titleHe}" — לא תפורסם.`,
    payload: { guideId: id, slug: guide.slug },
    success: true,
  });

  revalidatePath('/admin/drafts');
}
