/**
 * API Route: Lesson progress (completion + resume position)
 *
 * POST /api/portal/lessons/progress
 *   Body: { lessonSlug, completed?, positionSec?, durationSec? }
 *
 *   - `completed` toggles the lesson's done flag (optional).
 *   - `positionSec` / `durationSec` update the resume cursor (optional).
 *   - Sends from the lesson modal: throttled while playing, again on
 *     pause/close. The frontend is the source of truth; we just record.
 *
 * GET /api/portal/lessons/progress
 *   Returns the full progress map so the page can render in-progress
 *   visuals and the "המשך מהמקום שעצרת" card.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { COURSES_DATA } from '@/lib/courses-data';
import type { CategoryData, SubcategoryData, LessonData } from '@/lib/courses-data';
import { rateLimit } from '@/lib/rate-limit';

type CatalogEntry = {
  category: CategoryData;
  subcategory: SubcategoryData;
  lesson: LessonData;
};

/**
 * Build a slug → catalog entry index at module load. Walking the catalog on
 * every request is O(N) and silently picks the *first* match when slugs
 * collide. Building a Map once at boot lets us assert uniqueness loudly and
 * gives O(1) lookups. (LC-2)
 */
const LESSON_CATALOG_INDEX: Map<string, CatalogEntry> = (() => {
  const map = new Map<string, CatalogEntry>();
  for (const category of COURSES_DATA) {
    for (const subcategory of category.subcategories) {
      for (const lesson of subcategory.lessons) {
        if (map.has(lesson.slug)) {
          // Surface duplicates loudly at boot — production logs will show
          // the offending slug so an editor can rename it. We don't throw
          // (would crash all routes) but the error is impossible to miss.
          console.error(
            `[lessons/progress] duplicate lesson slug in catalog: "${lesson.slug}" — ` +
              `existing under ${map.get(lesson.slug)?.category.slug}/` +
              `${map.get(lesson.slug)?.subcategory.slug}, ` +
              `new under ${category.slug}/${subcategory.slug}`,
          );
        }
        map.set(lesson.slug, { category, subcategory, lesson });
      }
    }
  }
  return map;
})();

/**
 * Find a lesson in the static catalog by slug, returning the full chain
 * (category → subcategory → lesson) so we can seed all three at once.
 */
function findLessonInCatalog(slug: string): CatalogEntry | null {
  return LESSON_CATALOG_INDEX.get(slug) ?? null;
}

/**
 * Make sure the lesson row exists in the DB so we can attach
 * UserLessonProgress to it. Walks the chain (category → subcategory →
 * lesson) and upserts each level. Idempotent — safe to call on every
 * progress write, but we only call it on the cold path (lesson missing).
 *
 * Two concurrent first-time hits used to race: both passed the `findUnique`
 * miss, both called upsert, and Prisma raised P2002 on the loser. We now
 * (a) run the chain in a single $transaction and (b) retry on P2002 by
 * re-reading the row that the winner just created. (LC-1)
 */
async function ensureLessonSeeded(slug: string): Promise<string | null> {
  const entry = findLessonInCatalog(slug);
  if (!entry) return null;

  const attempt = async (): Promise<string> => {
    return prisma.$transaction(async (tx) => {
      const category = await tx.courseCategory.upsert({
        where: { slug: entry.category.slug },
        update: {},
        create: {
          name: entry.category.name,
          slug: entry.category.slug,
          description: entry.category.description,
          icon: entry.category.icon,
          color: entry.category.color,
        },
        select: { id: true },
      });

      const subcategory = await tx.courseSubcategory.upsert({
        where: { slug: entry.subcategory.slug },
        update: {},
        create: {
          name: entry.subcategory.name,
          slug: entry.subcategory.slug,
          description: entry.subcategory.description,
          categoryId: category.id,
        },
        select: { id: true },
      });

      const lesson = await tx.courseLesson.upsert({
        where: { slug: entry.lesson.slug },
        update: {},
        create: {
          title: entry.lesson.title,
          slug: entry.lesson.slug,
          description: entry.lesson.description,
          youtubeUrl: entry.lesson.youtubeUrl,
          youtubeId: entry.lesson.youtubeId,
          subcategoryId: subcategory.id,
        },
        select: { id: true },
      });

      return lesson.id;
    });
  };

  try {
    return await attempt();
  } catch (err) {
    // P2002 = unique constraint violation. Means another request beat us to
    // it — the winner already created the row, so a follow-up read returns
    // the canonical id. We also retry once on transient errors for safety.
    const code = (err as { code?: string })?.code;
    if (code === 'P2002') {
      const existing = await prisma.courseLesson.findUnique({
        where: { slug: entry.lesson.slug },
        select: { id: true },
      });
      if (existing) return existing.id;
    }
    throw err;
  }
}

