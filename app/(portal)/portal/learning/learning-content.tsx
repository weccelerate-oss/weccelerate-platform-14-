/**
 * Learning Center Content
 *
 * Interactive course browser with YouTube lessons, progress tracking,
 * and expandable category/subcategory navigation.
 */

'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { COURSES_DATA, getTotalLessons } from '@/lib/courses-data';
import type { CategoryData, SubcategoryData, LessonData } from '@/lib/courses-data';

// =============================================================================
// TYPES
// =============================================================================

interface LearningContentProps {
  user: { id: string; name: string };
  initialCompletedSlugs: string[];
}

// =============================================================================
// ICON MAP
// =============================================================================

const ICON_MAP: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUp className="w-6 h-6" />,
  Briefcase: <Briefcase className="w-6 h-6" />,
  Rocket: <Rocket className="w-6 h-6" />,
  Clock: <Clock className="w-6 h-6" />,
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; light: string; progress: string }> = {
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-600',
    border: 'border-blue-200',
    light: 'bg-blue-50',
    progress: 'bg-blue-500',
  },
  emerald: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    light: 'bg-emerald-50',
    progress: 'bg-emerald-500',
  },
  violet: {
    bg: 'bg-violet-500',
    text: 'text-violet-600',
    border: 'border-violet-200',
    light: 'bg-violet-50',
    progress: 'bg-violet-500',
  },
  amber: {
    bg: 'bg-amber-500',
    text: 'text-amber-600',
    border: 'border-amber-200',
    light: 'bg-amber-50',
    progress: 'bg-amber-500',
  },
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function LearningContent({ user, initialCompletedSlugs }: LearningContentProps) {
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(
    new Set(initialCompletedSlugs)
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(COURSES_DATA.map((c) => c.slug))
  );
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [activeLesson, setActiveLesson] = useState<LessonData | null>(null);
  const [activeCategoryColor, setActiveCategoryColor] = useState<string>('blue');

  const totalLessons = useMemo(() => getTotalLessons(), []);
  const completedCount = completedSlugs.size;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Toggle category expand
  const toggleCategory = useCallback((slug: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  // Toggle subcategory expand
  const toggleSubcategory = useCallback((slug: string) => {
    setExpandedSubcategories((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  // Toggle lesson completion
  const toggleLesson = useCallback(
    async (lessonSlug: string) => {
      const isCompleted = completedSlugs.has(lessonSlug);
      const newCompleted = !isCompleted;

      // Optimistic update
      setCompletedSlugs((prev) => {
        const next = new Set(prev);
        if (newCompleted) next.add(lessonSlug);
        else next.delete(lessonSlug);
        return next;
      });

      // Persist to API
      try {
        await fetch('/api/portal/lessons/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonSlug, completed: newCompleted }),
        });
      } catch {
        // Revert on error
        setCompletedSlugs((prev) => {
          const next = new Set(prev);
          if (isCompleted) next.add(lessonSlug);
          else next.delete(lessonSlug);
          return next;
        });
      }
    },
    [completedSlugs]
  );

  // Open lesson video
  const openLesson = useCallback((lesson: LessonData, color: string) => {
    setActiveLesson(lesson);
    setActiveCategoryColor(color);
  }, []);

  return (
    <div>
      {/* Header with hero image */}
      <div className="relative border-b border-white/[0.04] overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/portal/learning-hero.png" alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e]/50 to-[#070b1e]" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-[#c8a951] to-[#e8d48b] rounded-xl text-[#070b1e]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">מרכז הלמידה</h1>
              <p className="text-white/50 text-sm mt-0.5">
                קורסים להעשרה שילוו אותך לאורך כל המסע היזמי
              </p>
            </div>
          </div>

          {/* Overall Progress */}
          <OverallProgress
            completedCount={completedCount}
            totalLessons={totalLessons}
            progressPercent={progressPercent}
          />
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {COURSES_DATA.map((category, catIdx) => (
          <CategoryCard
            key={category.slug}
            category={category}
            index={catIdx}
            isExpanded={expandedCategories.has(category.slug)}
            expandedSubcategories={expandedSubcategories}
            completedSlugs={completedSlugs}
            onToggleCategory={toggleCategory}
            onToggleSubcategory={toggleSubcategory}
            onToggleLesson={toggleLesson}
            onOpenLesson={openLesson}
          />
        ))}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {activeLesson && (
          <VideoModal
            lesson={activeLesson}
            color={activeCategoryColor}
            isCompleted={completedSlugs.has(activeLesson.slug)}
            onToggleComplete={() => toggleLesson(activeLesson.slug)}
            onClose={() => setActiveLesson(null)}
          />
        )}
      </AnimatePresence>
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
// CATEGORY CARD
// =============================================================================

function CategoryCard({
  category,
  index,
  isExpanded,
  expandedSubcategories,
  completedSlugs,
  onToggleCategory,
  onToggleSubcategory,
  onToggleLesson,
  onOpenLesson,
}: {
  category: CategoryData;
  index: number;
  isExpanded: boolean;
  expandedSubcategories: Set<string>;
  completedSlugs: Set<string>;
  onToggleCategory: (slug: string) => void;
  onToggleSubcategory: (slug: string) => void;
  onToggleLesson: (slug: string) => void;
  onOpenLesson: (lesson: LessonData, color: string) => void;
}) {
  const colors = COLOR_MAP[category.color] || COLOR_MAP.blue;

  // Count completed lessons in this category
  const categoryLessons = category.subcategories.flatMap((s) => s.lessons);
  const categoryCompleted = categoryLessons.filter((l) => completedSlugs.has(l.slug)).length;
  const categoryTotal = categoryLessons.length;
  const categoryPercent = categoryTotal > 0 ? Math.round((categoryCompleted / categoryTotal) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
    >
      {/* Category Header */}
      <button
        onClick={() => onToggleCategory(category.slug)}
        className="w-full flex items-center gap-4 p-5 sm:p-6 hover:bg-white/[0.02] transition-colors text-right"
      >
        <div className={cn('p-3 rounded-xl text-white', colors.bg)}>
          {ICON_MAP[category.icon] || <BookOpen className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-white">{category.name}</h2>
          <p className="text-sm text-white/50 mt-0.5 line-clamp-1">{category.description}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Mini progress */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-20 h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', colors.progress)}
                style={{ width: `${categoryPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-white/40 whitespace-nowrap">
              {categoryCompleted}/{categoryTotal}
            </span>
          </div>
          <ChevronDown
            className={cn(
              'w-5 h-5 text-white/40 transition-transform duration-300',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Subcategories */}
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
                  completedSlugs={completedSlugs}
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
  completedSlugs,
  onToggle,
  onToggleLesson,
  onOpenLesson,
}: {
  subcategory: SubcategoryData;
  color: string;
  isExpanded: boolean;
  completedSlugs: Set<string>;
  onToggle: (slug: string) => void;
  onToggleLesson: (slug: string) => void;
  onOpenLesson: (lesson: LessonData) => void;
}) {
  const colors = COLOR_MAP[color] || COLOR_MAP.blue;
  const completedCount = subcategory.lessons.filter((l) => completedSlugs.has(l.slug)).length;
  const totalCount = subcategory.lessons.length;
  const allDone = completedCount === totalCount && totalCount > 0;

  return (
    <div className={cn('rounded-xl border transition-colors', isExpanded ? 'border-white/[0.12]' : 'border-white/[0.04]')}>
      {/* Subcategory Header */}
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
          </div>
          <span className="text-xs text-white/40">{totalCount} שיעורים</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              allDone
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-white/[0.06] text-white/60'
            )}
          >
            {completedCount}/{totalCount}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-white/40 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Lessons List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* Subcategory description */}
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
                  isCompleted={completedSlugs.has(lesson.slug)}
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
// LESSON ROW
// =============================================================================

function LessonRow({
  lesson,
  index,
  color,
  isCompleted,
  onToggleComplete,
  onOpen,
}: {
  lesson: LessonData;
  index: number;
  color: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onOpen: () => void;
}) {
  const colors = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'group flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer',
        'hover:bg-white/[0.03]',
        isCompleted && 'bg-white/[0.02]'
      )}
      onClick={onOpen}
    >
      {/* Completion checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete();
        }}
        className="flex-shrink-0 transition-transform hover:scale-110"
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <Circle className="w-5 h-5 text-white/20 group-hover:text-white/40" />
        )}
      </button>

      {/* Lesson info */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'text-sm font-medium transition-colors',
            isCompleted ? 'text-white/30 line-through' : 'text-white/80'
          )}
        >
          {lesson.title}
        </span>
      </div>

      {/* Play button */}
      <div
        className={cn(
          'flex-shrink-0 p-1.5 rounded-lg transition-all',
          'opacity-0 group-hover:opacity-100',
          colors.light
        )}
      >
        <Play className={cn('w-4 h-4', colors.text)} />
      </div>
    </motion.div>
  );
}

// =============================================================================
// VIDEO MODAL
// =============================================================================

function VideoModal({
  lesson,
  color,
  isCompleted,
  onToggleComplete,
  onClose,
}: {
  lesson: LessonData;
  color: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onClose: () => void;
}) {
  const colors = COLOR_MAP[color] || COLOR_MAP.blue;
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-[#0d1321] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto border border-white/[0.08]"
      >
        {/* Video Player */}
        <div className="relative aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${lesson.youtubeId}?rel=0&modestbranding=1`}
            title={lesson.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lesson Info */}
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="text-xl font-bold text-white">{lesson.title}</h3>
            <button
              onClick={onToggleComplete}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0',
                isCompleted
                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/20'
                  : 'bg-[#c8a951]/10 text-[#c8a951] hover:bg-[#c8a951]/15 border border-[#c8a951]/20'
              )}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  הושלם
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  סמן כהושלם
                </>
              )}
            </button>
          </div>

          <p className="text-white/60 leading-relaxed text-sm sm:text-base">
            {lesson.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
