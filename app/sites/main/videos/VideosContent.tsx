'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useLanguage } from '@/lib/i18n';
import { VideoSections } from './VideoSections';

interface VideoItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  videoUrl: string;
  thumbnail?: string;
  duration?: number;
  speaker?: string;
  views?: number;
  isFeatured?: boolean;
}

export function VideosContent({ videos }: { videos: VideoItem[] }) {
  const { t } = useLanguage();

  const stats = useMemo(() => {
    const podcast = videos.filter((v) => v.category === 'podcast').length;
    const testimonial = videos.filter((v) => v.category === 'testimonial').length;
    const reels = videos.filter((v) => v.category === 'reels' || v.category === 'highlight').length;
    const total = videos.length;
    return { total, podcast, testimonial, reels };
  }, [videos]);

  return (
    <div className="bg-[#070b1e] min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] to-[#070b1e]" />
        <div className="absolute top-0 start-0 w-full h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" />

        <div className="container-corporate relative z-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-white/40">
              <li>
                <Link href="/" className="hover:text-white/60 transition-colors">
                  {t('videos.breadcrumb.home')}
                </Link>
              </li>
              <li><span className="mx-1">/</span></li>
              <li className="text-[#c8a951]">{t('videos.breadcrumb.current')}</li>
            </ol>
          </nav>

          <p className="text-[#c8a951] text-sm font-semibold uppercase tracking-[0.2em] mb-4">
            {t('videos.tag')}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            {t('videos.title')}
          </h1>
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl leading-relaxed">
            {t('videos.hero.subtitle')}
          </p>

          {/* Dynamic Stats Bar */}
          <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-white/[0.06]">
            {[
              { value: `${stats.total}+`, label: t('videos.stats.videos') },
              { value: String(stats.podcast), label: t('videos.stats.podcast') },
              { value: String(stats.testimonial), label: t('videos.stats.testimonials') },
              { value: `${stats.reels}+`, label: t('videos.stats.reels') },
            ].map((stat) => (
              <div key={stat.label}>
                <span className="text-2xl sm:text-3xl font-bold text-[#c8a951]">{stat.value}</span>
                <span className="block text-sm text-white/40 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Sections */}
      <VideoSections videos={videos} />
    </div>
  );
}
