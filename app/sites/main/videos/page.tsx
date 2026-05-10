/**
 * Videos Listing Page — Server Component (Data Fetching Only)
 */

export const revalidate = 600; // ISR: refresh cached HTML every 10 minutes

import { Metadata } from 'next';
import { getVideos } from '@/lib/db-repository';
import { mockVideos } from '@/lib/mock-data';
import { VideosContent } from './VideosContent';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = {
  title: { absolute: 'סרטונים | WeCcelerate — פודקאסט, ראיונות, עדויות יזמים ו-Reels' },
  description:
    'צפו בתוכן הווידאו של WeCcelerate: פרקי פודקאסט עם מובילי אקוסיסטם הסטארטאפים, עדויות יזמים שגייסו הון, ראיונות בתקשורת ו-Reels עם טיפים מהירים ליזמים.',
  keywords: [
    'פודקאסט סטארטאפים',
    'ראיונות יזמים',
    'עדויות הצלחה',
    'WeCcelerate סרטונים',
    'reels יזמות',
    'טיפים ליזמים',
    'גיוס הון סרטונים',
    'מאיץ סטארטאפים ישראל',
  ],
};

// =============================================================================
// AUTO-CATEGORIZE (for videos synced as 'interview' by default)
// =============================================================================

function guessCategory(title: string, description: string, duration?: number): string {
  const text = `${title} ${description ?? ''}`.toLowerCase();

  if (/פודקאסט|podcast|#\d{1,3}:|הפודקאסט של|סלון של|פרק\s+\d/.test(text)) {
    return 'podcast';
  }
  if (/עדות|testimonial|סיפור הצלחה|ממליץ|ממליצה|הליווי של|על הליווי|מרעיון ל|חלק \d/.test(text)) {
    return 'testimonial';
  }
  if (/ערוץ הכלכלה|ערוץ 12|ערוץ 13|ערוץ 14|חדשות|news|כאן 11|i24|ynet|טלוויזיה/.test(text)) {
    return 'tv_interview';
  }
  if (
    /reel|reels|#shorts|short|קליפ|טיפ מהיר|היילייט|highlight/.test(text) ||
    (duration && duration < 180)
  ) {
    return 'reels';
  }
  return 'interview';
}

// =============================================================================
// DATA FETCHING
// =============================================================================

async function getVideosData() {
  try {
    const videos = await getVideos({ limit: 200 });
    if (videos.length > 0) {
      return videos.map((v: any) => {
        const rawCategory = v.category?.toLowerCase() ?? 'interview';
        // Re-categorize videos that are still 'interview' (from old sync)
        const category = rawCategory === 'interview'
          ? guessCategory(v.title, v.description ?? '', v.duration ?? undefined)
          : rawCategory;

        return {
          id: v.id,
          title: v.title,
          description: v.description ?? undefined,
          category,
          videoUrl: v.youtubeUrl || v.vimeoUrl || v.videoUrl || v.embedUrl || '',
          thumbnail: v.thumbnail ?? undefined,
          duration: v.duration ?? undefined,
          speaker: v.speaker ?? undefined,
          views: v.views ?? 0,
          isFeatured: v.isFeatured ?? (category === 'podcast'),
        };
      });
    }
    return mockVideos;
  } catch {
    return mockVideos;
  }
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

// =============================================================================
// VIDEO SCHEMA (JSON-LD for Rich Results)
// =============================================================================

function generateVideoListSchema(videos: { title: string; description?: string; videoUrl: string; thumbnail?: string; duration?: number }[]) {
  const videoItems = videos.slice(0, 20).map((v, i) => {
    const isYouTube = v.videoUrl?.includes('youtube') || v.videoUrl?.includes('youtu.be');
    const videoId = isYouTube
      ? v.videoUrl.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1]
      : null;

    return {
      '@type': 'VideoObject',
      position: i + 1,
      name: v.title,
      description: v.description || v.title,
      thumbnailUrl: v.thumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : undefined),
      uploadDate: '2024-01-01T00:00:00+02:00',
      contentUrl: v.videoUrl,
      embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : v.videoUrl,
      ...(v.duration && { duration: `PT${Math.floor(v.duration / 60)}M${v.duration % 60}S` }),
      publisher: {
        '@type': 'Organization',
        name: 'WeCcelerate',
        logo: {
          '@type': 'ImageObject',
          url: 'https://weccelerate.co.il/logo.png',
        },
      },
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': 'https://weccelerate.co.il/videos/#videolist',
    name: 'סרטונים — WeCcelerate',
    numberOfItems: videoItems.length,
    itemListElement: videoItems,
  };
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function VideosPage() {
  const videos = await getVideosData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateVideoListSchema(videos)),
        }}
      />
      <VideosContent videos={videos} />
    </>
  );
}
