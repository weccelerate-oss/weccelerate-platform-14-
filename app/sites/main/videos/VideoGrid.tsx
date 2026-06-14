'use client';

import { useState } from 'react';
import { Play, Clock, Eye, User } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

// =============================================================================
// TYPES & HELPERS
// =============================================================================

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
  const embedMatch = url.match(/\/embed\/([^?/]+)/);
  if (embedMatch) return embedMatch[1];
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return shortMatch[1];
  return null;
}

function getThumbnail(video: VideoItem): string {
  if (video.thumbnail) return video.thumbnail;
  const ytId = extractYouTubeId(video.videoUrl);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=450&fit=crop';
}

// =============================================================================
// VIDEO GRID
// =============================================================================

export function VideoGrid({ videos }: { videos: VideoItem[] }) {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(videos.map((v) => v.category)))];

  const categoryLabel = (cat: string) =>
    t(`videos.category.${cat}`) !== `videos.category.${cat}` ? t(`videos.category.${cat}`) : cat;

  const filtered =
    activeCategory === 'all'
      ? videos
      : videos.filter((v) => v.category === activeCategory);

  return (
    <>
      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-[#c8a951] text-[#070b1e]'
                : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.1] hover:text-white border border-white/[0.06]'
            }`}
          >
            {categoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-white/40 py-20">{t('videos.grid.empty')}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </>
  );
}

// =============================================================================
// VIDEO CARD
// =============================================================================

function VideoCard({ video }: { video: VideoItem }) {
  const { t } = useLanguage();
  const [playing, setPlaying] = useState(false);
  const thumb = getThumbnail(video);
  const ytId = extractYouTubeId(video.videoUrl);
  const categoryLabel = (cat: string) =>
    t(`videos.category.${cat}`) !== `videos.category.${cat}` ? t(`videos.category.${cat}`) : cat;

  return (
    <div
      className="group block bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
    >
      {/* Thumbnail / Inline Player */}
      <div className="relative aspect-video overflow-hidden">
        {playing && ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <>
            <img
              src={thumb}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Play Button */}
            <button
              onClick={() => ytId ? setPlaying(true) : window.open(video.videoUrl, '_blank')}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors duration-300 cursor-pointer"
              aria-label={t('videos.grid.playAria').replace('{title}', video.title)}
            >
              <div className="w-14 h-14 rounded-full bg-[#c8a951] flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                <Play className="w-6 h-6 text-[#070b1e] fill-[#070b1e] mr-[-2px]" />
              </div>
            </button>
            {/* Duration Badge */}
            {video.duration && (
              <span className="absolute bottom-3 end-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded" dir="ltr">
                {formatDuration(video.duration)}
              </span>
            )}
          </>
        )}
        {/* Category Badge */}
        {!playing && (
          <span className="absolute top-3 start-3 bg-[#c8a951]/20 text-[#c8a951] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#c8a951]/30 backdrop-blur-sm">
            {categoryLabel(video.category)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-white font-semibold text-base mb-2 line-clamp-2 group-hover:text-[#c8a951] transition-colors">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-white/40 text-sm line-clamp-2 mb-4">
            {video.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-white/30 text-xs">
          {video.speaker && (
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {video.speaker}
            </span>
          )}
          {(video.views ?? 0) > 0 && (
            <span className="flex items-center gap-1.5" dir="ltr">
              <Eye className="w-3.5 h-3.5" />
              {formatViews(video.views!)}
            </span>
          )}
          {video.duration && (
            <span className="flex items-center gap-1.5" dir="ltr">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(video.duration)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
