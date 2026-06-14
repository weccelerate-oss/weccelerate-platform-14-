import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEventBySlug, getEvents } from '@/lib/db-repository';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import EventDetailContent from './EventDetailContent';

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
    image: event.imageUrl ?? undefined,
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
    return events.map((e: { slug: string }) => ({ slug: e.slug }));
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

  const schema = buildEventSchema(event);

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}

      <EventDetailContent event={event} />
    </>
  );
}
