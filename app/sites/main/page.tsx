/**
 * WeCcelerate Main Homepage — Server Component (Data Fetching Only)
 *
 * Fetches data from DB/mock, passes to client HomepageContent for rendering.
 * All UI rendering and i18n happens in HomepageContent.tsx (client component).
 */

export const revalidate = 300; // ISR: refresh cached HTML every 5 minutes

import { Metadata } from 'next';

// Client component with all translated UI
import { HomepageContent } from './HomepageContent';

// Mock data
import {
  mockNewsUpdates,
  mockEvents,
  mockVideos,
  mockSuccessStories,
} from '@/lib/mock-data';

// SEO
import { constructMetadata } from '@/lib/seo/metadata';

// =============================================================================
// DATABASE FETCHING
// =============================================================================

async function getEventsFromDB() {
  try {
    const { prisma } = await import('@/lib/db');
    const events = await prisma.event.findMany({
      where: { isActive: true },
      orderBy: { date: 'asc' },
      take: 6,
      select: {
        id: true, name: true, nameEn: true, slug: true, description: true,
        descriptionEn: true,
        date: true, time: true, endTime: true, locationType: true,
        address: true, city: true, virtualLink: true, registrationLink: true,
        imageUrl: true, status: true, capacity: true, registeredCount: true,
        category: true, host: true, isFree: true, price: true, currency: true,
        isFeatured: true, tags: true, isActive: true, createdAt: true, updatedAt: true,
      },
    });
    return events.length > 0 ? events : mockEvents;
  } catch {
    return mockEvents;
  }
}

async function getNewsFromDB() {
  try {
    const { prisma } = await import('@/lib/db');
    const dbNews = await prisma.newsUpdate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (dbNews.length === 0) return mockNewsUpdates;

    return dbNews.map((news: {
      id: string;
      title: string;
      link?: string | null;
      urgencyLevel: string;
      createdAt: Date;
      excerpt?: string | null;
      isPinned?: boolean | null;
    }) => ({
      id: news.id,
      title: news.title,
      link: news.link || undefined,
      urgencyLevel: news.urgencyLevel.toLowerCase() as 'normal' | 'important' | 'breaking',
      createdAt: news.createdAt.toISOString(),
      excerpt: news.excerpt || undefined,
      isPinned: news.isPinned,
      imageUrl: (news as Record<string, unknown>).imageUrl as string | undefined,
      source: (news as Record<string, unknown>).source as string | undefined,
    }));
  } catch {
    return mockNewsUpdates;
  }
}

function getYouTubeThumbnail(url: string): string | null {
  if (!url) return null;
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return `https://i.ytimg.com/vi/${watchMatch[1]}/hqdefault.jpg`;
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return `https://i.ytimg.com/vi/${shortMatch[1]}/hqdefault.jpg`;
  const embedMatch = url.match(/\/embed\/([^?]+)/);
  if (embedMatch) return `https://i.ytimg.com/vi/${embedMatch[1]}/hqdefault.jpg`;
  return null;
}

async function getVideosFromDB() {
  try {
    const { prisma } = await import('@/lib/db');
    const dbVideos = await prisma.video.findMany({
      where: { isActive: true },
      orderBy: [
        { isFeatured: 'desc' },
        { publishAt: 'desc' },
      ],
      take: 8,
    });

    if (dbVideos.length === 0) return mockVideos;

    return dbVideos.map((video: {
      id: string;
      title: string;
      description?: string | null;
      category: string;
      youtubeUrl?: string | null;
      vimeoUrl?: string | null;
      videoUrl?: string | null;
      embedUrl?: string | null;
      thumbnail?: string | null;
      duration?: number | null;
      publishAt?: Date | null;
      createdAt: Date;
      views?: number | null;
      speaker?: string | null;
      isFeatured?: boolean | null;
      tags?: string[] | null;
    }) => {
      const videoUrl = video.youtubeUrl || video.vimeoUrl || video.videoUrl || video.embedUrl || '';
      return {
        id: video.id,
        title: video.title,
        description: video.description || undefined,
        category: video.category.toLowerCase() as 'interview' | 'summary' | 'webinar' | 'tutorial' | 'testimonial' | 'highlight',
        videoUrl,
        thumbnail: video.thumbnail || getYouTubeThumbnail(videoUrl) || undefined,
        duration: video.duration || undefined,
        publishedAt: video.publishAt?.toISOString() || video.createdAt.toISOString(),
        views: video.views || undefined,
        speaker: video.speaker || undefined,
        isFeatured: video.isFeatured,
        tags: video.tags || [],
      };
    });
  } catch {
    return mockVideos;
  }
}

