'use client';

import { useState, useMemo } from 'react';
import {
  Play,
  Clock,
  User,
  Mic2,
  Star,
  MessageCircle,
  Tv,
  Monitor,
  Film,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
} from 'lucide-react';
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
  isFeatured?: boolean;
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

// Category keys for translation lookup
const categoryKeys: Record<string, string> = {
  all: 'videos.category.all',
  podcast: 'videos.category.podcast',
  testimonial: 'videos.category.testimonial',
  tv_interview: 'videos.category.tv_interview',
  interview: 'videos.category.interview',
  reels: 'videos.category.reels',
};

// Category config
const categoryConfig: Record<string, { icon: React.ReactNode; accentColor: string; layout: 'featured' | 'grid' | 'reels' }> = {
  podcast: { icon: <Mic2 className="w-5 h-5" />, accentColor: '#c8a951', layout: 'featured' },
  testimonial: { icon: <MessageCircle className="w-5 h-5" />, accentColor: '#6ee7b7', layout: 'grid' },
  tv_interview: { icon: <Monitor className="w-5 h-5" />, accentColor: '#a78bfa', layout: 'grid' },
  interview: { icon: <Tv className="w-5 h-5" />, accentColor: '#93c5fd', layout: 'grid' },
  reels: { icon: <Film className="w-5 h-5" />, accentColor: '#f472b6', layout: 'reels' },
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function VideoSections({ videos }: { videos: VideoItem[] }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const { t } = useLanguage();

  const sections = useMemo(() => {
    const podcast = videos.filter((v) => v.category === 'podcast');
    const testimonial = videos.filter((v) => v.category === 'testimonial');
    const tv_interview = videos.filter((v) => v.category === 'tv_interview');
    const interview = videos.filter((v) => v.category === 'interview');
    const reels = videos.filter(
      (v) => v.category === 'reels' || v.category === 'highlight'
    );
    return { podcast, testimonial, tv_interview, interview, reels };
  }, [videos]);

  // Build the filter pills dynamically — only show categories that have videos
  const availableCategories = useMemo(() => {
    const cats: { key: string; count: number }[] = [{ key: 'all', count: videos.length }];
    if (sections.podcast.length > 0) cats.push({ key: 'podcast', count: sections.podcast.length });
    if (sections.testimonial.length > 0) cats.push({ key: 'testimonial', count: sections.testimonial.length });
    if (sections.tv_interview.length > 0) cats.push({ key: 'tv_interview', count: sections.tv_interview.length });
    if (sections.interview.length > 0) cats.push({ key: 'interview', count: sections.interview.length });
    if (sections.reels.length > 0) cats.push({ key: 'reels', count: sections.reels.length });
    return cats;
  }, [videos, sections]);

  // Featured video — first featured podcast or first podcast
  const featuredVideo = useMemo(() => {
    return (
      videos.find((v) => v.isFeatured && v.category === 'podcast') ||
      videos.find((v) => v.isFeatured) ||
      videos[0]
    );
  }, [videos]);

  const showAll = activeFilter === 'all';

  // Section ordering for "all" view
  const sectionOrder: { key: string; tTitle: string; tSubtitle: string; videos: VideoItem[] }[] = [
    { key: 'podcast', tTitle: 'videos.section.podcast.title', tSubtitle: 'videos.section.podcast.subtitle', videos: sections.podcast },
    { key: 'testimonial', tTitle: 'videos.section.testimonial.title', tSubtitle: 'videos.section.testimonial.subtitle', videos: sections.testimonial },
    { key: 'tv_interview', tTitle: 'videos.section.tv.title', tSubtitle: 'videos.section.tv.subtitle', videos: sections.tv_interview },
    { key: 'interview', tTitle: 'videos.section.interview.title', tSubtitle: 'videos.section.interview.subtitle', videos: sections.interview },
    { key: 'reels', tTitle: 'videos.section.reels.title', tSubtitle: 'videos.section.reels.subtitle', videos: sections.reels },
  ];

  return (
    <>
      {/* Quick Nav Pills */}
      <div className="sticky top-16 z-30 bg-[#070b1e]/90 backdrop-blur-lg border-b border-white/[0.06]">
        <div className="container-corporate py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {availableCategories.map(({ key, count }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeFilter === key
                    ? 'bg-[#c8a951] text-[#070b1e]'
                    : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.1] hover:text-white border border-white/[0.06]'
                }`}
              >
                {t(categoryKeys[key] ?? key)}
                <span className={`text-xs ${activeFilter === key ? 'text-[#070b1e]/60' : 'text-white/30'}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Hero Video */}
      {showAll && featuredVideo && (
        <section className="py-12 sm:py-16">
          <div className="container-corporate">
            <FeaturedVideo video={featuredVideo} />
          </div>
        </section>
      )}

      {/* Show All — render each section */}
      {showAll &&
        sectionOrder.map(
          (sec) =>
            sec.videos.length > 0 && (
              <VideoSection
                key={sec.key}
                id={sec.key}
                icon={categoryConfig[sec.key]?.icon ?? <LayoutGrid className="w-5 h-5" />}
                title={t(sec.tTitle)}
                subtitle={t(sec.tSubtitle)}
                videos={sec.videos}
                layout={categoryConfig[sec.key]?.layout ?? 'grid'}
                accentColor={categoryConfig[sec.key]?.accentColor ?? '#93c5fd'}
              />
            )
        )}

      {/* Single category filter */}
      {!showAll && (
        <VideoSection
          id={activeFilter}
          icon={categoryConfig[activeFilter]?.icon ?? <LayoutGrid className="w-5 h-5" />}
          title={t(categoryKeys[activeFilter] ?? activeFilter)}
          subtitle=""
          videos={
            activeFilter === 'reels'
              ? sections.reels
              : videos.filter((v) => v.category === activeFilter)
          }
          layout={categoryConfig[activeFilter]?.layout ?? 'grid'}
          accentColor={categoryConfig[activeFilter]?.accentColor ?? '#93c5fd'}
          showAllByDefault
        />
      )}

      {/* Bottom CTA */}
      <section className="py-16 sm:py-24">
        <div className="container-corporate text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {t('videos.cta.title')}
            </h2>
            <p className="text-white/50 mb-8">
              {t('videos.cta.text')}
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#c8a951] text-[#070b1e] font-bold px-8 py-4 rounded-xl hover:bg-[#d4b962] transition-colors"
            >
              {t('videos.cta.button')}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// =============================================================================
