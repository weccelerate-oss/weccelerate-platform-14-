'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PhoneCall, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TRACKERS } from '@/lib/trackers/schema';

const TABS = [
  { href: '/portal/journey/trackers/calls', slug: 'calls' as const, Icon: PhoneCall },
  { href: '/portal/journey/trackers/leads', slug: 'leads' as const, Icon: Send },
];

export default function TrackerTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 print:hidden">
      {TABS.map(({ href, slug, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors',
              active
                ? 'bg-gradient-to-l from-[#c8a951] to-[#e8d48b] text-[#1d1704] shadow-[0_8px_26px_-10px_rgba(200,169,81,.6)]'
                : 'border border-[#c8a951]/30 text-[#e8d48b] hover:bg-[#c8a951]/10',
            )}
          >
            <Icon className="w-4 h-4" />
            {TRACKERS[slug].title}
          </Link>
        );
      })}
    </div>
  );
}
