'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Tag, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

// =============================================================================
// TYPES & HELPERS
// =============================================================================

interface EventItem {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  description: string | null;
  descriptionEn?: string | null;
  date: Date;
  time: string | null;
  city: string | null;
  category: string | null;
  imageUrl: string | null;
  status: string;
  registrationLink: string | null;
}

const STATUS_FILTER_KEYS: Record<string, string> = {
  all: 'events.filter.all',
  UPCOMING: 'events.filter.upcoming',
  PAST: 'events.filter.past',
};

function formatEventDate(date: Date, locale: string): string {
  return new Date(date).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatShortDate(date: Date, locale: string): { day: string; month: string } {
  const d = new Date(date);
  return {
    day: d.toLocaleDateString(locale, { day: 'numeric' }),
    month: d.toLocaleDateString(locale, { month: 'short' }),
  };
}

// =============================================================================
// EVENT GRID
// =============================================================================

export function EventGrid({ events }: { events: EventItem[] }) {
  const { t } = useLanguage();
  const [activeStatus, setActiveStatus] = useState('all');

  const filtered =
    activeStatus === 'all'
      ? events
      : events.filter((e) => e.status === activeStatus);

  return (
    <>
      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-12">
        {Object.entries(STATUS_FILTER_KEYS).map(([key, labelKey]) => (
          <button
            key={key}
            onClick={() => setActiveStatus(key)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeStatus === key
                ? 'bg-[#c8a951] text-[#070b1e]'
                : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.1] hover:text-white border border-white/[0.06]'
            }`}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-white/40 py-20">{t('events.empty')}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </>
  );
}

// =============================================================================
// EVENT CARD
// =============================================================================

function EventCard({ event }: { event: EventItem }) {
  const { t, lang } = useLanguage();
  const locale = lang === 'en' ? 'en-US' : 'he-IL';
  const { day, month } = formatShortDate(event.date, locale);
  const isPast = event.status === 'PAST';

  const name = lang === 'en' && event.nameEn ? event.nameEn : event.name;
  const description =
    lang === 'en' && event.descriptionEn ? event.descriptionEn : event.description;

  return (
    <div
      className={`group bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 ${
        isPast ? 'opacity-70' : ''
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0a0e27] to-[#1a1f3d] flex items-center justify-center">
            <Calendar className="w-12 h-12 text-white/10" />
          </div>
        )}
        {/* Date Badge */}
        <div className="absolute top-3 end-3 bg-[#c8a951] rounded-lg px-3 py-2 text-center min-w-[52px] shadow-lg">
          <span className="block text-[#070b1e] text-lg font-bold leading-none">
            {day}
          </span>
          <span className="block text-[#070b1e]/70 text-[10px] font-medium uppercase mt-0.5">
            {month}
          </span>
        </div>
        {/* Status Badge */}
        {isPast && (
          <span className="absolute top-3 start-3 bg-white/10 text-white/50 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
            {t('events.ended')}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        {event.category && (
          <span className="inline-flex items-center gap-1.5 text-[#c8a951] text-[10px] font-bold uppercase tracking-wider mb-3">
            <Tag className="w-3 h-3" />
            {event.category}
          </span>
        )}
        <h3 className="text-white font-semibold text-base mb-2 line-clamp-2 group-hover:text-[#c8a951] transition-colors">
          {name}
        </h3>
        {description && (
          <p className="text-white/40 text-sm line-clamp-2 mb-4">
            {description}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-white/30 text-xs mb-5">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatEventDate(event.date, locale)}
          </span>
          {event.time && (
            <span className="flex items-center gap-1.5" dir="ltr">
              <Clock className="w-3.5 h-3.5" />
              {event.time}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {event.city || t('events.online')}
          </span>
        </div>

        {/* CTA */}
        {!isPast && event.registrationLink ? (
          <a
            href={event.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-5 py-2.5 text-sm font-bold rounded-lg hover:scale-[1.03] transition-all duration-300"
          >
            {t('events.detailsAndRegister')}
            <ArrowLeft className="w-4 h-4" />
          </a>
        ) : isPast ? (
          <span className="inline-block text-white/20 text-sm font-medium">
            {t('events.endedFull')}
          </span>
        ) : null}
      </div>
    </div>
  );
}
