/**
 * API Route: Founder Journey answers (silent autosave)
 *
 * POST /api/portal/journey/answer
 *   Body: { questionId, content?, status? }
 *   Upserts the user's answer. The client debounces 10s after the last edit
 *   and also flushes on question-switch / page-hide, so this fires rarely.
 *   Deleting = saving empty content (the row stays so updatedAt keeps the
 *   "המשך מהמקום שעצרת" resume point honest).
 *
 * GET /api/portal/journey/answer
 *   Returns all of the user's answers (used for cross-tab refresh).
 *
 * Answers are strictly per-user: every read/write is scoped to the session
 * user id — an entrepreneur can never see or touch another user's answers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { isSameOrigin } from '@/lib/http/same-origin';

const MAX_ANSWER_LENGTH = 20_000;

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

    // Autosave is debounced to every ≥10s per question, plus navigation
    // flushes — 60/min covers even frantic tab-hopping with headroom.
    const limit = rateLimit(`journey-answer:${userId}`, { limit: 60, windowSeconds: 60 });
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

    const { questionId, content, status } = body as {
      questionId?: string;
      content?: string;
      status?: string;
    };

    if (!questionId || typeof questionId !== 'string') {
      return NextResponse.json({ error: 'questionId required' }, { status: 400 });
    }
    if (questionId.startsWith('static:')) {
      // Static fallback ids only exist before the journey was seeded — refuse
      // loudly so the client can tell the user instead of silently dropping.
      return NextResponse.json(
        { error: 'Journey not seeded yet — answers cannot be saved' },
        { status: 409 },
      );
    }

    const question = await prisma.journeyQuestion.findUnique({
      where: { id: questionId },
      select: { id: true },
    });
    if (!question) {
      return NextResponse.json({ error: 'Unknown question' }, { status: 404 });
    }

    const update: Record<string, unknown> = {};
    const create: Record<string, unknown> = { userId, questionId };

    if (typeof content === 'string') {
      const safe = content.slice(0, MAX_ANSWER_LENGTH);
      update.content = safe;
      create.content = safe;
    }
    if (status === 'DRAFT' || status === 'READY') {
      update.status = status;
      create.status = status;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nothing to save' }, { status: 400 });
    }

    const saved = await prisma.userJourneyAnswer.upsert({
      where: { userId_questionId: { userId, questionId } },
      update,
      create,
    });

    return NextResponse.json({
      success: true,
      questionId,
      status: saved.status,
      updatedAt: saved.updatedAt?.toISOString?.() ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[journey/answer] upsert failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await prisma.userJourneyAnswer.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        questionId: true,
        content: true,
        status: true,
        aiFeedback: true,
        aiFeedbackAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      answers: (rows ?? []).map((a: any) => ({
        questionId: a.questionId,
        content: a.content ?? '',
        status: a.status ?? 'DRAFT',
        aiFeedback: a.aiFeedback ?? null,
        aiFeedbackAt: a.aiFeedbackAt?.toISOString?.() ?? null,
        updatedAt: a.updatedAt?.toISOString?.() ?? null,
      })),
    });
  } catch (error) {
    console.error('[journey/answer] fetch failed:', error);
    return NextResponse.json({ answers: [], error: 'fetch failed' }, { status: 500 });
  }
}
