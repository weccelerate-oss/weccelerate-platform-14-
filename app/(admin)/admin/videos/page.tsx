/**
 * Admin Videos Management Page
 * 
 * CRUD interface for managing video content.
 */

export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import { VideosTable } from './videos-table';
import { VideoFormDialog } from './video-form-dialog';
import { YouTubeSyncButton } from './youtube-sync-button';

export const metadata: Metadata = {
  title: 'ניהול סרטונים | Admin',
  description: 'ניהול סרטוני וידאו',
};

// Mock data for development
const MOCK_VIDEOS = [
  {
    id: 'video-1',
    title: 'איך לבנות מצגת משקיעים מנצחת',
    titleEn: 'How to Build a Winning Pitch Deck',
    slug: 'winning-pitch-deck',
    description: 'טיפים מעשיים לבניית מצגת שתסגור את העסקה',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    vimeoUrl: null,
    videoUrl: null,
    embedUrl: null,
    thumbnail: '/images/videos/pitch-deck.jpg',
    duration: 1200,
    category: 'TUTORIAL' as const,
    tags: ['מצגת', 'משקיעים', 'גיוס'],
    speaker: 'יוסי כהן',
    speakerTitle: 'מייסד ויזם סדרתי',
    speakerImage: null,
    views: 1542,
    isActive: true,
    isFeatured: true,
    publishAt: new Date('2024-01-10'),
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'video-2',
    title: 'ראיון עם יוצאי מחזור קיץ 2023',
    titleEn: 'Interview with Summer 2023 Graduates',
    slug: 'summer-2023-interview',
    description: 'ראיון עם שלושה יזמים שסיימו את תוכנית ההאצה',
    youtubeUrl: 'https://www.youtube.com/watch?v=abc123',
    vimeoUrl: null,
    videoUrl: null,
    embedUrl: null,
    thumbnail: '/images/videos/interview.jpg',
    duration: 2400,
    category: 'INTERVIEW' as const,
    tags: ['ראיון', 'הצלחה', 'יזמות'],
    speaker: 'צוות WeCcelerate',
    speakerTitle: null,
    speakerImage: null,
    views: 876,
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-01-05'),
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'video-3',
    title: 'סיכום דמו דיי - סתיו 2023',
    titleEn: 'Demo Day Summary - Fall 2023',
    slug: 'demo-day-fall-2023',
    description: 'הסיכום המלא מאירוע הדמו דיי האחרון',
    youtubeUrl: 'https://www.youtube.com/watch?v=xyz789',
    vimeoUrl: null,
    videoUrl: null,
    embedUrl: null,
    thumbnail: '/images/videos/demo-day.jpg',
    duration: 5400,
    category: 'SUMMARY' as const,
    tags: ['דמו דיי', 'סטארטאפים', 'אירוע'],
    speaker: null,
    speakerTitle: null,
    speakerImage: null,
    views: 2341,
    isActive: true,
    isFeatured: true,
    publishAt: new Date('2023-12-20'),
    createdAt: new Date('2023-12-18'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'video-4',
    title: 'עדות לקוח: סטארטאפ MedTech',
    titleEn: 'Customer Testimonial: MedTech Startup',
    slug: 'medtech-testimonial',
    description: 'חוויית היזם מתוכנית ההאצה',
    youtubeUrl: 'https://www.youtube.com/watch?v=def456',
    vimeoUrl: null,
    videoUrl: null,
    embedUrl: null,
    thumbnail: '/images/videos/testimonial.jpg',
    duration: 300,
    category: 'TESTIMONIAL' as const,
    tags: ['עדות', 'MedTech', 'הצלחה'],
    speaker: 'ד"ר מיכל לוי',
    speakerTitle: 'מייסדת HealthTech Startup',
    speakerImage: null,
    views: 654,
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-01-12'),
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-12'),
  },
];

async function getVideos() {
  try {
    const { prisma } = await import('@/lib/db');
    
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return videos;
  } catch (dbError) {
    console.warn('[Admin Videos] Database error, using mock data:', dbError);
    return MOCK_VIDEOS;
  }
}

export default async function VideosPage() {
  const videos = await getVideos();

  return (
    <div className="p-4 sm:p-6 pt-14 lg:pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">ניהול סרטונים</h1>
          <p className="text-slate-500 mt-1">
            {videos.length} סרטונים במערכת
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <YouTubeSyncButton />
          <Suspense fallback={<div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />}>
            <VideoFormDialog mode="create">
              <button className="flex items-center gap-2 px-4 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>סרטון חדש</span>
              </button>
            </VideoFormDialog>
          </Suspense>
        </div>
      </div>

      {/* Table */}
      <Suspense fallback={<TableSkeleton />}>
        <VideosTable videos={videos} />
      </Suspense>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-slate-50 rounded-xl overflow-hidden">
            <div className="aspect-video bg-slate-200 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
