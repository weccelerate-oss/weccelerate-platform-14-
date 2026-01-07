'use client';

import { useState, useMemo } from 'react';
import {
  Play,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  PlayCircle,
} from 'lucide-react';
import { VideoItem, VideoGalleryProps, VideoCategory } from '@/types/content';
import { cn, formatDuration, formatNumber, getRelativeTime } from '@/lib/utils';

// =============================================================================
// CATEGORY CONFIG
// =============================================================================

const categoryConfig: Record<VideoCategory, {
  label: string;
  labelHe: string;
  color: string;
}> = {
  interview: {
    label: 'Interview',
    labelHe: 'ראיון',
    color: 'bg-royal-100 text-royal-700',
  },
  summary: {
    label: 'Summary',
    labelHe: 'סיכום',
    color: 'bg-teal-100 text-teal-700',
  },
  webinar: {
    label: 'Webinar',
    labelHe: 'וובינר',
    color: 'bg-purple-100 text-purple-700',
  },
  tutorial: {
    label: 'Tutorial',
    labelHe: 'הדרכה',
    color: 'bg-emerald-100 text-emerald-700',
  },
  testimonial: {
    label: 'Testimonial',
    labelHe: 'עדות',
    color: 'bg-gold-100 text-gold-700',
  },
  highlight: {
    label: 'Highlight',
    labelHe: 'הייליט',
    color: 'bg-coral-100 text-coral-700',
  },
};

// =============================================================================
// VIDEO THUMBNAIL COMPONENT
// =============================================================================

interface VideoThumbnailProps {
  video: VideoItem;
  isActive?: boolean;
  onClick: () => void;
  variant?: 'default' | 'compact' | 'playlist';
}

function VideoThumbnail({ video, isActive, onClick, variant = 'default' }: VideoThumbnailProps) {
  const category = categoryConfig[video.category];

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full text-right rounded-xl overflow-hidden transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-royal-500 focus:ring-offset-2',
        variant === 'playlist' 
          ? 'flex gap-3 p-2 hover:bg-slate-100 rounded-lg'
          : 'bg-white border border-slate-200 hover:shadow-lg hover:border-royal-200 hover:-translate-y-1',
        isActive && variant === 'playlist' && 'bg-royal-50 border-r-4 border-royal-500'
      )}
    >
      {/* Thumbnail */}
      <div className={cn(
        'relative overflow-hidden bg-slate-200',
        variant === 'playlist' ? 'w-32 h-20 rounded-lg flex-shrink-0' : 'aspect-video'
      )}>
        <img
          src={video.thumbnail || '/images/video-placeholder.jpg'}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Play overlay */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity',
          variant === 'playlist' ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}>
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-royal-600 ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <span className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
        )}

        {/* Featured badge */}
        {video.isFeatured && variant !== 'playlist' && (
          <span className="absolute top-2 right-2 bg-gold-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded">
            מומלץ
          </span>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        variant === 'playlist' ? 'flex-1 min-w-0' : 'p-4'
      )}>
        {/* Category */}
        {variant !== 'playlist' && (
          <span className={cn(
            'inline-block text-xs font-medium px-2 py-0.5 rounded mb-2',
            category.color
          )}>
            {category.labelHe}
          </span>
        )}

        {/* Title */}
        <h4 className={cn(
          'font-semibold text-slate-900 group-hover:text-royal-700 transition-colors',
          variant === 'playlist' ? 'text-sm line-clamp-2' : 'text-base line-clamp-2 mb-2'
        )}>
          {video.title}
        </h4>

        {/* Meta */}
        {variant !== 'playlist' && (
          <div className="flex items-center gap-4 text-xs text-slate-500">
            {video.views && (
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {formatNumber(video.views)} צפיות
              </span>
            )}
            {video.publishedAt && (
              <span>{getRelativeTime(video.publishedAt)}</span>
            )}
          </div>
        )}

        {/* Speaker (playlist) */}
        {variant === 'playlist' && video.speaker && (
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <User className="w-3 h-3" />
            {video.speaker}
          </div>
        )}
      </div>
    </button>
  );
}

// =============================================================================
// MAIN PLAYER COMPONENT
// =============================================================================

interface MainPlayerProps {
  video: VideoItem;
}

