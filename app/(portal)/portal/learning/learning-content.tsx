/**
 * Learning Center Content
 *
 * Interactive course browser with YouTube lessons, completion tracking,
 * and a "remember where I paused" resume system powered by the YouTube
 * IFrame API + the UserLessonProgress table.
 */

'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Clock,
  Play,
  TrendingUp,
  Briefcase,
  Rocket,
  GraduationCap,
  Trophy,
  Sparkles,
  X,
  History,
  RotateCcw,
  Flame,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { COURSES_DATA, getTotalLessons } from '@/lib/courses-data';
import type { CategoryData, SubcategoryData, LessonData } from '@/lib/courses-data';

// =============================================================================
// TYPES
// =============================================================================

export interface LessonProgress {
  slug: string;
  completed: boolean;
  positionSec: number;
  durationSec: number | null;
  lastWatchedAt: string | null;
}

interface LearningContentProps {
  user: { id: string; name: string };
  initialProgress: LessonProgress[];
}

// Cross-cutting "is this in progress" check — used in multiple places.
// A lesson is "in progress" iff: not completed AND we've recorded a real
// position (>= MIN_RESUME_SEC). Anything shorter is autoplay noise.
const MIN_RESUME_SEC = 5;
const COMPLETE_RATIO = 0.92;
const COMPLETE_REMAINING_SEC = 1.5; // ≤ 1.5s left → already "done"

// Shared rule: a position counts as "finished" if it's within 1.5 seconds
// of the end OR past 92% of the runtime. Mirrors the server.
function isEffectivelyComplete(positionSec: number, durationSec: number | null): boolean {
  if (!durationSec || durationSec <= 0) return false;
  if (durationSec - positionSec <= COMPLETE_REMAINING_SEC) return true;
  return positionSec / durationSec >= COMPLETE_RATIO;
}

// Treat a lesson as "effectively done" if the completed flag is set OR
// the cursor has crossed the completion threshold. The second condition
// is a UI safety-net: if any persistence path drops the flag (server
// downtime, race condition, schema migration), the visual still reflects
// reality based on how far the user got.
function isEffectivelyDone(p: LessonProgress | undefined): boolean {
  if (!p) return false;
  if (p.completed) return true;
  return isEffectivelyComplete(p.positionSec, p.durationSec);
}

function isInProgress(p: LessonProgress | undefined): p is LessonProgress {
  return Boolean(p && !isEffectivelyDone(p) && p.positionSec >= MIN_RESUME_SEC);
}

function progressPercent(p: LessonProgress | undefined): number {
  if (!p) return 0;
  if (p.completed) return 100;
  if (!p.durationSec || p.durationSec <= 0) return 0;
  return Math.min(100, Math.round((p.positionSec / p.durationSec) * 100));
}

function formatTime(totalSec: number): string {
  if (!Number.isFinite(totalSec) || totalSec < 0) return '0:00';
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Flat index of every lesson with its category for the resume card.
type LessonIndex = {
  lesson: LessonData;
  category: CategoryData;
  subcategory: SubcategoryData;
};

function buildLessonIndex(): Map<string, LessonIndex> {
  const map = new Map<string, LessonIndex>();
  for (const category of COURSES_DATA) {
    for (const subcategory of category.subcategories) {
      for (const lesson of subcategory.lessons) {
        map.set(lesson.slug, { lesson, category, subcategory });
      }
    }
  }
  return map;
}

// Flat traversal order: every lesson in the order they appear on the page.
// Powers "מומלץ הבא" + continuous autoplay across subcategory/category seams.
function buildLessonOrder(): string[] {
  const order: string[] = [];
  for (const category of COURSES_DATA) {
    for (const subcategory of category.subcategories) {
      for (const lesson of subcategory.lessons) {
        order.push(lesson.slug);
      }
    }
  }
  return order;
}

// =============================================================================
// ICON / COLOR MAPS
// =============================================================================

const ICON_MAP: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUp className="w-6 h-6" />,
  Briefcase: <Briefcase className="w-6 h-6" />,
  Rocket: <Rocket className="w-6 h-6" />,
  Clock: <Clock className="w-6 h-6" />,
};

/** Hex equivalents of the Tailwind colours, used by SVG strokes which
 * can't read Tailwind class names. Keep in sync with COLOR_MAP. */
const COLOR_HEX: Record<string, string> = {
  blue: '#60a5fa',
  emerald: '#34d399',
  violet: '#a78bfa',
  amber: '#fbbf24',
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; light: string; progress: string; ring: string; gradient: string }> = {
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-400',
    border: 'border-blue-200',
    light: 'bg-blue-500/10',
    progress: 'bg-blue-500',
    ring: 'stroke-blue-400',
    gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
  },
  emerald: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-400',
    border: 'border-emerald-200',
    light: 'bg-emerald-500/10',
    progress: 'bg-emerald-500',
    ring: 'stroke-emerald-400',
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
  },
  violet: {
    bg: 'bg-violet-500',
    text: 'text-violet-400',
    border: 'border-violet-200',
    light: 'bg-violet-500/10',
    progress: 'bg-violet-500',
    ring: 'stroke-violet-400',
    gradient: 'from-violet-500/20 via-violet-500/5 to-transparent',
  },
  amber: {
    bg: 'bg-amber-500',
    text: 'text-amber-400',
    border: 'border-amber-200',
    light: 'bg-amber-500/10',
    progress: 'bg-amber-500',
    ring: 'stroke-amber-400',
    gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
  },
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function hebrewGreeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h >= 5 && h < 12) return 'בוקר טוב';
  if (h >= 12 && h < 17) return 'צהריים טובים';
  if (h >= 17 && h < 22) return 'ערב טוב';
  return 'לילה טוב';
}

function formatWatchTime(totalSec: number): string {
  if (totalSec < 60) return `${totalSec} שניות`;
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (hours === 0) return `${minutes} דק׳`;
  if (minutes === 0) return `${hours} שע׳`;
  return `${hours} שע׳ ${minutes} דק׳`;
}

