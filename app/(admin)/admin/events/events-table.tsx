/**
 * Events Table Component
 * 
 * Data table for managing events with actions.
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Video,
  Users,
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Search,
  Filter,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteEventAction, updateEventAction } from '../actions';
import { EventFormDialog } from './event-form-dialog';

// =============================================================================
// TYPES
// =============================================================================

interface Event {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  description?: string | null;
  date: Date;
  time: string;
  endTime?: string | null;
  locationType: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
  address?: string | null;
  city?: string | null;
  virtualLink?: string | null;
  registrationLink?: string | null;
  registrationRequired: boolean;
  capacity?: number | null;
  registeredCount: number;
  isFree: boolean;
  price?: number | null | unknown;
  currency: string;
  category?: string | null;
  host?: string | null;
  status: 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'PAST' | 'CANCELLED';
  isActive: boolean;
  isFeatured: boolean;
  imageUrl?: string | null;
  createdAt: Date;
}

interface EventsTableProps {
  events: Event[];
}

// =============================================================================
// HELPERS
// =============================================================================

const STATUS_CONFIG = {
  DRAFT: { label: 'טיוטה', color: 'bg-slate-100 text-slate-600' },
  UPCOMING: { label: 'קרוב', color: 'bg-emerald-100 text-emerald-700' },
  ONGOING: { label: 'מתקיים', color: 'bg-blue-100 text-blue-700' },
  PAST: { label: 'עבר', color: 'bg-slate-100 text-slate-500' },
  CANCELLED: { label: 'בוטל', color: 'bg-red-100 text-red-600' },
};

const LOCATION_TYPE_CONFIG = {
  PHYSICAL: { label: 'פיזי', icon: MapPin, color: 'text-emerald-600' },
  VIRTUAL: { label: 'וירטואלי', icon: Video, color: 'text-blue-600' },
  HYBRID: { label: 'משולב', icon: Globe, color: 'text-purple-600' },
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// =============================================================================
// COMPONENT
// =============================================================================

export function EventsTable({ events: initialEvents }: EventsTableProps) {
  const [events, setEvents] = useState(initialEvents);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync local state when server data changes (after router.refresh)
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch = 
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.host?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Toggle active status
  const handleToggleActive = async (event: Event) => {
    const result = await updateEventAction(event.id, { isActive: !event.isActive });
    if (result.success) {
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, isActive: !e.isActive } : e))
      );
    }
    setOpenMenuId(null);
  };

  // Toggle featured
  const handleToggleFeatured = async (event: Event) => {
    const result = await updateEventAction(event.id, { isFeatured: !event.isFeatured });
    if (result.success) {
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, isFeatured: !e.isFeatured } : e))
      );
    }
    setOpenMenuId(null);
  };

  // Delete event
  const handleDelete = async (eventId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק אירוע זה?')) return;
    
    setIsDeleting(eventId);
    const result = await deleteEventAction(eventId);
    
    if (result.success) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    }
    setIsDeleting(null);
    setOpenMenuId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="חיפוש אירועים..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-500/20"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-500/20"
        >
          <option value="ALL">כל הסטטוסים</option>
          <option value="UPCOMING">קרוב</option>
          <option value="ONGOING">מתקיים</option>
          <option value="DRAFT">טיוטה</option>
          <option value="PAST">עבר</option>
          <option value="CANCELLED">בוטל</option>
        </select>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-slate-100">
        <AnimatePresence>
          {filteredEvents.map((event) => {
            const LocationIcon = LOCATION_TYPE_CONFIG[event.locationType].icon;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'p-4 hover:bg-slate-50 transition-colors active:bg-slate-100',
                  !event.isActive && 'opacity-60'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-royal-100 text-royal-600 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 truncate text-sm">
                          {event.name}
                        </p>
                        {event.isFeatured && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      {event.host && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">{event.host}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === event.id ? null : event.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-500" />
                    </button>

                    <AnimatePresence>
                      {openMenuId === event.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute left-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20"
                          >
                            <EventFormDialog mode="edit" event={event}>
                              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                <Edit className="w-4 h-4" />
                                <span>עריכה</span>
                              </button>
                            </EventFormDialog>
                            <button
                              onClick={() => handleToggleActive(event)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              {event.isActive ? <><EyeOff className="w-4 h-4" /><span>הסתר</span></> : <><Eye className="w-4 h-4" /><span>הצג</span></>}
                            </button>
                            <button
                              onClick={() => handleToggleFeatured(event)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              {event.isFeatured ? <><StarOff className="w-4 h-4" /><span>הסר מומלץ</span></> : <><Star className="w-4 h-4" /><span>סמן כמומלץ</span></>}
                            </button>
                            {event.registrationLink && (
                              <a href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                <ExternalLink className="w-4 h-4" /><span>עמוד הרשמה</span>
                              </a>
                            )}
                            <div className="border-t border-slate-100 my-1" />
                            <button
                              onClick={() => handleDelete(event.id)}
                              disabled={isDeleting === event.id}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>{isDeleting === event.id ? 'מוחק...' : 'מחיקה'}</span>
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 mt-2.5 mr-[52px]">
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formatDate(event.date)} • {event.time}
                  </span>
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <LocationIcon className={cn('w-3 h-3', LOCATION_TYPE_CONFIG[event.locationType].color)} />
                    {LOCATION_TYPE_CONFIG[event.locationType].label}
                    {event.city && ` • ${event.city}`}
                  </span>
                  <span className={cn(
                    'inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium',
                    STATUS_CONFIG[event.status].color
                  )}>
                    {STATUS_CONFIG[event.status].label}
                  </span>
                  {event.capacity && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.registeredCount}/{event.capacity}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">אירוע</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">תאריך</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">מיקום</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">הרשמות</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">סטטוס</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence>
              {filteredEvents.map((event) => {
                const LocationIcon = LOCATION_TYPE_CONFIG[event.locationType].icon;

                return (
                  <motion.tr
                    key={event.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      'hover:bg-slate-50 transition-colors',
                      !event.isActive && 'opacity-60'
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-royal-100 text-royal-600 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900 truncate">{event.name}</p>
                            {event.isFeatured && <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />}
                          </div>
                          {event.host && <p className="text-xs text-slate-500 truncate">{event.host}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{formatDate(event.date)}</p>
                      <p className="text-xs text-slate-500">{event.time}{event.endTime && ` - ${event.endTime}`}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <LocationIcon className={cn('w-4 h-4', LOCATION_TYPE_CONFIG[event.locationType].color)} />
                        <div>
                          <p className="text-sm text-slate-700">{LOCATION_TYPE_CONFIG[event.locationType].label}</p>
                          {event.city && <p className="text-xs text-slate-500">{event.city}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {event.capacity ? (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">{event.registeredCount}/{event.capacity}</span>
                          </div>
                          <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-royal-500 rounded-full" style={{ width: `${Math.min(100, (event.registeredCount / event.capacity) * 100)}%` }} />
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">ללא הגבלה</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-medium', STATUS_CONFIG[event.status].color)}>
                        {STATUS_CONFIG[event.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === event.id ? null : event.id)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-500" />
                        </button>
                        <AnimatePresence>
                          {openMenuId === event.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute left-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20"
                            >
                              <EventFormDialog mode="edit" event={event}>
                                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                  <Edit className="w-4 h-4" /><span>עריכה</span>
                                </button>
                              </EventFormDialog>
                              <button onClick={() => handleToggleActive(event)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                {event.isActive ? <><EyeOff className="w-4 h-4" /><span>הסתר</span></> : <><Eye className="w-4 h-4" /><span>הצג</span></>}
                              </button>
                              <button onClick={() => handleToggleFeatured(event)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                {event.isFeatured ? <><StarOff className="w-4 h-4" /><span>הסר מומלץ</span></> : <><Star className="w-4 h-4" /><span>סמן כמומלץ</span></>}
                              </button>
                              {event.registrationLink && (
                                <a href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                  <ExternalLink className="w-4 h-4" /><span>עמוד הרשמה</span>
                                </a>
                              )}
                              <div className="border-t border-slate-100 my-1" />
                              <button onClick={() => handleDelete(event.id)} disabled={isDeleting === event.id} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" /><span>{isDeleting === event.id ? 'מוחק...' : 'מחיקה'}</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {filteredEvents.length === 0 && (
        <div className="p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            אין אירועים
          </h3>
          <p className="text-slate-500">
            {searchQuery || statusFilter !== 'ALL'
              ? 'לא נמצאו אירועים מתאימים לחיפוש'
              : 'הוסף את האירוע הראשון שלך'}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          מציג {filteredEvents.length} מתוך {events.length} אירועים
        </p>
      </div>
    </div>
  );
}

export default EventsTable;
