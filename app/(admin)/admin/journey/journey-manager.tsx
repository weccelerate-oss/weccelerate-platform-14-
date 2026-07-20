'use client';

/**
 * Founder Journey — Admin manager.
 *
 * Chapters → questions tree with inline editing, ordering, publish toggle and
 * a one-click seed of the cleaned workbook content. Follows the Learning CMS
 * manager pattern: server actions + useTransition + router.refresh().
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  EyeOff,
  ListChecks,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminJourneyChapter } from '@/lib/journey/repository';
import {
  createChapterAction,
  updateChapterAction,
  deleteChapterAction,
  createQuestionAction,
  updateQuestionAction,
  deleteQuestionAction,
  reorderJourneyAction,
  seedJourneyAction,
} from './actions';

interface Props {
  initialChapters: AdminJourneyChapter[];
}

interface QuestionDraft {
  id?: string;
  chapterId: string;
  prompt: string;
  helper: string;
}

interface ChapterDraft {
  id?: string;
  name: string;
  description: string;
  investorLook: string;
  icon: string;
}

export function JourneyManager({ initialChapters }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [questionDraft, setQuestionDraft] = useState<QuestionDraft | null>(null);
  const [chapterDraft, setChapterDraft] = useState<ChapterDraft | null>(null);

  const chapters = initialChapters;
  const totalQuestions = chapters.reduce((s, c) => s + c.questions.length, 0);

  const run = (fn: () => Promise<{ success: boolean; error?: string }>, okMsg?: string) => {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.success) {
        setError(res.error || 'שגיאה לא ידועה');
      } else {
        if (okMsg) {
          setNotice(okMsg);
          setTimeout(() => setNotice(null), 3500);
        }
        router.refresh();
      }
    });
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const move = (model: 'chapter' | 'question', ids: string[], index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    const next = [...ids];
    [next[index], next[target]] = [next[target], next[index]];
    run(() => reorderJourneyAction(model, next));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-600" />
            מסע מרעיון למיזם
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {chapters.length} פרקים · {totalQuestions} שאלות · התוכן מוצג ליזמים ב-
            <span className="font-mono text-xs">/portal/journey</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/journey/answers"
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ListChecks className="w-4 h-4" />
            תשובות היזמים
          </Link>
          <button
            onClick={() =>
              setChapterDraft({ name: '', description: '', investorLook: '', icon: 'Sparkles' })
            }
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            פרק חדש
          </button>
          <button
            onClick={() =>
              run(
                () => seedJourneyAction(),
                'תוכן המסע נטען — 7 פרקים עם 100 השאלות מהקובץ',
              )
            }
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {chapters.length === 0 ? 'טען את תוכן הקובץ' : 'סנכרן מתוכן הקובץ'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      {chapters.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          המסע עדיין ריק. לחץ על <b>"טען את תוכן הקובץ"</b> כדי לייבא את 7 הפרקים ו-100 השאלות
          מקובץ "מרעיון למיזם" (מנוקים ומוכנים), או צור פרק ידנית.
        </div>
      )}

      {/* Chapters */}
      <div className="space-y-3">
        {chapters.map((chapter, ci) => {
          const isOpen = expanded.has(chapter.id);
          return (
            <div key={chapter.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 px-4 py-3">
                <button onClick={() => toggleExpand(chapter.id)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 grid place-items-center text-xs font-bold">
                  {ci + 1}
                </span>
                <button onClick={() => toggleExpand(chapter.id)} className="flex-1 text-right cursor-pointer">
                  <span className="font-semibold text-slate-800">{chapter.name}</span>
                  <span className="text-xs text-slate-400 mr-2">{chapter.questions.length} שאלות</span>
                  {chapter.status === 'DRAFT' && (
                    <span className="text-[10px] mr-2 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-slate-500">
                      טיוטה — מוסתר מהפורטל
                    </span>
                  )}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    title={chapter.status === 'PUBLISHED' ? 'הסתר מהפורטל' : 'פרסם לפורטל'}
                    onClick={() =>
                      run(() =>
                        updateChapterAction(chapter.id, {
                          status: chapter.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
                        }),
                      )
                    }
                    className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer"
                  >
                    {chapter.status === 'PUBLISHED' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    title="ערוך פרק"
                    onClick={() =>
                      setChapterDraft({
                        id: chapter.id,
                        name: chapter.name,
                        description: chapter.description ?? '',
                        investorLook: chapter.investorLook ?? '',
                        icon: chapter.icon ?? 'Sparkles',
                      })
                    }
                    className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    title="הזז למעלה"
                    onClick={() => move('chapter', chapters.map((c) => c.id), ci, -1)}
                    disabled={ci === 0}
                    className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    title="הזז למטה"
                    onClick={() => move('chapter', chapters.map((c) => c.id), ci, 1)}
                    disabled={ci === chapters.length - 1}
                    className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    title="מחק פרק"
                    onClick={() => {
                      if (
                        window.confirm(
                          `למחוק את הפרק "${chapter.name}"? כל השאלות והתשובות של היזמים בפרק יימחקו לצמיתות.`,
                        )
                      ) {
                        run(() => deleteChapterAction(chapter.id));
                      }
                    }}
                    className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-slate-100 px-4 py-3">
                  {chapter.investorLook && (
                    <p className="text-xs text-slate-500 bg-amber-50/60 border border-amber-100 rounded-lg px-3 py-2 mb-3">
                      <b className="text-amber-700">מה משקיע מחפש:</b> {chapter.investorLook}
                    </p>
                  )}
                  <div className="space-y-1.5">
                    {chapter.questions.map((q, qi) => (
                      <div
                        key={q.id}
                        className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
                      >
                        <span className="text-[11px] text-slate-400 tabular-nums mt-0.5 w-5">{qi + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-slate-800">{q.prompt}</div>
                          {q.helper && <div className="text-xs text-slate-400 mt-0.5">{q.helper}</div>}
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            title="ערוך"
                            onClick={() =>
                              setQuestionDraft({
                                id: q.id,
                                chapterId: chapter.id,
                                prompt: q.prompt,
                                helper: q.helper ?? '',
                              })
                            }
                            className="p-1 rounded text-slate-400 hover:text-blue-600 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="הזז למעלה"
                            onClick={() => move('question', chapter.questions.map((x) => x.id), qi, -1)}
                            disabled={qi === 0}
                            className="p-1 rounded text-slate-400 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="הזז למטה"
                            onClick={() => move('question', chapter.questions.map((x) => x.id), qi, 1)}
                            disabled={qi === chapter.questions.length - 1}
                            className="p-1 rounded text-slate-400 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="מחק"
                            onClick={() => {
                              if (window.confirm('למחוק את השאלה? תשובות יזמים עליה יימחקו.')) {
                                run(() => deleteQuestionAction(q.id));
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setQuestionDraft({ chapterId: chapter.id, prompt: '', helper: '' })}
                    className="mt-3 flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-800 font-medium cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    הוסף שאלה לפרק
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Question modal */}
      {questionDraft && (
        <Modal onClose={() => setQuestionDraft(null)} title={questionDraft.id ? 'עריכת שאלה' : 'שאלה חדשה'}>
          <label className="block text-sm font-medium text-slate-700 mb-1">נוסח השאלה *</label>
          <textarea
            value={questionDraft.prompt}
            onChange={(e) => setQuestionDraft({ ...questionDraft, prompt: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm mb-3 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
          />
          <label className="block text-sm font-medium text-slate-700 mb-1">
            טקסט עזר — "מה משקיע מחפש" (מוצג מתחת לשאלה)
          </label>
          <textarea
            value={questionDraft.helper}
            onChange={(e) => setQuestionDraft({ ...questionDraft, helper: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm mb-4 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
          />
          <ModalActions
            onCancel={() => setQuestionDraft(null)}
            onSave={() => {
              const d = questionDraft;
              setQuestionDraft(null);
              if (d.id) {
                run(() => updateQuestionAction(d.id!, { prompt: d.prompt, helper: d.helper }));
              } else {
                run(() =>
                  createQuestionAction({ chapterId: d.chapterId, prompt: d.prompt, helper: d.helper }),
                );
              }
            }}
            saveDisabled={!questionDraft.prompt.trim() || isPending}
          />
        </Modal>
      )}

      {/* Chapter modal */}
      {chapterDraft && (
        <Modal onClose={() => setChapterDraft(null)} title={chapterDraft.id ? 'עריכת פרק' : 'פרק חדש'}>
          <label className="block text-sm font-medium text-slate-700 mb-1">שם הפרק *</label>
          <input
            value={chapterDraft.name}
            onChange={(e) => setChapterDraft({ ...chapterDraft, name: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm mb-3 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
          />
          <label className="block text-sm font-medium text-slate-700 mb-1">תיאור קצר (מוצג בכרטיס)</label>
          <input
            value={chapterDraft.description}
            onChange={(e) => setChapterDraft({ ...chapterDraft, description: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm mb-3 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
          />
          <label className="block text-sm font-medium text-slate-700 mb-1">"מה משקיע מחפש כאן" (פתיח הפרק)</label>
          <textarea
            value={chapterDraft.investorLook}
            onChange={(e) => setChapterDraft({ ...chapterDraft, investorLook: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm mb-3 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
          />
          <label className="block text-sm font-medium text-slate-700 mb-1">
            אייקון (שם מ-lucide: Telescope / Gem / Megaphone / LineChart / FlaskConical / Users / Landmark)
          </label>
          <input
            value={chapterDraft.icon}
            onChange={(e) => setChapterDraft({ ...chapterDraft, icon: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm mb-4 font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
            dir="ltr"
          />
          <ModalActions
            onCancel={() => setChapterDraft(null)}
            onSave={() => {
              const d = chapterDraft;
              setChapterDraft(null);
              if (d.id) {
                run(() =>
                  updateChapterAction(d.id!, {
                    name: d.name,
                    description: d.description,
                    investorLook: d.investorLook,
                    icon: d.icon,
                  }),
                );
              } else {
                run(() =>
                  createChapterAction({
                    name: d.name,
                    description: d.description,
                    investorLook: d.investorLook,
                    icon: d.icon,
                  }),
                );
              }
            }}
            saveDisabled={!chapterDraft.name.trim() || isPending}
          />
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small modal primitives (matching the admin's hand-rolled style)
// ---------------------------------------------------------------------------

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose} dir="rtl">
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  onSave,
  saveDisabled,
}: {
  onCancel: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={onCancel}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
      >
        ביטול
      </button>
      <button
        onClick={onSave}
        disabled={saveDisabled}
        className={cn(
          'rounded-lg bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 cursor-pointer',
          saveDisabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        שמירה
      </button>
    </div>
  );
}
