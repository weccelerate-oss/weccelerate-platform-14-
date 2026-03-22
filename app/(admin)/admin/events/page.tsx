/**
 * Admin Events Management Page
 * 
 * Enterprise-grade event management interface with EY-inspired design.
 * Features: Inline creation form, data table, and preview functionality.
 * 
 * Design: Sharp borders, generous whitespace, strict grid system
 */

export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { Suspense } from 'react';
import { Plus, Calendar, MapPin, Video, Users, ArrowLeft, Clock, Filter } from 'lucide-react';
import { EventsTable } from './events-table';
import { EventFormDialog } from './event-form-dialog';
import { EventQuickCreateForm } from './event-quick-create';

export const metadata: Metadata = {
  title: 'ניהול אירועים | מערכת ניהול WeCcelerate',
  description: 'צור, ערוך ונהל אירועים ומפגשים',
};

// Mock data for development
const MOCK_EVENTS = [
  {
    id: 'event-1',
    name: 'מפגש יזמים - מהרעיון לביצוע',
    nameEn: 'Entrepreneur Meetup',
    slug: 'entrepreneur-meetup-jan-2024',
    description: 'מפגש חודשי ליזמים בתחילת הדרך עם הרצאות והתחברות',
    date: new Date('2024-02-15'),
    time: '18:00',
    endTime: '21:00',
    timezone: 'Asia/Jerusalem',
    locationType: 'PHYSICAL' as const,
    address: 'רחוב הרצל 50',
    city: 'תל אביב',
    virtualLink: null,
    locationDetails: 'קומה 3, חדר ישיבות מרכזי',
    registrationLink: 'https://register.example.com/event1',
    registrationRequired: true,
    capacity: 50,
    registeredCount: 32,
    price: null,
    currency: 'ILS',
    isFree: true,
    imageUrl: '/images/events/meetup.jpg',
    thumbnailUrl: null,
    category: 'מפגש',
    tags: ['יזמות', 'נטוורקינג'],
    host: 'צוות WeCcelerate',
    hostBio: null,
    status: 'UPCOMING' as const,
    isActive: true,
    isFeatured: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'event-2',
    name: 'וובינר: איך לגייס סבב ראשון',
    nameEn: 'Webinar: How to Raise Seed Round',
    slug: 'seed-round-webinar',
    description: 'וובינר מקיף על תהליך גיוס ההון הראשון',
    date: new Date('2024-02-20'),
    time: '14:00',
    endTime: '15:30',
    timezone: 'Asia/Jerusalem',
    locationType: 'VIRTUAL' as const,
    address: null,
    city: null,
    virtualLink: 'https://zoom.us/j/123456789',
    locationDetails: null,
    registrationLink: 'https://register.example.com/webinar',
    registrationRequired: true,
    capacity: 200,
    registeredCount: 89,
    price: null,
    currency: 'ILS',
    isFree: true,
    imageUrl: '/images/events/webinar.jpg',
    thumbnailUrl: null,
    category: 'וובינר',
    tags: ['גיוס', 'משקיעים'],
    host: 'ד"ר רונן יהודה',
    hostBio: 'משקיע ויזם סדרתי',
    status: 'UPCOMING' as const,
    isActive: true,
    isFeatured: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: 'event-3',
    name: 'דמו דיי - מחזור חורף 2024',
    nameEn: 'Demo Day - Winter 2024',
    slug: 'demo-day-winter-2024',
    description: 'אירוע ההדגמה השנתי שלנו - הזדמנות לפגוש את הסטארטאפים המבטיחים',
    date: new Date('2024-03-05'),
    time: '09:00',
    endTime: '17:00',
    timezone: 'Asia/Jerusalem',
    locationType: 'HYBRID' as const,
    address: 'מרכז הכנסים, רחוב יגאל אלון 94',
    city: 'תל אביב',
    virtualLink: 'https://stream.example.com/demo-day',
    locationDetails: 'אולם ראשי + שידור חי',
    registrationLink: 'https://register.example.com/demo-day',
    registrationRequired: true,
    capacity: 300,
    registeredCount: 156,
    price: null,
    currency: 'ILS',
    isFree: true,
    imageUrl: '/images/events/demo-day.jpg',
    thumbnailUrl: null,
    category: 'דמו דיי',
    tags: ['סטארטאפים', 'משקיעים', 'השקה'],
    host: 'WeCcelerate',
    hostBio: null,
    status: 'UPCOMING' as const,
    isActive: true,
    isFeatured: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-25'),
  },
];

async function getEvents() {
  try {
    const { prisma } = await import('@/lib/db');
    
    const events = await prisma.event.findMany({
      orderBy: { date: 'desc' },
    });
    return events;
  } catch (dbError) {
    console.warn('[Admin Events] Database error, using mock data:', dbError);
    return MOCK_EVENTS;
  }
}

async function getEventStats() {
  const events = await getEvents();
  const upcoming = events.filter(e => e.status === 'UPCOMING').length;
  const totalRegistrations = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);
  const featured = events.filter(e => e.isFeatured).length;
  return { total: events.length, upcoming, totalRegistrations, featured };
}

export default async function EventsPage() {
  const events = await getEvents();
  const stats = await getEventStats();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-8 py-4 sm:py-6 pt-14 lg:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  ניהול אירועים
                </h1>
              </div>
              <p className="text-sm text-slate-500">
                צור וערוך אירועים, מפגשים ווובינרים
              </p>
            </div>

            <EventFormDialog mode="create">
              <button className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white text-sm sm:text-base font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center">
                <Plus className="w-4 h-4" />
                אירוע חדש
              </button>
            </EventFormDialog>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white border border-slate-200 p-5">
            <p className="text-sm text-slate-500 mb-1">סה"כ אירועים</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-white border border-slate-200 p-5 border-l-4 border-l-emerald-500">
            <p className="text-sm text-slate-500 mb-1">אירועים קרובים</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.upcoming}</p>
          </div>
          <div className="bg-white border border-slate-200 p-5">
            <p className="text-sm text-slate-500 mb-1">נרשמים</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalRegistrations}</p>
          </div>
          <div className="bg-white border border-slate-200 p-5">
            <p className="text-sm text-slate-500 mb-1">מומלצים</p>
            <p className="text-2xl font-bold text-slate-900">{stats.featured}</p>
          </div>
        </div>

        {/* Quick Create Form */}
        <Suspense fallback={<FormSkeleton />}>
          <EventQuickCreateForm />
        </Suspense>

        {/* Events Table */}
        <div className="mt-8">
          <Suspense fallback={<TableSkeleton />}>
            <EventsTable events={events} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="bg-white border border-slate-200 p-4 sm:p-6 animate-pulse">
      <div className="h-6 w-32 bg-slate-200 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-10 bg-slate-100" />
        <div className="h-10 bg-slate-100" />
        <div className="h-10 bg-slate-100" />
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <div className="h-10 w-64 bg-slate-200 animate-pulse" />
      </div>
      <div className="divide-y divide-slate-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 bg-slate-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-slate-200 animate-pulse" />
              <div className="h-3 w-32 bg-slate-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
