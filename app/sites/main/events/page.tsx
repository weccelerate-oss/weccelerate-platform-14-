/**
 * Events Listing Page — Server Component (Data Fetching Only)
 */

export const revalidate = 3600; // ISR: regenerate every hour

import { Metadata } from 'next';
import { getEvents } from '@/lib/db-repository';
import { mockEvents } from '@/lib/mock-data';
import { EventsContent } from './EventsContent';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = {
  title: { absolute: 'אירועים | WeCcelerate — מפגשים, וובינרים ודמו דייס' },
  description:
    'כל האירועים של WeCcelerate: מפגשי נטוורקינג, Demo Days, וובינרים מקצועיים, סדנאות ליזמים ואירועי חדשנות בתל אביב וירושלים.',
  keywords: [
    'אירועי סטארטאפ',
    'Demo Day',
    'נטוורקינג יזמים',
    'WeCcelerate אירועים',
    'וובינרים חדשנות',
    'אירועי טכנולוגיה תל אביב',
  ],
};

// =============================================================================
// DATA FETCHING
// =============================================================================

async function getEventsData() {
  try {
    const events = await getEvents({ limit: 50 });
    if (events.length > 0) {
      return events.map((e: {
        id: string;
        name: string;
        slug: string;
        description?: string | null;
        date: Date | string;
        time?: string | null;
        city?: string | null;
        category?: string | null;
        imageUrl?: string | null;
        status?: string | null;
        registrationLink?: string | null;
      }) => ({
        id: e.id,
        name: e.name,
        slug: e.slug,
        description: e.description,
        date: e.date,
        time: e.time ?? null,
        city: e.city ?? null,
        category: e.category ?? null,
        imageUrl: e.imageUrl ?? null,
        status: e.status ?? 'UPCOMING',
        registrationLink: e.registrationLink ?? null,
      }));
    }
    return mockEvents.map((e) => ({
      id: e.id,
      name: e.name,
      slug: e.slug ?? e.id,
      description: e.description ?? null,
      date: new Date(e.date),
      time: e.time ?? null,
      city: e.location?.city ?? null,
      category: e.category ?? null,
      imageUrl: e.imageUrl ?? null,
      status: e.status === 'upcoming' ? 'UPCOMING' : 'PAST',
      registrationLink: e.registrationLink ?? null,
    }));
  } catch {
    return mockEvents.map((e) => ({
      id: e.id,
      name: e.name,
      slug: e.slug ?? e.id,
      description: e.description ?? null,
      date: new Date(e.date),
      time: e.time ?? null,
      city: e.location?.city ?? null,
      category: e.category ?? null,
      imageUrl: e.imageUrl ?? null,
      status: e.status === 'upcoming' ? 'UPCOMING' : 'PAST',
      registrationLink: e.registrationLink ?? null,
    }));
  }
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

// =============================================================================
// EVENT SCHEMA (JSON-LD for Google Events Rich Results)
// =============================================================================

function generateEventsSchema(events: { name: string; description: string | null; date: Date; time: string | null; city: string | null; status: string; registrationLink: string | null; imageUrl: string | null }[]) {
  const upcomingEvents = events
    .filter((e) => e.status === 'UPCOMING')
    .slice(0, 10);

  if (upcomingEvents.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@graph': upcomingEvents.map((event) => {
      const startDate = event.date instanceof Date ? event.date.toISOString() : new Date(event.date).toISOString();

      return {
        '@type': 'Event',
        name: event.name,
        description: event.description || `אירוע של WeCcelerate: ${event.name}`,
        startDate,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: event.city
          ? 'https://schema.org/OfflineEventAttendanceMode'
          : 'https://schema.org/OnlineEventAttendanceMode',
        location: event.city
          ? {
              '@type': 'Place',
              name: event.city,
              address: {
                '@type': 'PostalAddress',
                addressLocality: event.city,
                addressCountry: 'IL',
              },
            }
          : {
              '@type': 'VirtualLocation',
              url: event.registrationLink || 'https://weccelerate.co.il/events',
            },
        organizer: {
          '@type': 'Organization',
          name: 'WeCcelerate',
          url: 'https://weccelerate.co.il',
        },
        ...(event.imageUrl && { image: event.imageUrl }),
        ...(event.registrationLink && {
          offers: {
            '@type': 'Offer',
            url: event.registrationLink,
            price: '0',
            priceCurrency: 'ILS',
            availability: 'https://schema.org/InStock',
          },
        }),
      };
    }),
  };
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function EventsPage() {
  const events = await getEventsData();
  const eventsSchema = generateEventsSchema(events);

  return (
    <>
      {eventsSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(eventsSchema),
          }}
        />
      )}
      <EventsContent events={events} />
    </>
  );
}
