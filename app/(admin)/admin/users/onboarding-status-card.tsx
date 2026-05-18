/**
 * Onboarding Webhook Status Card
 *
 * Shows the admin whether the Google-Form → /api/onboarding/entrepreneur
 * pipeline is actually firing. The most common failure mode is "no
 * Apps Script wired up on the form" — that produces zero webhook hits
 * at all, which this widget surfaces with a big "אין פעילות" warning
 * instead of looking like everything is fine.
 */

import type { OnboardingActivity } from './page';

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return 'הרגע';
  if (mins < 60) return `לפני ${mins} דקות`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  const days = Math.floor(hours / 24);
  return `לפני ${days} ימים`;
}

const ACTION_LABELS: Record<string, string> = {
  'onboarding.unauthorized': 'ניסיון חיבור עם secret שגוי',
  'onboarding.validation_failed': 'שדות חסרים/שגויים בקריאה',
  'user.welcome_email_failed': 'משלוח מייל קבלת פנים נכשל',
};

export function OnboardingStatusCard({ data }: { data: OnboardingActivity }) {
  const { counts, lastSuccess, lastFailure, daysSinceLastEvent } = data;
  const totalHits =
    counts.provisioned +
    counts.spamBlocked +
    counts.unauthorized +
    counts.validationFailed;
  const noActivity = totalHits === 0;
  const onlyFailures = totalHits > 0 && counts.provisioned === 0;

  // Pick the most informative state for the header banner.
  const state: 'healthy' | 'warning' | 'broken' = noActivity
    ? 'broken'
    : onlyFailures
      ? 'warning'
      : 'healthy';

  const banner = {
    healthy: {
      bg: 'bg-emerald-50 border-emerald-200',
      icon: '🟢',
      title: 'חיבור הטופס פעיל',
      body: lastSuccess
        ? `יזם אחרון נוצר ${formatRelative(lastSuccess.at)} (${lastSuccess.email ?? 'ללא אימייל'})`
        : 'הוובהוק מקבל פניות',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      icon: '⚠️',
      title: 'הוובהוק מקבל פניות — אבל אף יזם לא נוצר',
      body: 'בדוק את ההתראות מטה. אולי כל הפניות נחסמו כספאם, נדחו על אימות, או נכשלו בוולידציה.',
    },
    broken: {
      bg: 'bg-rose-50 border-rose-200',
      icon: '🔴',
      title: 'לא התקבלה פנייה אחת ל-webhook ב-30 ימים האחרונים',
      body: 'כנראה שאוטומציית הטופס (Apps Script / Zapier) אינה מחוברת, או שהיא קוראת לכתובת/secret שגויים. שלח טופס לדוגמה ובדוק שוב כעת.',
    },
  }[state];

  return (
    <section className="mb-8 bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Status banner */}
      <div className={`${banner.bg} border-b px-4 sm:px-5 py-3 sm:py-4`}>
        <div className="flex items-start gap-3">
          <div className="text-xl leading-none mt-0.5">{banner.icon}</div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 text-sm sm:text-base">
              {banner.title}
            </p>
            <p className="text-xs sm:text-sm text-slate-700 mt-0.5">{banner.body}</p>
          </div>
          {daysSinceLastEvent !== null && (
            <span
              className="text-xs text-slate-500 tabular-nums whitespace-nowrap flex-shrink-0"
              title="מתי הייתה הפעילות האחרונה (כל סוג)"
            >
              פעילות אחרונה: לפני {daysSinceLastEvent} ימים
            </span>
          )}
        </div>
      </div>

      {/* Counts grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100">
        <div className="bg-white p-3 sm:p-4">
          <p className="text-xl sm:text-2xl font-bold text-emerald-700">{counts.provisioned}</p>
          <p className="text-xs text-slate-500 mt-0.5">יזמים נוצרו</p>
        </div>
        <div className="bg-white p-3 sm:p-4">
          <p className="text-xl sm:text-2xl font-bold text-slate-700">{counts.spamBlocked}</p>
          <p className="text-xs text-slate-500 mt-0.5">נחסמו כספאם</p>
        </div>
        <div className="bg-white p-3 sm:p-4">
          <p
            className={`text-xl sm:text-2xl font-bold ${counts.unauthorized > 0 ? 'text-rose-700' : 'text-slate-700'}`}
          >
            {counts.unauthorized}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">נדחו על אימות</p>
        </div>
        <div className="bg-white p-3 sm:p-4">
          <p
            className={`text-xl sm:text-2xl font-bold ${counts.validationFailed > 0 ? 'text-rose-700' : 'text-slate-700'}`}
          >
            {counts.validationFailed}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">שגיאות שדות</p>
        </div>
      </div>

      {/* Last failure detail — only when there is one in the window */}
      {lastFailure && (
        <div className="px-4 sm:px-5 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-1">תקלה אחרונה</p>
          <p className="text-sm text-slate-900">
            <span className="font-medium">
              {ACTION_LABELS[lastFailure.action] ?? lastFailure.action}
            </span>
            {' · '}
            <span className="text-slate-500">{formatRelative(lastFailure.at)}</span>
          </p>
          {lastFailure.detail && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{lastFailure.detail}</p>
          )}
        </div>
      )}

      {/* Setup guide — collapsed by default */}
      <details className="border-t border-slate-100 group">
        <summary className="cursor-pointer px-4 sm:px-5 py-3 text-sm text-slate-600 hover:bg-slate-50 select-none">
          🛠️ איך לחבר את ה-Google Form ל-webhook?
        </summary>
        <div className="px-4 sm:px-5 pb-4 text-sm text-slate-700 space-y-2 leading-relaxed">
          <p>
            Google Forms לא קוראים ל-webhook לבד. צריך להוסיף Apps Script שיריץ
            על כל סליחת טופס.
          </p>
          <ol className="list-decimal pr-5 space-y-1">
            <li>בעורך הטופס: <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">⋮ → Script editor</code></li>
            <li>הדבק את הקוד הבא (החלף את <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">SECRET_HERE</code>):</li>
          </ol>
          <pre className="bg-slate-900 text-slate-100 text-[11px] sm:text-xs p-3 rounded-lg overflow-x-auto leading-relaxed" dir="ltr">{`function onFormSubmit(e) {
  var items = e.response.getItemResponses();
  var payload = { name: '', email: '', phone: '', company: '', message: '' };
  items.forEach(function(it) {
    var q = it.getItem().getTitle().toLowerCase();
    var v = it.getResponse();
    if (q.indexOf('שם') > -1) payload.name = v;
    else if (q.indexOf('מייל') > -1 || q.indexOf('email') > -1) payload.email = v;
    else if (q.indexOf('טלפון') > -1) payload.phone = v;
    else if (q.indexOf('חברה') > -1) payload.company = v;
    else payload.message = (payload.message ? payload.message + '\\n' : '') + q + ': ' + v;
  });
  payload.source = 'google_form';
  UrlFetchApp.fetch('https://weccelerate.co.il/api/onboarding/entrepreneur', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-onboarding-secret': 'SECRET_HERE' },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
}`}</pre>
          <ol className="list-decimal pr-5 space-y-1" start={3}>
            <li>שמור, ובחר <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">Triggers → Add Trigger → onFormSubmit → On form submit</code></li>
            <li>שלח טופס לדוגמה ובדוק את הסטטוס כאן.</li>
          </ol>
          <p className="text-xs text-slate-500 pt-1">
            ה-secret מצוי ב-Vercel תחת <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">ONBOARDING_WEBHOOK_SECRET</code>.
          </p>
        </div>
      </details>
    </section>
  );
}