export function LearningContent({ user, initialProgress }: LearningContentProps) {
  // The single source of truth for "what does the user know / where did
  // they stop." Keyed by slug for O(1) lookup from any render path.
  // On load, treat any lesson past the completion threshold as completed —
  // covers rows written before the server-side auto-complete rule existed,
  // so the gold progress bar reflects reality immediately.
  const [progressMap, setProgressMap] = useState<Map<string, LessonProgress>>(
    () => {
      const m = new Map<string, LessonProgress>();
      for (const p of initialProgress) {
        const pastThreshold = !p.completed && isEffectivelyComplete(p.positionSec, p.durationSec);
        m.set(p.slug, pastThreshold ? { ...p, completed: true } : p);
      }
      return m;
    },
  );

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(COURSES_DATA.map((c) => c.slug)),
  );
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [activeLesson, setActiveLesson] = useState<LessonData | null>(null);
  const [activeCategoryColor, setActiveCategoryColor] = useState<string>('blue');

  const totalLessons = useMemo(() => getTotalLessons(), []);
  const lessonIndex = useMemo(() => buildLessonIndex(), []);
  const lessonOrder = useMemo(() => buildLessonOrder(), []);

  // Returns the next lesson after `slug` in display order, or null at end.
  const getNextLesson = useCallback(
    (slug: string): LessonIndex | null => {
      const idx = lessonOrder.indexOf(slug);
      if (idx < 0 || idx >= lessonOrder.length - 1) return null;
      return lessonIndex.get(lessonOrder[idx + 1]) ?? null;
    },
    [lessonOrder, lessonIndex],
  );

  const completedCount = useMemo(
    () => Array.from(progressMap.values()).filter((p) => isEffectivelyDone(p)).length,
    [progressMap],
  );
  const overallPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Engagement stats for the hero strip. Computed from the same progressMap
  // so they stay perfectly in sync with the rest of the page.
  const engagementStats = useMemo(() => {
    let watchSec = 0;
    let thisWeek = 0;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    for (const p of progressMap.values()) {
      // Sum effective watch time: full duration for completed lessons,
      // current position for in-progress ones.
      if (isEffectivelyDone(p) && p.durationSec) watchSec += p.durationSec;
      else if (p.positionSec > 0) watchSec += p.positionSec;

      if (p.lastWatchedAt && new Date(p.lastWatchedAt).getTime() >= weekAgo) {
        thisWeek++;
      }
    }
    return { watchSec, thisWeek };
  }, [progressMap]);

  // The "continue watching" pick: the most-recently-touched in-progress lesson.
  // Falls back to nothing if everything is done or untouched.
  const continueLesson = useMemo<LessonIndex | null>(() => {
    const candidates = Array.from(progressMap.values())
      .filter(isInProgress)
      .sort((a, b) => {
        const aT = a.lastWatchedAt ? new Date(a.lastWatchedAt).getTime() : 0;
        const bT = b.lastWatchedAt ? new Date(b.lastWatchedAt).getTime() : 0;
        return bT - aT;
      });
    for (const c of candidates) {
      const entry = lessonIndex.get(c.slug);
      if (entry) return entry;
    }
    return null;
  }, [progressMap, lessonIndex]);

  // A short "recently watched" strip — last 4 touched lessons, excluding the
  // one already shown in the continue card. Helps users jump back to anything
  // they touched, not just the literal last thing.
  const recentLessons = useMemo<Array<{ entry: LessonIndex; progress: LessonProgress }>>(() => {
    return Array.from(progressMap.values())
      .filter((p) => p.lastWatchedAt)
      .sort((a, b) => {
        const aT = a.lastWatchedAt ? new Date(a.lastWatchedAt).getTime() : 0;
        const bT = b.lastWatchedAt ? new Date(b.lastWatchedAt).getTime() : 0;
        return bT - aT;
      })
      .filter((p) => !continueLesson || p.slug !== continueLesson.lesson.slug)
      .map((p) => {
        const entry = lessonIndex.get(p.slug);
        return entry ? { entry, progress: p } : null;
      })
      .filter((x): x is { entry: LessonIndex; progress: LessonProgress } => Boolean(x))
      .slice(0, 4);
  }, [progressMap, lessonIndex, continueLesson]);

  const toggleCategory = useCallback((slug: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  const toggleSubcategory = useCallback((slug: string) => {
    setExpandedSubcategories((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  // Patch progress for a single lesson locally + send to the server. Used by:
  //   - manual checkbox toggle (sends `completed`)
  //   - in-video position saves (sends `positionSec` + `durationSec`)
  //   - auto-complete from the modal (sends both)
  const patchProgress = useCallback(
    async (
      slug: string,
      patch: { completed?: boolean; positionSec?: number; durationSec?: number },
    ) => {
      const previous = progressMap.get(slug);
      const next: LessonProgress = {
        slug,
        completed: patch.completed ?? previous?.completed ?? false,
        positionSec: patch.positionSec ?? previous?.positionSec ?? 0,
        durationSec: patch.durationSec ?? previous?.durationSec ?? null,
        lastWatchedAt: new Date().toISOString(),
      };
      // If the user un-completes manually, also wipe the cursor so the row
      // doesn't claim "in progress 100%" right after.
      if (patch.completed === false && patch.positionSec === undefined) {
        next.positionSec = 0;
      }
      // Mirror the server's auto-complete rule on the client so the overall
      // progress bar reflects "finished" the instant the video crosses the
      // threshold — no waiting for the API round-trip.
      if (
        patch.completed === undefined &&
        isEffectivelyComplete(next.positionSec, next.durationSec)
      ) {
        next.completed = true;
      }
      setProgressMap((prev) => {
        const m = new Map(prev);
        m.set(slug, next);
        return m;
      });

      try {
        const res = await fetch('/api/portal/lessons/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonSlug: slug,
            ...patch,
          }),
          keepalive: true, // ensures saves survive a tab close on the way out
        });
        // Reconcile with the server's view: it may have auto-completed
        // based on its own threshold. But never downgrade `completed: true`
        // to false unless the caller asked for it explicitly — otherwise a
        // racing position-only save could silently un-mark a finished lesson.
        if (res.ok) {
          const data = (await res.json().catch(() => null)) as
            | {
                success?: boolean;
                completed?: boolean;
                positionSec?: number;
                durationSec?: number | null;
                lastWatchedAt?: string | null;
              }
            | null;
          if (data?.success && typeof data.completed === 'boolean') {
            const serverSaysCompleted = data.completed;
            const explicitUnmark = patch.completed === false;
            setProgressMap((prev) => {
              const m = new Map(prev);
              const current = m.get(slug);
              const finalCompleted = explicitUnmark
                ? serverSaysCompleted
                : current?.completed || serverSaysCompleted; // monotone up
              m.set(slug, {
                slug,
                completed: finalCompleted,
                positionSec: data.positionSec ?? next.positionSec,
                durationSec: data.durationSec ?? next.durationSec,
                lastWatchedAt: data.lastWatchedAt ?? next.lastWatchedAt,
              });
              return m;
            });
          }
        }
      } catch {
        // Revert on hard failure so the UI doesn't lie.
        setProgressMap((prev) => {
          const m = new Map(prev);
          if (previous) m.set(slug, previous);
          else m.delete(slug);
          return m;
        });
      }
    },
    [progressMap],
  );

  const toggleLessonComplete = useCallback(
    (slug: string) => {
      const current = progressMap.get(slug);
      const newCompleted = !current?.completed;
      void patchProgress(slug, { completed: newCompleted });
    },
    [progressMap, patchProgress],
  );

  const openLesson = useCallback((lesson: LessonData, color: string) => {
    setActiveLesson(lesson);
    setActiveCategoryColor(color);
  }, []);

  const closeLesson = useCallback(() => setActiveLesson(null), []);

  // When the modal asks to expand the parent category so the user can see
  // context after closing (nice touch, not required).
  const ensureLessonVisible = useCallback(
    (slug: string) => {
      const entry = lessonIndex.get(slug);
      if (!entry) return;
      setExpandedCategories((prev) => new Set(prev).add(entry.category.slug));
      setExpandedSubcategories((prev) => new Set(prev).add(entry.subcategory.slug));
    },
    [lessonIndex],
  );

  const openContinueLesson = useCallback(() => {
    if (!continueLesson) return;
    ensureLessonVisible(continueLesson.lesson.slug);
    openLesson(continueLesson.lesson, continueLesson.category.color);
  }, [continueLesson, openLesson, ensureLessonVisible]);

  // Switch the modal to the next lesson without closing it. Powers both the
  // "Up Next" CTA and the autoplay countdown.
  const playNext = useCallback(
    (currentSlug: string) => {
      const next = getNextLesson(currentSlug);
      if (!next) {
        setActiveLesson(null);
        return;
      }
      ensureLessonVisible(next.lesson.slug);
      setActiveLesson(next.lesson);
      setActiveCategoryColor(next.category.color);
    },
    [getNextLesson, ensureLessonVisible],
  );

  return (
    <div>
      {/* Header — personalized greeting, decorative orbs, headline stats */}
      <div className="relative border-b border-white/[0.04] overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/portal/learning-hero.png" alt="" className="w-full h-full object-cover opacity-[0.08]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e]/40 to-[#070b1e]" />
        </div>

        {/* Slow drifting orbs — premium ambient motion. Each orb circles its
            origin on its own period so they never sync up and feel mechanical. */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55, x: [0, 30, -10, 0], y: [0, -20, 20, 0] }}
          transition={{
            opacity: { duration: 1.2, ease: 'easeOut' },
            x: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 22, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#c8a951]/25 blur-3xl pointer-events-none"
        />
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45, x: [0, -25, 15, 0], y: [0, 20, -15, 0] }}
          transition={{
            opacity: { duration: 1.2, delay: 0.2, ease: 'easeOut' },
            x: { duration: 24, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 19, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"
        />
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3, x: [0, 15, -10, 0], y: [0, -15, 10, 0] }}
          transition={{
            opacity: { duration: 1.4, delay: 0.4, ease: 'easeOut' },
            x: { duration: 28, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 25, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute top-1/3 left-1/4 w-56 h-56 rounded-full bg-violet-500/15 blur-3xl pointer-events-none"
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-10 relative z-10">
          {/* Greeting + icon */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6"
          >
            <div className="relative flex-shrink-0">
              {/* Halo */}
              <div className="absolute inset-0 bg-[#c8a951]/40 blur-xl rounded-2xl" aria-hidden />
              <div className="relative p-3 bg-gradient-to-br from-[#e8d48b] to-[#c8a951] rounded-2xl text-[#070b1e] shadow-lg">
                <GraduationCap className="w-7 h-7" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-[#c8a951] uppercase tracking-wider">
                {hebrewGreeting()}, {user.name}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mt-0.5">
                {completedCount === 0
                  ? 'מסע הלמידה שלך מתחיל כאן'
                  : completedCount === totalLessons
                    ? 'סיימת את כל הקורסים — כל הכבוד!'
                    : 'בוא נמשיך מאיפה שעצרת'}
              </h1>
            </div>
          </motion.div>

          {/* Quick engagement stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6">
            <StatChip
              icon={<Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              label="שיעורים שהושלמו"
              value={String(completedCount)}
              numericValue={completedCount}
              accent="emerald"
            />
            <StatChip
              icon={<Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              label="זמן צפייה"
              value={engagementStats.watchSec > 0 ? formatWatchTime(engagementStats.watchSec) : '—'}
              accent="blue"
            />
            <StatChip
              icon={<Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              label="השבוע"
              value={String(engagementStats.thisWeek)}
              numericValue={engagementStats.thisWeek}
              accent="amber"
            />
          </div>

          <OverallProgress
            completedCount={completedCount}
            totalLessons={totalLessons}
            progressPercent={overallPercent}
          />
        </div>
      </div>

      {/* Continue watching + recently watched */}
      {(continueLesson || recentLessons.length > 0) && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6 space-y-4">
          {continueLesson && (
            <ContinueCard
              entry={continueLesson}
              progress={progressMap.get(continueLesson.lesson.slug)!}
              onResume={openContinueLesson}
            />
          )}
          {recentLessons.length > 0 && (
            <RecentlyWatchedStrip
              items={recentLessons}
              onOpen={(slug) => {
                const entry = lessonIndex.get(slug);
                if (entry) {
                  ensureLessonVisible(slug);
                  openLesson(entry.lesson, entry.category.color);
                }
              }}
            />
          )}
        </div>
      )}

      {/* Quick-jump category nav — sticky-ish at the top of the courses block */}
      <CategoryQuickJump categories={COURSES_DATA} progressMap={progressMap} />

      {/* Course Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {COURSES_DATA.map((category, catIdx) => (
          <CategoryCard
            key={category.slug}
            category={category}
            index={catIdx}
            isExpanded={expandedCategories.has(category.slug)}
            expandedSubcategories={expandedSubcategories}
            progressMap={progressMap}
            onToggleCategory={toggleCategory}
            onToggleSubcategory={toggleSubcategory}
            onToggleLesson={toggleLessonComplete}
            onOpenLesson={openLesson}
          />
        ))}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {activeLesson && (
          <VideoModal
            key={activeLesson.slug}
            lesson={activeLesson}
            color={activeCategoryColor}
            progress={progressMap.get(activeLesson.slug)}
            nextLesson={getNextLesson(activeLesson.slug)}
            onToggleComplete={() => toggleLessonComplete(activeLesson.slug)}
            onSavePosition={(positionSec, durationSec) =>
              patchProgress(activeLesson.slug, { positionSec, durationSec })
            }
            onAutoComplete={(positionSec, durationSec) =>
              patchProgress(activeLesson.slug, { completed: true, positionSec, durationSec })
            }
            onPlayNext={() => playNext(activeLesson.slug)}
            onClose={closeLesson}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// STAT CHIP — small accent-coloured engagement counter for the hero
// =============================================================================

const STAT_ACCENTS: Record<string, { ring: string; text: string; iconBg: string }> = {
  emerald: { ring: 'ring-emerald-400/20', text: 'text-emerald-300', iconBg: 'bg-emerald-500/15' },
  blue: { ring: 'ring-blue-400/20', text: 'text-blue-300', iconBg: 'bg-blue-500/15' },
  amber: { ring: 'ring-amber-400/20', text: 'text-amber-300', iconBg: 'bg-amber-500/15' },
};

/**
 * Counts up from 0 to `value` once per mount. For numeric stats, gives the
 * hero a moment of life when the page lands instead of feeling like a static
 * snapshot. For string stats (formatted watch time) we fall back to the raw
 * text — no animation, but consistent typography.
 */
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.1, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [value, mv]);
  return (
    <span className="tabular-nums">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

function StatChip({
  icon,
  label,
  value,
  numericValue,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  /** When provided, animates from 0 → numericValue on mount. */
  numericValue?: number;
  accent: 'emerald' | 'blue' | 'amber';
}) {
  const a = STAT_ACCENTS[accent];
  return (
    <div
      className={cn(
        'flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl',
        'bg-white/[0.03] backdrop-blur-md ring-1',
        a.ring,
      )}
    >
      <div className={cn('p-1.5 sm:p-2 rounded-lg flex-shrink-0', a.iconBg, a.text)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={cn('text-sm sm:text-base font-bold leading-none truncate', a.text)}>
          {numericValue !== undefined ? <AnimatedNumber value={numericValue} /> : value}
        </p>
        <p className="text-[10px] sm:text-xs text-white/50 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
}

// =============================================================================
// OVERALL PROGRESS
// =============================================================================

function OverallProgress({
  completedCount,
  totalLessons,
  progressPercent,
}: {
  completedCount: number;
  totalLessons: number;
  progressPercent: number;
}) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/[0.08]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#c8a951]" />
          <span className="font-semibold text-white/90">ההתקדמות שלך</span>
        </div>
        <span className="text-sm font-medium text-white/50">
          {completedCount} מתוך {totalLessons} שיעורים
        </span>
      </div>
      <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-l from-[#e8d48b] to-[#c8a951] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-white/40">
          {progressPercent === 100 ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              כל הכבוד! סיימת את כל השיעורים
            </span>
          ) : progressPercent > 50 ? (
            'אתה בדרך הנכונה! המשך ככה'
          ) : (
            'בוא נתחיל ללמוד'
          )}
        </span>
        <span className="text-sm font-bold text-[#c8a951]">{progressPercent}%</span>
      </div>
    </div>
  );
}

// =============================================================================
// CONTINUE WATCHING — hero card with thumbnail + resume button
// =============================================================================

function ContinueCard({
  entry,
  onResume,
}: {
  entry: LessonIndex;
  progress: LessonProgress;
  onResume: () => void;
}) {
  const colors = COLOR_MAP[entry.category.color] || COLOR_MAP.blue;
  const thumbHigh = `https://i.ytimg.com/vi/${entry.lesson.youtubeId}/maxresdefault.jpg`;
  const thumbFallback = `https://i.ytimg.com/vi/${entry.lesson.youtubeId}/hqdefault.jpg`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]"
    >
      {/* Cinematic background: blurred lesson thumbnail + heavy gradient */}
      <div className="absolute inset-0">
        <img
          src={thumbHigh}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = thumbFallback;
          }}
          alt=""
          className="w-full h-full object-cover scale-110 blur-md opacity-60"
        />
        {/* Dark wash so text is always readable */}
        <div className="absolute inset-0 bg-gradient-to-l from-[#0a0f24] via-[#0a0f24]/85 to-[#0a0f24]/40" />
        <div className={cn('absolute inset-0 bg-gradient-to-tr opacity-50', colors.gradient)} />
      </div>

      {/* Subtle gold corner shimmer */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#c8a951]/20 blur-3xl pointer-events-none"
      />

      <div className="relative flex flex-col sm:flex-row-reverse gap-5 sm:gap-7 p-5 sm:p-7 min-h-[200px] sm:min-h-[260px]">
        {/* Sharp foreground thumbnail */}
        <button
          onClick={onResume}
          className="group relative flex-shrink-0 w-full sm:w-72 aspect-video rounded-2xl overflow-hidden bg-black/40 ring-1 ring-white/15 hover:ring-white/40 shadow-2xl transition-all hover:scale-[1.02]"
          aria-label={`המשך לצפות: ${entry.lesson.title}`}
        >
          <img
            src={thumbHigh}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = thumbFallback;
            }}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {/* Pulsing play ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              initial={{ scale: 0.95, opacity: 0.85 }}
              animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="grid place-items-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-[#070b1e] shadow-2xl"
            >
              <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ms-1" />
            </motion.span>
          </div>
        </button>

        {/* Text + CTA */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-[#c8a951]/15 border border-[#c8a951]/30 mb-3"
          >
            <RotateCcw className="w-3 h-3 text-[#e8d48b]" />
            <span className="text-[11px] font-semibold text-[#e8d48b] uppercase tracking-wider">
              המשך מהמקום שעצרת
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold text-white leading-tight line-clamp-2"
          >
            {entry.lesson.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.5 }}
            className="text-sm text-white/60 mt-2 line-clamp-2"
          >
            {entry.lesson.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-4 sm:mt-5 flex flex-wrap items-center gap-3"
          >
            <button
              onClick={onResume}
              className={cn(
                'flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold transition-all',
                'bg-gradient-to-l from-[#e8d48b] to-[#c8a951] text-[#070b1e]',
                'shadow-[0_8px_24px_rgba(200,169,81,0.35)]',
                'hover:brightness-110 hover:shadow-[0_8px_28px_rgba(200,169,81,0.5)] hover:-translate-y-0.5',
                'active:translate-y-0',
              )}
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              המשך לצפות
            </button>
            <span className="text-xs text-white/40 truncate">
              {entry.category.name} · {entry.subcategory.name}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// RECENTLY WATCHED STRIP
// =============================================================================

function RecentlyWatchedStrip({
  items,
  onOpen,
}: {
  items: Array<{ entry: LessonIndex; progress: LessonProgress }>;
  onOpen: (slug: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <History className="w-4 h-4 text-white/40" />
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
          צפית לאחרונה
        </span>
      </div>
      {/* Horizontal scroll on mobile, wraps on desktop */}
      <div className="flex gap-2 overflow-x-auto sm:flex-wrap pb-1 -mx-1 px-1 scrollbar-hide">
        {items.map(({ entry, progress }) => (
          <button
            key={entry.lesson.slug}
            onClick={() => onOpen(entry.lesson.slug)}
            className={cn(
              'group flex-shrink-0 flex items-center gap-2 max-w-[240px] sm:max-w-none',
              'px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] transition',
            )}
          >
            <div className="relative flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-black/40">
              <img
                src={`https://i.ytimg.com/vi/${entry.lesson.youtubeId}/default.jpg`}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                <Play className="w-3.5 h-3.5 text-white fill-current" />
              </div>
            </div>
            <div className="min-w-0 text-right">
              <p className="text-xs font-medium text-white/80 truncate max-w-[150px] sm:max-w-[200px]">
                {entry.lesson.title}
              </p>
              {progress.completed && (
                <p className="text-[10px] text-emerald-400 font-medium">הושלם</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// CATEGORY QUICK-JUMP NAV — horizontal pills that smooth-scroll to anchors
// =============================================================================

function CategoryQuickJump({
  categories,
  progressMap,
}: {
  categories: CategoryData[];
  progressMap: Map<string, LessonProgress>;
}) {
  const handleJump = (slug: string) => {
    const el = document.getElementById(`category-${slug}`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
      <div className="flex items-center gap-2 mb-2.5 px-1">
        <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
          ניווט מהיר
        </span>
        <div className="flex-1 h-px bg-gradient-to-l from-white/10 to-transparent" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {categories.map((cat, i) => {
          const colors = COLOR_MAP[cat.color] || COLOR_MAP.blue;
          const lessons = cat.subcategories.flatMap((s) => s.lessons);
          const completed = lessons.filter((l) => isEffectivelyDone(progressMap.get(l.slug))).length;
          const total = lessons.length;
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
          return (
            <motion.button
              key={cat.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.4 }}
              onClick={() => handleJump(cat.slug)}
              className={cn(
                'group flex-shrink-0 flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl',
                'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15]',
                'transition-all',
              )}
            >
              <div className={cn('p-1.5 rounded-lg text-white shadow-md', colors.bg)}>
                {ICON_MAP[cat.icon] ?? <BookOpen className="w-4 h-4" />}
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-white/90 leading-tight whitespace-nowrap">
                  {cat.name}
                </p>
                <p className="text-[10px] text-white/40 leading-tight mt-0.5 tabular-nums">
                  {completed}/{total} · {percent}%
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// CIRCULAR PROGRESS RING — wraps a category icon with an animated arc
// =============================================================================

function CircularProgress({
  percent,
  size = 64,
  stroke = 3,
  color = '#c8a951',
  className,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  color?: string;
  className?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const safe = Math.max(0, Math.min(100, percent));
  const offset = circumference * (1 - safe / 100);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('-rotate-90', className)}
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

// =============================================================================
// CATEGORY CARD
// =============================================================================

function CategoryCard({
  category,
  index,
  isExpanded,
  expandedSubcategories,
  progressMap,
  onToggleCategory,
  onToggleSubcategory,
  onToggleLesson,
  onOpenLesson,
}: {
  category: CategoryData;
  index: number;
  isExpanded: boolean;
  expandedSubcategories: Set<string>;
  progressMap: Map<string, LessonProgress>;
  onToggleCategory: (slug: string) => void;
  onToggleSubcategory: (slug: string) => void;
  onToggleLesson: (slug: string) => void;
  onOpenLesson: (lesson: LessonData, color: string) => void;
}) {
  const colors = COLOR_MAP[category.color] || COLOR_MAP.blue;

  const categoryLessons = category.subcategories.flatMap((s) => s.lessons);
  const categoryCompleted = categoryLessons.filter((l) => isEffectivelyDone(progressMap.get(l.slug))).length;
  const categoryTotal = categoryLessons.length;
  const categoryPercent = categoryTotal > 0 ? Math.round((categoryCompleted / categoryTotal) * 100) : 0;

  return (
    <motion.div
      id={`category-${category.slug}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      className={cn(
        'bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.08] overflow-hidden',
        'shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300',
        'hover:border-white/[0.16] hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)] scroll-mt-20',
      )}
    >
      <button
        onClick={() => onToggleCategory(category.slug)}
        className="w-full flex items-center gap-4 p-5 sm:p-6 hover:bg-white/[0.02] transition-colors text-right relative overflow-hidden"
      >
        {category.image && (
          <div className="absolute inset-0 pointer-events-none">
            <img src={category.image} alt="" className="w-full h-full object-cover opacity-[0.06]" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0d1321]/80" />
          </div>
        )}
        {/* Icon framed by an animated circular progress ring + soft glow halo */}
        <div className="relative z-10 flex-shrink-0 grid place-items-center w-16 h-16 sm:w-[68px] sm:h-[68px]">
          <CircularProgress
            percent={categoryPercent}
            size={68}
            stroke={3}
            color={COLOR_HEX[category.color] ?? '#c8a951'}
            className="absolute inset-0 hidden sm:block"
          />
          <CircularProgress
            percent={categoryPercent}
            size={64}
            stroke={3}
            color={COLOR_HEX[category.color] ?? '#c8a951'}
            className="absolute inset-0 sm:hidden"
          />
          <div className={cn('absolute inset-2 rounded-full blur-md opacity-50', colors.light)} aria-hidden />
          <div className={cn('relative p-2.5 rounded-xl text-white shadow-lg', colors.bg)}>
            {ICON_MAP[category.icon] || <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />}
          </div>
        </div>

        <div className="flex-1 min-w-0 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-white">{category.name}</h2>
            {categoryPercent === 100 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✓ הושלם
              </span>
            )}
          </div>
          <p className="text-sm text-white/50 mt-0.5 line-clamp-1">{category.description}</p>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-white/40">
            <span className="font-medium tabular-nums">
              {categoryCompleted}/{categoryTotal} שיעורים
            </span>
            <span className="text-white/20">·</span>
            <span className="tabular-nums">{categoryPercent}%</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 relative z-10">
          <ChevronDown
            className={cn(
              'w-5 h-5 text-white/40 transition-transform duration-300',
              isExpanded && 'rotate-180',
            )}
          />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-3">
              {category.subcategories.map((sub) => (
                <SubcategorySection
                  key={sub.slug}
                  subcategory={sub}
                  color={category.color}
                  isExpanded={expandedSubcategories.has(sub.slug)}
                  progressMap={progressMap}
                  onToggle={onToggleSubcategory}
                  onToggleLesson={onToggleLesson}
                  onOpenLesson={(lesson) => onOpenLesson(lesson, category.color)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================================
// SUBCATEGORY SECTION
// =============================================================================

function SubcategorySection({
  subcategory,
  color,
  isExpanded,
  progressMap,
  onToggle,
  onToggleLesson,
  onOpenLesson,
}: {
  subcategory: SubcategoryData;
  color: string;
  isExpanded: boolean;
  progressMap: Map<string, LessonProgress>;
  onToggle: (slug: string) => void;
  onToggleLesson: (slug: string) => void;
  onOpenLesson: (lesson: LessonData) => void;
}) {
  const completedCount = subcategory.lessons.filter((l) => isEffectivelyDone(progressMap.get(l.slug))).length;
  const inProgressCount = subcategory.lessons.filter((l) => isInProgress(progressMap.get(l.slug))).length;
  const totalCount = subcategory.lessons.length;
  const allDone = completedCount === totalCount && totalCount > 0;

  return (
    <div className={cn('rounded-xl border transition-colors', isExpanded ? 'border-white/[0.12]' : 'border-white/[0.04]')}>
      <button
        onClick={() => onToggle(subcategory.slug)}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors text-right rounded-xl"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white/90">{subcategory.name}</h3>
            {allDone && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            )}
            {!allDone && inProgressCount > 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#c8a951]/15 text-[#e8d48b] border border-[#c8a951]/20">
                {inProgressCount} פעיל{inProgressCount === 1 ? '' : 'ים'}
              </span>
            )}
          </div>
          <span className="text-xs text-white/40">{totalCount} שיעורים</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              allDone
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-white/[0.06] text-white/60',
            )}
          >
            {completedCount}/{totalCount}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-white/40 transition-transform duration-200',
              isExpanded && 'rotate-180',
            )}
          />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">
              <p className="text-sm text-white/50 leading-relaxed">{subcategory.description}</p>
            </div>
            <div className="px-3 pb-4 space-y-1">
              {subcategory.lessons.map((lesson, idx) => (
                <LessonRow
                  key={lesson.slug}
                  lesson={lesson}
                  index={idx}
                  color={color}
                  progress={progressMap.get(lesson.slug)}
                  onToggleComplete={() => onToggleLesson(lesson.slug)}
                  onOpen={() => onOpenLesson(lesson)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// PROGRESS RING — partial-fill circle icon for in-progress lessons
// =============================================================================

function ProgressRing({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(100, Math.max(0, percent)) / 100);
  return (
    <svg viewBox="0 0 20 20" className={cn('w-5 h-5 -rotate-90', className)}>
      <circle cx="10" cy="10" r={radius} className="fill-none stroke-white/15" strokeWidth="2" />
      <circle
        cx="10"
        cy="10"
        r={radius}
        className="fill-none transition-[stroke-dashoffset] duration-500"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
      />
    </svg>
  );
}

// =============================================================================
// LESSON ROW
// =============================================================================

function LessonRow({
  lesson,
  index,
  color,
  progress,
  onToggleComplete,
  onOpen,
}: {
  lesson: LessonData;
  index: number;
  color: string;
  progress: LessonProgress | undefined;
  onToggleComplete: () => void;
  onOpen: () => void;
}) {
  const colors = COLOR_MAP[color] || COLOR_MAP.blue;
  // Use effective completion (flag OR position past threshold). If a
  // sync glitch left the row at completed:false but position is at the
  // end, the row still reflects "done" — matches what the modal showed.
  const isCompleted = isEffectivelyDone(progress);
  const inProgress = isInProgress(progress);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'group flex items-center gap-3 p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer',
        'hover:bg-white/[0.04]',
        isCompleted && 'bg-white/[0.02]',
        inProgress && 'bg-white/[0.025] ring-1 ring-[#c8a951]/15',
      )}
      onClick={onOpen}
    >
      {/* Completion indicator — no progress bar, by design. The system still
          tracks position internally; the YouTube player surfaces it to the
          user. We only show "started" via the side badge. */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete();
        }}
        className="flex-shrink-0 transition-transform hover:scale-110"
        aria-label={isCompleted ? 'בטל סימון כהושלם' : 'סמן כהושלם'}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <Circle className="w-5 h-5 text-white/25 group-hover:text-white/50" />
        )}
      </button>

      {/* Thumbnail — gives every lesson real visual weight. Falls back
          gracefully on slow connections; YouTube's CDN is fast and cached. */}
      <div className={cn(
        'relative flex-shrink-0 w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden bg-black/40 ring-1 transition',
        isCompleted ? 'ring-emerald-500/15' : 'ring-white/[0.06] group-hover:ring-white/15',
      )}>
        <img
          src={`https://i.ytimg.com/vi/${lesson.youtubeId}/mqdefault.jpg`}
          alt=""
          loading="lazy"
          className={cn(
            'w-full h-full object-cover transition',
            isCompleted && 'opacity-50',
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className={cn(
          'absolute inset-0 grid place-items-center transition-opacity',
          'opacity-0 group-hover:opacity-100',
          'bg-black/30',
        )}>
          <Play className="w-4 h-4 text-white fill-current" />
        </div>
      </div>

      {/* Lesson title + optional "ממשיך" tag */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              'text-sm font-medium transition-colors truncate',
              isCompleted ? 'text-white/40 line-through' : 'text-white/85 group-hover:text-white',
            )}
          >
            {lesson.title}
          </span>
          {inProgress && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#c8a951]/15 text-[#e8d48b] border border-[#c8a951]/20 flex-shrink-0">
              ממשיך
            </span>
          )}
        </div>
        <p className="text-[11px] text-white/40 mt-0.5 truncate">
          {isCompleted ? '✓ צפית בשיעור' : inProgress ? 'בהמשך צפייה' : 'לחץ להתחיל'}
        </p>
      </div>

      {/* Play affordance on the side — always visible for "ממשיך", hover for the rest */}
      <div
        className={cn(
          'flex-shrink-0 p-1.5 rounded-lg transition-all',
          inProgress ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          colors.light,
        )}
      >
        <Play className={cn('w-4 h-4', colors.text)} />
      </div>
    </motion.div>
  );
}

// =============================================================================
// VIDEO MODAL — YouTube IFrame API integration for resume + auto-save
// =============================================================================

// Minimal YT IFrame API typings — just what we actually call.
type YTPlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (sec: number, allowSeekAhead: boolean) => void;
};
type YTPlayerEvent = { target: YTPlayer; data?: number };
declare global {
  interface Window {
    YT?: {
      Player: new (
        el: string | HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (e: YTPlayerEvent) => void;
            onStateChange?: (e: YTPlayerEvent) => void;
          };
        },
      ) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Load the IFrame API exactly once across the app session.
let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise<void>((resolve) => {
    const existing = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      existing?.();
      resolve();
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

const SAVE_INTERVAL_MS = 10_000; // throttle in-flight saves while playing

const AUTOPLAY_COUNTDOWN_SEC = 6;

function VideoModal({
  lesson,
  color,
  progress,
  nextLesson,
  onToggleComplete,
  onSavePosition,
  onAutoComplete,
  onPlayNext,
  onClose,
}: {
  lesson: LessonData;
  color: string;
  progress: LessonProgress | undefined;
  nextLesson: LessonIndex | null;
  onToggleComplete: () => void;
  onSavePosition: (positionSec: number, durationSec: number) => void;
  onAutoComplete: (positionSec: number, durationSec: number) => void;
  onPlayNext: () => void;
  onClose: () => void;
}) {
  const colors = COLOR_MAP[color] || COLOR_MAP.blue;
  const isCompleted = isEffectivelyDone(progress);
  const resumeFrom = !isCompleted && (progress?.positionSec ?? 0) >= MIN_RESUME_SEC ? progress!.positionSec : 0;

  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const lastSavedRef = useRef<{ position: number; at: number }>({ position: 0, at: 0 });
  const autoCompletedRef = useRef<boolean>(false);
  const tickHandleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showResumeToast, setShowResumeToast] = useState<number>(resumeFrom);
  // Autoplay-next countdown. -1 means "not running". Ticks down once per
  // second; on 0 we hand control to the parent to swap lessons.
  const [nextCountdown, setNextCountdown] = useState<number>(-1);
  const triggerNextOverlay = useCallback(() => {
    if (nextLesson) setNextCountdown(AUTOPLAY_COUNTDOWN_SEC);
  }, [nextLesson]);

  // Build a stable internal id for the player host element.
  const hostId = useMemo(
    () => `yt-host-${lesson.slug}-${Math.random().toString(36).slice(2, 8)}`,
    [lesson.slug],
  );

  // Save the latest position. Used by the tick interval, pause handler,
  // and unmount cleanup. Pulls live state from the player so we never
  // save stale numbers.
  const saveNow = useCallback(
    (opts?: { force?: boolean }) => {
      const player = playerRef.current;
      if (!player) return;
      let position = 0;
      let duration = 0;
      try {
        position = Math.floor(player.getCurrentTime());
        duration = Math.floor(player.getDuration());
      } catch {
        return;
      }
      if (!Number.isFinite(position) || !Number.isFinite(duration)) return;
      if (duration <= 0) return;

      // Skip if nothing meaningful changed since the last save (avoid
      // spam on rapid pause/play).
      const last = lastSavedRef.current;
      const now = Date.now();
      if (!opts?.force && Math.abs(position - last.position) < 3 && now - last.at < 4000) {
        return;
      }
      lastSavedRef.current = { position, at: now };

      // Auto-complete near the end — fire once.
      if (!autoCompletedRef.current && isEffectivelyComplete(position, duration)) {
        autoCompletedRef.current = true;
        onAutoComplete(position, duration);
        return;
      }

      onSavePosition(position, duration);
    },
    [onSavePosition, onAutoComplete],
  );

  // Hide resume toast after a few seconds.
  useEffect(() => {
    if (showResumeToast <= 0) return;
    const t = setTimeout(() => setShowResumeToast(0), 3500);
    return () => clearTimeout(t);
  }, [showResumeToast]);

  // Mount the YT player when the modal opens; tear down on close.
  useEffect(() => {
    let disposed = false;

    void loadYouTubeApi().then(() => {
      if (disposed || !playerHostRef.current || !window.YT?.Player) return;

      autoCompletedRef.current = false;
      lastSavedRef.current = { position: resumeFrom, at: 0 };

      playerRef.current = new window.YT.Player(playerHostRef.current, {
        videoId: lesson.youtubeId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          start: resumeFrom > 0 ? resumeFrom : undefined,
          playsinline: 1,
        },
        events: {
          onReady: (e) => {
            // Defensive: some browsers ignore `start` param — seek manually.
            if (resumeFrom > 0) {
              try {
                e.target.seekTo(resumeFrom, true);
              } catch {
                /* swallow */
              }
            }
          },
          onStateChange: (e) => {
            const state = e.data;
            const YT = window.YT;
            if (!YT) return;
            if (state === YT.PlayerState.PLAYING) {
              // Start ticking — save every SAVE_INTERVAL_MS.
              if (tickHandleRef.current) clearInterval(tickHandleRef.current);
              tickHandleRef.current = setInterval(() => saveNow(), SAVE_INTERVAL_MS);
            } else if (state === YT.PlayerState.PAUSED) {
              if (tickHandleRef.current) {
                clearInterval(tickHandleRef.current);
                tickHandleRef.current = null;
              }
              saveNow({ force: true });
            } else if (state === YT.PlayerState.ENDED) {
              if (tickHandleRef.current) {
                clearInterval(tickHandleRef.current);
                tickHandleRef.current = null;
              }
              // Force one final save → triggers auto-complete branch.
              saveNow({ force: true });
              // Kick off the autoplay-next countdown. The overlay handles
              // the rest (countdown UI + cancellation).
              triggerNextOverlay();
            }
          },
        },
      });
    });

    return () => {
      disposed = true;
      if (tickHandleRef.current) {
        clearInterval(tickHandleRef.current);
        tickHandleRef.current = null;
      }
      // Final save before tear-down so closing the modal mid-video persists.
      saveNow({ force: true });
      try {
        playerRef.current?.destroy();
      } catch {
        /* swallow */
      }
      playerRef.current = null;
    };
    // We intentionally re-mount the player only when the lesson changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.youtubeId]);

  // Close on Escape; also save on the way out (in addition to unmount).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        saveNow({ force: true });
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, saveNow]);

  // Autoplay countdown: tick once per second; on 0, switch to the next
  // lesson. Cancelling sets it back to -1.
  useEffect(() => {
    if (nextCountdown < 0) return;
    if (nextCountdown === 0) {
      onPlayNext();
      return;
    }
    const t = setTimeout(() => setNextCountdown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [nextCountdown, onPlayNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          saveNow({ force: true });
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-[#0d1321] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto border border-white/[0.08]"
      >
        {/* Video Player */}
        <div className="relative aspect-video bg-black">
          {/* IFrame API replaces this div in place */}
          <div ref={playerHostRef} id={hostId} className="w-full h-full" />

          {/* Resume toast */}
          <AnimatePresence>
            {showResumeToast > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-3 right-3 px-3 py-1.5 bg-[#c8a951] text-[#070b1e] rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1.5 pointer-events-none"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                ממשיך מ-{formatTime(showResumeToast)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close button */}
          <button
            onClick={() => {
              saveNow({ force: true });
              onClose();
            }}
            className="absolute top-3 left-3 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors z-10"
            aria-label="סגור"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Up-Next overlay — fires when the video ends, gives the user
              ~6 seconds to either jump straight to the next lesson or back
              off. The radial progress on the play button visualises the
              countdown. */}
          <AnimatePresence>
            {nextCountdown >= 0 && nextLesson && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="w-full max-w-md bg-[#0d1321] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#c8a951] uppercase tracking-wider mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      השיעור הבא · מתחיל בעוד {nextCountdown}
                    </div>
                    <div className="flex gap-3">
                      <div className="relative flex-shrink-0 w-24 sm:w-28 aspect-video rounded-lg overflow-hidden bg-black/40">
                        <img
                          src={`https://i.ytimg.com/vi/${nextLesson.lesson.youtubeId}/hqdefault.jpg`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 grid place-items-center">
                          <Play className="w-5 h-5 text-white fill-current" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
                          {nextLesson.lesson.title}
                        </h4>
                        <p className="text-xs text-white/50 mt-1 line-clamp-1">
                          {nextLesson.category.name} · {nextLesson.subcategory.name}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => setNextCountdown(-1)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-white/[0.12] text-white/70 hover:bg-white/[0.05] transition"
                      >
                        ביטול
                      </button>
                      <button
                        onClick={onPlayNext}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-l from-[#e8d48b] to-[#c8a951] text-[#070b1e] hover:brightness-105 transition flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        התחל עכשיו
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lesson Info */}
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="text-xl font-bold text-white">{lesson.title}</h3>
            {isCompleted ? (
              // Static pill — completion is a state, not an action. The
              // older toggle button made it too easy to unmark by reflex,
              // which is exactly what the user hit. Unmarking now lives
              // in a small secondary link below.
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex-shrink-0"
                role="status"
              >
                <CheckCircle2 className="w-4 h-4" />
                הושלם
              </div>
            ) : (
              <button
                onClick={onToggleComplete}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 bg-[#c8a951]/10 text-[#c8a951] hover:bg-[#c8a951]/15 border border-[#c8a951]/20"
                title="סמן את השיעור כהושלם"
              >
                <Circle className="w-4 h-4" />
                סמן כהושלם
              </button>
            )}
          </div>

          {/* Secondary unmark action — only reachable when completed, and
              only after explicit confirmation. Keeps the main pill safe. */}
          {isCompleted && (
            <button
              onClick={() => {
                if (window.confirm('לסמן את השיעור כלא הושלם?')) {
                  onToggleComplete();
                }
              }}
              className="mb-4 text-xs text-white/40 hover:text-white/70 underline-offset-2 hover:underline transition"
            >
              סמן כלא הושלם
            </button>
          )}

          <p className="text-white/60 leading-relaxed text-sm sm:text-base">
            {lesson.description}
          </p>

          {/* "Up next" rail — always available so the user can jump ahead
              without waiting for the video to end. Hidden when there's no
              next lesson (end of curriculum). */}
          {nextLesson && (
            <button
              onClick={() => {
                saveNow({ force: true });
                onPlayNext();
              }}
              className="mt-5 group w-full flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] transition text-right"
            >
              <div className="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-black/40">
                <img
                  src={`https://i.ytimg.com/vi/${nextLesson.lesson.youtubeId}/hqdefault.jpg`}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                  <Play className="w-4 h-4 text-white fill-current" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-[#c8a951] uppercase tracking-wider">
                  השיעור הבא
                </p>
                <p className="text-sm font-semibold text-white truncate mt-0.5">
                  {nextLesson.lesson.title}
                </p>
                <p className="text-xs text-white/40 truncate">
                  {nextLesson.subcategory.name}
                </p>
              </div>
              <div className="flex-shrink-0 grid place-items-center w-9 h-9 rounded-lg bg-[#c8a951]/15 text-[#c8a951] group-hover:bg-[#c8a951]/25 transition">
                <ChevronLeft className="w-5 h-5" />
              </div>
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
