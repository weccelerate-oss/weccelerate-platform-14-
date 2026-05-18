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
const MIN_RESUME_SEC = 5; // ignore micro-positions (autoplay flicker)

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const userId = session.user.id;

    const lesson = await prisma.courseLesson.findUnique({
      where: { slug: lessonSlug },
      select: { id: true },
    }).catch(() => null);

    // Lesson isn't seeded yet — return optimistic OK so the UI keeps state
    // client-side. The next time the seed runs, real persistence kicks in.
    //
    // CRITICAL: do NOT echo back `completed` here. If we did, a follow-up
    // position-only save (no `completed` flag) would echo `completed: false`,
    // which the client would then sync back, silently un-marking a lesson
    // the user already finished. By omitting `completed`/`positionSec` from
    // the response, the client's sync guard (`typeof data.completed === 'boolean'`)
    // short-circuits and the local state is preserved.
    if (!lesson) {
      return NextResponse.json({
        success: true,
        source: 'optimistic',
        slug: lessonSlug,
      });
    }

    // Build the partial update — only set fields the client actually sent.
    const update: Record<string, unknown> = {
      lastWatchedAt: new Date(),
    };
    const create: Record<string, unknown> = {
      userId,
      lessonId: lesson.id,
      lastWatchedAt: new Date(),
      completed: false,
      positionSec: 0,
    };

    let safePosition: number | null = null;
    if (typeof positionSec === 'number' && Number.isFinite(positionSec) && positionSec >= 0) {
      safePosition = Math.floor(positionSec);
      update.positionSec = safePosition;
      create.positionSec = safePosition;
    }

    let safeDuration: number | null = null;
    if (typeof durationSec === 'number' && Number.isFinite(durationSec) && durationSec > 0) {
      safeDuration = Math.floor(durationSec);
      update.durationSec = safeDuration;
      create.durationSec = safeDuration;
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
    console.error('[API] Error updating lesson progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    console.error('[API] Error fetching lesson progress:', error);
    return NextResponse.json({ entries: [], completedSlugs: [] });
  }
}

