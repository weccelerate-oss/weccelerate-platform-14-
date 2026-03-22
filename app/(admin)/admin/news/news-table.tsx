/**
 * News Table Component
 * 
 * Table displaying all news updates with edit/delete actions.
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Pencil,
  Trash2,
  Pin,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink,
  X,
  Loader2,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { compressImage } from '@/lib/compress-image';
import { deleteNewsAction, updateNewsAction, type NewsFormData } from '../actions';
import type { NewsUpdate, UrgencyLevel } from '@prisma/client';

// =============================================================================
// EDIT DIALOG
// =============================================================================

const URGENCY_OPTIONS: { value: UrgencyLevel; label: string; color: string }[] = [
  { value: 'NORMAL', label: 'רגיל', color: 'bg-slate-100 text-slate-700' },
  { value: 'IMPORTANT', label: 'חשוב', color: 'bg-blue-100 text-blue-700' },
  { value: 'URGENT', label: 'דחוף', color: 'bg-orange-100 text-orange-700' },
  { value: 'BREAKING', label: 'מבזק', color: 'bg-red-100 text-red-700' },
];

function NewsEditDialog({
  item,
  onClose,
}: {
  item: NewsUpdate;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<NewsFormData>({
    title: item.title,
    titleEn: item.titleEn || '',
    excerpt: item.excerpt || '',
    link: item.link || '',
    imageUrl: (item as NewsUpdate & { imageUrl?: string }).imageUrl || '',
    urgencyLevel: item.urgencyLevel,
    isActive: item.isActive,
    isPinned: item.isPinned,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      const body = new FormData();
      body.append('file', compressed);
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

    if (!formData.title.trim()) {
      setError('נדרש כותרת');
      return;
    }

    startTransition(async () => {
      const result = await updateNewsAction(item.id, formData);
      if (result.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => onClose(), 1000);
      } else {
        setError(result.error || 'שגיאה בשמירה');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">עריכת עדכון</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
            <label className="block text-sm font-medium text-slate-700 mb-1">כותרת (עברית) *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-500"
            />
          </div>

          {/* Title English */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">כותרת (אנגלית)</label>
            <input
              type="text"
              dir="ltr"
              value={formData.titleEn}
              onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-500"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">תקציר</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-500 resize-none"
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">קישור</label>
            <input
              type="url"
              dir="ltr"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <ImageIcon className="w-4 h-4 inline ml-1" />
              תמונה
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

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">רמת דחיפות</label>
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
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">פעיל</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700 flex items-center gap-1">
                <Pin className="w-3 h-3" /> נעוץ
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending || success}
              className="flex-1 py-2.5 bg-royal-600 text-white rounded-lg hover:bg-royal-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> שומר...</>
              ) : success ? (
                <><CheckCircle2 className="w-4 h-4" /> נשמר!</>
              ) : (
                'שמור שינויים'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================================================
// TABLE
// =============================================================================

interface NewsTableProps {
  news: NewsUpdate[];
}

export function NewsTable({ news }: NewsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<NewsUpdate | null>(null);

  const handleToggleActive = (item: NewsUpdate) => {
    setActionId(item.id);
    startTransition(async () => {
      await updateNewsAction(item.id, { isActive: !item.isActive });
      router.refresh();
      setActionId(null);
    });
  };

  const handleTogglePinned = (item: NewsUpdate) => {
    setActionId(item.id);
    startTransition(async () => {
      await updateNewsAction(item.id, { isPinned: !item.isPinned });
      router.refresh();
      setActionId(null);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק עדכון זה?')) return;
    
    setActionId(id);
    startTransition(async () => {
      await deleteNewsAction(id);
      router.refresh();
      setActionId(null);
    });
  };

  const urgencyColors: Record<string, string> = {
    NORMAL: 'bg-slate-100 text-slate-700',
    IMPORTANT: 'bg-blue-100 text-blue-700',
    URGENT: 'bg-orange-100 text-orange-700',
    BREAKING: 'bg-red-100 text-red-700',
  };

  if (news.length === 0) {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500">אין עדכונים עדיין</p>
        <p className="text-sm text-slate-400 mt-1">הוסף עדכון חדש בטופס משמאל</p>
      </div>
    );
  }

  return (
    <>
    {editItem && (
      <NewsEditDialog item={editItem} onClose={() => setEditItem(null)} />
    )}
    <div className="divide-y divide-slate-100">
      {news.map((item) => (
        <div
          key={item.id}
          className={cn(
            'p-4 hover:bg-slate-50 transition-colors',
            isPending && actionId === item.id && 'opacity-50'
          )}
        >
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Status indicators */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <span className={cn(
                'px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full',
                urgencyColors[item.urgencyLevel]
              )}>
                {item.urgencyLevel}
              </span>
              {item.isPinned && (
                <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div className="min-w-0">
                  <h3 className={cn(
                    'font-medium text-sm sm:text-base',
                    item.isActive ? 'text-slate-900' : 'text-slate-400'
                  )}>
                    {item.title}
                  </h3>
                  {item.titleEn && (
                    <p className="text-xs sm:text-sm text-slate-400 mt-0.5 truncate" dir="ltr">
                      {item.titleEn}
                    </p>
                  )}
                  {item.excerpt && (
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2">
                      {item.excerpt}
                    </p>
                  )}
                </div>

                {/* Status badge */}
                <span className={cn(
                  'px-2 py-0.5 text-[10px] sm:text-xs rounded-full flex-shrink-0',
                  item.isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                )}>
                  {item.isActive ? 'פעיל' : 'לא פעיל'}
                </span>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 sm:gap-4 mt-2 text-[10px] sm:text-xs text-slate-400">
                <span>
                  {new Date(item.createdAt).toLocaleDateString('he-IL')}
                </span>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-royal-600 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    קישור
                  </a>
                )}
              </div>

              {/* Mobile actions row */}
              <div className="flex items-center gap-1 mt-2 sm:hidden">
                <button
                  onClick={() => setEditItem(item)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg text-royal-600 transition-colors"
                  title="ערוך"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleActive(item)}
                  disabled={isPending}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    item.isActive ? 'text-emerald-600' : 'text-slate-400'
                  )}
                >
                  {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleTogglePinned(item)}
                  disabled={isPending}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    item.isPinned ? 'text-amber-600' : 'text-slate-400'
                  )}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setEditItem(item)}
                disabled={isPending}
                className="p-2 rounded-lg text-royal-600 hover:bg-royal-50 transition-colors"
                title="ערוך"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleToggleActive(item)}
                disabled={isPending}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  item.isActive
                    ? 'text-emerald-600 hover:bg-emerald-50'
                    : 'text-slate-400 hover:bg-slate-100'
                )}
                title={item.isActive ? 'הסתר' : 'הצג'}
              >
                {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleTogglePinned(item)}
                disabled={isPending}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  item.isPinned
                    ? 'text-amber-600 hover:bg-amber-50'
                    : 'text-slate-400 hover:bg-slate-100'
                )}
                title={item.isPinned ? 'בטל נעיצה' : 'נעץ'}
              >
                <Pin className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                disabled={isPending}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                title="מחק"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
    </>
  );
}

export default NewsTable;
