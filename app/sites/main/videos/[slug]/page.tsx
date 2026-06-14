import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getVideoBySlug, getVideos } from '@/lib/db-repository';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import VideoDetailContent from './VideoDetailContent';

export const revalidate = 3600;

type Params = { slug: string };

function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}

function formatIsoDuration(seconds: number | null | undefined): string | undefined {
  if (!seconds || seconds <= 0) return undefined;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s ? `${s}S` : ''}` || 'PT0S';
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideoBySlug(slug).catch(() => null);

  if (!video) {
    return constructMetadata({
      title: 'סרטון לא נמצא',
      path: `/videos/${slug}`,
      noIndex: true,
    });
  }

  const videoId = video.youtubeVideoId ?? extractYouTubeId(video.youtubeUrl ?? video.embedUrl);
  const thumb =
    video.thumbnail ?? (videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : undefined);

  return constructMetadata({
    title: video.title,
    description: video.description ?? video.title,
    path: `/videos/${slug}`,
    image: thumb,
    type: 'article',
    locale: 'he',
    publishedTime: (video.publishAt instanceof Date ? video.publishAt : new Date(video.publishAt)).toISOString(),
    keywords: [
      video.title,
      ...(video.tags ?? []),
      'WeCcelerate סרטון',
      'פודקאסט סטארטאפים',
    ],
  });
}

export async function generateStaticParams() {
  try {
    const videos = await getVideos({ limit: 200 });
    return videos.map((v: { slug: string }) => ({ slug: v.slug }));
  } catch {
    return [];
  }
}

function buildVideoSchema(video: Awaited<ReturnType<typeof getVideoBySlug>>) {
  if (!video) return null;

  const videoId = video.youtubeVideoId ?? extractYouTubeId(video.youtubeUrl ?? video.embedUrl);
  const thumb =
    video.thumbnail ?? (videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : undefined);
  const contentUrl = video.youtubeUrl ?? video.vimeoUrl ?? video.videoUrl ?? video.embedUrl ?? '';
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : (video.embedUrl ?? contentUrl);
  const videoPageUrl = `${SITE_CONFIG.url}/videos/${video.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${videoPageUrl}#video`,
    name: video.title,
    description: video.description ?? video.title,
    thumbnailUrl: thumb ? [thumb] : undefined,
    uploadDate: (video.publishAt instanceof Date ? video.publishAt : new Date(video.publishAt)).toISOString(),
    ...(video.duration && { duration: formatIsoDuration(video.duration) }),
    contentUrl: contentUrl || undefined,
    embedUrl: embedUrl || undefined,
    inLanguage: 'he-IL',
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: { '@type': 'WatchAction' },
      userInteractionCount: video.views ?? 0,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.url}/#organization`,
      name: 'WeCcelerate',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.png`,
      },
    },
    potentialAction: embedUrl
      ? {
          '@type': 'SeekToAction',
          target: `${embedUrl}?t={seek_to_second_number}`,
          'startOffset-input': 'required name=seek_to_second_number',
        }
      : undefined,
    ...(video.speaker && {
      actor: {
        '@type': 'Person',
        name: video.speaker,
        ...(video.speakerTitle && { jobTitle: video.speakerTitle }),
        ...(video.speakerImage && { image: video.speakerImage }),
      },
    }),
  };
}

export default async function VideoDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const video = await getVideoBySlug(slug).catch(() => null);

  if (!video || !video.isActive) {
    notFound();
  }

  const videoId = video.youtubeVideoId ?? extractYouTubeId(video.youtubeUrl ?? video.embedUrl);
  const embedSrc = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}`
    : video.embedUrl;

  const schema = buildVideoSchema(video);

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}

      <VideoDetailContent video={video} embedSrc={embedSrc} />
    </>
  );
}
