import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LearningContent } from './learning-content';

export default async function LearningPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/portal/learning');
  }

  // Fetch user's completed lessons from DB
  let completedSlugs: string[] = [];
  try {
    const { prisma } = await import('@/lib/db');
    const progress = await prisma.userLessonProgress.findMany({
      where: {
        userId: session.user.id,
        completed: true,
      },
      include: {
        lesson: { select: { slug: true } },
      },
    });
    completedSlugs = progress.map((p: { lesson: { slug: string } }) => p.lesson.slug);
  } catch {
    // DB might not have the table yet — graceful fallback
    completedSlugs = [];
  }

  return (
    <LearningContent
      user={{
        id: session.user.id!,
        name: session.user.name || 'יזם',
      }}
      initialCompletedSlugs={completedSlugs}
    />
  );
}
