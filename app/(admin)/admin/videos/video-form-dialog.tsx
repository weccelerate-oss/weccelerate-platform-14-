/**
 * Video Form Dialog Component
 * 
 * Modal form for creating and editing videos.
 */

'use client';

import { useState, useTransition, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Video,
  Link as LinkIcon,
  Tag,
  User,
  Clock,
  Loader2,
  CheckCircle,
  Image,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createVideoAction, updateVideoAction, type VideoFormData } from '../actions';

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
  isActive: boolean;
  isFeatured: boolean;
}

interface VideoFormDialogProps {
  mode: 'create' | 'edit';
  video?: VideoItem;
  children: React.ReactNode;
}

// =============================================================================
// HELPERS
// =============================================================================

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return match ? match[1] : null;
}

function getYouTubeThumbnail(url: string): string {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
}

// =============================================================================
// COMPONENT
// =============================================================================

export function VideoFormDialog({ mode, video, children }: VideoFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState('');

  // Form state
  const [formData, setFormData] = useState<VideoFormData>({
    title: video?.title || '',
    titleEn: video?.titleEn || '',
    slug: video?.slug || '',
    description: video?.description || '',
    youtubeUrl: video?.youtubeUrl || '',
    vimeoUrl: video?.vimeoUrl || '',
    thumbnail: video?.thumbnail || '',
    duration: video?.duration || undefined,
    category: video?.category || 'INTERVIEW',
    tags: video?.tags || [],
    speaker: video?.speaker || '',
    speakerTitle: video?.speakerTitle || '',
    isActive: video?.isActive ?? true,
    isFeatured: video?.isFeatured ?? false,
  });

  // Initialize tags input
  useEffect(() => {
    if (isOpen) {
      setTagsInput(formData.tags.join(', '));
    }
  }, [isOpen]);

  // Auto-generate slug from title
  useEffect(() => {
    if (mode === 'create' && formData.title && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.title),
      }));
    }
  }, [formData.title, mode]);

  // Auto-fetch thumbnail from YouTube URL
  useEffect(() => {
    if (formData.youtubeUrl && !formData.thumbnail) {
      const thumbnail = getYouTubeThumbnail(formData.youtubeUrl);
      if (thumbnail) {
        setFormData((prev) => ({ ...prev, thumbnail }));
      }
    }
  }, [formData.youtubeUrl]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Parse tags
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const submitData = { ...formData, tags };

    startTransition(async () => {
      try {
        const result =
          mode === 'create'
            ? await createVideoAction(submitData)
            : await updateVideoAction(video!.id, submitData);

        if (result.success) {
          setIsSuccess(true);
          setTimeout(() => {
            setIsOpen(false);
            setIsSuccess(false);
          }, 1500);
        } else {
          setError(result.error || 'שגיאה בשמירת הסרטון');
        }
      } catch (err) {
        setError('שגיאה בשמירת הסרטון');
      }
    });
  };

  const handleChange = (field: keyof VideoFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Trigger */}
      <div onClick={() => setIsOpen(true)}>{children}</div>

      {/* Dialog */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isPending && setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">
                  {mode === 'create' ? 'סרטון חדש' : 'עריכת סרטון'}
                </h2>
                <button
                  onClick={() => !isPending && setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                <div className="space-y-5">
                  {/* Error */}
                  {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Success */}
                  {isSuccess && (
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-lg text-sm flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>הסרטון נשמר בהצלחה!</span>
                    </div>
                  )}

                  {/* Title & Slug */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        כותרת *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                        placeholder="איך לבנות מצגת משקיעים"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Slug (URL) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => handleChange('slug', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                        placeholder="video-slug"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        קטגוריה *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                      >
                        <option value="INTERVIEW">ראיון</option>
                        <option value="SUMMARY">סיכום</option>
                        <option value="WEBINAR">וובינר</option>
                        <option value="TUTORIAL">מדריך</option>
                        <option value="TESTIMONIAL">עדות</option>
                        <option value="HIGHLIGHT">הייליט</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      תיאור
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description || ''}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20 resize-none"
                      placeholder="תיאור קצר של הסרטון..."
                    />
                  </div>

                  {/* YouTube URL */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <Video className="w-4 h-4 inline ml-1" />
                      קישור YouTube
                    </label>
                    <input
                      type="url"
                      value={formData.youtubeUrl || ''}
                      onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                      placeholder="https://www.youtube.com/watch?v=..."
                      dir="ltr"
                    />
                  </div>

                  {/* Thumbnail Preview */}
                  {formData.thumbnail && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <Image className="w-4 h-4 inline ml-1" />
                        תמונה ממוזערת
                      </label>
                      <div className="relative w-48 aspect-video bg-slate-100 rounded-lg overflow-hidden">
                        <img
                          src={formData.thumbnail}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <Clock className="w-4 h-4 inline ml-1" />
                      משך (שניות)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.duration || ''}
                      onChange={(e) => handleChange('duration', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-32 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                      placeholder="0"
                    />
                  </div>

                  {/* Speaker */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <User className="w-4 h-4 inline ml-1" />
                        דובר / מרצה
                      </label>
                      <input
                        type="text"
                        value={formData.speaker || ''}
                        onChange={(e) => handleChange('speaker', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                        placeholder="שם הדובר"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        תפקיד
                      </label>
                      <input
                        type="text"
                        value={formData.speakerTitle || ''}
                        onChange={(e) => handleChange('speakerTitle', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                        placeholder="מייסד ויזם"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <Tag className="w-4 h-4 inline ml-1" />
                      תגיות (מופרדות בפסיקים)
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                      placeholder="יזמות, גיוס, מצגת"
                    />
                  </div>

                  {/* Options */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => handleChange('isActive', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-royal-600 focus:ring-royal-500"
                      />
                      <span className="text-sm text-slate-700">פעיל (מוצג באתר)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => handleChange('isFeatured', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-royal-600 focus:ring-royal-500"
                      />
                      <span className="text-sm text-slate-700">מומלץ</span>
                    </label>
                  </div>
                </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={() => !isPending && setIsOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={isPending || isSuccess}
                  className={cn(
                    'flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors',
                    isSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-royal-600 text-white hover:bg-royal-700'
                  )}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>שומר...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>נשמר!</span>
                    </>
                  ) : (
                    <span>{mode === 'create' ? 'צור סרטון' : 'שמור שינויים'}</span>
                  )}
                </button>
              </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default VideoFormDialog;
