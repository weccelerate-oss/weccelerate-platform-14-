import { getAdminJourney } from '@/lib/journey/repository';
import { JourneyManager } from './journey-manager';

export const dynamic = 'force-dynamic';

export default async function AdminJourneyPage() {
  const chapters = await getAdminJourney();
  return <JourneyManager initialChapters={chapters} />;
}
