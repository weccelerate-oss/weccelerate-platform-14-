/**
 * Lesson editor dialog.
 *
 * Edits everything about a lesson: title, slug, YouTube video (with live
 * preview), description, rich content, duration, publish status, downloadable
 * attachments, and an end-of-lesson quiz.
 *
 * Attachments + quiz require a saved lesson (they need a lessonId), so in
 * "create" mode those sections prompt the admin to save first.
 */

'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Loader2,
  Video,
  Plus,
  Trash2,
  Upload,
  Paperclip,
  HelpCircle,
  CheckCircle,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractYouTubeId } from '@/lib/learning/youtube';
import type { AdminLesson } from '@/lib/learning/repository';
import {
  createLessonAction,
  updateLessonAction,
  deleteAttachmentAction,
  saveQuizAction,
  type LessonFormData,
  type QuizQuestionInput,
} from './actions';

const inputCls =
  'w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20';

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function LessonDialog({
  subcategoryId,
  lesson,
  onClose,
  onSaved,
}: {
  subcategoryId: string;
  lesson?: AdminLesson;
  onClose: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const mode = lesson ? 'edit' : 'create';
  const [tab, setTab] = useState<'details' | 'attachments' | 'quiz'>('details');

  const [form, setForm] = useState<LessonFormData>({
    subcategoryId,
    title: lesson?.title || '',
    slug: lesson?.slug || '',
    description: lesson?.description || '',
    content: lesson?.content || '',
    youtubeUrl: lesson?.youtubeUrl || '',
    duration: lesson?.duration || undefined,
    status: lesson?.status || 'DRAFT',
  });
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const ytId = useMemo(() => extractYouTubeId(form.youtubeUrl || ''), [form.youtubeUrl]);

  const saveDetails = () => {
    setError(null);
    start(async () => {
      const r =
        mode === 'create'
          ? await createLessonAction(form)
          : await updateLessonAction(lesson!.id, form);
      if (r.success) onSaved();
      else setError(r.error || 'שגיאה');
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh]" dir="rtl">
        {/* Header + tabs */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            {mode === 'create' ? 'שיעור חדש' : 'עריכת שיעור'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex border-b border-slate-200 px-5 gap-1">
          <Tab active={tab === 'details'} onClick={() => setTab('details')} icon={<Video className="w-4 h-4" />}>
            פרטים ווידאו
          </Tab>
          <Tab active={tab === 'attachments'} onClick={() => setTab('attachments')} icon={<Paperclip className="w-4 h-4" />}>
            קבצים
          </Tab>
          <Tab active={tab === 'quiz'} onClick={() => setTab('quiz')} icon={<HelpCircle className="w-4 h-4" />}>
            בוחן
          </Tab>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          {tab === 'details' && (
            <div className="space-y-4">
              <Field label="כותרת *">
                <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </Field>
              <Field label="Slug (אופציונלי — נוצר אוטומטית)">
                <input className={inputCls} dir="ltr" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </Field>
              <Field label="קישור YouTube">
                <input
                  className={inputCls}
                  dir="ltr"
                  placeholder="https://youtu.be/..."
                  value={form.youtubeUrl}
                  onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  העלה ל-YouTube כ-Unlisted (לא רשום) והדבק כאן את הקישור.
                </p>
              </Field>
              {ytId && (
                <div className="rounded-lg overflow-hidden border border-slate-200 aspect-video bg-black">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${ytId}`}
                    title="preview"
                    allowFullScreen
                  />
                </div>
              )}
              <Field label="תיאור קצר">
                <textarea rows={2} className={cn(inputCls, 'resize-none')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
              <Field label="תוכן / הערות (מוצג מתחת לוידאו)">
                <textarea rows={4} className={cn(inputCls, 'resize-none')} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="משך (שניות)">
                  <input
                    type="number"
                    min={0}
                    className={inputCls}
                    value={form.duration ?? ''}
                    onChange={(e) => setForm({ ...form, duration: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </Field>
                <Field label="סטטוס">
                  <select
                    className={inputCls}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as 'DRAFT' | 'PUBLISHED' })}
                  >
                    <option value="DRAFT">טיוטה (מוסתר)</option>
                    <option value="PUBLISHED">מפורסם (גלוי ליזמים)</option>
                  </select>
                </Field>
              </div>
            </div>
          )}

          {tab === 'attachments' &&
            (mode === 'create' ? (
              <NeedSaveFirst label="שמור את השיעור תחילה כדי להוסיף קבצים מצורפים." />
            ) : (
              <AttachmentsPanel lesson={lesson!} onChanged={() => router.refresh()} />
            ))}

          {tab === 'quiz' &&
            (mode === 'create' ? (
              <NeedSaveFirst label="שמור את השיעור תחילה כדי להוסיף בוחן." />
            ) : (
              <QuizPanel lesson={lesson!} onSaved={onSaved} />
            ))}
        </div>

        {tab === 'details' && (
          <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 bg-slate-50">
            <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg">
              ביטול
            </button>
            <button
              onClick={saveDetails}
              disabled={pending || !form.title.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700 disabled:opacity-60"
            >
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'create' ? 'צור שיעור' : 'שמור שינויים'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Tab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition',
        active ? 'border-royal-600 text-royal-700' : 'border-transparent text-slate-400 hover:text-slate-600',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function NeedSaveFirst({ label }: { label: string }) {
  return (
    <div className="text-center py-10 text-slate-400">
      <CheckCircle className="w-8 h-8 mx-auto mb-3 text-slate-300" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ATTACHMENTS
// ---------------------------------------------------------------------------

function AttachmentsPanel({ lesson, onChanged }: { lesson: AdminLesson; onChanged: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const upload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('lessonId', lesson.id);
      const res = await fetch('/api/admin/learning/attachments', { method: 'POST', body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok) setError(data?.error || 'העלאה נכשלה');
      else onChanged();
    } catch {
      setError('העלאה נכשלה');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-royal-300 hover:bg-royal-50/30 transition">
        {uploading ? <Loader2 className="w-6 h-6 text-royal-500 animate-spin" /> : <Upload className="w-6 h-6 text-slate-400" />}
        <span className="text-sm text-slate-500">{uploading ? 'מעלה...' : 'לחץ להעלאת קובץ (עד 50MB)'}</span>
        <input
          type="file"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = '';
          }}
        />
      </label>

      <div className="space-y-2">
        {lesson.attachments.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-2">אין קבצים מצורפים.</p>
        )}
        {lesson.attachments.map((a) => (
          <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50">
            <Download className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 text-sm text-slate-700 truncate hover:text-royal-600">
              {a.name}
            </a>
            <button
              onClick={() =>
                start(async () => {
                  if (!confirm('למחוק את הקובץ?')) return;
                  await deleteAttachmentAction(a.id);
                  onChanged();
                })
              }
              disabled={pending}
              className="p-1.5 text-slate-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// QUIZ
// ---------------------------------------------------------------------------

type DraftOption = { id: string; text: string };
type DraftQuestion = { id: string; prompt: string; options: DraftOption[]; correctId: string };

function QuizPanel({ lesson, onSaved }: { lesson: AdminLesson; onSaved: () => void }) {
  const [title, setTitle] = useState(lesson.quiz?.title || '');
  const [passScore, setPassScore] = useState(lesson.quiz?.passScore ?? 70);
  const [questions, setQuestions] = useState<DraftQuestion[]>(
    () =>
      lesson.quiz?.questions.map((q) => ({
        id: q.id || uid(),
        prompt: q.prompt,
        options: q.options.map((o) => ({ id: o.id, text: o.text })),
        correctId: q.correctId || '',
      })) || [],
  );
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const addQuestion = () => {
    const o1 = uid();
    const o2 = uid();
    setQuestions((qs) => [
      ...qs,
      { id: uid(), prompt: '', options: [{ id: o1, text: '' }, { id: o2, text: '' }], correctId: o1 },
    ]);
  };

  const updateQuestion = (qid: string, patch: Partial<DraftQuestion>) =>
    setQuestions((qs) => qs.map((q) => (q.id === qid ? { ...q, ...patch } : q)));

  const save = () => {
    setError(null);
    setSaved(false);
    const payload: QuizQuestionInput[] = questions.map((q) => ({
      prompt: q.prompt,
      options: q.options,
      correctId: q.correctId,
    }));
    start(async () => {
      const r = await saveQuizAction(lesson.id, { title, passScore, questions: payload });
      if (r.success) {
        setSaved(true);
        onSaved();
      } else setError(r.error || 'שגיאה');
    });
  };

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
      {saved && (
        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> הבוחן נשמר
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="כותרת הבוחן">
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="בוחן קצר" />
        </Field>
        <Field label="ציון מעבר (%)">
          <input
            type="number"
            min={0}
            max={100}
            className={inputCls}
            value={passScore}
            onChange={(e) => setPassScore(parseInt(e.target.value) || 0)}
          />
        </Field>
      </div>

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={q.id} className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-sm font-bold text-slate-400 mt-2">{qi + 1}.</span>
              <input
                className={inputCls}
                placeholder="שאלה"
                value={q.prompt}
                onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })}
              />
              <button
                onClick={() => setQuestions((qs) => qs.filter((x) => x.id !== q.id))}
                className="p-2 text-slate-400 hover:text-red-600 mt-0.5"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5 pr-6">
              {q.options.map((o) => (
                <div key={o.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctId === o.id}
                    onChange={() => updateQuestion(q.id, { correctId: o.id })}
                    className="w-4 h-4 text-emerald-600"
                    title="סמן כתשובה הנכונה"
                  />
                  <input
                    className={cn(inputCls, 'py-1.5')}
                    placeholder="תשובה"
                    value={o.text}
                    onChange={(e) =>
                      updateQuestion(q.id, {
                        options: q.options.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)),
                      })
                    }
                  />
                  {q.options.length > 2 && (
                    <button
                      onClick={() =>
                        updateQuestion(q.id, {
                          options: q.options.filter((x) => x.id !== o.id),
                          correctId: q.correctId === o.id ? q.options[0].id : q.correctId,
                        })
                      }
                      className="p-1.5 text-slate-300 hover:text-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() =>
                  updateQuestion(q.id, { options: [...q.options, { id: uid(), text: '' }] })
                }
                className="text-xs text-royal-600 hover:underline flex items-center gap-1 mt-1"
              >
                <Plus className="w-3 h-3" /> הוסף תשובה
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addQuestion}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-royal-300 hover:text-royal-600 transition"
      >
        <Plus className="w-4 h-4" /> הוסף שאלה
      </button>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-400">
          {questions.length === 0 ? 'שמירה ללא שאלות תמחק את הבוחן.' : `${questions.length} שאלות`}
        </p>
        <button
          onClick={save}
          disabled={pending}
          className="flex items-center gap-2 px-5 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700 disabled:opacity-60"
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" />}
          שמור בוחן
        </button>
      </div>
    </div>
  );
}
