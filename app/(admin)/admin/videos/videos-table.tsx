/**
 * Videos Table Component
 * 
 * Grid/List view for managing videos with actions.
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Play,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Grid,
  List,
  ExternalLink,
  Clock,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteVideoAction, updateVideoAction } from '../actions';
import { VideoFormDialog } from './video-form-dialog';

// =============================================================================
// TYPES
// =============================================================================

interface VideoItem {
  id: string;
  title: string;
  titleEn?: string | null;
  slug: string;
  description?: string | null;
  youtubeUrl?: string | null;
  vimeoUrl?: string | null;
  thumbnail?: string | null;
  duration?: number | null;
  category: 'INTERVIEW' | 'SUMMARY' | 'WEBINAR' | 'TUTORIAL' | 'TESTIMONIAL' | 'HIGHLIGHT';
  tags: string[];
  speaker?: string | null;
  speakerTitle?: string | null;
  views: number;
  isActive: boolean;
  isFeatured: boolean;
  publishAt: Date;
  createdAt: Date;
}

interface VideosTableProps {
  videos: VideoItem[];
}

type ViewMode = 'grid' | 'list';

// =============================================================================
// HELPERS
// =============================================================================

const CATEGORY_CONFIG = {
  INTERVIEW: { label: 'ראיון', color: 'bg-purple-100 text-purple-700' },
  SUMMARY: { label: 'סיכום', color: 'bg-blue-100 text-blue-700' },
  WEBINAR: { label: 'וובינר', color: 'bg-emerald-100 text-emerald-700' },
  TUTORIAL: { label: 'מדריך', color: 'bg-amber-100 text-amber-700' },
  TESTIMONIAL: { label: 'עדות', color: 'bg-pink-100 text-pink-700' },
  HIGHLIGHT: { label: 'הייליט', color: 'bg-cyan-100 text-cyan-700' },
};

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatViews(views: number): string {
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}

function getYouTubeThumbnail(url: string | null | undefined): string {
  if (!url) return '/images/placeholder.svg';
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }
  return '/images/placeholder.svg';
}

// =============================================================================
// COMPONENT
// =============================================================================

export function VideosTable({ videos: initialVideos }: VideosTableProps) {
  const [videos, setVideos] = useState(initialVideos);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync local state when server data changes (after router.refresh)
  useEffect(() => {
    setVideos(initialVideos);
  }, [initialVideos]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Filter videos
  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.speaker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'ALL' || video.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Toggle active status
  const handleToggleActive = async (video: VideoItem) => {
    try {
      const result = await updateVideoAction(video.id, { isActive: !video.isActive });
      if (result.success) {
        setVideos((prev) =>
          prev.map((v) => (v.id === video.id ? { ...v, isActive: !v.isActive } : v))
        );
      } else {
        alert(result.error || 'שגיאה בעדכון הנראות');
      }
    } catch (err) {
      alert('שגיאה בתקשורת עם השרת: ' + (err instanceof Error ? err.message : String(err)));
    }
    setOpenMenuId(null);
  };

  // Toggle featured
  const handleToggleFeatured = async (video: VideoItem) => {
    try {
      const result = await updateVideoAction(video.id, { isFeatured: !video.isFeatured });
      if (result.success) {
        setVideos((prev) =>
          prev.map((v) => (v.id === video.id ? { ...v, isFeatured: !v.isFeatured } : v))
        );
      } else {
        alert(result.error || 'שגיאה בעדכון מומלץ');
      }
    } catch (err) {
      alert('שגיאה בתקשורת עם השרת: ' + (err instanceof Error ? err.message : String(err)));
    }
    setOpenMenuId(null);
  };

  // Delete video
  const handleDelete = async (videoId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק סרטון זה?')) return;

    setIsDeleting(videoId);
    try {
      const result = await deleteVideoAction(videoId);
      if (result.success) {
        setVideos((prev) => prev.filter((v) => v.id !== videoId));
      } else {
        alert(result.error || 'שגיאה במחיקת הסרטון');
      }
    } catch (err) {
      alert('שגיאה בתקשורת עם השרת: ' + (err instanceof Error ? err.message : String(err)));
    }
    setIsDeleting(null);
    setOpenMenuId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="חיפוש סרטונים..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-500/20"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-500/20"
        >
          <option value="ALL">כל הקטגוריות</option>
          <option value="INTERVIEW">ראיון</option>
          <option value="SUMMARY">סיכום</option>
          <option value="WEBINAR">וובינר</option>
          <option value="TUTORIAL">מדריך</option>
          <option value="TESTIMONIAL">עדות</option>
          <option value="HIGHLIGHT">הייליט</option>
        </select>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          <AnimatePresence>
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  'bg-slate-50 rounded-xl overflow-hidden group',
                  !video.isActive && 'opacity-60'
                )}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-200">
                  <img
                    src={video.thumbnail || getYouTubeThumbnail(video.youtubeUrl)}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.svg';
                    }}
                  />

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                      href={video.youtubeUrl || video.vimeoUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      <Play className="w-5 h-5 text-slate-900 mr-[-2px]" />
                    </a>
                  </div>

                  {/* Duration badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}

                  {/* Featured badge */}
                  {video.isFeatured && (
                    <div className="absolute top-2 right-2">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        CATEGORY_CONFIG[video.category].color
                      )}
                    >
                      {CATEGORY_CONFIG[video.category].label}
                    </span>

                    {/* Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === video.id ? null : video.id)}
                        className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-500" />
                      </button>

                      <AnimatePresence>
                        {openMenuId === video.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute left-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20"
                          >
                            <VideoFormDialog mode="edit" video={video}>
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                <Edit className="w-4 h-4" />
                                <span>עריכה</span>
                              </button>
                            </VideoFormDialog>

                            <button
                              onClick={() => handleToggleActive(video)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              {video.isActive ? (
                                <>
                                  <EyeOff className="w-4 h-4" />
                                  <span>הסתר</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4" />
                                  <span>הצג</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleToggleFeatured(video)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              {video.isFeatured ? (
                                <>
                                  <StarOff className="w-4 h-4" />
                                  <span>הסר מומלץ</span>
                                </>
                              ) : (
                                <>
                                  <Star className="w-4 h-4" />
                                  <span>סמן כמומלץ</span>
                                </>
                              )}
                            </button>

                            <div className="border-t border-slate-100 my-1" />

                            <button
                              onClick={() => handleDelete(video.id)}
                              disabled={isDeleting === video.id}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>{isDeleting === video.id ? 'מוחק...' : 'מחיקה'}</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <h3 className="font-semibold text-slate-900 line-clamp-2 mb-1">
                    {video.title}
                  </h3>

                  {video.speaker && (
                    <p className="text-sm text-slate-500 mb-2">{video.speaker}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViews(video.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(video.duration)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="divide-y divide-slate-100">
          <AnimatePresence>
            {filteredVideos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'flex items-start sm:items-center gap-3 sm:gap-4 p-4 hover:bg-slate-50 transition-colors',
                  !video.isActive && 'opacity-60'
                )}
              >
                {/* Thumbnail */}
                <div className="relative w-20 sm:w-32 aspect-video bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={video.thumbnail || getYouTubeThumbnail(video.youtubeUrl)}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  {video.duration && (
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-slate-900 truncate">{video.title}</h3>
                    {video.isFeatured && (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  {video.speaker && (
                    <p className="text-sm text-slate-500">{video.speaker}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        CATEGORY_CONFIG[video.category].color
                      )}
                    >
                      {CATEGORY_CONFIG[video.category].label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Eye className="w-3 h-3" />
                      {formatViews(video.views)} צפיות
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <VideoFormDialog mode="edit" video={video}>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-slate-500" />
                    </button>
                  </VideoFormDialog>

                  <a
                    href={video.youtubeUrl || video.vimeoUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                  </a>

                  <button
                    onClick={() => handleDelete(video.id)}
                    disabled={isDeleting === video.id}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {filteredVideos.length === 0 && (
        <div className="p-12 text-center">
          <Video className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">אין סרטונים</h3>
          <p className="text-slate-500">
            {searchQuery || categoryFilter !== 'ALL'
              ? 'לא נמצאו סרטונים מתאימים לחיפוש'
              : 'הוסף את הסרטון הראשון שלך'}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          מציג {filteredVideos.length} מתוך {videos.length} סרטונים
        </p>
      </div>
    </div>
  );
}

export default VideosTable;
