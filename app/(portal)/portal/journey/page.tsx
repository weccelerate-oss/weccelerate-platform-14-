import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { JourneyContent } from './journey-content';
import { getPublishedJourney, getUserJourneyAnswers } from '@/lib/journey/repository';

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

  const [chapters, answers] = await Promise.all([
    getPublishedJourney(),
    getUserJourneyAnswers(userId),
  ]);

  return (
    <JourneyContent
      userName={session.user.name || 'יזם'}
      chapters={chapters}
      initialAnswers={answers}
    />
  );
}
