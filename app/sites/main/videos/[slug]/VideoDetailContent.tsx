'use client';

/**
 * VideoDetailContent — client view for a single video page (fully i18n).
 * The server page (page.tsx) handles metadata, generateStaticParams,
 * data-fetching and JSON-LD; it passes the resolved video as a prop.
 */

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import type { getVideoBySlug } from '@/lib/db-repository';

type Video = NonNullable<Awaited<ReturnType<typeof getVideoBySlug>>>;

export default function VideoDetailContent({
  video,
  embedSrc,
}: {
  video: Video;
  embedSrc: string | null | undefined;
}) {
  const { t, lang, dir } = useLanguage();

  // Prefer English stored fields when viewing in English; fall back to Hebrew.
  const title = lang === 'en' && video.titleEn ? video.titleEn : video.title;
  const description =
    lang === 'en' && video.descriptionEn ? video.descriptionEn : video.description;

  // Category enum (e.g. "INTERVIEW") -> translated static label.
  const categoryKey = `videos.category.${video.category.toLowerCase()}`;
  const categoryLabel = t(categoryKey) !== categoryKey ? t(categoryKey) : video.category;

  return (
    <article className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16" dir={dir}>
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">{t('videos.detail.breadcrumbHome')}</Link>
          <span className="mx-2">›</span>
          <Link href="/videos" className="hover:text-slate-900">{t('videos.detail.breadcrumbVideos')}</Link>
          <span className="mx-2">›</span>
          <span aria-current="page" className="text-slate-900">{title}</span>
        </nav>

        <header className="mb-6">
          <h1 className="mb-3 text-2xl font-bold text-slate-900 md:text-3xl">{title}</h1>
          {description && (
            <p data-speakable className="text-slate-700 leading-relaxed">
              {description}
            </p>
          )}
        </header>

        {embedSrc && (
          <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl bg-black">
            <iframe
              src={embedSrc}
              title={title}
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
              <dt className="font-medium text-slate-500">{t('videos.detail.speaker')}</dt>
              <dd className="text-slate-900">
                {video.speaker}
                {video.speakerTitle ? <span className="text-slate-500"> · {video.speakerTitle}</span> : null}
              </dd>
            </div>
          )}
          {video.category && (
            <div>
              <dt className="font-medium text-slate-500">{t('videos.detail.category')}</dt>
              <dd className="text-slate-900">{categoryLabel}</dd>
            </div>
          )}
          {video.duration ? (
            <div>
              <dt className="font-medium text-slate-500">{t('videos.detail.duration')}</dt>
              <dd className="text-slate-900" dir="ltr">
                {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
              </dd>
            </div>
          ) : null}
          {typeof video.views === 'number' && (
            <div>
              <dt className="font-medium text-slate-500">{t('videos.detail.views')}</dt>
              <dd className="text-slate-900">{video.views.toLocaleString(lang === 'en' ? 'en-US' : 'he-IL')}</dd>
            </div>
          )}
        </dl>
      </div>
    </article>
  );
}
