/**
 * /admin/drafts — review queue for David's gate-rejected articles.
 *
 * Every article that finished writing but failed the quality/policy gate is
 * saved as status='draft' and shows up here with its scores and the reason
 * it was held back. The admin previews the full article, then publishes
 * (IndexNow + Katrin email fire automatically) or discards.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { publishDraftAction, discardDraftAction } from './actions';

export const metadata: Metadata = {
  title: 'טיוטות של דוד | מערכת ניהול WeCcelerate',
};

export const dynamic = 'force-dynamic';

interface DraftRow {
  id: string;
  slug: string;
  titleHe: string;
  metaDescription: string;
  category: string;
  factCheckScore: number | null;
  seoScore: number | null;
  wordCount: number | null;
  createdAt: Date;
  holdReason: string | null;
}

async function getDrafts(): Promise<DraftRow[]> {
  try {
    const drafts = await prisma.generatedGuide.findMany({
      where: { status: 'draft' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        titleHe: true,
        metaDescription: true,
        category: true,
        factCheckScore: true,
        seoScore: true,
        wordCount: true,
        createdAt: true,
      },
    });
    if (drafts.length === 0) return [];

    type DraftSelect = Omit<DraftRow, 'holdReason'>;
    type JobSelect = { generatedGuideId: string | null; error: string | null };

    // The gate wrote WHY it held the article on the writing job row.
    const jobs = await prisma.writingJob.findMany({
      where: { generatedGuideId: { in: drafts.map((d: DraftSelect) => d.id) } },
      select: { generatedGuideId: true, error: true },
    });
    const reasonByGuide = new Map(jobs.map((j: JobSelect) => [j.generatedGuideId, j.error]));

    return drafts.map((d: DraftSelect) => ({ ...d, holdReason: reasonByGuide.get(d.id) ?? null }));
  } catch {
    return [];
  }
}

function ScoreBadge({ label, score }: { label: string; score: number | null }) {
  const tone =
    score === null
      ? 'bg-slate-100 text-slate-500 border-slate-200'
      : score >= 60
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-amber-50 text-amber-800 border-amber-200';
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      {label}: {score ?? '—'}
    </span>
  );
}

export default async function DraftsPage() {
  const drafts = await getDrafts();

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10" dir="rtl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">טיוטות של דוד — ממתינות לאישור</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          מאמרים שדוד סיים לכתוב אבל שער האיכות עצר (ציון נמוך מ-60 או הפרת כללי כתיבה).
          הם לא נראים באתר, בגוגל או ב-LLMs עד שתאשר. פרסום מפעיל אוטומטית IndexNow ומייל לקטרין עם פוסט מוכן.
        </p>
      </header>

      {drafts.length === 0 ? (
        <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
          אין טיוטות שממתינות לאישור. כשדוד יכתוב מאמר שייעצר בשער האיכות — הוא יופיע כאן
          (וגם בדוח היומי במייל).
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((d) => (
            <article key={d.id} className="rounded-xl border-2 border-slate-200 bg-white p-5">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                  {d.category}
                </span>
                <ScoreBadge label="Fact-check" score={d.factCheckScore} />
                <ScoreBadge label="SEO" score={d.seoScore} />
                {d.wordCount && <span className="text-xs text-slate-500">{d.wordCount} מילים</span>}
                <span className="text-xs text-slate-400">
                  {new Date(d.createdAt).toLocaleDateString('he-IL')}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900">{d.titleHe}</h2>
              <p className="mt-1 text-sm text-slate-600">{d.metaDescription}</p>

              {d.holdReason && (
                <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  <strong>למה נעצר:</strong> {d.holdReason}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`/admin/drafts/${d.id}`}
                  className="rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  👁 תצוגה מקדימה מלאה
                </Link>
                <form
                  action={async () => {
                    'use server';
                    await publishDraftAction(d.id);
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    ✅ פרסם עכשיו
                  </button>
                </form>
                <form
                  action={async () => {
                    'use server';
                    await discardDraftAction(d.id);
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-lg border-2 border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    🗑 דחה
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