async function getSuccessStoriesFromDB() {
  try {
    const { prisma } = await import('@/lib/db');
    const dbStories = await prisma.successStory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      take: 10,
    });

    if (dbStories.length === 0) return mockSuccessStories;

    return dbStories.map((story: {
      id: string;
      companyName: string;
      logoUrl?: string | null;
      industry?: string | null;
      website?: string | null;
      quote: string;
      personName: string | null;
      personRole?: string | null;
      personImage?: string | null;
      metrics?: unknown;
      projectLink?: string | null;
      isFeatured?: boolean | null;
    }) => ({
      id: story.id,
      companyName: story.companyName,
      logoUrl: story.logoUrl || undefined,
      industry: story.industry || undefined,
      website: story.website || undefined,
      quote: story.quote,
      personName: story.personName,
      personRole: story.personRole || undefined,
      personImage: story.personImage || undefined,
      metrics: story.metrics as { items: Array<{ label: string; value: string }> } | undefined,
      projectLink: story.projectLink || undefined,
      isFeatured: story.isFeatured,
    }));
  } catch {
    return mockSuccessStories;
  }
}

// =============================================================================
// PAGE METADATA
// =============================================================================

export const metadata: Metadata = constructMetadata({
  title: 'WeCcelerate | Venture Builder & MedTech Accelerator Israel',
  description: 'WeCcelerate (וויסלרייט) — Venture Builder ישראלי. בונים ומאיצים סטארטאפים ב-MedTech, AI, SaaS ו-Consumer. ליווי מלא מהרעיון ועד האקזיט.',
  siteKey: 'main',
  path: '/',
  keywords: [
    // Brand & core identity
    'Venture Builder Israel',
    'Startup Accelerator',
    'וויסלרייט',
    'WeCcelerate',
    'Weccelerate',
    'We Accelerate',
    // Primary commercial Hebrew keywords (guides target these for ranking)
    'סטארטאפ',
    'סטארט אפ',
    'סטרטאפ',
    'סטארטאפים',
    // "מיזם" cluster — Hebrew-native term for "venture", structurally aligned
    // with WeCcelerate's identity as a "בונה מיזמים" (Venture Builder).
    'מיזם',
    'מיזמים',
    'בונה מיזמים',
    'הקמת מיזם',
    'איך להקים מיזם',
    'מה זה מיזם',
    'מיזם טכנולוגי',
    'מיזם רפואי',
    'מיזם הזנק',
    'חברת הזנק',
    'ליווי מיזמים',
    'מימון למיזם',
    // יזמות / יזם variations
    'יזם',
    'יזמים',
    'יזמות',
    'ליווי יזמים',
    'רעיון לסטארטאפ',
    'איך להקים סטארטאפ',
    'מאיץ סטארטאפים',
    'אקסלרטור סטארטאפים',
    'אקסלרטור',
    'אקסלטור',
    'האצת סטארטאפים',
    'הקמת סטארטאפ',
    'סטארטאפ בישראל',
    // Product / development
    'פיתוח MVP',
    'בניית MVP',
    'פיתוח אפליקציה',
    'פיתוח מוצר',
    'CTO as a Service',
    'שכירת CTO',
    'פיתוח תוכנה לסטארטאפ',
    // Fundraising
    'גיוס משקיעים',
    'גיוס הון',
    'Pitch Deck',
    'פיץ׳ דק',
    'תוכנית עסקית',
    'הכנה למשקיעים',
    // MedTech
    'Medical Accelerator',
    'סטארטאפ רפואי',
    'MedTech ישראל',
    'HealthTech',
    'Digital Health',
    'ועדת הלסינקי',
    'FDA 510k',
    'CE marking',
    // Ecosystem
    'Innovation Hub Tel Aviv',
    'חממה טכנולוגית',
    'Venture Capital Israel',
    'השקעה בסטארטאפים',
  ],
});

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default async function MainHomePage() {
  const [events, news, videos, stories] = await Promise.all([
    getEventsFromDB(),
    getNewsFromDB(),
    getVideosFromDB(),
    getSuccessStoriesFromDB(),
  ]);

  return (
    <HomepageContent
      news={news}
      events={events}
      videos={videos}
      stories={stories}
    />
  );
}
