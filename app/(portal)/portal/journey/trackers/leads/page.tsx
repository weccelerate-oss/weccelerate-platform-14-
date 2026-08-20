import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { featuresFor } from '@/lib/entitlements';
import { getTrackerRows, getTrackerVersion } from '@/lib/trackers/repository';
import { TRACKERS } from '@/lib/trackers/schema';
import TrackerScreen from '@/components/trackers/tracker-screen';

export const dynamic = 'force-dynamic';

const SLUG = 'leads' as const;
const PATH = '/portal/journey/trackers/leads';

export default async function LeadsTrackerPage() {
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=${PATH}`);
  const userId = session.user.id;
  if (!userId) redirect(`/login?callbackUrl=${PATH}`);

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, featureOverrides: true, advisorId: true },
  });
  if (!featuresFor(dbUser).trackers) redirect('/portal/journey');

  const [rows, version] = await Promise.all([
    getTrackerRows(userId, SLUG),
    getTrackerVersion(userId, SLUG),
  ]);

  const definition = TRACKERS[SLUG];

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-white/95">{definition.title}</h1>
        <p className="mt-1.5 text-sm text-white/45">{definition.subtitle}</p>
      </header>

      <TrackerScreen slug={SLUG} initialRows={rows} initialVersion={version} />
    </>
  );
}