// FEATURED VIDEO
// =============================================================================

function FeaturedVideo({ video }: { video: VideoItem }) {
  const [playing, setPlaying] = useState(false);
  const { t } = useLanguage();
  const ytId = extractYouTubeId(video.videoUrl);
  const thumb = getThumbnail(video);

  return (
    <div
      className="group relative block rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.02]"
    >
      <div className="grid md:grid-cols-[1.5fr_1fr] gap-0">
        {/* Video Thumbnail / Player */}
        <div className="relative aspect-video md:aspect-auto md:min-h-[360px] overflow-hidden">
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
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-[#070b1e] via-transparent to-transparent opacity-0 md:opacity-100" />
              <button
                onClick={() => ytId ? setPlaying(true) : window.open(video.videoUrl, '_blank')}
                className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer"
                aria-label={`${t('videos.play')} ${video.title}`}
              >
                <div className="w-20 h-20 rounded-full bg-[#c8a951] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 text-[#070b1e] fill-[#070b1e] mr-[-3px]" />
                </div>
              </button>
              {/* Badge */}
              <div className="absolute top-4 end-4 flex items-center gap-2 bg-[#c8a951]/20 backdrop-blur-sm text-[#c8a951] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-[#c8a951]/30 pointer-events-none">
                <Star className="w-3.5 h-3.5 fill-[#c8a951]" />
                {t('videos.featured.badge')}
              </div>
            </>
          )}
        </div>

        {/* Info Panel */}
        <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center">
          <span className="inline-flex items-center gap-1.5 text-[#c8a951] text-xs font-semibold uppercase tracking-wider mb-4">
            <Mic2 className="w-3.5 h-3.5" />
            {t(categoryKeys[video.category] ?? 'videos.category.podcast')}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 leading-snug">
            {video.title}
          </h2>
          {video.description && (
            <p className="text-white/40 text-sm leading-relaxed line-clamp-4 mb-6">
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
            {video.duration && (
              <span className="flex items-center gap-1.5" dir="ltr">
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(video.duration)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// VIDEO SECTION
// =============================================================================

interface VideoSectionProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  videos: VideoItem[];
  layout: 'featured' | 'grid' | 'reels';
  accentColor: string;
  showAllByDefault?: boolean;
}

function VideoSection({
  id,
  icon,
  title,
  subtitle,
  videos,
  layout,
  accentColor,
  showAllByDefault = false,
}: VideoSectionProps) {
  const [showAll, setShowAll] = useState(showAllByDefault);
  const { t } = useLanguage();
  const initialCount = layout === 'reels' ? 8 : 6;
  const displayed = showAll ? videos : videos.slice(0, initialCount);
  const hasMore = videos.length > initialCount;

  return (
    <section id={id} className="py-12 sm:py-16 scroll-mt-20">
      <div className="container-corporate">
        {/* Section Header */}
        <div className="flex items-start sm:items-center justify-between mb-8 sm:mb-10">
          <div>
            <div
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider mb-3 px-3 py-1.5 rounded-full"
              style={{
                color: accentColor,
                backgroundColor: `${accentColor}15`,
                border: `1px solid ${accentColor}30`,
              }}
            >
              {icon}
              {title}
            </div>
            {subtitle && (
              <p className="text-white/40 text-sm sm:text-base max-w-xl">
                {subtitle}
              </p>
            )}
          </div>
          <span className="text-white/20 text-sm shrink-0">
            {videos.length} {t('videos.videoCount')}
          </span>
        </div>

        {/* Videos */}
        {layout === 'featured' ? (
          <PodcastLayout videos={displayed} accentColor={accentColor} />
        ) : layout === 'reels' ? (
          <ReelsGrid videos={displayed} accentColor={accentColor} />
        ) : (
          <StandardGrid videos={displayed} accentColor={accentColor} />
        )}

        {/* Show More */}
        {hasMore && !showAllByDefault && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.05] text-white/60 hover:bg-white/[0.1] hover:text-white border border-white/[0.06] transition-all text-sm"
            >
              {showAll ? (
                <>
                  {t('videos.showLess')}
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  {t('videos.showMore')} {videos.length - initialCount} {t('videos.moreVideos')}
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Section Divider */}
      <div className="container-corporate mt-12 sm:mt-16">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>
    </section>
  );
}

// =============================================================================
// PODCAST LAYOUT — Large featured + side list
// =============================================================================

function PodcastLayout({
  videos,
  accentColor,
}: {
  videos: VideoItem[];
  accentColor: string;
}) {
  const [mainVideo, ...rest] = videos;
  const [mainPlaying, setMainPlaying] = useState(false);
  const { t } = useLanguage();
  const mainYtId = mainVideo ? extractYouTubeId(mainVideo.videoUrl) : null;

  return (
    <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
      {/* Main Featured Podcast */}
      {mainVideo && (
        <div className="group block bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
          <div className="relative aspect-video overflow-hidden">
            {mainPlaying && mainYtId ? (
              <iframe
                src={`https://www.youtube.com/embed/${mainYtId}?autoplay=1&rel=0`}
                title={mainVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <>
                <img
                  src={getThumbnail(mainVideo)}
                  alt={mainVideo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => mainYtId ? setMainPlaying(true) : window.open(mainVideo.videoUrl, '_blank')}
                  className="absolute inset-0 bg-black/20 hover:bg-black/40 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label={`${t('videos.play')} ${mainVideo.title}`}
                >
                  <div className="w-16 h-16 rounded-full bg-[#c8a951] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 text-[#070b1e] fill-[#070b1e] mr-[-2px]" />
                  </div>
                </button>
              </>
            )}
          </div>
          <div className="p-6">
            <h3 className="text-white font-bold text-lg mb-3 line-clamp-2">
              {mainVideo.title}
            </h3>
            {mainVideo.description && (
              <p className="text-white/40 text-sm line-clamp-3 mb-4">
                {mainVideo.description}
              </p>
            )}
            {mainVideo.speaker && (
              <span className="flex items-center gap-1.5 text-white/30 text-xs">
                <User className="w-3.5 h-3.5" />
                {mainVideo.speaker}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Side List */}
      <div className="flex flex-col gap-3">
        {rest.map((video, i) => (
          <PodcastSideItem key={video.id} video={video} index={i} total={videos.length} accentColor={accentColor} />
        ))}
      </div>
    </div>
  );
}

function PodcastSideItem({ video, index, total, accentColor }: { video: VideoItem; index: number; total: number; accentColor: string }) {
  const [playing, setPlaying] = useState(false);
  const { t } = useLanguage();
  const ytId = extractYouTubeId(video.videoUrl);

  if (playing && ytId) {
    return (
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="relative aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => ytId ? setPlaying(true) : window.open(video.videoUrl, '_blank')}
      className="group flex gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 cursor-pointer"
    >
      <div className="relative w-32 sm:w-36 shrink-0 aspect-video rounded-lg overflow-hidden">
        <img
          src={getThumbnail(video)}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-6 h-6 text-white" />
        </div>
        <span
          className="absolute top-1.5 end-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{
            color: accentColor,
            backgroundColor: `${accentColor}20`,
          }}
        >
          #{total - index}
        </span>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-[#c8a951] transition-colors">
          {video.title}
        </h4>
        {video.speaker && (
          <span className="text-white/30 text-xs mt-2 flex items-center gap-1">
            <User className="w-3 h-3" />
            {video.speaker}
          </span>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// STANDARD GRID — 3-col cards
// =============================================================================

function StandardGrid({
  videos,
  accentColor,
}: {
  videos: VideoItem[];
  accentColor: string;
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} accentColor={accentColor} />
      ))}
    </div>
  );
}

// =============================================================================
// REELS GRID — 4-col compact cards
// =============================================================================

function ReelsGrid({
  videos,
  accentColor,
}: {
  videos: VideoItem[];
  accentColor: string;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <ReelCard key={video.id} video={video} accentColor={accentColor} />
      ))}
    </div>
  );
}

function ReelCard({ video, accentColor }: { video: VideoItem; accentColor: string }) {
  const [playing, setPlaying] = useState(false);
  const { t } = useLanguage();
  const ytId = extractYouTubeId(video.videoUrl);

  return (
    <div className="group block bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
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
              src={getThumbnail(video)}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <button
              onClick={() => ytId ? setPlaying(true) : window.open(video.videoUrl, '_blank')}
              className="absolute inset-0 bg-black/20 hover:bg-black/40 flex items-center justify-center cursor-pointer transition-colors"
              aria-label={`${t('videos.play')} ${video.title}`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all"
                style={{ backgroundColor: accentColor }}
              >
                <Play className="w-4 h-4 text-[#070b1e] fill-[#070b1e] mr-[-1px]" />
              </div>
            </button>
            {video.duration && (
              <span className="absolute bottom-2 start-2 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded pointer-events-none" dir="ltr">
                {formatDuration(video.duration)}
              </span>
            )}
            <span
              className="absolute top-2 end-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none"
              style={{
                color: accentColor,
                backgroundColor: `${accentColor}20`,
                border: `1px solid ${accentColor}30`,
              }}
            >
              Reel
            </span>
          </>
        )}
      </div>
      <div className="p-3">
        <h4 className="text-white text-xs sm:text-sm font-semibold line-clamp-2 group-hover:text-[#c8a951] transition-colors">
          {video.title}
        </h4>
        {video.speaker && (
          <span className="text-white/30 text-[10px] mt-1.5 flex items-center gap-1">
            <User className="w-3 h-3" />
            {video.speaker}
          </span>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// VIDEO CARD
// =============================================================================

function VideoCard({
  video,
  accentColor,
}: {
  video: VideoItem;
  accentColor: string;
}) {
  const [playing, setPlaying] = useState(false);
  const { t } = useLanguage();
  const thumb = getThumbnail(video);
  const ytId = extractYouTubeId(video.videoUrl);

  return (
    <div className="group block bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
      {/* Thumbnail / Player */}
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
            <button
              onClick={() => ytId ? setPlaying(true) : window.open(video.videoUrl, '_blank')}
              className="absolute inset-0 bg-black/20 hover:bg-black/40 flex items-center justify-center cursor-pointer transition-colors"
              aria-label={`${t('videos.play')} ${video.title}`}
            >
              <div className="w-14 h-14 rounded-full bg-[#c8a951] flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                <Play className="w-6 h-6 text-[#070b1e] fill-[#070b1e] mr-[-2px]" />
              </div>
            </button>
            {video.duration && (
              <span className="absolute bottom-3 start-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded pointer-events-none" dir="ltr">
                {formatDuration(video.duration)}
              </span>
            )}
            <span
              className="absolute top-3 end-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none"
              style={{
                color: accentColor,
                backgroundColor: `${accentColor}20`,
                border: `1px solid ${accentColor}30`,
              }}
            >
              {t(categoryKeys[video.category] ?? 'videos.category.interview')}
            </span>
          </>
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
