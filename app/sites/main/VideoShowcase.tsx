'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  User,
  ArrowLeft,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

// =============================================================================
// TYPES
// =============================================================================

export interface VideoItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  videoUrl: string;
  thumbnail?: string;
  duration?: number;
  speaker?: string;
  views?: number;
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toLocaleString();
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  // youtube.com/embed/ID
  const embedMatch = url.match(/\/embed\/([^?/]+)/);
  if (embedMatch) return embedMatch[1];
  // youtube.com/watch?v=ID
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  // youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return shortMatch[1];
  return null;
}

function getEmbedUrl(url: string): string {
  const id = extractYouTubeId(url);
  if (id) return `https://www.youtube.com/embed/${id}`;
  return url;
}

function getThumbnailUrl(video: VideoItem): string | null {
  if (video.thumbnail) return video.thumbnail;
  const id = extractYouTubeId(video.videoUrl);
  if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  return null;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function VideoShowcase({ videos }: { videos: VideoItem[] }) {
  const { t, dir } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const categoryLabel = (category: string) =>
    t(`videos.category.${category}`) !== `videos.category.${category}`
      ? t(`videos.category.${category}`)
      : category;

  const activeVideo = videos[activeIndex];
  const hasNext = activeIndex < videos.length - 1;
  const hasPrev = activeIndex > 0;

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
    setIsPlaying(false);
  }, []);

  const goNext = useCallback(() => {
    if (hasNext) {
      setActiveIndex((i) => i + 1);
      setIsPlaying(false);
    }
  }, [hasNext]);

  const goPrev = useCallback(() => {
    if (hasPrev) {
      setActiveIndex((i) => i - 1);
      setIsPlaying(false);
    }
  }, [hasPrev]);

  if (!activeVideo) return null;

  const embedUrl = `${getEmbedUrl(activeVideo.videoUrl)}?autoplay=1&rel=0&modestbranding=1`;
  const activeThumbnail = getThumbnailUrl(activeVideo);

  return (
    <div>
      {/* ================================================================= */}
      {/* MAIN PLAYER + INFO — Side by side on desktop                      */}
      {/* ================================================================= */}
      <div className="grid lg:grid-cols-5 gap-6 mb-8">
        {/* Player Area — 3 cols */}
        <div className="lg:col-span-3">
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0a0e27]">
            {isPlaying ? (
              /* YouTube Embed */
              <iframe
                src={embedUrl}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              /* Thumbnail + Play Button */
              <button
                onClick={() => setIsPlaying(true)}
                className="group absolute inset-0 w-full h-full cursor-pointer"
                aria-label={t('videos.showcase.playAria').replace('{title}', activeVideo.title)}
              >
                {activeThumbnail ? (
                  <img
                    src={activeThumbnail}
                    alt={activeVideo.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#111b3c] to-[#0a0e27]" />
                )}

                {/* Cinematic overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-500" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -inset-3 rounded-full border-2 border-white/10 group-hover:border-[#c8a951]/30 group-hover:scale-110 transition-all duration-700" />
                    <div className="w-20 h-20 bg-[#c8a951] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-[#c8a951]/20">
                      <Play className="w-9 h-9 text-[#070b1e] ms-1" />
                    </div>
                  </div>
                </div>

                {/* Duration badge */}
                {activeVideo.duration && (
                  <div className="absolute bottom-4 start-4 bg-black/70 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-lg" dir="ltr">
                    {formatDuration(activeVideo.duration)}
                  </div>
                )}
              </button>
            )}

            {/* Navigation arrows — always visible on the player */}
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              disabled={!hasPrev}
              className={`absolute top-1/2 start-3 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                hasPrev
                  ? 'bg-black/50 backdrop-blur-sm text-white hover:bg-[#c8a951] hover:text-[#070b1e] border border-white/10 hover:border-[#c8a951]'
                  : 'bg-black/20 text-white/20 cursor-not-allowed'
              }`}
              aria-label={t('videos.showcase.prev')}
            >
              {dir === 'rtl' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              disabled={!hasNext}
              className={`absolute top-1/2 end-3 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                hasNext
                  ? 'bg-black/50 backdrop-blur-sm text-white hover:bg-[#c8a951] hover:text-[#070b1e] border border-white/10 hover:border-[#c8a951]'
                  : 'bg-black/20 text-white/20 cursor-not-allowed'
              }`}
              aria-label={t('videos.showcase.next')}
            >
              {dir === 'rtl' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            {/* Video counter */}
            <div className="absolute top-4 end-4 z-20 bg-black/60 backdrop-blur-sm text-white/70 text-xs font-medium px-3 py-1.5 rounded-full border border-white/10" dir="ltr">
              {activeIndex + 1} / {videos.length}
            </div>
          </div>
        </div>

        {/* Info Panel — 2 cols */}
        <div className="lg:col-span-2 flex flex-col justify-between">
          <div>
            {/* Category pill */}
            {activeVideo.category && (
              <span className="inline-block bg-[#c8a951]/15 text-[#e8d48b] text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full border border-[#c8a951]/20 mb-4">
                {categoryLabel(activeVideo.category)}
              </span>
            )}

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 leading-tight">
              {activeVideo.title}
            </h3>

            {/* Description */}
            {activeVideo.description && (
              <p className="text-sm text-white/50 leading-relaxed mb-6 line-clamp-4">
                {activeVideo.description}
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/40">
              {activeVideo.speaker && (
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {activeVideo.speaker}
                </span>
              )}
              {activeVideo.views != null && activeVideo.views > 0 && (
                <span className="flex items-center gap-1.5" dir="ltr">
                  <Eye className="w-3.5 h-3.5" />
                  {formatViews(activeVideo.views)} {t('videos.showcase.views')}
                </span>
              )}
              {activeVideo.duration && (
                <span className="flex items-center gap-1.5" dir="ltr">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(activeVideo.duration)}
                </span>
              )}
            </div>
          </div>

          {/* Play / Next CTA */}
          <div className="flex items-center gap-3 mt-8">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-6 py-3 text-sm font-bold rounded-lg hover:scale-[1.03] transition-all duration-300 shadow-lg shadow-[#c8a951]/15"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  {t('videos.showcase.pause')}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 ms-0.5" />
                  {t('videos.showcase.playNow')}
                </>
              )}
            </button>

            {hasNext && (
              <button
                onClick={goNext}
                className="inline-flex items-center gap-2 border border-white/10 text-white/60 px-5 py-3 text-sm font-medium rounded-lg hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-300"
              >
                {t('videos.showcase.nextLabel')}
                {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* FILMSTRIP — Scrollable Thumbnails                                  */}
      {/* ================================================================= */}
      <div className="relative">
        {/* Label */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">
            {t('videos.showcase.moreVideos')}
          </p>
          <Link
            href="/videos"
            className="inline-flex items-center gap-1.5 text-gold-400 text-xs font-semibold hover:text-gold-300 transition-colors"
          >
            {t('videos.showcase.viewAll')}
            <ArrowLeft className={`w-3 h-3 ${dir === 'rtl' ? '' : 'rotate-180'}`} />
          </Link>
        </div>

        {/* Thumbnails strip */}
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 hide-scrollbar -mx-2 px-2">
          {videos.map((video, idx) => (
            <button
              key={video.id}
              onClick={() => goTo(idx)}
              className={`snap-center flex-shrink-0 w-[200px] sm:w-[240px] group relative rounded-xl overflow-hidden transition-all duration-400 ${
                idx === activeIndex
                  ? 'ring-2 ring-[#c8a951] ring-offset-2 ring-offset-[#070b1e] scale-[1.02]'
                  : 'opacity-60 hover:opacity-90'
              }`}
              aria-label={t('videos.showcase.thumbAria')
                .replace('{title}', video.title)
                .replace('{nowPlaying}', idx === activeIndex ? t('videos.showcase.nowPlayingSuffix') : '')}
            >
              <div className="relative aspect-video">
                {(() => {
                  const thumb = getThumbnailUrl(video);
                  return thumb ? (
                    <img
                      src={thumb}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#111b3c] to-[#0a0e27]" />
                  );
                })()}

                {/* Dark overlay */}
                <div className={`absolute inset-0 transition-colors duration-300 ${
                  idx === activeIndex ? 'bg-black/10' : 'bg-black/40 group-hover:bg-black/20'
                }`} />

                {/* Now playing indicator */}
                {idx === activeIndex && (
                  <div className="absolute top-2 start-2 bg-[#c8a951] text-[#070b1e] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {t('videos.showcase.nowPlaying')}
                  </div>
                )}

                {/* Play icon for non-active */}
                {idx !== activeIndex && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 text-white ms-0.5" />
                    </div>
                  </div>
                )}

                {/* Duration */}
                {video.duration && (
                  <div className="absolute bottom-1.5 start-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded" dir="ltr">
                    {formatDuration(video.duration)}
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="p-2.5 bg-white/[0.03]">
                <p className={`text-xs font-semibold line-clamp-1 ${
                  idx === activeIndex ? 'text-[#e8d48b]' : 'text-white/70'
                }`}>
                  {video.title}
                </p>
                {video.speaker && (
                  <p className="text-[10px] text-white/30 mt-0.5">{video.speaker}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
