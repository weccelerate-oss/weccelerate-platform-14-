'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import type { getEventBySlug } from '@/lib/db-repository';

type EventRecord = NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>;

export default function EventDetailContent({ event }: { event: EventRecord }) {
  const { t, lang } = useLanguage();
  const locale = lang === 'en' ? 'en-US' : 'he-IL';

  const startDate = event.date instanceof Date ? event.date : new Date(event.date);
  const dateStr = startDate.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const name = lang === 'en' && event.nameEn ? event.nameEn : event.name;
  const description =
    lang === 'en' && event.descriptionEn ? event.descriptionEn : event.description;

  return (
    <article className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">{t('events.breadcrumb.home')}</Link>
          <span className="mx-2">›</span>
          <Link href="/events" className="hover:text-slate-900">{t('events.breadcrumb.events')}</Link>
          <span className="mx-2">›</span>
          <span aria-current="page" className="text-slate-900">{name}</span>
        </nav>

        <header className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">{name}</h1>
          <p
            data-speakable
            className="text-lg text-slate-700 leading-relaxed"
          >
            {description ?? t('events.fallbackDescription').replace('{date}', dateStr)}
          </p>
        </header>

        {event.imageUrl && (
          <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100">
            <Image
              src={event.imageUrl}
              alt={name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        )}

        <dl className="mb-8 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-6 md:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-500">{t('events.label.date')}</dt>
            <dd className="mt-1 text-slate-900">{dateStr}</dd>
          </div>
          {event.time && (
            <div>
              <dt className="text-sm font-medium text-slate-500">{t('events.label.time')}</dt>
              <dd className="mt-1 text-slate-900" dir="ltr">
                {event.time}
                {event.endTime ? ` – ${event.endTime}` : ''}
              </dd>
            </div>
          )}
          {event.city && (
            <div>
              <dt className="text-sm font-medium text-slate-500">{t('events.label.location')}</dt>
              <dd className="mt-1 text-slate-900">
                {event.address ? `${event.address}, ${event.city}` : event.city}
              </dd>
            </div>
          )}
          {event.host && (
            <div>
              <dt className="text-sm font-medium text-slate-500">{t('events.label.host')}</dt>
              <dd className="mt-1 text-slate-900">{event.host}</dd>
            </div>
          )}
          {event.category && (
            <div>
              <dt className="text-sm font-medium text-slate-500">{t('events.label.category')}</dt>
              <dd className="mt-1 text-slate-900">{event.category}</dd>
            </div>
          )}
          {typeof event.capacity === 'number' && (
            <div>
              <dt className="text-sm font-medium text-slate-500">{t('events.label.capacity')}</dt>
              <dd className="mt-1 text-slate-900" dir="ltr">
                {event.registeredCount ?? 0} / {event.capacity}
              </dd>
            </div>
          )}
        </dl>

        {event.locationDetails && (
          <section className="prose prose-slate mb-8 max-w-none">
            <h2 className="text-xl font-semibold text-slate-900">{t('events.locationDetailsTitle')}</h2>
            <p className="text-slate-700 whitespace-pre-line">{event.locationDetails}</p>
          </section>
        )}

        {event.registrationLink && event.status === 'UPCOMING' && (
          <div className="sticky bottom-6 flex justify-center md:static md:justify-start">
            <a
              href={event.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700"
            >
              {t('events.register')}
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
