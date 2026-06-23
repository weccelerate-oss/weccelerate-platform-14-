/**
 * API Route: Lesson quiz submission.
 *
 * POST /api/portal/lessons/quiz
 *   Body: { lessonSlug: string, answers: { [questionId]: optionId } }
 *
 * Grades server-side (the catalog sent to the client strips correctId, so the
 * answer key never leaves the server), records a QuizAttempt, and returns the
 * score + the correct-answer map for review.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const limit = rateLimit(`lessons-quiz:${userId}`, { limit: 30, windowSeconds: 60 });
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    const lessonSlug: string | undefined = body?.lessonSlug;
    const answers: Record<string, string> = body?.answers ?? {};

    if (!lessonSlug || typeof lessonSlug !== 'string') {
      return NextResponse.json({ error: 'lessonSlug required' }, { status: 400 });
    }

    const lesson = await prisma.courseLesson.findUnique({
      where: { slug: lessonSlug },
      select: {
        quiz: {
          select: {
            id: true,
            passScore: true,
            questions: { select: { id: true, correctId: true } },
          },
        },
      },
    });

    const quiz = lesson?.quiz;
    if (!quiz || quiz.questions.length === 0) {
      return NextResponse.json({ error: 'No quiz for this lesson' }, { status: 404 });
    }

    // Grade.
    let correctCount = 0;
    const correct: Record<string, string> = {};
    for (const q of quiz.questions) {
      correct[q.id] = q.correctId;
      if (answers[q.id] === q.correctId) correctCount++;
    }
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passScore;

    await prisma.quizAttempt
      .create({
        data: {
          quizId: quiz.id,
          userId,
          answers,
          score,
          passed,
        },
      })
      .catch((err: unknown) => {
        console.error('[lessons/quiz] attempt save failed:', err);
      });

    return NextResponse.json({ score, passed, correct });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[lessons/quiz] failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
