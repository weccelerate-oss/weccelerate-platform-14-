/**
 * Admin — read-only view of entrepreneurs' journey answers.
 *
 * /admin/journey/answers            → list of entrepreneurs with progress
 * /admin/journey/answers?user=<id>  → that user's answers, chapter by chapter
 *
 * Read-only by design: answers belong to the entrepreneur. This exists so the
 * team can prepare for coaching meetings ("בתחילת כל פגישה נוודא שעברתם על
 * השאלות" — straight from the workbook's intro).
 */

import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getAdminJourney } from '@/lib/journey/repository';
import { ArrowRight, CheckCircle2, Circle, User as UserIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function JourneyAnswersPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const { user: userId } = await searchParams;

  if (!userId) {
    return <UsersOverview />;
  }
  return <UserAnswers userId={userId} />;
}

async function UsersOverview() {
  const [chapters, users] = await Promise.all([
    getAdminJourney(),
    prisma.user.findMany({
      where: { role: 'ENTREPRENEUR', isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        _count: { select: { journeyAnswers: true } },
        journeyAnswers: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
          select: { updatedAt: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  const totalQuestions = chapters.reduce((s: number, c) => s + c.questions.length, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      <Link
        href="/admin/journey"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowRight className="w-4 h-4" />
        לניהול המסע
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">תשובות היזמים</h1>
      <p className="text-sm text-slate-500 mb-6">
        צפייה בלבד — להכנת פגישות ליווי. {totalQuestions} שאלות במסע.
      </p>

      <div className="space-y-2">
        {users.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            אין עדיין יזמים פעילים במערכת.
          </div>
        )}
        {users.map((u: any) => {
          const answered = u._count?.journeyAnswers ?? 0;
          const pct = totalQuestions ? Math.round((answered / totalQuestions) * 100) : 0;
          const lastAt = u.journeyAnswers?.[0]?.updatedAt as Date | undefined;
          return (
            <Link
              key={u.id}
              href={`/admin/journey/answers?user=${u.id}`}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm hover:border-amber-300 hover:shadow transition"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 grid place-items-center shrink-0">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 truncate">
                  {u.name}
                  {u.company && <span className="text-slate-400 font-normal text-sm mr-2">· {u.company}</span>}
                </div>
                <div className="text-xs text-slate-400 truncate">{u.email}</div>
              </div>
              <div className="text-left shrink-0">
                <div className="text-sm font-bold text-amber-700 tabular-nums">
                  {answered}/{totalQuestions} · {pct}%
                </div>
                <div className="text-[11px] text-slate-400">
                  {lastAt ? `פעילות אחרונה: ${new Date(lastAt).toLocaleDateString('he-IL')}` : 'טרם התחיל'}
                </div>
              </div>
              <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden shrink-0">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-amber-500 to-amber-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

async function UserAnswers({ userId }: { userId: string }) {
  const [chapters, user, answers] = await Promise.all([
    getAdminJourney(),
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, company: true },
    }),
    prisma.userJourneyAnswer.findMany({
      where: { userId },
      select: { questionId: true, content: true, status: true, updatedAt: true },
    }),
  ]);

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto" dir="rtl">
        <p className="text-slate-500">היזם לא נמצא.</p>
      </div>
    );
  }

  const byQuestion = new Map<string, { content: string; status: string; updatedAt: Date }>(
    answers.map((a: any) => [a.questionId, a]),
  );

  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      <Link
        href="/admin/journey/answers"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowRight className="w-4 h-4" />
        לכל היזמים
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">
        המסע של {user.name}
        {user.company && <span className="text-slate-400 font-normal text-lg"> · {user.company}</span>}
      </h1>
      <p className="text-sm text-slate-500 mb-6">{user.email} · צפייה בלבד</p>

      <div className="space-y-5">
        {chapters.map((chapter, ci) => {
          const done = chapter.questions.filter((q) => {
            const a = byQuestion.get(q.id);
            return a && a.content.trim().length > 0;
          }).length;
          return (
            <div key={chapter.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <div className="font-bold text-slate-800">
                  {ci + 1}. {chapter.name}
                </div>
                <div className="text-xs text-slate-400 tabular-nums">
                  {done}/{chapter.questions.length} נענו
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {chapter.questions.map((q) => {
                  const a = byQuestion.get(q.id);
                  const has = a && a.content.trim().length > 0;
                  return (
                    <div key={q.id} className="px-5 py-3">
                      <div className="flex items-start gap-2">
                        {has ? (
                          a!.status === 'READY' ? (
                            <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                          )
                        ) : (
                          <Circle className="w-4 h-4 text-slate-200 mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-700">{q.prompt}</div>
                          {has ? (
                            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 mt-1.5 whitespace-pre-line">
                              {a!.content}
                            </p>
                          ) : (
                            <p className="text-xs text-slate-300 mt-1">— טרם נענה —</p>
                          )}
                        </div>
                        {has && a!.status === 'READY' && (
                          <span className="text-[10px] rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 shrink-0">
                            מוכן להצגה
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
