'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Users,
  Tag,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

// =============================================================================
// TYPES
// =============================================================================

export interface EventItem {
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
  imageUrl?: string | null;
}

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
// MAIN COMPONENT
// =============================================================================

export function EventsShowcase({ events }: { events: EventItem[] }) {
  const { t, lang } = useLanguage();
  const locale = lang === 'en' ? 'en-US' : 'he-IL';
  const [activeIndex, setActiveIndex] = useState(0);

  const activeEvent = events[activeIndex];
  const hasNext = activeIndex < events.length - 1;
  const hasPrev = activeIndex > 0;

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const goNext = useCallback(() => {
    if (hasNext) setActiveIndex((i) => i + 1);
  }, [hasNext]);

  const goPrev = useCallback(() => {
    if (hasPrev) setActiveIndex((i) => i - 1);
  }, [hasPrev]);

  if (!activeEvent) return null;

  const shortDate = formatShortDate(activeEvent.date, locale);
  const activeName =
    lang === 'en' && activeEvent.nameEn ? activeEvent.nameEn : activeEvent.name;
  const activeDescription =
    lang === 'en' && activeEvent.descriptionEn
      ? activeEvent.descriptionEn
      : activeEvent.description;

  return (
    <div>
      {/* ================================================================= */}
      {/* FEATURED EVENT — Hero Card                                        */}
      {/* ================================================================= */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] mb-8">
        <div className="grid lg:grid-cols-2">
          {/* Image Side */}
          <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[380px]">
            {activeEvent.imageUrl ? (
              <Image
                src={activeEvent.imageUrl}
                alt={activeName}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#111b3c] to-[#0a0e27] flex items-center justify-center">
                <Calendar className="w-16 h-16 text-[#c8a951]/20" />
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e]/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#070b1e]/80" />

            {/* Date badge — floating */}
            <div className="absolute top-5 start-5 bg-[#c8a951] text-[#070b1e] rounded-xl p-3 text-center min-w-[60px] shadow-lg shadow-[#c8a951]/20">
              <p className="text-2xl font-black leading-none">{shortDate.day}</p>
              <p className="text-[10px] font-bold uppercase mt-1">{shortDate.month}</p>
            </div>

            {/* Navigation arrows */}
            <button
              onClick={goPrev}
              disabled={!hasPrev}
              className={`absolute top-1/2 start-3 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                hasPrev
                  ? 'bg-black/50 backdrop-blur-sm text-white hover:bg-[#c8a951] hover:text-[#070b1e] border border-white/10'
                  : 'bg-black/20 text-white/20 cursor-not-allowed'
              }`}
              aria-label={t('events.prevEvent')}
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </button>
            <button
              onClick={goNext}
              disabled={!hasNext}
              className={`absolute top-1/2 end-3 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                hasNext
                  ? 'bg-black/50 backdrop-blur-sm text-white hover:bg-[#c8a951] hover:text-[#070b1e] border border-white/10'
                  : 'bg-black/20 text-white/20 cursor-not-allowed'
              }`}
              aria-label={t('events.nextEvent')}
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </button>

            {/* Counter */}
            <div className="absolute bottom-4 end-4 z-10 bg-black/60 backdrop-blur-sm text-white/70 text-xs font-medium px-3 py-1.5 rounded-full border border-white/10" dir="ltr">
              {activeIndex + 1} / {events.length}
            </div>
          </div>

          {/* Info Side */}
          <div className="p-8 lg:p-10 flex flex-col justify-between bg-gradient-to-b from-white/[0.03] to-white/[0.01]">
            <div>
              {/* Category */}
              {activeEvent.category && (
                <span className="inline-flex items-center gap-1.5 bg-[#c8a951]/15 text-[#e8d48b] text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border border-[#c8a951]/20 mb-5">
                  <Tag className="w-3 h-3" />
                  {activeEvent.category}
                </span>
              )}

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
                {activeName}
              </h3>

              {/* Description */}
              {activeDescription && (
                <p className="text-sm text-white/50 leading-relaxed mb-6 line-clamp-3">
                  {activeDescription}
                </p>
              )}

              {/* Meta details */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-white/40">
                  <Calendar className="w-4 h-4 text-[#c8a951]/60" />
                  <span>{formatEventDate(activeEvent.date, locale)}</span>
                </div>
                {activeEvent.time && (
                  <div className="flex items-center gap-3 text-sm text-white/40">
                    <Clock className="w-4 h-4 text-[#c8a951]/60" />
                    <span>{activeEvent.time}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-white/40">
                  <MapPin className="w-4 h-4 text-[#c8a951]/60" />
                  <span>{activeEvent.city || t('events.online')}</span>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-3">
              <Link
                href={`/events/${activeEvent.slug}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-6 py-3 text-sm font-bold rounded-lg hover:scale-[1.03] transition-all duration-300 shadow-lg shadow-[#c8a951]/15"
              >
                {t('events.detailsAndRegister')}
                <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
              </Link>
              {hasNext && (
                <button
                  onClick={goNext}
                  className="inline-flex items-center gap-2 border border-white/10 text-white/60 px-5 py-3 text-sm font-medium rounded-lg hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-300"
                >
                  {t('events.nextEvent')}
                  <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* EVENT CARDS STRIP                                                  */}
      {/* ================================================================= */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 hide-scrollbar -mx-2 px-2">
        {events.map((event, idx) => {
          const sd = formatShortDate(event.date, locale);
          const cardName = lang === 'en' && event.nameEn ? event.nameEn : event.name;
          return (
            <button
              key={event.id}
              onClick={() => goTo(idx)}
              className={`snap-center flex-shrink-0 w-[220px] sm:w-[260px] group relative rounded-xl overflow-hidden text-start transition-all duration-400 ${
                idx === activeIndex
                  ? 'ring-2 ring-[#c8a951] ring-offset-2 ring-offset-[#070b1e] scale-[1.02]'
                  : 'opacity-50 hover:opacity-80'
              }`}
              aria-label={`${cardName}${idx === activeIndex ? ` ${t('events.currentEventAria')}` : ''}`}
            >
              {/* Image */}
              <div className="relative aspect-[16/10]">
                {event.imageUrl ? (
                  <Image
                    src={event.imageUrl}
                    alt={cardName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#111b3c] to-[#0a0e27] flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-white/10" />
                  </div>
                )}

                <div className={`absolute inset-0 transition-colors duration-300 ${
                  idx === activeIndex ? 'bg-black/10' : 'bg-black/40 group-hover:bg-black/20'
                }`} />

                {/* Date mini badge */}
                <div className="absolute top-2 start-2 bg-[#c8a951] text-[#070b1e] rounded-lg px-2 py-1 text-center min-w-[36px]">
                  <p className="text-sm font-black leading-none">{sd.day}</p>
                  <p className="text-[8px] font-bold uppercase">{sd.month}</p>
                </div>

                {/* Active indicator */}
                {idx === activeIndex && (
                  <div className="absolute top-2 end-2 bg-[#c8a951] text-[#070b1e] text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {t('events.showing')}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 bg-white/[0.03]">
                <p className={`text-xs font-bold line-clamp-1 ${
                  idx === activeIndex ? 'text-[#e8d48b]' : 'text-white/70'
                }`}>
                  {cardName}
                </p>
                <p className="text-[10px] text-white/30 mt-1 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {event.city || t('events.online')}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
