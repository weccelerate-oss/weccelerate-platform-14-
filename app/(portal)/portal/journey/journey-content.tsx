'use client';

/**
 * Founder Journey — "מסע מרעיון למיזם"
 *
 * The entrepreneur's interactive investor-prep program. Design language:
 * "שביל הזהב" — night sky, a golden constellation of chapters that lights up
 * with progress, and a distraction-free focus mode for answering.
 *
 * Persistence rules (owner-specified):
 *   - Everything is saved on the user; they can return, edit, clear and
 *     continue any time.
 *   - Autosave is SILENT: no "saved" toast/indicator. A save fires 10s after
 *     the last keystroke, and always flushes on question switch, chapter
 *     exit and page hide.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ChevronRight,
  Eraser,
  FlaskConical,
  FolderOpen,
  Gem,
  MessagesSquare,
  Send,
  UserRound,
  Landmark,
  LineChart,
  Megaphone,
  Sparkles,
  Telescope,
  Users,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JourneyChapterView, JourneyAnswerView } from '@/lib/journey/repository';
import { Kochavi, type KochaviScene } from '../components/kochavi';
import { KochaviWalker } from '../components/kochavi-walker';

/** Kochavi acts out each chapter's theme in the focus screen. */
const SCENE_BY_SLUG: Record<string, KochaviScene> = {
  'problem-market': 'telescope',
  'business-model': 'coins',
  marketing: 'megaphone',
  financials: 'scale',
  validation: 'flask',
  'story-team': 'mic',
  'investor-room': 'briefcase',
};

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

interface ThreadComment {
  id: string;
  authorType: 'ENTREPRENEUR' | 'ADVISOR';
  authorName: string;
  body: string;
  createdAt: string;
}

interface AnswerState {
  content: string;
  status: 'DRAFT' | 'READY';
  aiFeedback: string | null;
  advisorRequestedAt?: string | null;
  comments?: ThreadComment[];
}

interface JourneyContentProps {
  userName: string;
  chapters: JourneyChapterView[];
  initialAnswers: JourneyAnswerView[];
  /** Monthly mentor-feedback pool state at page load. */
  initialMentorQuota?: { remaining: number; limit: number };
  /** Plan-derived feature switches (see lib/entitlements.ts). */
  features?: { mentorAi: boolean; humanMentor: boolean };
  /** Whether an advisor email is assigned (required for the human thread). */
  hasAdvisor?: boolean;
}

const AUTOSAVE_DELAY_MS = 10_000;

const CHAPTER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Telescope,
  Gem,
  Megaphone,
  LineChart,
  FlaskConical,
  Users,
  Landmark,
};

function ChapterIcon({ icon, className }: { icon: string | null; className?: string }) {
  const Icon = (icon && CHAPTER_ICONS[icon]) || Sparkles;
  return <Icon className={className} />;
}

// ---------------------------------------------------------------------------
// Starfield background (canvas, respects reduced motion)
// ---------------------------------------------------------------------------

