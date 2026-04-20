/**
 * API Route: Toggle lesson completion progress
 * POST /api/portal/lessons/progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonSlug, completed } = await req.json();

    if (!lessonSlug || typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const userId = session.user.id;

    // Find or create lesson in DB (lessons may not exist yet if seeding hasn't happened)
    let lesson = await prisma.courseLesson.findUnique({
      where: { slug: lessonSlug },
    });

    // If the lesson doesn't exist in DB yet, we store progress with a virtual key
    if (!lesson) {
      // Return success but with a note that the lesson isn't in DB yet
      // The frontend will track this optimistically
      return NextResponse.json({
        success: true,
        completed,
        lessonSlug,
        source: 'optimistic',
      });
    }

    if (completed) {
      await prisma.userLessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId: lesson.id,
          },
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
        create: {
          userId,
          lessonId: lesson.id,
          completed: true,
          completedAt: new Date(),
        },
      });
    } else {
      await prisma.userLessonProgress.deleteMany({
        where: {
          userId,
          lessonId: lesson.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      completed,
      lessonSlug,
    });
  } catch (error) {
    console.error('[API] Error updating lesson progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
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
      where: {
        userId: session.user.id,
        completed: true,
      },
      include: {
        lesson: {
          select: { slug: true },
        },
      },
    });

    const completedSlugs = progress.map((p) => p.lesson.slug);

    return NextResponse.json({ completedSlugs });
  } catch (error) {
    console.error('[API] Error fetching lesson progress:', error);
    return NextResponse.json({ completedSlugs: [] });
  }
}
