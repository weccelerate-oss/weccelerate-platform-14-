/**
 * Event Form Dialog Component
 * 
 * Modal form for creating and editing events.
 */

'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
  Link as LinkIcon,
  Users,
  Tag,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  Globe,
  Upload,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { compressImage } from '@/lib/compress-image';
import { createEventAction, updateEventAction, type EventFormData } from '../actions';

// =============================================================================
// TYPES
// =============================================================================

interface Event {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  description?: string | null;
  date: Date;
  time: string;
  endTime?: string | null;
  locationType: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
  address?: string | null;
  city?: string | null;
  virtualLink?: string | null;
  registrationLink?: string | null;
  registrationRequired: boolean;
  capacity?: number | null;
  isFree: boolean;
  price?: number | null | unknown;
  currency: string;
  category?: string | null;
  host?: string | null;
  status: 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'PAST' | 'CANCELLED';
  isActive: boolean;
  isFeatured: boolean;
  imageUrl?: string | null;
}

interface EventFormDialogProps {
  mode: 'create' | 'edit';
  event?: Event;
  children: React.ReactNode;
}

// =============================================================================
// HELPERS
// =============================================================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

function formatDateForInput(date: Date): string {
  return new Date(date).toISOString().split('T')[0];
}

// =============================================================================
// COMPONENT
// =============================================================================