function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Static sky on phones — an endless canvas loop is real battery/CPU drag.
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    let stars: { x: number; y: number; r: number; gold: boolean; ph: number; sp: number }[] = [];
    let W = 0;
    let H = 0;
    let raf = 0;
    let lastFrame = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(140, Math.floor((W * H) / 11000));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.2 + 0.3,
        gold: Math.random() < 0.18,
        ph: Math.random() * Math.PI * 2,
        sp: 0.4 + Math.random() * 1.1,
      }));
    };

    const paintStars = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        const a = 0.22 + 0.5 * (0.5 + 0.5 * Math.sin(s.ph + t * 0.001 * s.sp));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.gold
          ? `rgba(232,212,139,${a})`
          : `rgba(190,205,255,${a * 0.75})`;
        ctx.fill();
      }
    };

    const draw = (t: number) => {
      // 30fps is indistinguishable for twinkling and halves the work; skip
      // entirely while the tab is hidden.
      if (!document.hidden && t - lastFrame >= 33) {
        lastFrame = t;
        paintStars(t);
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    paintStars(0);
    if (!reduced && !isMobile) raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}

// ---------------------------------------------------------------------------
// Readiness ring
// ---------------------------------------------------------------------------

function ReadinessRing({ percent, size = 120 }: { percent: number; size?: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="journey-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c8a951" />
            <stop offset="1" stopColor="#f5e9c0" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="8" className="stroke-white/[0.08]" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          stroke="url(#journey-gold)"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * percent) / 100 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: 'drop-shadow(0 0 6px rgba(200,169,81,.55))' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-xl font-black text-[#e8d48b] tabular-nums">{percent}%</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gold particle burst (chapter celebration)
// ---------------------------------------------------------------------------

function burstGold(container: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#f5e9c0', '#e8d48b', '#c8a951'];
  for (let i = 0; i < 36; i++) {
    const p = document.createElement('span');
    p.style.cssText =
      'position:absolute;width:7px;height:7px;border-radius:50%;top:40%;right:50%;pointer-events:none;z-index:50;background:' +
      colors[i % 3];
    container.appendChild(p);
    const ang = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 150;
    p.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        {
          transform: `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist + 40}px) scale(.3)`,
          opacity: 0,
        },
      ],
      { duration: 900 + Math.random() * 600, easing: 'cubic-bezier(.1,.8,.4,1)' },
    ).onfinish = () => p.remove();
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function JourneyContent({
  userName,
  chapters,
  initialAnswers,
  initialMentorQuota,
  features = { mentorAi: true, humanMentor: false },
  hasAdvisor = false,
}: JourneyContentProps) {
  const firstName = userName.split(' ')[0] || 'יזם';
  const isStatic = chapters[0]?.id.startsWith('static:');

  // ----- answers state ------------------------------------------------------
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(() => {
    const map: Record<string, AnswerState> = {};
    for (const a of initialAnswers) {
      map[a.questionId] = {
        content: a.content,
        status: a.status,
        aiFeedback: a.aiFeedback,
        advisorRequestedAt: a.advisorRequestedAt ?? null,
        comments: a.comments ?? [],
      };
    }
    return map;
  });

  // ----- navigation state ---------------------------------------------------
  const [chapterIdx, setChapterIdx] = useState<number | null>(null); // null = map
  const [questionIdx, setQuestionIdx] = useState(0);
  const [direction, setDirection] = useState(1); // slide direction

  // ----- silent autosave ----------------------------------------------------
  const dirtyRef = useRef<Set<string>>(new Set());
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushDirty = useCallback((useBeacon = false) => {
    const dirty = Array.from(dirtyRef.current);
    if (dirty.length === 0) return;
    dirtyRef.current.clear();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    for (const questionId of dirty) {
      const a = answersRef.current[questionId];
      if (!a) continue;
      const payload = JSON.stringify({
        questionId,
        content: a.content,
        status: a.status,
      });
      if (useBeacon && navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/portal/journey/answer',
          new Blob([payload], { type: 'application/json' }),
        );
      } else {
        fetch('/api/portal/journey/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {
          // Silent by design — the next flush retries the latest state.
          dirtyRef.current.add(questionId);
        });
      }
    }
  }, []);

  const scheduleSave = useCallback(
    (questionId: string) => {
      if (isStatic) return;
      dirtyRef.current.add(questionId);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => flushDirty(), AUTOSAVE_DELAY_MS);
    },
    [flushDirty, isStatic],
  );

  // Flush on page hide / tab switch so nothing typed in the last 10s is lost.
  useEffect(() => {
    const onHide = () => flushDirty(true);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flushDirty(true);
    };
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onVisibility);
      flushDirty(true);
    };
  }, [flushDirty]);

  // ----- derived progress ---------------------------------------------------
  const isAnswered = useCallback(
    (qid: string) => (answers[qid]?.content ?? '').trim().length > 0,
    [answers],
  );

  const totalQuestions = useMemo(
    () => chapters.reduce((s, c) => s + c.questions.length, 0),
    [chapters],
  );
  const answeredCount = useMemo(
    () =>
      chapters.reduce(
        (s, c) => s + c.questions.filter((q) => isAnswered(q.id)).length,
        0,
      ),
    [chapters, isAnswered],
  );
  const readiness = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Answers marked "מוכן להצגה למשקיע" — these live in the readiness kit.
  const readyCount = useMemo(
    () =>
      Object.values(answers).filter((a) => a.status === 'READY' && a.content.trim().length > 0)
        .length,
    [answers],
  );

  const chapterProgress = useCallback(
    (c: JourneyChapterView) => {
      const done = c.questions.filter((q) => isAnswered(q.id)).length;
      return { done, total: c.questions.length, percent: c.questions.length ? Math.round((done / c.questions.length) * 100) : 0 };
    },
    [isAnswered],
  );

  const level =
    readiness >= 100 ? 'מוכן למשקיעים' : readiness >= 40 ? 'יזם מגובש' : 'יזם מתחיל';

  // Resume point: the most recently edited answer → its chapter/question.
  const resumeTarget = useMemo(() => {
    let latest: { ci: number; qi: number; at: string } | null = null;
    for (const a of initialAnswers) {
      for (let ci = 0; ci < chapters.length; ci++) {
        const qi = chapters[ci].questions.findIndex((q) => q.id === a.questionId);
        if (qi >= 0 && (!latest || a.updatedAt > latest.at)) {
          latest = { ci, qi, at: a.updatedAt };
        }
      }
    }
    return latest;
  }, [chapters, initialAnswers]);

  // ----- mobile jumper: keep the active circle in view ----------------------
  // RTL + overflow-x-auto opens scrolled to the wrong end on iOS Safari, so
  // in long chapters the current question's circle starts off-screen and the
  // whole screen reads as broken. Center it on every mount/question change.
  const jumperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = jumperRef.current?.querySelector<HTMLElement>(`[data-qidx="${questionIdx}"]`);
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [questionIdx, chapterIdx]);

  // ----- chapter celebration ------------------------------------------------
  const celebratedRef = useRef<Set<string>>(new Set());
  const focusBoxRef = useRef<HTMLDivElement>(null);
  const [celebration, setCelebration] = useState<string | null>(null);

  const maybeCelebrate = useCallback(
    (chapter: JourneyChapterView) => {
      const { done, total } = chapterProgress(chapter);
      if (total > 0 && done === total && !celebratedRef.current.has(chapter.id)) {
        celebratedRef.current.add(chapter.id);
        setCelebration(chapter.name);
        if (focusBoxRef.current) burstGold(focusBoxRef.current);
        setTimeout(() => setCelebration(null), 3600);
      }
    },
    [chapterProgress],
  );

  // ----- mentor feedback ----------------------------------------------------
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [mentorQuota, setMentorQuota] = useState(
    initialMentorQuota ?? { remaining: 30, limit: 30 },
  );

  const requestFeedback = useCallback(
    async (questionId: string) => {
      setFeedbackLoading(true);
      setFeedbackError(null);
      // Make sure the latest text is on the server before the mentor reads it.
      flushDirty();
      try {
        const res = await fetch('/api/portal/journey/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId }),
        });
        const data = await res.json().catch(() => ({}));
        if (typeof data?.remaining === 'number' && typeof data?.limit === 'number') {
          setMentorQuota({ remaining: data.remaining, limit: data.limit });
        }
        if (!res.ok) {
          setFeedbackError(data?.error || 'משהו השתבש — נסה שוב');
          return;
        }
        setAnswers((prev) => ({
          ...prev,
          [questionId]: {
            ...(prev[questionId] ?? { content: '', status: 'DRAFT' as const }),
            aiFeedback: data.feedback,
          },
        }));
      } catch {
        setFeedbackError('בעיית תקשורת — נסה שוב');
      } finally {
        setFeedbackLoading(false);
      }
    },
    [flushDirty],
  );

  // ----- human-mentor thread (INVESTOR_PREP) --------------------------------
  const [advisorSending, setAdvisorSending] = useState(false);
  const [threadDraft, setThreadDraft] = useState('');
  const [threadSending, setThreadSending] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);

  const requestAdvisor = useCallback(
    async (questionId: string) => {
      setAdvisorSending(true);
      setThreadError(null);
      flushDirty();
      try {
        const res = await fetch('/api/portal/journey/advisor-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId, note: threadDraft.trim() || undefined }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setThreadError(data?.error || 'השליחה נכשלה — נסה שוב');
          return;
        }
        setThreadDraft('');
        setAnswers((prev) => {
          const cur = prev[questionId];
          if (!cur) return prev;
          return {
            ...prev,
            [questionId]: {
              ...cur,
              advisorRequestedAt: data.advisorRequestedAt,
              comments: data.comment ? [...(cur.comments ?? []), data.comment] : cur.comments,
            },
          };
        });
      } catch {
        setThreadError('בעיית תקשורת — נסה שוב');
      } finally {
        setAdvisorSending(false);
      }
    },
    [flushDirty, threadDraft],
  );

  const sendThreadMessage = useCallback(
    async (questionId: string) => {
      const text = threadDraft.trim();
      if (text.length < 2) return;
      setThreadSending(true);
      setThreadError(null);
      try {
        const res = await fetch('/api/portal/journey/comment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId, body: text }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setThreadError(data?.error || 'השליחה נכשלה — נסה שוב');
          return;
        }
        setThreadDraft('');
        setAnswers((prev) => {
          const cur = prev[questionId];
          if (!cur) return prev;
          return {
            ...prev,
            [questionId]: { ...cur, comments: [...(cur.comments ?? []), data.comment] },
          };
        });
      } catch {
        setThreadError('בעיית תקשורת — נסה שוב');
      } finally {
        setThreadSending(false);
      }
    },
    [threadDraft],
  );

  // ----- edit handlers ------------------------------------------------------
  const setContent = useCallback(
    (questionId: string, content: string) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          ...(prev[questionId] ?? { status: 'DRAFT' as const, aiFeedback: null }),
          content,
          status: prev[questionId]?.status ?? 'DRAFT',
          aiFeedback: prev[questionId]?.aiFeedback ?? null,
        },
      }));
      scheduleSave(questionId);
    },
    [scheduleSave],
  );

  const toggleReady = useCallback(
    (questionId: string) => {
      setAnswers((prev) => {
        const cur = prev[questionId];
        if (!cur || !cur.content.trim()) return prev;
        return {
          ...prev,
          [questionId]: { ...cur, status: cur.status === 'READY' ? 'DRAFT' : 'READY' },
        };
      });
      scheduleSave(questionId);
      // Status changes deserve an immediate (still silent) save.
      setTimeout(() => flushDirty(), 50);
    },
    [scheduleSave, flushDirty],
  );

  const clearAnswer = useCallback(
    (questionId: string) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { content: '', status: 'DRAFT', aiFeedback: prev[questionId]?.aiFeedback ?? null },
      }));
      scheduleSave(questionId);
      setTimeout(() => flushDirty(), 50);
    },
    [scheduleSave, flushDirty],
  );

  const goToQuestion = useCallback(
    (qi: number, dir: number) => {
      flushDirty();
      setDirection(dir);
      setQuestionIdx(qi);
    },
    [flushDirty],
  );

  const openChapter = useCallback(
    (ci: number, qi = 0) => {
      flushDirty();
      setChapterIdx(ci);
      setQuestionIdx(qi);
      setDirection(1);
      window.scrollTo({ top: 0 });
    },
    [flushDirty],
  );

  const backToMap = useCallback(() => {
    if (chapterIdx !== null) maybeCelebrate(chapters[chapterIdx]);
    flushDirty();
    setChapterIdx(null);
    window.scrollTo({ top: 0 });
  }, [chapterIdx, chapters, flushDirty, maybeCelebrate]);

  // ---------------------------------------------------------------------------
  // Render: constellation map
  // ---------------------------------------------------------------------------

  const renderMap = () => {
    const n = chapters.length;
    const W = 1000;
    const H = 500;
    const pts = chapters.map((_, i) => {
      const x = n === 1 ? W / 2 : 930 - (i * 860) / (n - 1);
      const y = 380 - (i % 2) * 110 - (i === n - 1 ? 90 : 0);
      return { x, y };
    });
    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const totalDone = chapters.filter((c) => {
      const p = chapterProgress(c);
      return p.total > 0 && p.done === p.total;
    }).length;

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        {/* Hero image — the golden path (anchors to the full-width wrapper) */}
        <div className="absolute inset-x-0 top-0 h-[420px] sm:h-[520px] overflow-hidden pointer-events-none" aria-hidden="true">
          <img
            src="/images/portal/welcome-hero.webp"
            alt=""
            className="w-full h-full object-cover object-center opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e]/55 via-[#070b1e]/35 to-[#070b1e]" />
        </div>

        {/* Hero */}
        <div className="pt-10 pb-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] text-[#e8d48b] border border-[#c8a951]/40 rounded-full px-4 py-1.5 bg-[#c8a951]/10 backdrop-blur"
          >
            <Sparkles className="w-3.5 h-3.5" />
            מסע מרעיון למיזם
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="mt-5 text-4xl sm:text-5xl font-black leading-tight flex items-center justify-center gap-4 flex-wrap"
          >
            <span>
              שלום {firstName},{' '}
              <span className="bg-gradient-to-l from-[#c8a951] via-[#f5e9c0] to-[#c8a951] bg-clip-text text-transparent">
                המסע שלך מחכה
              </span>
            </span>
            <span className="hidden sm:inline-block pointer-events-none">
              <Kochavi size={72} anim={answeredCount === 0 ? 'wave' : 'idle'} />
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-3 text-white/50 max-w-xl mx-auto text-sm sm:text-base"
          >
            {totalQuestions} שאלות שמשקיעים באמת שואלים, ב-{n} תחנות. ענה בקצב שלך —
            הכול נשמר אצלך, ותמיד אפשר לחזור ולחדד.
          </motion.p>
        </div>

        {/* Readiness summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="wc-glass wc-shine flex flex-wrap items-center justify-center gap-6 sm:gap-10 rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md px-6 py-6 mb-4 relative"
        >
          <div className="text-center">
            <ReadinessRing percent={readiness} />
            <div className="mt-1 text-[11px] tracking-wider text-white/40">מד מוכנות למשקיעים</div>
          </div>
          <div className="h-14 w-px bg-white/[0.08] hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-black text-[#e8d48b] tabular-nums">
              {answeredCount}
              <span className="text-white/30 text-lg font-bold">/{totalQuestions}</span>
            </div>
            <div className="text-[11px] tracking-wider text-white/40 mt-1">שאלות נענו</div>
          </div>
          <div className="h-14 w-px bg-white/[0.08] hidden sm:block" />
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-lg font-bold text-[#e8d48b]">
              <Award className="w-5 h-5" />
              {level}
            </div>
            <div className="text-[11px] tracking-wider text-white/40 mt-1">
              {totalDone}/{n} תחנות הושלמו
            </div>
          </div>
          {resumeTarget && (
            <>
              <div className="h-14 w-px bg-white/[0.08] hidden sm:block" />
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <button
                  onClick={() => openChapter(resumeTarget.ci, resumeTarget.qi)}
                  className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[#c8a951] to-[#e8d48b] text-[#1d1704] font-bold px-5 py-3 text-sm shadow-[0_8px_26px_-10px_rgba(200,169,81,.6)] hover:brightness-105 transition cursor-pointer"
                >
                  המשך מהמקום שעצרת
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <Link
                  href="/portal/journey/kit"
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#c8a951]/40 text-[#e8d48b] font-semibold px-5 py-2.5 text-[13px] hover:bg-[#c8a951]/10 transition-colors"
                >
                  <FolderOpen className="w-4 h-4" />
                  תיק המוכנות שלי
                  <span className="tabular-nums text-[11px] bg-[#c8a951]/15 border border-[#c8a951]/30 rounded-full px-2 py-0.5">
                    {readyCount}
                  </span>
                </Link>
              </div>
            </>
          )}
        </motion.div>

        {!resumeTarget && readyCount > 0 && (
          <div className="flex justify-center mb-4">
            <Link
              href="/portal/journey/kit"
              className="flex items-center gap-2 rounded-xl border border-[#c8a951]/40 text-[#e8d48b] font-semibold px-5 py-2.5 text-[13px] hover:bg-[#c8a951]/10 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              תיק המוכנות שלי ({readyCount})
            </Link>
          </div>
        )}

        {isStatic && (
          <div className="text-center text-xs text-amber-400/80 mb-4">
            תצוגה מקדימה — התוכן טרם נטען למסד הנתונים, שמירת תשובות תתאפשר לאחר טעינה על ידי מנהל.
          </div>
        )}

        {/* Constellation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="hidden md:block relative"
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="group" aria-label="מפת תחנות המסע">
            <defs>
              <linearGradient id="map-path" x1="1" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#c8a951" />
                <stop offset="1" stopColor="#f5e9c0" />
              </linearGradient>
            </defs>
            <motion.path
              d={path}
              fill="none"
              stroke="url(#map-path)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.4 }}
              style={{ filter: 'drop-shadow(0 0 6px rgba(200,169,81,.5))' }}
            />
            {chapters.map((c, i) => {
              const p = chapterProgress(c);
              const complete = p.total > 0 && p.done === p.total;
              const started = p.done > 0;
              const pt = pts[i];
              const labelAbove = pt.y > 250;
              return (
                <motion.g
                  key={c.id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.12, type: 'spring', stiffness: 200, damping: 16 }}
                  className="cursor-pointer"
                  onClick={() => openChapter(i)}
                  role="button"
                  aria-label={`תחנה ${i + 1}: ${c.name} — ${p.done} מתוך ${p.total} נענו`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openChapter(i);
                    }
                  }}
                >
                  {complete && (
                    <circle cx={pt.x} cy={pt.y} r="30" fill="none" stroke="rgba(232,212,139,.35)" strokeWidth="1.5" />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="21"
                    fill={complete ? 'rgba(200,169,81,.9)' : started ? 'rgba(200,169,81,.22)' : '#0a1030'}
                    stroke={started || complete ? '#e8d48b' : 'rgba(255,255,255,.25)'}
                    strokeWidth="2"
                    style={complete ? { filter: 'drop-shadow(0 0 10px rgba(200,169,81,.7))' } : undefined}
                  />
                  {complete ? (
                    <path
                      d={`M ${pt.x - 8} ${pt.y} l 6 6 l 11 -11`}
                      fill="none"
                      stroke="#1d1704"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <text
                      x={pt.x}
                      y={pt.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="15"
                      fontWeight="800"
                      fill={started ? '#f5e9c0' : 'rgba(255,255,255,.55)'}
                    >
                      {i + 1}
                    </text>
                  )}
                  <text
                    x={pt.x}
                    y={labelAbove ? pt.y + 46 : pt.y - 36}
                    textAnchor="middle"
                    fontSize="15"
                    fontWeight="700"
                    fill={complete ? '#e8d48b' : 'rgba(255,255,255,.7)'}
                  >
                    {c.name}
                  </text>
                  <text
                    x={pt.x}
                    y={labelAbove ? pt.y + 66 : pt.y - 58}
                    textAnchor="middle"
                    fontSize="11.5"
                    fill="rgba(255,255,255,.35)"
                  >
                    {p.done}/{p.total} נענו
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </motion.div>

        {/* Chapter cards (mobile + detail) */}
        <div className="grid sm:grid-cols-2 gap-4 mt-6 md:mt-2">
          {chapters.map((c, i) => {
            const p = chapterProgress(c);
            const complete = p.total > 0 && p.done === p.total;
            return (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                onClick={() => openChapter(i)}
                className={cn(
                  'wc-glass wc-shine wc-glass-lift text-right rounded-2xl border p-5 backdrop-blur-md transition-all cursor-pointer group',
                  complete
                    ? 'border-[#c8a951]/50 bg-[#c8a951]/[0.08] hover:bg-[#c8a951]/[0.12]'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-[#c8a951]/40 hover:bg-white/[0.05]',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-11 h-11 rounded-xl grid place-items-center border',
                        complete
                          ? 'bg-[#c8a951]/25 border-[#c8a951]/50 text-[#f5e9c0]'
                          : 'bg-white/[0.04] border-white/[0.1] text-[#c8a951]',
                      )}
                    >
                      <ChapterIcon icon={c.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-white/90 flex items-center gap-2">
                        {c.name}
                        {complete && <CheckCircle2 className="w-4 h-4 text-[#e8d48b]" />}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">{c.description}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/25 rotate-180 group-hover:text-[#c8a951] group-hover:-translate-x-0.5 transition-all mt-1" />
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-l from-[#c8a951] to-[#f5e9c0]"
                      initial={{ width: 0 }}
                      animate={{ width: `${p.percent}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                    />
                  </div>
                  <span className="text-[11px] text-[#e8d48b] tabular-nums font-bold">
                    {p.done}/{p.total}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render: chapter focus mode
  // ---------------------------------------------------------------------------

  const renderChapter = () => {
    const chapter = chapters[chapterIdx!];
    const question = chapter.questions[questionIdx];
    if (!question) return null;
    const answer = answers[question.id];
    const content = answer?.content ?? '';
    const ready = answer?.status === 'READY';
    const p = chapterProgress(chapter);
    const hasText = content.trim().length > 0;

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        {/* Chapter header */}
        <div className="pt-3 sm:pt-6 pb-3 sm:pb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={backToMap}
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-[#e8d48b] transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            למפת המסע
          </button>
          <div className="flex items-center gap-3">
            <div className="text-left">
              <div className="text-sm font-bold text-[#e8d48b] flex items-center gap-2 justify-end">
                <ChapterIcon icon={chapter.icon} className="w-4 h-4" />
                {chapter.name}
              </div>
              <div className="text-[11px] text-white/35 text-left tabular-nums">
                {p.done}/{p.total} נענו בפרק
              </div>
            </div>
          </div>
        </div>

        {/* investor look — short visual callout, not a text wall */}
        {chapter.investorLook && questionIdx === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 sm:mb-4 flex items-start gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-[#c8a951]/25 bg-[#c8a951]/[0.06] px-3.5 py-3 sm:px-5 sm:py-4"
          >
            <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-[#c8a951] shrink-0 mt-0.5" />
            <p className="text-[13px] sm:text-sm text-white/70 leading-relaxed m-0">{chapter.investorLook}</p>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-[260px_1fr] gap-5 items-start">
          {/* Question rail (free navigation) */}
          <div className="hidden lg:block rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur p-3 max-h-[70vh] overflow-y-auto sticky top-24">
            {chapter.questions.map((q, qi) => {
              const done = isAnswered(q.id);
              const isReady = answers[q.id]?.status === 'READY' && done;
              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(qi, qi > questionIdx ? 1 : -1)}
                  className={cn(
                    'w-full text-right flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] transition-colors cursor-pointer',
                    qi === questionIdx
                      ? 'bg-[#c8a951]/15 text-[#f5e9c0] border border-[#c8a951]/30'
                      : 'text-white/45 hover:bg-white/[0.04] border border-transparent',
                  )}
                >
                  {isReady ? (
                    <CheckCircle2 className="w-4 h-4 text-[#e8d48b] shrink-0" />
                  ) : done ? (
                    <Check className="w-4 h-4 text-[#c8a951]/70 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                  )}
                  <span className="truncate">{q.prompt}</span>
                </button>
              );
            })}
          </div>

          {/* Focus card — כוכבי מטייל על הקצה העליון שלו (ובפיננסים: על חבל!) */}
          <div>
            <KochaviWalker
              size={58}
              scene={SCENE_BY_SLUG[chapter.slug] ?? 'none'}
              rope={chapter.slug === 'financials'}
              className="hidden lg:block mx-10 -mb-1"
            />
          <div
            ref={focusBoxRef}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#c8a951]/25 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-md p-4 sm:p-9 shadow-[0_40px_90px_-50px_rgba(0,0,0,.9)]"
          >
            {/* progress inside chapter — on mobile the numbered jumper below
                already shows position; the extra bar row just eats screen */}
            <div className="hidden sm:flex items-center gap-3 mb-4">
              <div className="flex-1 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-l from-[#c8a951] to-[#f5e9c0]"
                  animate={{ width: `${((questionIdx + 1) / chapter.questions.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span className="text-xs text-[#c8a951] tabular-nums tracking-wider whitespace-nowrap">
                שאלה {questionIdx + 1} / {chapter.questions.length}
              </span>
            </div>

            {/* mobile question jumper — the desktop rail is hidden below lg */}
            <div
              ref={jumperRef}
              className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 -mx-1 px-1 [scrollbar-width:none]"
            >
              <span className="sm:hidden shrink-0 text-[11px] font-bold text-[#c8a951] tabular-nums whitespace-nowrap pl-1.5">
                {questionIdx + 1}/{chapter.questions.length}
              </span>
              {chapter.questions.map((q, qi) => {
                const done = isAnswered(q.id);
                const isReadyQ = answers[q.id]?.status === 'READY' && done;
                return (
                  <button
                    key={q.id}
                    data-qidx={qi}
                    onClick={() => goToQuestion(qi, qi > questionIdx ? 1 : -1)}
                    aria-label={`שאלה ${qi + 1}${done ? ' — נענתה' : ''}`}
                    className={cn(
                      'shrink-0 w-9 h-9 rounded-full grid place-items-center text-[12px] font-bold tabular-nums border transition-colors cursor-pointer',
                      qi === questionIdx
                        ? 'bg-[#c8a951] text-[#1d1704] border-[#c8a951]'
                        : isReadyQ
                          ? 'bg-[#c8a951]/25 text-[#f5e9c0] border-[#c8a951]/50'
                          : done
                            ? 'bg-[#c8a951]/10 text-[#e8d48b] border-[#c8a951]/30'
                            : 'bg-white/[0.03] text-white/40 border-white/[0.12]',
                    )}
                  >
                    {done && qi !== questionIdx ? <Check className="w-3.5 h-3.5" /> : qi + 1}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={question.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 34 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -26 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="text-lg sm:text-2xl font-black leading-snug text-white/95 mb-2 break-words">
                  {question.prompt}
                </h2>
                {question.helper && (
                  <p className="text-[13.5px] text-white/50 border-r-2 border-[#c8a951]/40 pr-3 mb-5 leading-relaxed max-w-2xl">
                    {question.helper}
                  </p>
                )}

                <textarea
                  dir="rtl"
                  value={content}
                  onChange={(e) => setContent(question.id, e.target.value)}
                  placeholder="כתוב את התשובה שלך כאן..."
                  rows={6}
                  className="w-full resize-y rounded-2xl bg-[#03061a]/60 border border-white/[0.1] focus:border-[#c8a951] focus:ring-[3px] focus:ring-[#c8a951]/15 outline-none px-4 sm:px-5 py-4 text-[16px] sm:text-[15px] leading-relaxed text-white/90 placeholder:text-white/25 transition-colors"
                />

                {/* actions — stacked full-width on phones, row on larger screens */}
                <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5">
                  <button
                    onClick={() => toggleReady(question.id)}
                    disabled={!hasText}
                    className={cn(
                      'flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed',
                      ready
                        ? 'bg-gradient-to-l from-[#c8a951] to-[#e8d48b] text-[#1d1704] shadow-[0_6px_20px_-8px_rgba(200,169,81,.6)]'
                        : 'border border-[#c8a951]/40 text-[#e8d48b] hover:bg-[#c8a951]/10',
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {ready ? 'מוכן להצגה למשקיע' : 'סמן כמוכן להצגה'}
                  </button>

                  {features.mentorAi && (
                  <button
                    onClick={() => requestFeedback(question.id)}
                    disabled={
                      feedbackLoading ||
                      content.trim().length < 10 ||
                      isStatic ||
                      mentorQuota.remaining <= 0
                    }
                    title={
                      mentorQuota.remaining <= 0
                        ? 'המכסה החודשית נוצלה — מתחדשת ב-1 בחודש'
                        : undefined
                    }
                    className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-white/[0.12] px-4 py-2.5 text-[13px] font-semibold text-white/70 hover:border-[#c8a951]/40 hover:text-[#e8d48b] transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <Wand2 className={cn('w-4 h-4', feedbackLoading && 'animate-pulse')} />
                    {feedbackLoading ? 'כוכבי קורא...' : 'משוב מכוכבי'}
                    {mentorQuota.limit > 0 && (
                      <span
                        className={cn(
                          'tabular-nums text-[11px] rounded-full px-1.5 py-px border',
                          mentorQuota.remaining <= 0
                            ? 'border-red-400/30 text-red-300/70'
                            : mentorQuota.remaining <= 5
                              ? 'border-amber-400/30 text-amber-300/80'
                              : 'border-white/[0.15] text-white/40',
                        )}
                      >
                        {mentorQuota.remaining}/{mentorQuota.limit}
                      </span>
                    )}
                  </button>
                  )}

                  {hasText && (
                    <button
                      onClick={() => clearAnswer(question.id)}
                      className="flex self-start sm:self-auto items-center gap-1.5 rounded-xl px-3 py-2 text-[12.5px] text-white/35 hover:text-red-400/80 transition-colors cursor-pointer"
                      title="נקה את התשובה"
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      נקה
                    </button>
                  )}
                </div>

                {ready && (
                  <Link
                    href="/portal/journey/kit"
                    className="mt-3 flex items-center gap-1.5 text-[12.5px] text-[#c8a951] hover:text-[#f5e9c0] transition-colors w-fit"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    התשובה נאספה לתיק המוכנות שלך — לצפייה בתיק
                  </Link>
                )}

                {feedbackError && (
                  <p className="mt-3 text-[13px] text-amber-400/90">{feedbackError}</p>
                )}

                {answer?.aiFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-2xl border border-[#c8a951]/30 bg-gradient-to-br from-[#c8a951]/[0.12] to-[#c8a951]/[0.04] px-5 py-4"
                  >
                    <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] text-[#e8d48b] font-bold mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      כוכבי · המנטור האישי שלך
                    </div>
                    <p className="text-[13.5px] text-white/75 leading-relaxed whitespace-pre-line m-0">
                      {answer.aiFeedback}
                    </p>
                  </motion.div>
                )}

                {/* Human-mentor thread — INVESTOR_PREP plan */}
                {features.humanMentor && (
                  <div className="mt-4 rounded-2xl border border-white/[0.1] bg-white/[0.03] px-4 sm:px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] text-white/50 font-bold">
                        <MessagesSquare className="w-3.5 h-3.5 text-[#c8a951]" />
                        שיחה עם המלווה האישי
                      </div>
                      {answer?.advisorRequestedAt && (
                        <span className="text-[11px] text-emerald-400/80">
                          נשלח למלווה ב-{new Date(answer.advisorRequestedAt).toLocaleDateString('he-IL')} ✓
                        </span>
                      )}
                    </div>

                    {(answer?.comments ?? []).map((c) => (
                      <div
                        key={c.id}
                        className={cn(
                          'rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed mb-2 max-w-[92%]',
                          c.authorType === 'ADVISOR'
                            ? 'bg-[#c8a951]/[0.12] border border-[#c8a951]/30'
                            : 'bg-white/[0.05] border border-white/[0.09] mr-auto',
                        )}
                      >
                        <div className={cn('text-[10.5px] font-bold mb-0.5', c.authorType === 'ADVISOR' ? 'text-[#e8d48b]' : 'text-white/45')}>
                          {c.authorType === 'ADVISOR' ? `${c.authorName} · המלווה שלך` : 'אתה'}
                        </div>
                        <div className="text-white/80 whitespace-pre-line">{c.body}</div>
                      </div>
                    ))}

                    {!hasAdvisor ? (
                      <p className="text-[12.5px] text-white/40 m-0">
                        עדיין לא שויך לך מלווה אישי — פנה לצוות ונחבר אותך.
                      </p>
                    ) : (
                      <>
                        <textarea
                          dir="rtl"
                          value={threadDraft}
                          onChange={(e) => setThreadDraft(e.target.value)}
                          placeholder={
                            answer?.advisorRequestedAt
                              ? 'כתוב הודעה למלווה...'
                              : 'הודעה אישית למלווה (לא חובה) — ואז שלח את התשובה לעיונו'
                          }
                          rows={2}
                          className="w-full resize-y rounded-xl bg-[#03061a]/50 border border-white/[0.1] focus:border-[#c8a951] focus:ring-[3px] focus:ring-[#c8a951]/15 outline-none px-3.5 py-2.5 text-[14px] leading-relaxed text-white/90 placeholder:text-white/25 transition-colors"
                        />
                        {threadError && <p className="text-[12.5px] text-amber-400/90 mt-1.5 mb-0">{threadError}</p>}
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          {!answer?.advisorRequestedAt ? (
                            <button
                              onClick={() => requestAdvisor(question.id)}
                              disabled={advisorSending || !hasText}
                              className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl bg-gradient-to-l from-[#c8a951] to-[#e8d48b] text-[#1d1704] font-bold px-4 py-2.5 text-[13px] shadow-[0_6px_20px_-8px_rgba(200,169,81,.6)] hover:brightness-105 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <UserRound className="w-4 h-4" />
                              {advisorSending ? 'שולח למלווה...' : 'שלח את התשובה למלווה שלי'}
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => sendThreadMessage(question.id)}
                                disabled={threadSending || threadDraft.trim().length < 2}
                                className="flex items-center gap-1.5 rounded-xl border border-[#c8a951]/40 text-[#e8d48b] font-semibold px-4 py-2 text-[13px] hover:bg-[#c8a951]/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <Send className="w-3.5 h-3.5" />
                                {threadSending ? 'שולח...' : 'שלח הודעה'}
                              </button>
                              <button
                                onClick={() => requestAdvisor(question.id)}
                                disabled={advisorSending}
                                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] text-white/40 hover:text-[#e8d48b] transition-colors cursor-pointer disabled:opacity-40"
                                title="שולח למלווה מייל נוסף עם התשובה המעודכנת"
                              >
                                <UserRound className="w-3.5 h-3.5" />
                                {advisorSending ? 'שולח...' : 'עדכן את המלווה שוב'}
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* prev / next — on mobile the primary action stretches for the thumb */}
            <div className="mt-5 sm:mt-7 flex items-center justify-between gap-3">
              <button
                onClick={() => goToQuestion(questionIdx - 1, -1)}
                disabled={questionIdx === 0}
                className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 sm:px-4 py-3 text-sm text-white/50 hover:text-white/85 transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-4 h-4" />
                הקודמת
              </button>
              {questionIdx < chapter.questions.length - 1 ? (
                <button
                  onClick={() => goToQuestion(questionIdx + 1, 1)}
                  className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[#c8a951] to-[#e8d48b] text-[#1d1704] font-bold px-6 py-3 text-sm shadow-[0_8px_26px_-10px_rgba(200,169,81,.6)] hover:brightness-105 active:scale-[0.97] transition cursor-pointer"
                >
                  לשאלה הבאה
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={backToMap}
                  className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[#c8a951] to-[#e8d48b] text-[#1d1704] font-bold px-6 py-3 text-sm shadow-[0_8px_26px_-10px_rgba(200,169,81,.6)] hover:brightness-105 active:scale-[0.97] transition cursor-pointer"
                >
                  סיום הפרק — למפה
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen text-white relative" dir="rtl">
      <Starfield />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(900px 480px at 85% -5%, rgba(200,169,81,0.10), transparent 60%), radial-gradient(700px 500px at -5% 30%, rgba(63,86,201,0.12), transparent 60%)',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">
        {chapterIdx === null ? renderMap() : renderChapter()}
      </div>

      {/* Chapter-complete celebration */}
      <AnimatePresence>
        {celebration && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="fixed bottom-8 right-1/2 translate-x-1/2 z-50 flex w-[calc(100vw-2rem)] max-w-md sm:w-auto items-center gap-3 rounded-2xl border border-[#c8a951]/50 bg-[#0a1030]/95 backdrop-blur-xl px-5 sm:px-6 py-4 shadow-[0_20px_60px_-20px_rgba(200,169,81,.5)]"
          >
            <Kochavi size={64} anim="party" className="shrink-0" />
            <div>
              <div className="font-black text-[#f5e9c0]">הפרק "{celebration}" הושלם!</div>
              <div className="text-xs text-white/50">תחנה נוספת נחתמה בזהב במפת המסע שלך</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
