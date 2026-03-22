/**
 * News Form Component
 * 
 * Form for creating/editing news ticker updates.
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Newspaper,
  Link as LinkIcon,
  AlertTriangle,
  Pin,
  Upload,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createNewsAction, updateNewsAction, type NewsFormData } from '../actions';
import type { NewsUpdate, UrgencyLevel } from '@prisma/client';

interface NewsFormProps {
  news?: NewsUpdate;
  onSuccess?: () => void;
}

const URGENCY_OPTIONS: { value: UrgencyLevel; label: string; color: string }[] = [
  { value: 'NORMAL', label: 'רגיל', color: 'bg-slate-100 text-slate-700' },
  { value: 'IMPORTANT', label: 'חשוב', color: 'bg-blue-100 text-blue-700' },
  { value: 'URGENT', label: 'דחוף', color: 'bg-orange-100 text-orange-700' },
  { value: 'BREAKING', label: 'מבזק', color: 'bg-red-100 text-red-700' },
];

export function NewsForm({ news, onSuccess }: NewsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<NewsFormData>({
    title: news?.title || '',
    titleEn: news?.titleEn || '',
    excerpt: news?.excerpt || '',
    link: news?.link || '',
    imageUrl: (news as (NewsUpdate & { imageUrl?: string }) | undefined)?.imageUrl || '',
    urgencyLevel: news?.urgencyLevel || 'NORMAL',
    isActive: news?.isActive ?? true,
    isPinned: news?.isPinned ?? false,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'שגיאה בהעלאה'); return; }
      setFormData(prev => ({ ...prev, imageUrl: data.url }));
    } catch { setError('שגיאה בהעלאת התמונה'); }
    finally { setIsUploading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.title.trim()) {
      setError('נדרש כותרת');
      return;
    }

    startTransition(async () => {
      const result = news
        ? await updateNewsAction(news.id, formData)
        : await createNewsAction(formData);

      if (result.success) {
        setSuccess(true);
        if (!news) {
          // Reset form for new entries
          setFormData({
            title: '',
            titleEn: '',
            excerpt: '',
            link: '',
            imageUrl: '',
            urgencyLevel: 'NORMAL',
            isActive: true,
            isPinned: false,
          });
        }
        onSuccess?.();
        router.refresh();
        
        // Reset success message
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'שגיאה בשמירה');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Status messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>נשמר בהצלחה!</span>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          כותרת (עברית) *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="הזן כותרת..."
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-500"
        />
      </div>

      {/* Title English */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          כותרת (אנגלית)
        </label>
        <input
          type="text"
          dir="ltr"
          value={formData.titleEn}
          onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
          placeholder="Enter title..."
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-500"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          תקציר
        </label>
        <textarea
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          placeholder="תיאור קצר..."
          rows={2}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-500 resize-none"
        />
      </div>

      {/* Link */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          קישור (אופציונלי)
        </label>
        <div className="relative">
          <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="url"
            dir="ltr"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="https://..."
            className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-500"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <ImageIcon className="w-4 h-4 inline ml-1" />
          תמונה (אופציונלי)
        </label>
        {formData.imageUrl ? (
          <div className="relative w-full aspect-video max-w-[200px] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
            <img src={formData.imageUrl} alt="תמונה" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
              className="absolute top-1.5 left-1.5 p-1 bg-red-500 text-white rounded-md hover:bg-red-600 shadow"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <label className={cn(
            'flex flex-col items-center justify-center w-full aspect-video max-w-[200px] border-2 border-dashed rounded-lg cursor-pointer transition-colors',
            isUploading ? 'border-royal-400 bg-royal-50' : 'border-slate-300 hover:border-royal-400'
          )}>
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="hidden" />
            {isUploading ? (
              <><Loader2 className="w-6 h-6 text-royal-500 animate-spin mb-1" /><span className="text-xs text-royal-600">מעלה...</span></>
            ) : (
              <><Upload className="w-6 h-6 text-slate-400 mb-1" /><span className="text-xs text-slate-500">העלה תמונה</span></>
            )}
          </label>
        )}
      </div>

      {/* Urgency Level */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          רמת דחיפות
        </label>
        <div className="grid grid-cols-2 gap-2">
          {URGENCY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, urgencyLevel: option.value })}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                formData.urgencyLevel === option.value
                  ? `${option.color} ring-2 ring-offset-1 ring-slate-400`
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-royal-600 focus:ring-royal-500"
          />
          <span className="text-sm text-slate-700">פעיל</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isPinned}
            onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-royal-600 focus:ring-royal-500"
          />
          <span className="text-sm text-slate-700 flex items-center gap-1">
            <Pin className="w-3 h-3" />
            נעוץ
          </span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          'w-full py-3 rounded-xl font-semibold text-white',
          'bg-royal-600 hover:bg-royal-700',
          'disabled:opacity-70 disabled:cursor-not-allowed',
          'transition-colors flex items-center justify-center gap-2'
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>שומר...</span>
          </>
        ) : (
          <>
            <Newspaper className="w-4 h-4" />
            <span>{news ? 'עדכון' : 'הוסף עדכון'}</span>
          </>
        )}
      </button>
    </form>
  );
}

export default NewsForm;
