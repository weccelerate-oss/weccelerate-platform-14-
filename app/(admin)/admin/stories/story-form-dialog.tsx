'use client';

import { useState, useTransition, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { createStoryAction, updateStoryAction } from '../actions';

interface MetricItem {
  label: string;
  value: string;
}

interface StoryFormData {
  companyName: string;
  logoUrl?: string | null;
  industry?: string | null;
  website?: string | null;
  quote: string;
  quoteEn?: string | null;
  personName?: string | null;
  personRole?: string | null;
  personImage?: string | null;
  slug: string;
  fullStory?: string | null;
  fullStoryEn?: string | null;
  projectLink?: string | null;
  collaborationDate?: string | null;
  programName?: string | null;
  metrics?: MetricItem[] | null;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
}

interface Story extends StoryFormData {
  id: string;
  rawMetrics?: any; // JSON from DB: { items: MetricItem[] }
}

interface StoryFormDialogProps {
  mode: 'create' | 'edit';
  story?: Story;
  children: ReactNode;
}

export function StoryFormDialog({ mode, story, children }: StoryFormDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Parse metrics from DB JSON format
  const initialMetrics: MetricItem[] = (() => {
    if (story?.metrics && Array.isArray(story.metrics)) return story.metrics;
    if (story?.rawMetrics?.items && Array.isArray(story.rawMetrics.items)) return story.rawMetrics.items;
    return [];
  })();

  const [formData, setFormData] = useState<StoryFormData>({
    companyName: story?.companyName || '',
    logoUrl: story?.logoUrl || '',
    industry: story?.industry || '',
    website: story?.website || '',
    quote: story?.quote || '',
    quoteEn: story?.quoteEn || '',
    personName: story?.personName || '',
    personRole: story?.personRole || '',
    personImage: story?.personImage || '',
    slug: story?.slug || '',
    fullStory: story?.fullStory || '',
    fullStoryEn: story?.fullStoryEn || '',
    projectLink: story?.projectLink || '',
    collaborationDate: story?.collaborationDate || '',
    programName: story?.programName || '',
    metrics: initialMetrics,
    order: story?.order || 0,
    isActive: story?.isActive ?? true,
    isFeatured: story?.isFeatured ?? false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // BUG 9: Validation for required fields
    if (!formData.companyName.trim() || !formData.quote.trim() || !formData.slug.trim()) {
      setError('שדות חובה לא יכולים להיות ריקים');
      return;
    }

    startTransition(async () => {
      try {
        const result = mode === 'create'
          ? await createStoryAction(formData)
          : story ? await updateStoryAction(story.id, formData) : null;

        if (!result || !result.success) {
          setError(result?.error || 'שגיאה בשמירה');
          return;
        }

        setIsOpen(false);
        router.refresh();
        // Reset form for create mode
        if (mode === 'create') {
          setFormData({
            companyName: '',
            logoUrl: '',
            industry: '',
            website: '',
            quote: '',
            quoteEn: '',
            personName: '',
            personRole: '',
            personImage: '',
            slug: '',
            fullStory: '',
            fullStoryEn: '',
            projectLink: '',
            collaborationDate: '',
            programName: '',
            metrics: [],
            order: 0,
            isActive: true,
            isFeatured: false,
          });
        }
      } catch (err) {
        console.error('Error saving story:', err);
        setError('שגיאה בשמירה');
      }
    });
  };

  const generateSlug = () => {
    let slug = formData.companyName
      .toLowerCase()
      .replace(/[^a-z0-9\u0590-\u05FF]+/g, '-')
      .replace(/^-|-$/g, '');
    // BUG 5: Empty slug fallback
    if (!slug) slug = `story-${Date.now()}`;
    setFormData({ ...formData, slug });
  };

  // BUG 3: Metrics helpers
  const addMetric = () => {
    setFormData({
      ...formData,
      metrics: [...(formData.metrics || []), { label: '', value: '' }],
    });
  };

  const removeMetric = (index: number) => {
    const updated = [...(formData.metrics || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, metrics: updated });
  };

  const updateMetric = (index: number, field: 'label' | 'value', val: string) => {
    const updated = [...(formData.metrics || [])];
    updated[index] = { ...updated[index], [field]: val };
    setFormData({ ...formData, metrics: updated });
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {mode === 'create' ? 'סיפור הצלחה חדש' : 'עריכת סיפור'}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {/* Company Info */}
              <div className="space-y-4">
                <h3 className="font-medium text-slate-900 border-b pb-2">פרטי החברה</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      שם החברה *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      onBlur={() => !formData.slug && generateSlug()}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Slug *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
                        placeholder="company-name"
                      />
                      <button
                        type="button"
                        onClick={generateSlug}
                        className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg"
                      >
                        צור
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      תעשייה
                    </label>
                    <input
                      type="text"
                      value={formData.industry || ''}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
                      placeholder="HealthTech"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      אתר
                    </label>
                    <input
                      type="url"
                      value={formData.website || ''}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    לוגו (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              {/* Testimonial */}
              <div className="space-y-4">
                <h3 className="font-medium text-slate-900 border-b pb-2">המלצה</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    ציטוט * (עברית)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
                    placeholder="מה הם אמרו עלינו..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    ציטוט (אנגלית)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.quoteEn || ''}
                    onChange={(e) => setFormData({ ...formData, quoteEn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
                    placeholder="What they said about us (English)..."
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      שם הממליץ
                    </label>
                    <input
                      type="text"
                      value={formData.personName || ''}
                      onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      תפקיד
                    </label>
                    <input
                      type="text"
                      value={formData.personRole || ''}
                      onChange={(e) => setFormData({ ...formData, personRole: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
                      placeholder='מייסד ומנכ"ל'
                    />
                  </div>
                </div>
              </div>

              {/* Full Story */}
              <div className="space-y-4">
                <h3 className="font-medium text-slate-900 border-b pb-2">סיפור מלא</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    סיפור מלא (עברית)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.fullStory || ''}
                    onChange={(e) => setFormData({ ...formData, fullStory: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
                    placeholder="הסיפור המלא של שיתוף הפעולה..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    סיפור מלא (אנגלית)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.fullStoryEn || ''}
                    onChange={(e) => setFormData({ ...formData, fullStoryEn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
                    placeholder="The full collaboration story (English)..."
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    קישור לפרויקט
                  </label>
                  <input
                    type="url"
                    value={formData.projectLink || ''}
                    onChange={(e) => setFormData({ ...formData, projectLink: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
                    placeholder="https://example.com/project"
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-medium text-slate-900">מדדים / תוצאות</h3>
                  <button
                    type="button"
                    onClick={addMetric}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    הוסף מדד
                  </button>
                </div>

                {(formData.metrics || []).length === 0 && (
                  <p className="text-sm text-slate-500">אין מדדים. לחץ &quot;הוסף מדד&quot; כדי להוסיף.</p>
                )}

                {(formData.metrics || []).map((metric, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={metric.label}
                      onChange={(e) => updateMetric(index, 'label', e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500 text-sm"
                      placeholder="תווית (למשל: גידול בהכנסות)"
                    />
                    <input
                      type="text"
                      value={metric.value}
                      onChange={(e) => updateMetric(index, 'value', e.target.value)}
                      className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500 text-sm"
                      placeholder="ערך (למשל: 300%)"
                    />
                    <button
                      type="button"
                      onClick={() => removeMetric(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Program Info */}
              <div className="space-y-4">
                <h3 className="font-medium text-slate-900 border-b pb-2">פרטי התוכנית</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      שם התוכנית
                    </label>
                    <input
                      type="text"
                      value={formData.programName || ''}
                      onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
                      placeholder="מאיץ לאומית"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      שנת שיתוף פעולה
                    </label>
                    <input
                      type="text"
                      value={formData.collaborationDate || ''}
                      onChange={(e) => setFormData({ ...formData, collaborationDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
                      placeholder="2024"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    סדר תצוגה
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-royal-500 focus:border-royal-500"
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="flex items-center gap-6 pt-4 border-t">
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
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">מומלץ</span>
                </label>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'שומר...' : mode === 'create' ? 'צור סיפור' : 'שמור שינויים'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
