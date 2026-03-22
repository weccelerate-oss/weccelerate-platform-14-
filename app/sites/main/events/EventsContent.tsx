'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { EventGrid } from './EventGrid';

interface EventItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  date: Date;
  time: string | null;
  city: string | null;
  category: string | null;
  imageUrl: string | null;
  status: string;
  registrationLink: string | null;
}

export function EventsContent({ events }: { events: EventItem[] }) {
  const { t } = useLanguage();

  return (
    <div className="bg-[#070b1e] min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] to-[#070b1e]" />
        <div className="absolute top-0 start-0 w-full h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" />

        <div className="container-corporate relative z-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-white/40">
              <li>
                <Link href="/" className="hover:text-white/60 transition-colors">
                  {t('events.breadcrumb.home')}
                </Link>
              </li>
              <li><span className="mx-1">/</span></li>
              <li className="text-gold-400">{t('events.breadcrumb.current')}</li>
            </ol>
          </nav>

          <p className="text-[#c8a951] text-sm font-semibold uppercase tracking-[0.2em] mb-4">
            {t('events.tag')}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            {t('events.title')}
          </h1>
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl leading-relaxed">
            {t('events.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Events Grid with Filters */}
      <section className="pb-24 sm:pb-32">
        <div className="container-corporate">
          <EventGrid events={events} />
        </div>
      </section>
    </div>
  );
}
