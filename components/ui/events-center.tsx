'use client';

import { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Event, EventsCenterProps, EventStatus, EventLocationType } from '@/types/content';
import { cn, formatDate, formatTime, isFutureDate, isToday } from '@/lib/utils';

// =============================================================================
// STATUS & LOCATION CONFIGS
// =============================================================================

const statusConfig: Record<EventStatus, {
  label: string;
  bgClass: string;
  textClass: string;
}> = {
  upcoming: {
    label: 'בקרוב',
    bgClass: 'bg-emerald-100',
    textClass: 'text-emerald-700',
  },
  ongoing: {
    label: 'עכשיו!',
    bgClass: 'bg-red-100 animate-pulse',
    textClass: 'text-red-700',
  },
  past: {
    label: 'הסתיים',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-600',
  },
  cancelled: {
    label: 'בוטל',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700 line-through',
  },
};

const locationTypeConfig: Record<EventLocationType, {
  label: string;
  icon: typeof MapPin;
  bgClass: string;
}> = {
  physical: {
    label: 'פיזי',
    icon: MapPin,
    bgClass: 'bg-royal-100 text-royal-700',
  },
  zoom: {
    label: 'Zoom',
    icon: Video,
    bgClass: 'bg-teal-100 text-teal-700',
  },
  hybrid: {
    label: 'היברידי',
    icon: Video,
    bgClass: 'bg-gold-100 text-gold-700',
  },
};

// =============================================================================
// EVENT CARD COMPONENT
// =============================================================================

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact' | 'featured';
}

