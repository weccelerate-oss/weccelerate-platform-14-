import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getEventBySlug, getEvents } from '@/lib/db-repository';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';

export const revalidate = 3600;

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug).catch(() => null);

  if (!event) {
    return constructMetadata({
      title: 'אירוע לא נמצא',
      path: `/events/${slug}`,
      noIndex: true,
    });
  }

  const startDate = event.date instanceof Date ? event.date : new Date(event.date);
  const dateStr = startDate.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
  const description = event.description
    ?? `${event.name} — אירוע של WeCcelerate בתאריך ${dateStr}${event.city ? `, ${event.city}` : ''}.`;

  return constructMetadata({
    title: event.name,
    description,
    path: `/events/${slug}`,
    ogImage: event.imageUrl ?? undefined,
    locale: 'he',
    publishedTime: startDate.toISOString(),
    modifiedTime: (event.updatedAt instanceof Date ? event.updatedAt : new Date(event.updatedAt)).toISOString(),
    keywords: [
      event.name,
      'WeCcelerate אירוע',
      'Demo Day',
      'נטוורקינג יזמים',
      ...(event.tags ?? []),
    ],
  });
}

export async function generateStaticParams() {
  try {
    const events = await getEvents({ limit: 100 });
    return events.map((e) => ({ slug: e.slug }));
  } catch {
    return [];
  }
}

function buildEventSchema(event: Awaited<ReturnType<typeof getEventBySlug>>) {
  if (!event) return null;

  const startDate = event.date instanceof Date ? event.date.toISOString() : new Date(event.date).toISOString();
  const endDate = event.endTime
    ? `${(event.date instanceof Date ? event.date : new Date(event.date)).toISOString().slice(0, 10)}T${event.endTime}:00+03:00`
    : startDate;

  const isVirtual = event.locationType === 'VIRTUAL';
  const isHybrid = event.locationType === 'HYBRID';

  const eventUrl = `${SITE_CONFIG.url}/events/${event.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${eventUrl}#event`,
    name: event.name,
    description: event.description ?? event.name,
    startDate,
    endDate,
    eventStatus: event.status === 'CANCELLED'
      ? 'https://schema.org/EventCancelled'
      : event.status === 'PAST'
        ? 'https://schema.org/EventScheduled'
        : 'https://schema.org/EventScheduled',
    eventAttendanceMode: isVirtual
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : isHybrid
        ? 'https://schema.org/MixedEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
    location: isVirtual
      ? {
          '@type': 'VirtualLocation',
          url: event.virtualLink ?? eventUrl,
        }
      : {
          '@type': 'Place',
          name: event.city ?? 'WeCcelerate',
          address: {
            '@type': 'PostalAddress',
            streetAddress: event.address ?? 'HaRakevet 58',
            addressLocality: event.city ?? 'Tel Aviv',
            addressCountry: 'IL',
          },
        },
    organizer: {
      '@type': 'Organization',
      name: 'WeCcelerate',
      url: SITE_CONFIG.url,
    },
    performer: event.host
      ? {
          '@type': 'Person',
          name: event.host,
          ...(event.hostBio && { description: event.hostBio }),
        }
      : undefined,
    image: event.imageUrl ? [event.imageUrl] : [`${SITE_CONFIG.url}/og-image.jpg`],
    offers: event.registrationLink
      ? {
          '@type': 'Offer',
          url: event.registrationLink,
          price: event.isFree ? '0' : (event.price ?? '0'),
          priceCurrency: event.currency ?? 'ILS',
          availability:
            event.capacity && event.registeredCount && event.registeredCount >= event.capacity
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
          validFrom: new Date().toISOString(),
        }
      : undefined,
    inLanguage: 'he-IL',
    isAccessibleForFree: event.isFree ?? false,
    maximumAttendeeCapacity: event.capacity ?? undefined,
  };
}

export default async function EventDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug).catch(() => null);

  if (!event || !event.isActive) {
    notFound();
  }

  const startDate = event.date instanceof Date ? event.date : new Date(event.date);
  const dateStrHe = startDate.toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const schema = buildEventSchema(event);

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}

      <article className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12 md:py-16" dir="rtl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">בית</Link>
            <span className="mx-2">›</span>
            <Link href="/events" className="hover:text-slate-900">אירועים</Link>
            <span className="mx-2">›</span>
            <span aria-current="page" className="text-slate-900">{event.name}</span>
          </nav>

          <header className="mb-8">
            <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">{event.name}</h1>
            <p
              data-speakable
              className="text-lg text-slate-700 leading-relaxed"
            >
              {event.description ?? `אירוע של WeCcelerate בתאריך ${dateStrHe}`}
            </p>
          </header>

          {event.imageUrl && (
            <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={event.imageUrl}
                alt={event.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1024px"
                className="object-cover"
              />
            </div>
          )}

          <dl className="mb-8 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-6 md:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500">תאריך</dt>
              <dd className="mt-1 text-slate-900">{dateStrHe}</dd>
            </div>
            {event.time && (
              <div>
                <dt className="text-sm font-medium text-slate-500">שעה</dt>
                <dd className="mt-1 text-slate-900">
                  {event.time}
                  {event.endTime ? ` – ${event.endTime}` : ''}
                </dd>
              </div>
            )}
            {event.city && (
              <div>
                <dt className="text-sm font-medium text-slate-500">מיקום</dt>
                <dd className="mt-1 text-slate-900">
                  {event.address ? `${event.address}, ${event.city}` : event.city}
                </dd>
              </div>
            )}
            {event.host && (
              <div>
                <dt className="text-sm font-medium text-slate-500">מנחה</dt>
                <dd className="mt-1 text-slate-900">{event.host}</dd>
              </div>
            )}
            {event.category && (
              <div>
                <dt className="text-sm font-medium text-slate-500">קטגוריה</dt>
                <dd className="mt-1 text-slate-900">{event.category}</dd>
              </div>
            )}
            {typeof event.capacity === 'number' && (
              <div>
                <dt className="text-sm font-medium text-slate-500">מקומות</dt>
                <dd className="mt-1 text-slate-900">
                  {event.registeredCount ?? 0} / {event.capacity}
                </dd>
              </div>
            )}
          </dl>

          {event.locationDetails && (
            <section className="prose prose-slate mb-8 max-w-none">
              <h2 className="text-xl font-semibold text-slate-900">פרטי מיקום</h2>
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
                הרשמה לאירוע
              </a>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
