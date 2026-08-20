import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import TrackerTabs from '@/components/trackers/tracker-tabs';

/**
 * Shared shell for both trackers: back-link to the journey and the tab pills.
 * The navbar needs no change — its active state is
 * pathname.startsWith('/portal/journey'), so "מסע היזם" stays lit here.
 */
export default function TrackersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-white print:text-black print:bg-white" dir="rtl">
      <div
        className="fixed inset-0 pointer-events-none print:hidden"
        style={{
          background:
            'radial-gradient(900px 480px at 85% -5%, rgba(200,169,81,0.10), transparent 60%), radial-gradient(700px 500px at -5% 30%, rgba(63,86,201,0.12), transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-20 print:pb-0">
        <div className="pt-6 pb-3 print:hidden">
          <Link
            href="/portal/journey"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-[#e8d48b] transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה למסע
          </Link>
        </div>

        <TrackerTabs />

        {children}
      </div>
    </div>
  );
}
