/**
 * Learning Center manager — the admin tree.
 *
 * Categories → subcategories → lessons, each with create / edit / delete /
 * reorder (up-down) and publish controls. Lesson editing (video, content,
 * attachments, quiz) lives in ./lesson-dialog.
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  Eye,
  EyeOff,
  FolderPlus,
  Video,
  HelpCircle,
  Paperclip,
  Loader2,
  X,
  Upload,
  GraduationCap,
  AlertTriangle,
  Check,
  TrendingUp,
  Briefcase,
  Rocket,
  Clock,
  BookOpen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminCategory, AdminSubcategory, AdminLesson } from '@/lib/learning/repository';
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  createSubcategoryAction,
  updateSubcategoryAction,
  deleteSubcategoryAction,
  deleteLessonAction,
  setLessonStatusAction,
  reorderAction,
  seedLearningAction,
  type CategoryFormData,
} from './actions';
import { LessonDialog } from './lesson-dialog';

const COLORS = ['blue', 'emerald', 'violet', 'amber', 'rose', 'cyan'];
const ICONS = ['TrendingUp', 'Briefcase', 'Rocket', 'Clock', 'BookOpen', 'GraduationCap'];

// Static map — Tailwind can't see `bg-${color}-500` built at runtime.
const COLOR_DOT: Record<string, string> = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  violet: 'bg-violet-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  cyan: 'bg-cyan-500',
};

// Render the actual lucide icon in the picker (not the raw name string).
const ICON_COMPONENTS: Record<string, LucideIcon> = {
  TrendingUp,
  Briefcase,
  Rocket,
  Clock,
  BookOpen,
  GraduationCap,
};

function reorderIds(ids: string[], index: number, dir: -1 | 1): string[] {
  const next = [...ids];
  const target = index + dir;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function LearningManager({
  catalog,
  stats,
  loadError,
}: {
  catalog: AdminCategory[];
  stats: { categories: number; subcategories: number; lessons: number };
  loadError: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [catDialog, setCatDialog] = useState<{ mode: 'create' | 'edit'; category?: AdminCategory } | null>(null);
  const [subDialog, setSubDialog] = useState<{
    mode: 'create' | 'edit';
    categoryId: string;
    subcategory?: AdminSubcategory;
  } | null>(null);
  const [lessonDialog, setLessonDialog] = useState<{
    subcategoryId: string;
    lesson?: AdminLesson;
  } | null>(null);

  const refresh = () => router.refresh();

  const moveCategory = (index: number, dir: -1 | 1) => {
    const ids = reorderIds(catalog.map((c) => c.id), index, dir);
    startTransition(async () => {
      await reorderAction('category', ids);
      refresh();
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-royal-600" />
            ניהול שיעורים
          </h1>
          <p className="text-slate-500 mt-1">
            {stats.categories} קטגוריות · {stats.subcategories} תתי-קטגוריות · {stats.lessons} שיעורים
          </p>
        </div>
        <button
          onClick={() => setCatDialog({ mode: 'create' })}
          className="flex items-center gap-2 px-4 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700 transition-colors self-start"
        >
          <Plus className="w-4 h-4" />
          <span>קטגוריה חדשה</span>
        </button>
      </div>

      {loadError && (
        <div className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">שגיאה בטעינת הקטלוג מה-DB</p>
            <p className="text-amber-700/80 mt-0.5 break-all">{loadError}</p>
            <p className="mt-1">ייתכן שצריך להריץ <code className="bg-amber-100 px-1 rounded" dir="ltr">prisma db push</code> כדי להחיל את שינויי הסכמה.</p>
          </div>
        </div>
      )}

      {/* Empty state — offer to import the legacy catalog */}
      {catalog.length === 0 && !loadError && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <div className="grid place-items-center w-14 h-14 rounded-2xl bg-royal-50 text-royal-600 mx-auto mb-4">
            <Upload className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">אין עדיין שיעורים ב-DB</h2>
          <p className="text-slate-500 mt-1 max-w-md mx-auto">
            ייבא את קטלוג השיעורים הקיים (מהקובץ הסטטי) ל-DB בלחיצה אחת, ואז תוכל לערוך הכל מכאן.
          </p>
          <button
            onClick={() =>
              startTransition(async () => {
                const r = await seedLearningAction();
                if (!r.success) alert(r.error || 'שגיאה בייבוא');
                refresh();
              })
            }
            disabled={isPending}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-royal-600 text-white rounded-lg hover:bg-royal-700 transition-colors disabled:opacity-60"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            ייבא שיעורים מהקטלוג
          </button>
        </div>
      )}

      {/* Tree */}
      <div className="space-y-3">
        {catalog.map((category, ci) => (
          <CategoryNode
            key={category.id}
            category={category}
            index={ci}
            total={catalog.length}
            isPending={isPending}
            onMove={moveCategory}
            onEdit={() => setCatDialog({ mode: 'edit', category })}
            onDelete={() =>
              startTransition(async () => {
                if (
                  !confirm(
                    `למחוק את הקטגוריה "${category.name}"? פעולה זו תמחק גם את כל תתי-הקטגוריות, השיעורים וההתקדמות של היזמים בהם.`,
                  )
                )
                  return;
                const r = await deleteCategoryAction(category.id);
                if (!r.success) alert(r.error);
                refresh();
              })
            }
            onAddSub={() => setSubDialog({ mode: 'create', categoryId: category.id })}
            onEditSub={(sub) => setSubDialog({ mode: 'edit', categoryId: category.id, subcategory: sub })}
            onAddLesson={(subId) => setLessonDialog({ subcategoryId: subId })}
            onEditLesson={(subId, lesson) => setLessonDialog({ subcategoryId: subId, lesson })}
            onRefresh={refresh}
            startTransition={startTransition}
          />
        ))}
      </div>

      {/* Dialogs */}
      {catDialog && (
        <CategoryDialog
          mode={catDialog.mode}
          category={catDialog.category}
          onClose={() => setCatDialog(null)}
          onSaved={() => {
            setCatDialog(null);
            refresh();
          }}
        />
      )}
      {subDialog && (
        <SubcategoryDialog
          mode={subDialog.mode}
          categoryId={subDialog.categoryId}
          subcategory={subDialog.subcategory}
          onClose={() => setSubDialog(null)}
          onSaved={() => {
            setSubDialog(null);
            refresh();
          }}
        />
      )}
      {lessonDialog && (
        <LessonDialog
          subcategoryId={lessonDialog.subcategoryId}
          lesson={lessonDialog.lesson}
          onClose={() => setLessonDialog(null)}
          onSaved={() => {
            setLessonDialog(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CATEGORY NODE
// ---------------------------------------------------------------------------

function CategoryNode({
  category,
  index,
  total,
  isPending,
  onMove,
  onEdit,
  onDelete,
  onAddSub,
  onEditSub,
  onAddLesson,
  onEditLesson,
  onRefresh,
  startTransition,
}: {
  category: AdminCategory;
  index: number;
  total: number;
  isPending: boolean;
  onMove: (index: number, dir: -1 | 1) => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddSub: () => void;
  onEditSub: (sub: AdminSubcategory) => void;
  onAddLesson: (subId: string) => void;
  onEditLesson: (subId: string, lesson: AdminLesson) => void;
  onRefresh: () => void;
  startTransition: (cb: () => Promise<void> | void) => void;
}) {
  const [open, setOpen] = useState(true);
  const lessonCount = category.subcategories.reduce((n, s) => n + s.lessons.length, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 p-3 sm:p-4 bg-slate-50/80">
        <button onClick={() => setOpen((o) => !o)} className="p-1 text-slate-400 hover:text-slate-700">
          <ChevronLeft className={cn('w-4 h-4 transition-transform', open && '-rotate-90')} />
        </button>
        <div className="flex flex-col">
          <ReorderArrows index={index} total={total} disabled={isPending} onMove={onMove} />
        </div>
        <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', COLOR_DOT[category.color || 'blue'] || COLOR_DOT.blue)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 truncate">{category.name}</h3>
            {!category.isActive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-500">מוסתר</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5" dir="ltr">
            {category.slug} · {category.subcategories.length} תתי · {lessonCount} שיעורים
          </p>
        </div>
        <NodeActions onEdit={onEdit} onDelete={onDelete}>
          <button
            onClick={onAddSub}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-royal-50 text-royal-700 rounded-lg hover:bg-royal-100 transition"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            תת-קטגוריה
          </button>
        </NodeActions>
      </div>

      {open && (
        <div className="p-3 sm:p-4 space-y-2">
          {category.subcategories.length === 0 && (
            <p className="text-sm text-slate-400 px-2 py-3 text-center">
              אין תתי-קטגוריות. הוסף אחת כדי להתחיל.
            </p>
          )}
          {category.subcategories.map((sub, si) => (
            <SubcategoryNode
              key={sub.id}
              sub={sub}
              index={si}
              total={category.subcategories.length}
              isPending={isPending}
              onMove={(i, dir) => {
                const ids = reorderIds(category.subcategories.map((s) => s.id), i, dir);
                startTransition(async () => {
                  await reorderAction('subcategory', ids);
                  onRefresh();
                });
              }}
              onEdit={() => onEditSub(sub)}
              onDelete={() =>
                startTransition(async () => {
                  if (!confirm(`למחוק את "${sub.name}" וכל השיעורים שבה?`)) return;
                  const r = await deleteSubcategoryAction(sub.id);
                  if (!r.success) alert(r.error);
                  onRefresh();
                })
              }
              onAddLesson={() => onAddLesson(sub.id)}
              onEditLesson={(lesson) => onEditLesson(sub.id, lesson)}
              onRefresh={onRefresh}
              startTransition={startTransition}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SUBCATEGORY NODE
// ---------------------------------------------------------------------------

function SubcategoryNode({
  sub,
  index,
  total,
  isPending,
  onMove,
  onEdit,
  onDelete,
  onAddLesson,
  onEditLesson,
  onRefresh,
  startTransition,
}: {
  sub: AdminSubcategory;
  index: number;
  total: number;
  isPending: boolean;
  onMove: (index: number, dir: -1 | 1) => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onEditLesson: (lesson: AdminLesson) => void;
  onRefresh: () => void;
  startTransition: (cb: () => Promise<void> | void) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-lg border border-slate-200">
      <div className="flex items-center gap-2 p-2.5 bg-white">
        <button onClick={() => setOpen((o) => !o)} className="p-1 text-slate-400 hover:text-slate-700">
          <ChevronLeft className={cn('w-4 h-4 transition-transform', open && '-rotate-90')} />
        </button>
        <ReorderArrows index={index} total={total} disabled={isPending} onMove={onMove} />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 text-sm truncate">{sub.name}</h4>
          <p className="text-[11px] text-slate-400" dir="ltr">
            {sub.slug} · {sub.lessons.length} שיעורים
          </p>
        </div>
        <NodeActions onEdit={onEdit} onDelete={onDelete}>
          <button
            onClick={onAddLesson}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            שיעור
          </button>
        </NodeActions>
      </div>

      {open && (
        <div className="p-2 space-y-1.5">
          {sub.lessons.length === 0 && (
            <p className="text-xs text-slate-400 px-2 py-2 text-center">אין שיעורים בתת-קטגוריה זו.</p>
          )}
          {sub.lessons.map((lesson, li) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              index={li}
              total={sub.lessons.length}
              isPending={isPending}
              onMove={(i, dir) => {
                const ids = reorderIds(sub.lessons.map((l) => l.id), i, dir);
                startTransition(async () => {
                  await reorderAction('lesson', ids);
                  onRefresh();
                });
              }}
              onEdit={() => onEditLesson(lesson)}
              onTogglePublish={() =>
                startTransition(async () => {
                  await setLessonStatusAction(
                    lesson.id,
                    lesson.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
                  );
                  onRefresh();
                })
              }
              onDelete={() =>
                startTransition(async () => {
                  if (!confirm(`למחוק את השיעור "${lesson.title}"? גם ההתקדמות של היזמים בו תימחק.`)) return;
                  const r = await deleteLessonAction(lesson.id);
                  if (!r.success) alert(r.error);
                  onRefresh();
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LESSON ROW
// ---------------------------------------------------------------------------

function LessonRow({
  lesson,
  index,
  total,
  isPending,
  onMove,
  onEdit,
  onTogglePublish,
  onDelete,
}: {
  lesson: AdminLesson;
  index: number;
  total: number;
  isPending: boolean;
  onMove: (index: number, dir: -1 | 1) => void;
  onEdit: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}) {
  const published = lesson.status === 'PUBLISHED';
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
      <ReorderArrows index={index} total={total} disabled={isPending} onMove={onMove} />
      <div className="relative flex-shrink-0 w-12 h-9 rounded bg-slate-200 overflow-hidden">
        {lesson.youtubeId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://i.ytimg.com/vi/${lesson.youtubeId}/default.jpg`}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-slate-400">
            <Video className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{lesson.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {lesson.attachments.length > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400">
              <Paperclip className="w-3 h-3" />
              {lesson.attachments.length}
            </span>
          )}
          {lesson.quiz && lesson.quiz.questions.length > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400">
              <HelpCircle className="w-3 h-3" />
              {lesson.quiz.questions.length}
            </span>
          )}
          {!lesson.youtubeId && <span className="text-[10px] text-amber-500">ללא וידאו</span>}
        </div>
      </div>
      <button
        onClick={onTogglePublish}
        disabled={isPending}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition',
          published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-500 hover:bg-slate-300',
        )}
        title={published ? 'מפורסם — לחץ כדי להסתיר' : 'טיוטה — לחץ כדי לפרסם'}
      >
        {published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        {published ? 'מפורסם' : 'טיוטה'}
      </button>
      <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-royal-600 transition" title="ערוך">
        <Pencil className="w-4 h-4" />
      </button>
      <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 transition" title="מחק">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHARED BITS
// ---------------------------------------------------------------------------

function ReorderArrows({
  index,
  total,
  disabled,
  onMove,
}: {
  index: number;
  total: number;
  disabled: boolean;
  onMove: (index: number, dir: -1 | 1) => void;
}) {
  return (
    <div className="flex flex-col">
      <button
        onClick={() => onMove(index, -1)}
        disabled={disabled || index === 0}
        className="text-slate-300 hover:text-slate-600 disabled:opacity-30 disabled:hover:text-slate-300"
        title="העבר למעלה"
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onMove(index, 1)}
        disabled={disabled || index === total - 1}
        className="text-slate-300 hover:text-slate-600 disabled:opacity-30 disabled:hover:text-slate-300"
        title="העבר למטה"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function NodeActions({
  onEdit,
  onDelete,
  children,
}: {
  onEdit: () => void;
  onDelete: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {children}
      <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-royal-600 transition" title="ערוך">
        <Pencil className="w-4 h-4" />
      </button>
      <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 transition" title="מחק">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CATEGORY DIALOG
// ---------------------------------------------------------------------------

function DialogShell({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" dir="rtl">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">{children}</div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 bg-slate-50">{footer}</div>
      </div>
    </div>
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

const inputCls =
  'w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-500/20';

function CategoryDialog({
  mode,
  category,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit';
  category?: AdminCategory;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<CategoryFormData>({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    icon: category?.icon || 'BookOpen',
    color: category?.color || 'blue',
    isActive: category?.isActive ?? true,
  });
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    setError(null);
    start(async () => {
      const r =
        mode === 'create'
          ? await createCategoryAction(form)
          : await updateCategoryAction(category!.id, form);
      if (r.success) onSaved();
      else setError(r.error || 'שגיאה');
    });
  };

  return (
    <DialogShell
      title={mode === 'create' ? 'קטגוריה חדשה' : 'עריכת קטגוריה'}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg">
            ביטול
          </button>
          <button
            onClick={save}
            disabled={pending || !form.name.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700 disabled:opacity-60"
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            שמירה
          </button>
        </>
      }
    >
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
      <Field label="שם *">
        <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>
      <Field label="Slug (אופציונלי — נוצר אוטומטית)">
        <input className={inputCls} dir="ltr" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
      </Field>
      <Field label="תיאור">
        <textarea rows={2} className={cn(inputCls, 'resize-none')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </Field>
      <Field label="צבע">
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => {
            const active = form.color === c;
            return (
              <button
                type="button"
                key={c}
                onClick={() => setForm({ ...form, color: c })}
                title={c}
                aria-label={c}
                aria-pressed={active}
                className={cn(
                  'relative w-9 h-9 rounded-full transition ring-2 ring-offset-2',
                  COLOR_DOT[c],
                  active ? 'ring-slate-800' : 'ring-transparent hover:ring-slate-300',
                )}
              >
                {active && (
                  <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow" strokeWidth={3} />
                )}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="אייקון">
        <div className="flex flex-wrap gap-2">
          {ICONS.map((name) => {
            const Icon = ICON_COMPONENTS[name];
            const active = form.icon === name;
            return (
              <button
                type="button"
                key={name}
                onClick={() => setForm({ ...form, icon: name })}
                title={name}
                aria-label={name}
                aria-pressed={active}
                className={cn(
                  'grid place-items-center w-11 h-11 rounded-xl border transition',
                  active
                    ? 'border-royal-500 bg-royal-50 text-royal-700 ring-2 ring-royal-500/20'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                {Icon ? <Icon className="w-5 h-5" /> : name}
              </button>
            );
          })}
        </div>
      </Field>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          className="w-4 h-4 rounded border-slate-300 text-royal-600"
        />
        <span className="text-sm text-slate-700">פעיל (מוצג ליזמים)</span>
      </label>
    </DialogShell>
  );
}

function SubcategoryDialog({
  mode,
  categoryId,
  subcategory,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit';
  categoryId: string;
  subcategory?: AdminSubcategory;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: subcategory?.name || '',
    slug: subcategory?.slug || '',
    description: subcategory?.description || '',
  });
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    setError(null);
    start(async () => {
      const r =
        mode === 'create'
          ? await createSubcategoryAction({ categoryId, ...form })
          : await updateSubcategoryAction(subcategory!.id, form);
      if (r.success) onSaved();
      else setError(r.error || 'שגיאה');
    });
  };

  return (
    <DialogShell
      title={mode === 'create' ? 'תת-קטגוריה חדשה' : 'עריכת תת-קטגוריה'}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg">
            ביטול
          </button>
          <button
            onClick={save}
            disabled={pending || !form.name.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700 disabled:opacity-60"
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            שמירה
          </button>
        </>
      }
    >
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
      <Field label="שם *">
        <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>
      <Field label="Slug (אופציונלי)">
        <input className={inputCls} dir="ltr" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
      </Field>
      <Field label="תיאור">
        <textarea rows={3} className={cn(inputCls, 'resize-none')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </Field>
    </DialogShell>
  );
}