export function EventFormDialog({ mode, event, children }: EventFormDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<EventFormData>({
    name: event?.name || '',
    nameEn: event?.nameEn || '',
    slug: event?.slug || '',
    description: event?.description || '',
    date: event ? formatDateForInput(event.date) : '',
    time: event?.time || '18:00',
    endTime: event?.endTime || '',
    locationType: event?.locationType || 'PHYSICAL',
    address: event?.address || '',
    city: event?.city || '',
    virtualLink: event?.virtualLink || '',
    registrationLink: event?.registrationLink || '',
    registrationRequired: event?.registrationRequired ?? true,
    capacity: event?.capacity || undefined,
    isFree: event?.isFree ?? true,
    price: typeof event?.price === 'number' ? event.price : undefined,
    currency: event?.currency || 'ILS',
    category: event?.category || '',
    host: event?.host || '',
    status: event?.status || 'DRAFT',
    isActive: event?.isActive ?? true,
    isFeatured: event?.isFeatured ?? false,
    imageUrl: event?.imageUrl || '',
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (mode === 'create' && formData.name && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.name),
      }));
    }
  }, [formData.name, mode]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = mode === 'create'
          ? await createEventAction(formData)
          : await updateEventAction(event!.id, formData);

        if (result.success) {
          setIsSuccess(true);
          router.refresh();
          setTimeout(() => {
            setIsOpen(false);
            setIsSuccess(false);
          }, 1500);
        } else {
          setError(result.error || 'שגיאה בשמירת האירוע');
        }
      } catch (err) {
        setError('שגיאה בשמירת האירוע');
      }
    });
  };

  const handleChange = (field: keyof EventFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Image upload handler
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

      if (!res.ok) {
        setError(data.error || 'שגיאה בהעלאת התמונה');
        return;
      }

      handleChange('imageUrl', data.url);
    } catch {
      setError('שגיאה בהעלאת התמונה');
    } finally {
      setIsUploading(false);
    }
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
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[700px] md:max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">
                  {mode === 'create' ? 'אירוע חדש' : 'עריכת אירוע'}
                </h2>
                <button
                  onClick={() => !isPending && setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Form — wraps both fields and footer so the submit button triggers validation */}
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
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
                      <span>האירוע נשמר בהצלחה!</span>
                    </div>
                  )}

                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        שם האירוע *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                        placeholder="מפגש יזמים"
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
                        placeholder="event-name"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        קטגוריה
                      </label>
                      <input
                        type="text"
                        value={formData.category || ''}
                        onChange={(e) => handleChange('category', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                        placeholder="מפגש / וובינר / סדנה"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      תיאור
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20 resize-none"
                      placeholder="תיאור האירוע..."
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <Calendar className="w-4 h-4 inline ml-1" />
                        תאריך *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <Clock className="w-4 h-4 inline ml-1" />
                        שעת התחלה *
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.time}
                        onChange={(e) => handleChange('time', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        שעת סיום
                      </label>
                      <input
                        type="time"
                        value={formData.endTime || ''}
                        onChange={(e) => handleChange('endTime', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                      />
                    </div>
                  </div>

                  {/* Location Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      סוג מיקום
                    </label>
                    <div className="flex gap-3">
                      {[
                        { value: 'PHYSICAL', label: 'פיזי', icon: MapPin },
                        { value: 'VIRTUAL', label: 'וירטואלי', icon: Video },
                        { value: 'HYBRID', label: 'משולב', icon: Globe },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleChange('locationType', option.value)}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all',
                            formData.locationType === option.value
                              ? 'border-royal-500 bg-royal-50 text-royal-700'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          )}
                        >
                          <option.icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location Details */}
                  {(formData.locationType === 'PHYSICAL' || formData.locationType === 'HYBRID') && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          <MapPin className="w-4 h-4 inline ml-1" />
                          כתובת
                        </label>
                        <input
                          type="text"
                          value={formData.address || ''}
                          onChange={(e) => handleChange('address', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                          placeholder="רחוב הרצל 50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          עיר
                        </label>
                        <input
                          type="text"
                          value={formData.city || ''}
                          onChange={(e) => handleChange('city', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                          placeholder="תל אביב"
                        />
                      </div>
                    </div>
                  )}

                  {(formData.locationType === 'VIRTUAL' || formData.locationType === 'HYBRID') && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <Video className="w-4 h-4 inline ml-1" />
                        קישור לשידור
                      </label>
                      <input
                        type="url"
                        value={formData.virtualLink || ''}
                        onChange={(e) => handleChange('virtualLink', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                        placeholder="https://zoom.us/j/..."
                        dir="ltr"
                      />
                    </div>
                  )}

                  {/* Registration */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <LinkIcon className="w-4 h-4 inline ml-1" />
                        קישור להרשמה
                      </label>
                      <input
                        type="url"
                        value={formData.registrationLink || ''}
                        onChange={(e) => handleChange('registrationLink', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                        placeholder="https://..."
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <Users className="w-4 h-4 inline ml-1" />
                        מקסימום משתתפים
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.capacity || ''}
                        onChange={(e) => handleChange('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                        placeholder="ללא הגבלה"
                      />
                    </div>
                  </div>

                  {/* Event Image */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <ImageIcon className="w-4 h-4 inline ml-1" />
                      תמונת האירוע
                    </label>

                    {formData.imageUrl ? (
                      <div className="relative w-full aspect-video max-w-xs bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                        <img
                          src={formData.imageUrl}
                          alt="תמונת אירוע"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleChange('imageUrl', '')}
                          className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className={cn(
                        'flex flex-col items-center justify-center w-full aspect-video max-w-xs border-2 border-dashed rounded-xl cursor-pointer transition-colors',
                        isUploading
                          ? 'border-royal-400 bg-royal-50'
                          : 'border-slate-300 hover:border-royal-400 hover:bg-slate-50'
                      )}>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                        {isUploading ? (
                          <>
                            <Loader2 className="w-8 h-8 text-royal-500 animate-spin mb-2" />
                            <span className="text-sm text-royal-600">מעלה תמונה...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <span className="text-sm text-slate-500">לחץ להעלאת תמונה</span>
                            <span className="text-xs text-slate-400 mt-1">JPG, PNG, WebP • עד 5MB</span>
                          </>
                        )}
                      </label>
                    )}
                  </div>

                  {/* Host */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      מארח / מרצה
                    </label>
                    <input
                      type="text"
                      value={formData.host || ''}
                      onChange={(e) => handleChange('host', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                      placeholder="שם המארח"
                    />
                  </div>

                  {/* Status & Options */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        סטטוס
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20"
                      >
                        <option value="DRAFT">טיוטה</option>
                        <option value="UPCOMING">קרוב</option>
                        <option value="ONGOING">מתקיים</option>
                        <option value="PAST">עבר</option>
                        <option value="CANCELLED">בוטל</option>
                      </select>
                    </div>

                    <div className="space-y-3 pt-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => handleChange('isActive', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-royal-600 focus:ring-royal-500"
                        />
                        <span className="text-sm text-slate-700">פעיל (מוצג באתר)</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => handleChange('isFeatured', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-royal-600 focus:ring-royal-500"
                        />
                        <span className="text-sm text-slate-700">מומלץ (מודגש)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer — inside <form> so submit triggers HTML validation */}
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
                    <span>{mode === 'create' ? 'צור אירוע' : 'שמור שינויים'}</span>
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

export default EventFormDialog;