function MainPlayer({ video }: MainPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const category = categoryConfig[video.category];

  // Extract video ID for YouTube embed
  const getEmbedUrl = (url: string) => {
    // Handle YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('embed/')
        ? url.split('embed/')[1]?.split('?')[0]
        : url.includes('v=')
        ? url.split('v=')[1]?.split('&')[0]
        : url.split('/').pop()?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    return url;
  };

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden">
      {/* Video container */}
      <div className="relative aspect-video bg-black">
        {isPlaying ? (
          <iframe
            src={getEmbedUrl(video.videoUrl)}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={video.thumbnail || '/images/video-placeholder.jpg'}
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Play button */}
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center group"
              aria-label="נגן סרטון"
            >
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                <Play className="w-8 h-8 text-royal-600 ml-1" fill="currentColor" />
              </div>
            </button>

            {/* Video info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className={cn(
                'inline-block text-xs font-medium px-2 py-0.5 rounded mb-3',
                category.color
              )}>
                {category.labelHe}
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                {video.title}
              </h3>
              {video.description && (
                <p className="text-slate-300 text-sm line-clamp-2 max-w-2xl">
                  {video.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
                {video.speaker && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {video.speaker}
                  </span>
                )}
                {video.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(video.duration)}
                  </span>
                )}
                {video.views && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {formatNumber(video.views)} צפיות
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// VIDEO GALLERY COMPONENT
// =============================================================================

export function VideoGallery({
  videos,
  initialVideoId,
  showPlaylist = true,
  categoryFilter,
  variant = 'default',
}: VideoGalleryProps) {
  const [activeVideoId, setActiveVideoId] = useState(
    initialVideoId || videos[0]?.id
  );
  const [activeCategory, setActiveCategory] = useState<VideoCategory | 'all'>('all');

  // Get unique categories from videos
  const availableCategories = useMemo(() => {
    const cats = new Set(videos.map((v) => v.category));
    return Array.from(cats);
  }, [videos]);

  // Filter videos
  const filteredVideos = useMemo(() => {
    if (activeCategory === 'all') return videos;
    return videos.filter((v) => v.category === activeCategory);
  }, [videos, activeCategory]);

  // Get active video
  const activeVideo = videos.find((v) => v.id === activeVideoId) || videos[0];

  if (!videos.length) {
    return (
      <div className="text-center py-12 bg-slate-100 rounded-xl">
        <PlayCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">אין סרטונים להצגה</p>
      </div>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-royal-600 font-semibold text-sm uppercase tracking-wide">
              תוכן וידאו
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
              גלריית סרטונים
            </h2>
            <p className="text-slate-600 mt-2 max-w-xl">
              ראיונות, הדרכות, סיכומים ועוד מהמומחים שלנו
            </p>
          </div>

          {/* Category filter */}
          {availableCategories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-full transition-all',
                  activeCategory === 'all'
                    ? 'bg-royal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                הכל
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-full transition-all',
                    activeCategory === cat
                      ? 'bg-royal-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {categoryConfig[cat].labelHe}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main layout */}
        <div className={cn(
          'grid gap-6',
          showPlaylist && 'lg:grid-cols-3'
        )}>
          {/* Main player */}
          <div className={cn(showPlaylist && 'lg:col-span-2')}>
            {activeVideo && <MainPlayer video={activeVideo} />}
          </div>

          {/* Playlist sidebar */}
          {showPlaylist && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900">
                  רשימת השמעה
                </h3>
                <p className="text-sm text-slate-500">
                  {filteredVideos.length} סרטונים
                </p>
              </div>
              <div className="max-h-[500px] overflow-y-auto p-2 space-y-1">
                {filteredVideos.map((video) => (
                  <VideoThumbnail
                    key={video.id}
                    video={video}
                    variant="playlist"
                    isActive={video.id === activeVideoId}
                    onClick={() => setActiveVideoId(video.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Video grid (when no playlist or for additional videos) */}
        {!showPlaylist && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredVideos.slice(1).map((video) => (
              <VideoThumbnail
                key={video.id}
                video={video}
                variant="default"
                onClick={() => setActiveVideoId(video.id)}
              />
            ))}
          </div>
        )}

        {/* View all link */}
        <div className="text-center mt-10">
          <a
            href="/videos"
            className="inline-flex items-center gap-2 text-royal-600 font-semibold hover:text-royal-700 transition-colors"
          >
            לכל הסרטונים
            <ChevronLeft className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default VideoGallery;
