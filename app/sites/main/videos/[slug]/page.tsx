import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getVideoBySlug, getVideos } from '@/lib/db-repository';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';

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

      <article className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12 md:py-16" dir="rtl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">בית</Link>
            <span className="mx-2">›</span>
            <Link href="/videos" className="hover:text-slate-900">סרטונים</Link>
            <span className="mx-2">›</span>
            <span aria-current="page" className="text-slate-900">{video.title}</span>
          </nav>

          <header className="mb-6">
            <h1 className="mb-3 text-2xl font-bold text-slate-900 md:text-3xl">{video.title}</h1>
            {video.description && (
              <p data-speakable className="text-slate-700 leading-relaxed">
                {video.description}
              </p>
            )}
          </header>

          {embedSrc && (
            <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                src={embedSrc}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full"
              />
            </div>
          )}

          <dl className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm sm:grid-cols-2">
            {video.speaker && (
              <div>
                <dt className="font-medium text-slate-500">דובר/ת</dt>
                <dd className="text-slate-900">
                  {video.speaker}
                  {video.speakerTitle ? <span className="text-slate-500"> · {video.speakerTitle}</span> : null}
                </dd>
              </div>
            )}
            {video.category && (
              <div>
                <dt className="font-medium text-slate-500">קטגוריה</dt>
                <dd className="text-slate-900">{video.category}</dd>
              </div>
            )}
            {video.duration ? (
              <div>
                <dt className="font-medium text-slate-500">אורך</dt>
                <dd className="text-slate-900">
                  {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                </dd>
              </div>
            ) : null}
            {typeof video.views === 'number' && (
              <div>
                <dt className="font-medium text-slate-500">צפיות</dt>
                <dd className="text-slate-900">{video.views.toLocaleString('he-IL')}</dd>
              </div>
            )}
          </dl>
        </div>
      </article>
    </>
  );
}