export type LessonProgressEntry = {
  slug: string;
  completed: boolean;
  positionSec: number;
  durationSec: number | null;
  lastWatchedAt: string | null;
  completedAt: string | null;
};

// A lesson is "in progress" when the user has watched some of it but
// not enough to count as done. Two ways to qualify as "done":
//   - within 1.5s of the end (catches users who watched almost everything
//     even on long videos where 92% would still be minutes away)
//   - OR past 92% of the runtime (catches users who scrubbed past credits)
// Either condition trips the auto-complete branch.
const COMPLETE_RATIO = 0.92;
const COMPLETE_REMAINING_SEC = 1.5;
// Skip the lastWatchedAt bump if neither completion nor a real position
// change came through — avoids spamming the row on every micro-save. (LC-21)
const MIN_POSITION_DELTA_SEC = 3;

/**
 * Same-origin check — a minimal CSRF guard. NextAuth already validates its
 * own session cookie via the session lookup, but a malicious page on
 * example.evil can still trigger an authenticated POST from the user's
 * browser. Rejecting cross-origin posts cheaply closes that. (LC-24)
 */
function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (!origin || !host) {
    // No Origin header (e.g. same-site GET-following-redirect, server-to-server)
    // — fall back to referer host match. If neither is present, allow:
    // NextAuth still validated the session, and some proxies strip these.
    const referer = req.headers.get('referer');
    if (!referer) return true;
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Per-user rate limit. Saves fire every ~10s while a video plays plus
    // pause/close bursts; 120/min is generous and catches runaway loops or
    // a malicious script trying to hammer the row. (LC-24)
    const limit = rateLimit(`lessons-progress:${userId}`, {
      limit: 120,
      windowSeconds: 60,
    });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { lessonSlug, completed, positionSec, durationSec } = body as {
      lessonSlug?: string;
      completed?: boolean;
      positionSec?: number;
      durationSec?: number;
    };

    if (!lessonSlug || typeof lessonSlug !== 'string') {
      return NextResponse.json({ error: 'lessonSlug required' }, { status: 400 });
    }

    let lesson = await prisma.courseLesson.findUnique({
      where: { slug: lessonSlug },
      select: { id: true },
    }).catch(() => null);

    // Lesson isn't seeded yet — seed it on demand from the static catalog.
    // This is how progress survives a page refresh: without an actual
    // CourseLesson row we can't create a UserLessonProgress row, so nothing
    // would persist. Auto-seeding here means the very first time anyone
    // touches a lesson the chain (category → subcategory → lesson) gets
    // created, and every subsequent write goes through the normal upsert.
    if (!lesson) {
      try {
        const seededId = await ensureLessonSeeded(lessonSlug);
        if (seededId) {
          lesson = { id: seededId };
        }
      } catch (err) {
        console.error('[lessons/progress] auto-seed failed:', err);
      }
    }

    // If even the catalog doesn't know this slug, fall back to optimistic
    // — but omit `completed` so the client's monotone-up sync doesn't get
    // downgraded by a phantom `completed: false`.
    if (!lesson) {
      return NextResponse.json({
        success: true,
        source: 'optimistic',
        slug: lessonSlug,
      });
    }

    // Read the current row up-front so we can decide whether the
    // lastWatchedAt timestamp actually needs to move. (LC-21)
    const existing = await prisma.userLessonProgress
      .findUnique({
        where: { userId_lessonId: { userId, lessonId: lesson.id } },
        select: {
          completed: true,
          positionSec: true,
          durationSec: true,
        },
      })
      .catch(() => null);

    // Build the partial update — only set fields the client actually sent.
    const update: Record<string, unknown> = {};
    const create: Record<string, unknown> = {
      userId,
      lessonId: lesson.id,
      lastWatchedAt: new Date(),
      completed: false,
      positionSec: 0,
    };

    let safeDuration: number | null = null;
    if (typeof durationSec === 'number' && Number.isFinite(durationSec) && durationSec > 0) {
      safeDuration = Math.floor(durationSec);
      update.durationSec = safeDuration;
      create.durationSec = safeDuration;
    } else if (existing?.durationSec) {
      // Use the previously-stored duration when the client didn't send one,
      // so the clamp below still works on position-only saves.
      safeDuration = existing.durationSec;
    }

    let safePosition: number | null = null;
    if (typeof positionSec === 'number' && Number.isFinite(positionSec) && positionSec >= 0) {
      // Clamp to duration server-side so a slightly-overshoot value (the
      // player has reported position > duration on some browsers near the
      // end) doesn't break the percent math or the auto-complete branch. (LC-8)
      safePosition = Math.floor(positionSec);
      if (safeDuration !== null && safePosition > safeDuration) {
        safePosition = safeDuration;
      }
      update.positionSec = safePosition;
      create.positionSec = safePosition;
    }

    // Auto-complete when the user has watched essentially the whole video.
    // Beats the "did you press the checkbox?" friction.
    let effectiveCompleted = completed;
    if (
      effectiveCompleted === undefined &&
      safePosition !== null &&
      safeDuration !== null &&
      (safeDuration - safePosition <= COMPLETE_REMAINING_SEC ||
        safePosition / safeDuration >= COMPLETE_RATIO)
    ) {
      effectiveCompleted = true;
    }

    if (typeof effectiveCompleted === 'boolean') {
      update.completed = effectiveCompleted;
      create.completed = effectiveCompleted;
      if (effectiveCompleted) {
        update.completedAt = new Date();
        create.completedAt = new Date();
      } else {
        update.completedAt = null;
        create.completedAt = null;
        // If we're un-completing, also rewind the cursor so the UI doesn't
        // claim "100% but not done".
        if (safePosition === null) {
          update.positionSec = 0;
        }
      }
    }

    // Decide whether lastWatchedAt should actually bump. We touch it when:
    //   - this is a fresh row (no existing data), OR
    //   - completion is changing, OR
    //   - position moved by ≥ MIN_POSITION_DELTA_SEC seconds. (LC-21)
    let bumpTimestamp = false;
    if (!existing) {
      bumpTimestamp = true;
    } else if (typeof effectiveCompleted === 'boolean' && effectiveCompleted !== existing.completed) {
      bumpTimestamp = true;
    } else if (
      safePosition !== null &&
      Math.abs(safePosition - (existing.positionSec ?? 0)) >= MIN_POSITION_DELTA_SEC
    ) {
      bumpTimestamp = true;
    }
    if (bumpTimestamp) {
      update.lastWatchedAt = new Date();
    }

    const saved = await prisma.userLessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId: lesson.id,
        },
      },
      update,
      create,
    });

    return NextResponse.json({
      success: true,
      slug: lessonSlug,
      completed: saved.completed,
      positionSec: saved.positionSec ?? 0,
      durationSec: saved.durationSec ?? null,
      lastWatchedAt: saved.lastWatchedAt?.toISOString() ?? null,
      completedAt: saved.completedAt?.toISOString() ?? null,
    });
  } catch (error) {
    // Detailed error surfacing — the symptoms of a stale DB schema (missing
    // positionSec/durationSec/lastWatchedAt columns) are silent in
    // production because the outer catch used to swallow the message. We
    // still log it server-side, but only return the raw Prisma error to
    // clients when DEBUG_PROGRESS_API=1 or the user is an admin. (LC-17)
    const message = error instanceof Error ? error.message : String(error);
    console.error('[lessons/progress] upsert failed:', message);
    const looksLikeSchemaIssue = /positionSec|durationSec|lastWatchedAt|column.*does not exist|Unknown arg/i.test(message);

    let canSeeDetails = process.env.DEBUG_PROGRESS_API === '1';
    if (!canSeeDetails) {
      try {
        const s = await auth();
        canSeeDetails = s?.user?.role === 'ADMIN';
      } catch {
        /* swallow */
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        ...(canSeeDetails
          ? {
              detail: message.slice(0, 600),
              hint: looksLikeSchemaIssue
                ? 'הסכמה של ה-DB ככל הנראה לא עודכנה. הרץ: `npx prisma db push --config prisma/prisma.config.ts --skip-generate` ואז re-deploy ב-Vercel.'
                : undefined,
            }
          : {}),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const progress = await prisma.userLessonProgress.findMany({
      where: { userId: session.user.id },
      include: {
        lesson: { select: { slug: true } },
      },
      orderBy: { lastWatchedAt: 'desc' },
    });

    const entries: LessonProgressEntry[] = progress
      .filter((p: { lesson: { slug: string } | null }) => p.lesson)
      .map(
        (p: {
          lesson: { slug: string };
          completed: boolean;
          positionSec: number | null;
          durationSec: number | null;
          lastWatchedAt: Date | null;
          completedAt: Date | null;
        }) => ({
          slug: p.lesson.slug,
          completed: p.completed,
          positionSec: p.positionSec ?? 0,
          durationSec: p.durationSec ?? null,
          lastWatchedAt: p.lastWatchedAt?.toISOString() ?? null,
          completedAt: p.completedAt?.toISOString() ?? null,
        }),
      );

    // Backwards-compat: old callers used `completedSlugs`. Keep it so any
    // cached client bundle keeps working until it reloads.
    const completedSlugs = entries.filter((e) => e.completed).map((e) => e.slug);

    return NextResponse.json({ entries, completedSlugs });
  } catch (error) {
    // Used to return HTTP 200 with an error payload — that quietly broke
    // client retries that check `res.ok`. Honour the actual failure now. (LC-22)
    const message = error instanceof Error ? error.message : String(error);
    console.error('[lessons/progress] fetch failed:', message);
    return NextResponse.json(
      {
        entries: [],
        completedSlugs: [],
        error: 'fetch failed',
      },
      { status: 500 },
    );
  }
}
