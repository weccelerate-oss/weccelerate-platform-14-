/**
 * Event Quick Create Form
 * 
 * Inline form for quickly creating events without opening a modal.
 * Enterprise-grade design with EY-inspired styling.
 */

'use client';

import { useState, useTransition } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Globe, 
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { createEventAction } from '../actions';

export function EventQuickCreateForm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '18:00',
    locationType: 'PHYSICAL' as 'PHYSICAL' | 'VIRTUAL' | 'HYBRID',
    city: '',
    address: '',
    virtualLink: '',
    imageUrl: '',
    category: 'מפגש',
    host: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    setErrorMessage('');

    // Generate slug from name
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9\u0590-\u05FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50) + '-' + Date.now().toString(36);

    startTransition(async () => {
      try {
        const result = await createEventAction({
          name: formData.name,
          slug,
          date: formData.date,
          time: formData.time,
          locationType: formData.locationType,
          city: formData.city || undefined,
          address: formData.address || undefined,
          virtualLink: formData.virtualLink || undefined,
          imageUrl: formData.imageUrl || undefined,
          category: formData.category || undefined,
          host: formData.host || undefined,
          registrationRequired: true,
          isFree: true,
          currency: 'ILS',
          status: 'UPCOMING',
          isActive: true,
          isFeatured: false,
        });

        if (result.success) {
          setStatus('success');
          // Reset form
          setFormData({
            name: '',
            date: '',
            time: '18:00',
            locationType: 'PHYSICAL',
            city: '',
            address: '',
            virtualLink: '',
            imageUrl: '',
            category: 'מפגש',
            host: '',
          });
          // Collapse after success
          setTimeout(() => {
            setIsExpanded(false);
            setStatus('idle');
          }, 2000);
        } else {
          setStatus('error');
          setErrorMessage(result.error || 'שגיאה ביצירת האירוע');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage('שגיאה בלתי צפויה');
      }
    });
  };

  return (
    <div className="bg-white border border-slate-200">
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-right">
            <h3 className="font-semibold text-slate-900">יצירה מהירה של אירוע</h3>
            <p className="text-sm text-slate-500">הזן את הפרטים הבסיסיים ליצירת אירוע חדש</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {/* Form - Expandable */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="px-6 pb-6 border-t border-slate-100">
          {/* Status Messages */}
          {status === 'success' && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-700 font-medium">האירוע נוצר בהצלחה!</span>
            </div>
          )}
          {status === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700 font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Form Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Event Name */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                שם האירוע <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="מפגש יזמים חודשי"
                className="w-full px-4 py-3 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                קטגוריה
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="מפגש">מפגש</option>
                <option value="וובינר">וובינר</option>
                <option value="סדנה">סדנה</option>
                <option value="דמו דיי">דמו דיי</option>
                <option value="כנס">כנס</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline ml-1" />
                תאריך <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Clock className="w-4 h-4 inline ml-1" />
                שעה <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Location Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                סוג מיקום
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'PHYSICAL', label: 'פיזי', icon: MapPin },
                  { value: 'VIRTUAL', label: 'וירטואלי', icon: Video },
                  { value: 'HYBRID', label: 'משולב', icon: Globe },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, locationType: option.value as typeof formData.locationType })}
                    className={`
                      flex-1 flex items-center justify-center gap-1 py-3 px-2 border-2 text-sm font-medium transition-all
                      ${formData.locationType === option.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'}
                    `}
                  >
                    <option.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional Fields based on Location Type */}
            {(formData.locationType === 'PHYSICAL' || formData.locationType === 'HYBRID') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MapPin className="w-4 h-4 inline ml-1" />
                    עיר
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="תל אביב"
                    className="w-full px-4 py-3 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    כתובת
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="רחוב הרצל 50"
                    className="w-full px-4 py-3 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </>
            )}

            {(formData.locationType === 'VIRTUAL' || formData.locationType === 'HYBRID') && (
              <div className={formData.locationType === 'HYBRID' ? '' : 'lg:col-span-2'}>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Video className="w-4 h-4 inline ml-1" />
                  קישור לשידור
                </label>
                <input
                  type="url"
                  value={formData.virtualLink}
                  onChange={(e) => setFormData({ ...formData, virtualLink: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                  dir="ltr"
                  className="w-full px-4 py-3 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            )}

            {/* Host */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                מארח / מרצה
              </label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                placeholder="שם המארח"
                className="w-full px-4 py-3 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <ImageIcon className="w-4 h-4 inline ml-1" />
                קישור לתמונה (URL)
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                dir="ltr"
                className="w-full px-4 py-3 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              * שדות חובה
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    יוצר...
                  </>
                ) : (
                  'צור אירוע'
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default EventQuickCreateForm;
