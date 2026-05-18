import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LearningContent, type LessonProgress } from './learning-content';

export default async function LearningPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/portal/learning');
  }

  // Fetch user's lesson progress (completion + resume position).
  let initialProgress: LessonProgress[] = [];
  try {
    const { prisma } = await import('@/lib/db');
    const rows = await prisma.userLessonProgress.findMany({
      where: { userId: session.user.id },
      include: { lesson: { select: { slug: true } } },
      orderBy: { lastWatchedAt: 'desc' },
    });
    initialProgress = rows
      .filter((r): r is typeof r & { lesson: { slug: string } } => Boolean(r.lesson))
      .map((r) => ({
        slug: r.lesson.slug,
        completed: r.completed,
        positionSec: r.positionSec ?? 0,
        durationSec: r.durationSec ?? null,
        lastWatchedAt: r.lastWatchedAt ? r.lastWatchedAt.toISOString() : null,
      }));
  } catch {
    // DB might not have the new columns yet — graceful fallback.
    initialProgress = [];
  }

  return (
    <LearningContent
      user={{
        id: session.user.id!,
        name: session.user.name || 'יזם',
      }}
      initialProgress={initialProgress}
    />
  );
}
