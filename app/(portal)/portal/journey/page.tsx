import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { JourneyContent } from './journey-content';
import { getPublishedJourney, getUserJourneyAnswers } from '@/lib/journey/repository';
import { getQuota } from '@/lib/ai-quota';
import { prisma } from '@/lib/db';
import { featuresFor } from '@/lib/entitlements';
import { advisorDisplayName } from '@/lib/advisors';
import { getTrackerCounts } from '@/lib/trackers/repository';

// Content is admin-managed and answers are per-user — always render fresh.
export const dynamic = 'force-dynamic';

export default async function JourneyPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login?callbackUrl=/portal/journey');
  }
  const userId = session.user.id;
  if (!userId) {
    redirect('/login?callbackUrl=/portal/journey');
  }

  const [chapters, answers, mentorQuota, trackerCounts, dbUser] = await Promise.all([
    getPublishedJourney(),
    getUserJourneyAnswers(userId),
    getQuota(userId, 'mentor_feedback'),
    getTrackerCounts(userId),
    prisma.user
      .findUnique({
        where: { id: userId },
        select: {
          plan: true,
          featureOverrides: true,
          advisorId: true,
          advisor: { select: { name: true, isActive: true } },
        },
      })
      .catch(() => null),
  ]);

  const features = featuresFor(dbUser);
  if (!features.journey) {
    redirect('/portal/dashboard');
  }

  return (
    <JourneyContent
      userName={session.user.name || 'יזם'}
      chapters={chapters}
      initialAnswers={answers}
      initialMentorQuota={{ remaining: mentorQuota.remaining, limit: mentorQuota.limit }}
      features={{
        mentorAi: features.mentorAi,
        humanMentor: features.humanMentor,
        trackers: features.trackers,
      }}
      trackerCounts={trackerCounts}
      advisorName={dbUser?.advisor?.isActive ? advisorDisplayName(dbUser.advisor) : null}
    />
  );
}
