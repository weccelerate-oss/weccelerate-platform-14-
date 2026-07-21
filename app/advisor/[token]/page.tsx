/**
 * Advisor review page — opened from the signed email link, no login needed.
 * Shows the entrepreneur's answer + כוכבי's AI feedback + the conversation
 * thread, with a reply box. Token-gated (30-day HMAC link bound to the
 * advisor's email and the specific answer).
 */

import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { verifyAdvisorToken } from '@/lib/journey/advisor-token';
import { AdvisorReviewClient } from './review-client';

export const metadata: Metadata = {
  title: 'משוב ליזם | WeCcelerate',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function AdvisorReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const verified = verifyAdvisorToken(token);

  if (!verified) {
    return (
      <Shell>
        <div className="text-center py-16">
          <h1 className="text-xl font-bold text-white mb-2">הקישור פג תוקף</h1>
          <p className="text-white/50 text-sm">בקש מהיזם לשלוח את הבקשה מחדש, או פנה לצוות.</p>
        </div>
      </Shell>
    );
  }

  const answer = await prisma.userJourneyAnswer.findUnique({
    where: { id: verified.answerId },
    include: {
      user: { select: { name: true, company: true, advisorEmail: true } },
      question: { include: { chapter: { select: { name: true } } } },
      comments: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!answer || (answer.user?.advisorEmail ?? '').toLowerCase() !== verified.advisorEmail) {
    return (
      <Shell>
        <div className="text-center py-16">
          <h1 className="text-xl font-bold text-white mb-2">הקישור אינו תקף</h1>
          <p className="text-white/50 text-sm">ייתכן שהשיוך ליזם השתנה. פנה לצוות.</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <AdvisorReviewClient
        token={token}
        advisorEmail={verified.advisorEmail}
        entrepreneur={{ name: answer.user?.name ?? 'היזם', company: answer.user?.company ?? null }}
        chapterName={answer.question?.chapter?.name ?? ''}
        questionPrompt={answer.question?.prompt ?? ''}
        answerContent={answer.content ?? ''}
        answerStatus={answer.status}
        aiFeedback={answer.aiFeedback ?? null}
        comments={(answer.comments ?? []).map((c: any) => ({
          id: c.id,
          authorType: c.authorType,
          authorName: c.authorName,
          body: c.body,
          createdAt: c.createdAt.toISOString(),
        }))}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070b1e] text-white" dir="rtl">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(800px 400px at 85% -5%, rgba(200,169,81,0.10), transparent 60%), radial-gradient(600px 400px at -5% 40%, rgba(63,86,201,0.10), transparent 60%)',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-2.5 mb-8">
          <img src="/images/weccelerate-gold-trimmed.png" alt="WeCcelerate" className="h-9 w-auto" />
          <span className="text-[11px] tracking-[0.24em] text-[#c8a951] font-bold">מסע מרעיון למיזם · משוב מלווה</span>
        </div>
        {children}
      </div>
    </div>
  );
}
