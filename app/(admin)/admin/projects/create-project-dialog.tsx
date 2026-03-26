'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createProjectAction, type CreateProjectFormData } from '../actions';
import type { ProjectStatus } from '@prisma/client';

interface Entrepreneur {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
}

interface CreateProjectDialogProps {
  entrepreneurs: Entrepreneur[];
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'DRAFT', label: 'טיוטה' },
  { value: 'CHARACTERIZATION', label: 'אפיון' },
  { value: 'MARKET_RESEARCH', label: 'מחקר שוק' },
  { value: 'BUSINESS_MODEL', label: 'מודל עסקי' },
  { value: 'DEVELOPMENT', label: 'פיתוח' },
  { value: 'FUNDING_PREP', label: 'הכנה לגיוס' },
  { value: 'ACTIVE_FUNDING', label: 'גיוס פעיל' },
];

export function CreateProjectDialog({ entrepreneurs }: CreateProjectDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CreateProjectFormData>({
    name: '',
    description: '',
    industry: '',
    website: '',
    userId: '',
    pipedriveId: '',
    status: 'DRAFT',
    stage: 1,
    targetFunding: undefined,
    fundingCurrency: 'ILS',
    teamSize: undefined,
  });

  const resetForm = () => {
    setFormData({
      name: '', description: '', industry: '', website: '',
      userId: '', pipedriveId: '', status: 'DRAFT', stage: 1,
      targetFunding: undefined, fundingCurrency: 'ILS', teamSize: undefined,
    });
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => { setIsOpen(false); resetForm(); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) { setError('נדרש שם פרויקט'); return; }
    if (!formData.userId) { setError('נדרש לבחור יזם'); return; }

    startTransition(async () => {
      const result = await createProjectAction(formData);
      if (result.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(handleClose, 1500);
      } else {
        setError(result.error || 'שגיאה ביצירת פרויקט');
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl font-medium transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>פרויקט חדש</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-semibold text-slate-900">
                {success ? 'פרויקט נוצר!' : 'פרויקט חדש'}
              </h2>
              <button onClick={handleClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              {success ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-slate-900">הפרויקט נוצר בהצלחה!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Entrepreneur Select */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">יזם *</label>
                    <select
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                      required
                    >
                      <option value="">בחר יזם...</option>
                      {entrepreneurs.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name || e.email} {e.company ? `(${e.company})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Project Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">שם הפרויקט *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="שם הסטארטאפ / הפרויקט"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">תיאור</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="תיאור קצר של הפרויקט..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm resize-none"
                    />
                  </div>

                  {/* Industry & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">תחום</label>
                      <input
                        type="text"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        placeholder="טכנולוגיה, בריאות..."
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">סטטוס התחלתי</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pipedrive ID */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pipedrive Deal ID</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={formData.pipedriveId}
                      onChange={(e) => setFormData({ ...formData, pipedriveId: e.target.value })}
                      placeholder="מזהה עסקה ב-Pipedrive (אופציונלי)"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>

                  {/* Funding & Team */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">יעד גיוס (₪)</label>
                      <input
                        type="number"
                        dir="ltr"
                        value={formData.targetFunding || ''}
                        onChange={(e) => setFormData({ ...formData, targetFunding: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="500000"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">גודל צוות</label>
                      <input
                        type="number"
                        dir="ltr"
                        value={formData.teamSize || ''}
                        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="3"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={handleClose} className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                      ביטול
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex-1 py-3 bg-royal-600 text-white rounded-xl font-medium hover:bg-royal-700 disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
                    >
                      {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /><span>יוצר...</span></> : <><Plus className="w-4 h-4" /><span>צור פרויקט</span></>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
