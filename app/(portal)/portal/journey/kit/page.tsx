import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getPublishedJourney, getUserJourneyAnswers } from '@/lib/journey/repository';
import { KitContent } from './kit-content';

// The kit is built live from the user's READY answers — always fresh.
export const dynamic = 'force-dynamic';

export default async function JourneyKitPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login?callbackUrl=/portal/journey/kit');
  }
  const userId = session.user.id;
  if (!userId) {
    redirect('/login?callbackUrl=/portal/journey/kit');
  }

  const [chapters, answers] = await Promise.all([
    getPublishedJourney(),
    getUserJourneyAnswers(userId),
  ]);

  return (
    <KitContent
      userName={session.user.name || 'יזם'}
      chapters={chapters}
      answers={answers}
    />
  );
}
