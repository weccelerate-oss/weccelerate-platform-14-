import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LearningContent, type LessonProgress } from './learning-content';
import { getPublishedCatalog } from '@/lib/learning/repository';
import type { CategoryData } from '@/lib/courses-data';

// The catalog now comes from the DB (admin-managed). Render dynamically so
// admin edits show up immediately rather than being baked into a static build.
export const dynamic = 'force-dynamic';

export default async function LearningPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/portal/learning');
  }

  // Published catalog from the DB (falls back to the static catalog if the DB
  // isn't seeded yet — see getPublishedCatalog).
  let catalog: CategoryData[] = [];
  try {
    catalog = await getPublishedCatalog();
  } catch {
    catalog = [];
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

  // Safety net: the redirect above guarantees session.user exists, but the
  // id is still typed as optional on the session shape. Fall back rather
  // than asserting with `!`. (LC-23)
  const userId = session.user.id;
  if (!userId) {
    redirect('/login?callbackUrl=/portal/learning');
  }

  return (
    <LearningContent
      user={{
        id: userId,
        name: session.user.name || 'יזם',
      }}
      catalog={catalog}
      initialProgress={initialProgress}
    />
  );
}
