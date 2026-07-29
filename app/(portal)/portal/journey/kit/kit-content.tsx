'use client';

/**
 * תיק המוכנות — the entrepreneur's investor-ready answer collection.
 *
 * Every answer marked "מוכן להצגה למשקיע" (READY) in the journey is gathered
 * here automatically, organized by chapter, in one clean place. Screen view
 * keeps the portal's night/gold language; the print view (window.print)
 * flips to a clean white document ready to bring to an investor meeting.
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  FolderOpen,
  Printer,
} from 'lucide-react';
import type { JourneyChapterView, JourneyAnswerView } from '@/lib/journey/repository';

interface KitContentProps {
  userName: string;
  chapters: JourneyChapterView[];
  answers: JourneyAnswerView[];
}

export function KitContent({ userName, chapters, answers }: KitContentProps) {
  const readyByQuestion = useMemo(() => {
    const map = new Map<string, JourneyAnswerView>();
    for (const a of answers) {
      if (a.status === 'READY' && a.content.trim().length > 0) {
        map.set(a.questionId, a);
      }
    }
    return map;
  }, [answers]);

  // Chapters that actually have READY answers, keeping journey order.
  const sections = useMemo(
    () =>
      chapters
        .map((c) => ({
          chapter: c,
          items: c.questions
            .filter((q) => readyByQuestion.has(q.id))
            .map((q) => ({ question: q, answer: readyByQuestion.get(q.id)! })),
        }))
        .filter((s) => s.items.length > 0),
    [chapters, readyByQuestion],
  );

  const readyCount = readyByQuestion.size;
  const totalQuestions = chapters.reduce((s, c) => s + c.questions.length, 0);
  const lastUpdated = useMemo(() => {
    let latest: string | null = null;
    for (const a of readyByQuestion.values()) {
      if (!latest || a.updatedAt > latest) latest = a.updatedAt;
    }
    return latest ? new Date(latest).toLocaleDateString('he-IL') : null;
  }, [readyByQuestion]);

  return (
    <div className="min-h-screen text-white print:text-black print:bg-white" dir="rtl">
      {/* screen-only backdrop */}
      <div
        className="fixed inset-0 pointer-events-none print:hidden"
        style={{
          background:
            'radial-gradient(900px 480px at 85% -5%, rgba(200,169,81,0.10), transparent 60%), radial-gradient(700px 500px at -5% 30%, rgba(63,86,201,0.12), transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-20 print:pb-0">
        {/* top bar (screen only) */}
        <div className="pt-6 pb-2 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/portal/journey"
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-[#e8d48b] transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה למסע
          </Link>
          {readyCount > 0 && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-[#c8a951] to-[#e8d48b] text-[#1d1704] font-bold px-5 py-2.5 text-sm shadow-[0_8px_26px_-10px_rgba(200,169,81,.6)] hover:brightness-105 active:scale-[0.97] transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              הדפסה / שמירה כ-PDF
            </button>
          )}
        </div>

        {/* Kit header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mt-4 rounded-3xl border border-[#c8a951]/30 bg-gradient-to-br from-[#c8a951]/[0.12] to-white/[0.02] backdrop-blur-md px-6 sm:px-8 py-7 print:border-slate-300 print:bg-white print:rounded-none print:px-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] tracking-[0.22em] text-[#e8d48b] print:text-amber-700 font-bold mb-2">
                <FolderOpen className="w-4 h-4" />
                תיק המוכנות למשקיעים
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white/95 print:text-black">
                {userName}
              </h1>
              <p className="text-sm text-white/45 print:text-slate-500 mt-1">
                כל התשובות שסימנת כ"מוכן להצגה למשקיע" — במקום אחד, מסודרות לפי פרקי המסע.
                {lastUpdated && <> עודכן לאחרונה: {lastUpdated}.</>}
              </p>
            </div>
            <div className="text-center shrink-0">
              <div className="w-20 h-20 rounded-full border-2 border-[#c8a951] print:border-amber-600 grid place-items-center bg-[#c8a951]/10">
                <div>
                  <div className="text-xl font-black text-[#f5e9c0] print:text-amber-700 tabular-nums leading-none">
                    {readyCount}
                  </div>
                  <div className="text-[9px] text-white/40 print:text-slate-400 mt-0.5">
                    מתוך {totalQuestions}
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-white/40 print:text-slate-400 mt-1.5">תשובות בתיק</div>
            </div>
          </div>
        </motion.div>

        {/* Empty state */}
        {readyCount === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 rounded-3xl border border-dashed border-white/[0.15] bg-white/[0.02] px-8 py-14 text-center"
          >
            <FolderOpen className="w-10 h-10 text-[#c8a951]/50 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white/80 mb-2">התיק שלך עדיין ריק</h2>
            <p className="text-sm text-white/45 max-w-md mx-auto mb-6">
              בכל שאלה במסע, אחרי שכתבת תשובה שאתה שלם איתה — לחץ על{' '}
              <span className="text-[#e8d48b] font-semibold">"סמן כמוכן להצגה"</span>. התשובה
              תיאסף לכאן אוטומטית, ותבנה בהדרגה את תיק המוכנות שתביא לפגישת המשקיעים.
            </p>
            <Link
              href="/portal/journey"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[#c8a951] to-[#e8d48b] text-[#1d1704] font-bold px-6 py-3 text-sm shadow-[0_8px_26px_-10px_rgba(200,169,81,.6)] hover:brightness-105 transition"
            >
              למסע — לענות על שאלות
            </Link>
          </motion.div>
        )}

        {/* Sections by chapter */}
        <div className="mt-6 space-y-6 print:space-y-4">
          {sections.map(({ chapter, items }, si) => (
            <motion.section
              key={chapter.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + si * 0.06 }}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md overflow-hidden print:border-slate-200 print:bg-white print:rounded-lg print:break-inside-avoid-page"
            >
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-white/[0.07] print:border-slate-200 bg-white/[0.02]">
                <h2 className="font-black text-[#e8d48b] print:text-amber-700 flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[#c8a951]/15 border border-[#c8a951]/40 grid place-items-center text-xs tabular-nums print:bg-amber-50">
                    {chapters.indexOf(chapter) + 1}
                  </span>
                  {chapter.name}
                </h2>
                <span className="text-[11px] text-white/35 print:text-slate-400 tabular-nums">
                  {items.length} תשובות
                </span>
              </div>
              <div className="divide-y divide-white/[0.05] print:divide-slate-100">
                {items.map(({ question, answer }) => (
                  <div key={question.id} className="px-6 py-5 print:break-inside-avoid">
                    <div className="flex items-start gap-2.5 mb-2">
                      <BadgeCheck className="w-4 h-4 text-[#c8a951] print:text-amber-600 shrink-0 mt-0.5" />
                      <h3 className="text-[14.5px] font-bold text-white/85 print:text-black m-0">
                        {question.prompt}
                      </h3>
                    </div>
                    <p className="text-[14px] leading-relaxed text-white/65 print:text-slate-700 whitespace-pre-line mr-[26px] m-0">
                      {answer.content}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* footer note */}
        {readyCount > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2 text-[12px] text-white/35 print:text-slate-400">
            <Award className="w-4 h-4 text-[#c8a951] print:text-amber-600" />
            הופק ממסע "מרעיון למיזם" · פורטל היזמים של WeCcelerate
          </div>
        )}
      </div>
    </div>
  );
}