function EventCard({ event, variant = 'default' }: EventCardProps) {
  const status = statusConfig[event.status];
  const locationType = locationTypeConfig[event.location.type];
  const LocationIcon = locationType.icon;

  const eventDate = new Date(event.date);
  const isEventToday = isToday(event.date);
  const isUpcoming = isFutureDate(event.date);

  // Calculate capacity percentage
  const capacityPercentage = event.capacity && event.registeredCount
    ? Math.round((event.registeredCount / event.capacity) * 100)
    : null;

  const isFeatured = variant === 'featured';

  return (
    <article
      className={cn(
        'group relative bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:border-royal-200 hover:-translate-y-1',
        isFeatured && 'md:col-span-2 md:row-span-2'
      )}
    >
      {/* Image */}
      {event.imageUrl && (
        <div className={cn(
          'relative overflow-hidden bg-slate-100',
          isFeatured ? 'h-48 md:h-64' : 'h-40'
        )}>
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Status badge overlay */}
          <div className="absolute top-3 right-3 flex gap-2">
            <span className={cn(
              'px-2.5 py-1 rounded-full text-xs font-semibold',
              status.bgClass,
              status.textClass
            )}>
              {status.label}
            </span>
            <span className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1',
              locationType.bgClass
            )}>
              <LocationIcon className="w-3 h-3" />
              {locationType.label}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        {event.category && (
          <span className="text-xs text-royal-600 font-medium uppercase tracking-wide">
            {event.category}
          </span>
        )}

        {/* Title */}
        <h3 className={cn(
          'font-bold text-slate-900 mt-1 mb-3 line-clamp-2 group-hover:text-royal-700 transition-colors',
          isFeatured ? 'text-xl md:text-2xl' : 'text-lg'
        )}>
          {event.name}
        </h3>

        {/* Description (featured only) */}
        {isFeatured && event.description && (
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Date & Time */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className={cn(isEventToday && 'text-emerald-600 font-semibold')}>
              {isEventToday ? 'היום' : formatDate(eventDate, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              {formatTime(event.time)}
              {event.endTime && ` - ${formatTime(event.endTime)}`}
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-1.5 text-sm text-slate-600 mb-4">
          <LocationIcon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {event.location.type === 'zoom' ? (
              'אירוע וירטואלי ב-Zoom'
            ) : (
              `${event.location.address}${event.location.city ? `, ${event.location.city}` : ''}`
            )}
          </span>
        </div>

        {/* Capacity indicator */}
        {capacityPercentage !== null && isUpcoming && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{event.registeredCount} / {event.capacity} נרשמו</span>
              </div>
              <span className={cn(
                capacityPercentage >= 90 && 'text-red-600 font-medium'
              )}>
                {capacityPercentage >= 90 ? 'מקומות אחרונים!' : `${capacityPercentage}%`}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  capacityPercentage >= 90 ? 'bg-red-500' : 
                  capacityPercentage >= 70 ? 'bg-orange-500' : 'bg-emerald-500'
                )}
                style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Price */}
        {event.price !== undefined && (
          <div className="mb-4">
            {event.price === 0 ? (
              <span className="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-2 py-0.5 rounded">
                כניסה חופשית
              </span>
            ) : (
              <span className="text-slate-700 font-semibold">
                ₪{event.price}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {event.status === 'upcoming' && event.registrationLink && (
            <a
              href={event.registrationLink}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all',
                'bg-royal-600 text-white hover:bg-royal-700',
                'focus:outline-none focus:ring-2 focus:ring-royal-500 focus:ring-offset-2'
              )}
            >
              הרשמה
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {event.status === 'past' && (
            <button
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all',
                'border border-slate-300 text-slate-700 hover:bg-slate-50'
              )}
            >
              צפה בהקלטה
            </button>
          )}
        </div>
      </div>

      {/* Host badge */}
      {event.host && (
        <div className="absolute bottom-20 left-4 right-4">
          <div className="text-xs text-slate-500">
            מנחה: <span className="text-slate-700">{event.host}</span>
          </div>
        </div>
      )}
    </article>
  );
}

// =============================================================================
// EVENTS CENTER COMPONENT
// =============================================================================

export function EventsCenter({
  events,
  limit = 6,
  statusFilter = ['upcoming', 'ongoing'],
  showPast = false,
  variant = 'grid',
}: EventsCenterProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Apply status filter based on activeFilter
    if (activeFilter === 'upcoming') {
      filtered = events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing');
    } else if (activeFilter === 'past') {
      filtered = events.filter((e) => e.status === 'past');
    }

    // Sort: ongoing first, then by date
    return filtered.sort((a, b) => {
      if (a.status === 'ongoing' && b.status !== 'ongoing') return -1;
      if (b.status === 'ongoing' && a.status !== 'ongoing') return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }).slice(0, limit);
  }, [events, activeFilter, limit]);

  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-royal-600 font-semibold text-sm uppercase tracking-wide">
              אירועים
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
              מרכז האירועים
            </h2>
            <p className="text-slate-600 mt-2 max-w-xl">
              הצטרפו לאירועים, סדנאות ומפגשי נטוורקינג שלנו
            </p>
          </div>

          {/* Filter tabs */}
          {showPast && (
            <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
              <button
                onClick={() => setActiveFilter('upcoming')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-all',
                  activeFilter === 'upcoming'
                    ? 'bg-royal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                קרובים
              </button>
              <button
                onClick={() => setActiveFilter('past')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-all',
                  activeFilter === 'past'
                    ? 'bg-royal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                עברו
              </button>
              <button
                onClick={() => setActiveFilter('all')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-all',
                  activeFilter === 'all'
                    ? 'bg-royal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                הכל
              </button>
            </div>
          )}
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className={cn(
            'grid gap-6',
            variant === 'grid' && 'md:grid-cols-2 lg:grid-cols-3',
            variant === 'list' && 'grid-cols-1 max-w-3xl mx-auto'
          )}>
            {filteredEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                variant={index === 0 && variant === 'grid' ? 'featured' : 'default'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              אין אירועים {activeFilter === 'upcoming' ? 'קרובים' : 'להצגה'}
            </h3>
            <p className="text-slate-600">
              בדקו שוב בקרוב לעדכונים חדשים
            </p>
          </div>
        )}

        {/* View all link */}
        <div className="text-center mt-10">
          <a
            href="/events"
            className="inline-flex items-center gap-2 text-royal-600 font-semibold hover:text-royal-700 transition-colors"
          >
            לכל האירועים
            <ChevronLeft className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default EventsCenter;
