/**
 * GET /api/admin/preview-article-email
 *
 * Sends a SAMPLE article-published notification email so Katrin can
 * preview the layout. Uses a real published guide (or, if no published
 * guide exists, falls back to a hand-crafted demo) to generate a
 * realistic LinkedIn post + image prompt via Claude.
 *
 * SECURITY: header/query secret = ONBOARDING_WEBHOOK_SECRET (same one
 * used by the welcome-email preview, the onboarding webhook, etc.).
 *
 * USAGE:
 *   /api/admin/preview-article-email?to=katrin@weccelerate.co.il&secret=...
 *   Optional: &slug=foo-bar  → preview using a specific guide slug.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateLinkedInPost } from '@/lib/agents/linkedin-post-generator';
import { sendArticlePublishedEmail } from '@/lib/agents/article-published-email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DEMO_GUIDE = {
  titleHe: 'איך להקים סטארטאפ MedTech בישראל — המדריך המלא 2026',
  slug: 'eich-lehakim-startup-medtech',
  category: 'medtech',
  sourceQuery: 'איך עוברים את ועדת הלסינקי בישראל — מי עוזר?',
  bodyExcerpt:
    `הקמת סטארטאפ MedTech בישראל דורשת תכנון מוקדם בכמה צירים שלא קיימים בסטארטאפ B2B רגיל: רגולציה (FDA, CE, משרד הבריאות), גישה לנתונים קליניים, וצוות שמשלב יזם טכנולוגי עם רופא מומחה. במאמר הזה נעבור על הצעדים הקריטיים מהיום הראשון: בחירת התחום הקליני, חיבור לקופת חולים, מסלול הלסינקי, ובניית MVP שאפשר באמת לפלט מולו. ` +
    `הטעות הכי נפוצה שאני רואה: יזמים שמתחילים לכתוב קוד לפני שיש להם רופא מלווה. בלי רופא, המוצר לא יעמוד בועדה. ובלי גישה אמיתית לדאטה קלינית, אי אפשר לבנות אלגוריתם אבחון שמשהו יסמוך עליו.`,
  wordCount: 1850,
};

export async function GET(req: NextRequest) {
  const expected = process.env.ONBOARDING_WEBHOOK_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'ONBOARDING_WEBHOOK_SECRET missing' },
      { status: 500 },
    );
  }
  const url = new URL(req.url);
  const provided = req.headers.get('x-onboarding-secret') ?? url.searchParams.get('secret');
  if (provided !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const to = url.searchParams.get('to');
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ ok: false, error: 'Missing or invalid ?to=' }, { status: 400 });
  }

  // Try to use a real published guide if the operator passed ?slug=, otherwise
  // pick the most recent one, otherwise fall back to the DEMO.
  const slugParam = url.searchParams.get('slug');
  let source = DEMO_GUIDE;
  try {
    if (slugParam) {
      const g = await prisma.generatedGuide.findUnique({ where: { slug: slugParam } });
      if (g && g.status === 'published') {
        source = {
          titleHe: g.titleHe,
          slug: g.slug,
          category: g.category,
          sourceQuery: '',
          bodyExcerpt: g.contentHe.slice(0, 1500),
          wordCount: g.wordCount ?? 0,
        };
      }
    } else {
      const g = await prisma.generatedGuide.findFirst({
        where: { status: 'published' },
        orderBy: { publishedAt: 'desc' },
      });
      if (g) {
        source = {
          titleHe: g.titleHe,
          slug: g.slug,
          category: g.category,
          sourceQuery: '',
          bodyExcerpt: g.contentHe.slice(0, 1500),
          wordCount: g.wordCount ?? 0,
        };
      }
    }
  } catch {
    /* fall through to DEMO */
  }

  // Override the recipient just for this preview run by setting the env var
  // for the single sendArticlePublishedEmail call. Simpler: pass a per-call
  // override via a local env mutation (Node process env is per-instance).
  const originalRecipient = process.env.ARTICLE_NOTIFICATION_EMAIL;
  process.env.ARTICLE_NOTIFICATION_EMAIL = to;

  try {
    const articleUrl = `https://weccelerate.co.il/guides/${encodeURIComponent(source.slug)}`;
    const post = await generateLinkedInPost({
      titleHe: source.titleHe,
      url: articleUrl,
      bodyExcerpt: source.bodyExcerpt,
      sourceQuery: source.sourceQuery,
      category: source.category,
    });
    if (!post.ok || !post.post) {
      return NextResponse.json({ ok: false, step: 'linkedin', error: post.error }, { status: 502 });
    }

    const emailResult = await sendArticlePublishedEmail({
      titleHe: source.titleHe,
      slug: source.slug,
      linkedInPost: post.post,
      imagePrompt: post.imagePrompt ?? null,
      shouldIncludeLogo: post.shouldIncludeLogo ?? false,
      imageStyle: post.imageStyle ?? null,
      imageRationale: post.imageRationale ?? null,
      topicHint: source.sourceQuery,
      category: source.category,
      wordCount: source.wordCount,
    });
    if (!emailResult.ok) {
      return NextResponse.json({ ok: false, step: 'email', error: emailResult.error }, { status: 502 });
    }
    return NextResponse.json({
      ok: true,
      sentTo: to,
      usedSlug: source.slug,
      note: 'Preview sent. Check inbox + spam.',
      previewedPost: post.post,
      previewedImagePrompt: post.imagePrompt,
    });
  } finally {
    // Restore original env so subsequent requests aren't affected.
    if (originalRecipient === undefined) {
      delete process.env.ARTICLE_NOTIFICATION_EMAIL;
    } else {
      process.env.ARTICLE_NOTIFICATION_EMAIL = originalRecipient;
    }
  }
}
