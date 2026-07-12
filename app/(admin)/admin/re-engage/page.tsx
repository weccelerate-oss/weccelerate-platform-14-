/**
 * /admin/re-engage — one-click re-engagement of dormant entrepreneurs.
 *
 * Shows exactly who will receive the "your course content is waiting in the
 * portal" email (veteran welcome variant + fresh temp password), and sends
 * only when the admin clicks. Safe to re-run: anyone emailed in the last 30
 * days is skipped automatically.
 */

import type { Metadata } from 'next';
import { getEligibleUsers, reEngageBatchAction } from './actions';

export const metadata: Metadata = {
  title: 'החייאת יזמים רדומים | מערכת ניהול WeCcelerate',
};

export const dynamic = 'force-dynamic';
// The batch is sequential (bcrypt + Resend per user) — ~1s per entrepreneur.
export const maxDuration = 300;

export default async function ReEngagePage() {
  const { toSend, skippedRecentlySent } = await getEligibleUsers();

  return (
    <div className="mx-auto max-w-3xl p-6 md:p-10" dir="rtl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">החייאת יזמים רדומים</h1>
        <p className="mt-2 text-slate-600">
          שליחת מייל &quot;כניסה בקליק אחד&quot; לכל יזם שקיבל חשבון בפורטל אבל מעולם לא נכנס.
          הכפתור במייל מכניס אותו ישר לפורטל — <strong>בלי סיסמה חדשה ובלי שום שינוי בפרטים
          הקיימים שלו</strong>. הקישור אישי ותקף ל-14 יום.
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border-2 border-slate-200 bg-white p-5 text-center">
          <div className="text-4xl font-bold text-slate-900">{toSend.length}</div>
          <div className="mt-1 text-sm text-slate-500">יקבלו את המייל עכשיו</div>
        </div>
        <div className="rounded-xl border-2 border-slate-200 bg-white p-5 text-center">
          <div className="text-4xl font-bold text-slate-400">{skippedRecentlySent}</div>
          <div className="mt-1 text-sm text-slate-500">ידולגו (קיבלו ב-30 הימים האחרונים)</div>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>לפני הלחיצה:</strong> השליחה היא לכל הרשימה בבת אחת ואי אפשר לבטל מייל שיצא.
        התהליך רץ ~{Math.ceil(toSend.length / 60)} דקות; אל תסגור את העמוד. אפשר להריץ שוב
        בבטחה — מי שכבר קיבל ידולג.
      </div>

      {toSend.length > 0 ? (
        <form
          action={async () => {
            'use server';
            await reEngageBatchAction();
          }}
        >
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 px-6 py-4 text-lg font-bold text-white hover:bg-emerald-700"
          >
            📩 שלח מייל כניסה ל-{toSend.length} יזמים
          </button>
        </form>
      ) : (
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-800">
          אין יזמים רדומים לשליחה כרגע 🎉
        </div>
      )}

      <details className="mt-8">
        <summary className="cursor-pointer text-sm font-semibold text-slate-600">
          מי ברשימה? ({toSend.length})
        </summary>
        <ul className="mt-3 max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {toSend.map((u: { id: string; email: string; name: string }) => (
            <li key={u.id} className="border-b border-slate-100 py-1 last:border-0">
              {u.name} · <span className="text-slate-500" dir="ltr">{u.email}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
