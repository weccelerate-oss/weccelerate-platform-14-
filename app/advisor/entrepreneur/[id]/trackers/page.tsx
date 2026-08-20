import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { auth } from '@/lib/auth';
import { resolveTrackerAccess } from '@/lib/trackers/access';
import { getTrackerRows, getTrackerVersion } from '@/lib/trackers/repository';
import { TRACKERS, isTrackerSlug, type TrackerSlug } from '@/lib/trackers/schema';
import TrackerScreen from '@/components/trackers/tracker-screen';

/**
 * Read-only tracker view for an advisor or an admin.
 *
 * One route serves both roles, the same way app/advisor/page.tsx does — every
 * visibility decision is made by resolveTrackerAccess() and nowhere else.
 */
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'מעקב היזם | WeCcelerate',
  robots: { index: false, follow: false },
};

export default async function AdvisorTrackersPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id: ownerId } = await params;
  const { tab } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/advisor/entrepreneur/${ownerId}/trackers`);
  }

  const access = await resolveTrackerAccess(session.user.id, ownerId);
  if (!access.allowed) {
    redirect('/portal');
  }

  const slug: TrackerSlug = isTrackerSlug(tab) ? tab : 'calls';
  const [rows, version] = await Promise.all([
    getTrackerRows(ownerId, slug),
    getTrackerVersion(ownerId, slug),
  ]);

  const ownerName = access.owner?.name || 'היזם';
  const definition = TRACKERS[slug];

  return (
    <div className="min-h-screen text-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
        <Link
          href="/advisor"
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-[#e8d48b] transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          חזרה לאזור המלווה
        </Link>

        <header className="mt-5 mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-white/95">
            {ownerName}
            {access.owner?.company ? ` · ${access.owner.company}` : ''}
          </h1>
          <p className="mt-1.5 text-sm text-white/45">{definition.subtitle}</p>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {(['calls', 'leads'] as TrackerSlug[]).map((s) => (
            <Link
              key={s}
              href={`/advisor/entrepreneur/${ownerId}/trackers?tab=${s}`}
              className={
                s === slug
                  ? 'inline-flex items-center rounded-xl bg-gradient-to-l from-[#c8a951] to-[#e8d48b] px-4 py-2.5 text-[13px] font-bold text-[#1d1704]'
                  : 'inline-flex items-center rounded-xl border border-[#c8a951]/30 px-4 py-2.5 text-[13px] font-semibold text-[#e8d48b] hover:bg-[#c8a951]/10 transition-colors'
              }
            >
              {TRACKERS[s].title}
            </Link>
          ))}
        </div>

        <TrackerScreen
          slug={slug}
          initialRows={rows}
          initialVersion={version}
          readOnly
          ownerName={ownerName}
        />
      </div>
    </div>
  );
}
