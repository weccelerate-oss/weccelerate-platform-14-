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
  const { counts, lastSuccess, lastFailure, lastSpamBlock, daysSinceLastEvent } = data;
  const totalHits =
    counts.provisioned +
    counts.spamBlocked +
    counts.unauthorized +
    counts.validationFailed;
  const noActivity = totalHits === 0;
  const onlyFailures = totalHits > 0 && counts.provisioned === 0;
  const onlySpamBlocks =
    counts.provisioned === 0 &&
    counts.spamBlocked > 0 &&
    counts.unauthorized === 0 &&
    counts.validationFailed === 0;

  // Pick the most informative state for the header banner.
  const state: 'healthy' | 'warning' | 'spam-only' | 'broken' = noActivity
    ? 'broken'
    : onlySpamBlocks
      ? 'spam-only'
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
    'spam-only': {
      bg: 'bg-amber-50 border-amber-200',
      icon: '🛡️',
      title: 'החיבור עובד — כל הפניות נחסמו כספאם',
      body:
        'ה-Apps Script מצליח לקרוא לוובהוק (סימן טוב), אבל מסנן הספאם דחה את התוכן. ' +
        'בדוק את הסיבות מטה — אם זאת היתה פנייה אמיתית, אפשר להוסיף את היזם ידנית או להרגיע את הסינון.',
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

      {/* Last spam block — shows EXACTLY why the filter said no, so the
          admin can tell a real spam from a misclassified legit submission. */}
      {lastSpamBlock && (
        <div className="px-4 sm:px-5 py-3 border-t border-slate-100 bg-amber-50/40">
          <div className="flex items-baseline gap-2 mb-1.5">
            <p className="text-xs font-medium text-amber-900">
              🛡️ פנייה אחרונה שנחסמה כספאם
            </p>
            <p className="text-xs text-amber-700/70">
              {formatRelative(lastSpamBlock.at)}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-900 mb-2">
            {lastSpamBlock.name && (
              <p>
                <span className="text-slate-500 text-xs">שם:</span>{' '}
                <span className="font-medium">{lastSpamBlock.name}</span>
              </p>
            )}
            {lastSpamBlock.email && (
              <p>
                <span className="text-slate-500 text-xs">אימייל:</span>{' '}
                <span className="font-mono text-xs">{lastSpamBlock.email}</span>
              </p>
            )}
            {lastSpamBlock.score !== null && (
              <p>
                <span className="text-slate-500 text-xs">ציון חשד:</span>{' '}
                <span className="font-bold text-amber-700">{lastSpamBlock.score}</span>
              </p>
            )}
          </div>
          {lastSpamBlock.reasons.length > 0 && (
            <div className="mb-1">
              <p className="text-xs text-slate-500 mb-1">סיבות:</p>
              <ul className="space-y-0.5">
                {lastSpamBlock.reasons.map((reason, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {lastSpamBlock.codes.length > 0 && (
            <p className="text-[10px] text-slate-400 mt-2 font-mono">
              codes: {lastSpamBlock.codes.join(', ')}
            </p>
          )}
          <p className="text-xs text-amber-800/80 mt-2.5 leading-relaxed">
            💡 <strong>אם זאת היתה פנייה אמיתית של יזם</strong> — אפשר להוסיף את היזם ידנית
            דרך &ldquo;הוסף משתמש&rdquo; למעלה. הספאם פילטר נועד לחסום בוטים ומיילים זמניים
            (למשל <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">@example.com</code>),
            אז אימייל אמיתי של יזם (<code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">@gmail.com</code>,
            <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">@startup.co.il</code> וכו׳)
            <strong> לא ייחסם</strong>.
          </p>
        </div>
      )}

      {/* "How do I test this?" — most admins land here right after a test
          run and wonder why nothing appears. Spell it out. */}
      <details className="border-t border-slate-100 group">
        <summary className="cursor-pointer px-4 sm:px-5 py-3 text-sm text-slate-600 hover:bg-slate-50 select-none">
          🧪 איך בודקים שהחיבור עובד?
        </summary>
        <div className="px-4 sm:px-5 pb-4 text-sm text-slate-700 space-y-3 leading-relaxed">
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
            <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono self-start whitespace-nowrap" dir="ltr">verifySetup()</code>
            <div>
              <p className="text-slate-900">בודק שה-secret קיים ושה-API נגיש.</p>
              <p className="text-xs text-slate-500">
                לא יוצר כלום ולא משאיר עקבות. תוצאה צפויה: <code className="text-[10px] bg-slate-100 px-1 rounded">✅ Setup OK</code> בלוג של Apps Script.
              </p>
            </div>

            <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono self-start whitespace-nowrap" dir="ltr">testDryRun()</code>
            <div>
              <p className="text-slate-900">מריץ את כל הצינור (auth + ספאם + ולידציה) <strong>בלי</strong> ליצור משתמש.</p>
              <p className="text-xs text-slate-500">
                ⚠️ <strong>לא מופיע בלוח הזה</strong> בכוונה — dry-run לא כותב ל-Activity Log. תוצאה צפויה: <code className="text-[10px] bg-slate-100 px-1 rounded">200 dryRun:true would have provisioned</code>.
              </p>
            </div>

            <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono self-start whitespace-nowrap" dir="ltr">testWebhook()</code>
            <div>
              <p className="text-slate-900">בדיקה אמיתית — <strong>יוצר משתמש</strong> ומפעיל את מייל קבלת הפנים.</p>
              <p className="text-xs text-slate-500">
                המונה &ldquo;יזמים נוצרו&rdquo; יזוז ב-+1, ויופיע משתמש חדש בטבלה למטה. אחר כך אפשר למחוק אותו.
              </p>
            </div>

            <span className="text-xl self-start">📋</span>
            <div>
              <p className="text-slate-900">מילוי טופס Google אמיתי על-ידי יועץ.</p>
              <p className="text-xs text-slate-500">
                זאת הזרימה האמיתית. הטריגר <code className="text-[10px] bg-slate-100 px-1 rounded" dir="ltr">handleFormSubmit · On form submit</code> חייב להיות מחובר ב-Apps Script (Triggers).
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>ה-Apps Script המעודכן</strong> כולל את שלוש הפונקציות הנ&quot;ל +
              retry על 5xx + התראת מייל למנהל. הקובץ נמסר בעבר;
              אם השתנה — בקש את הגרסה הנוכחית מהמפתח.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              ה-secret מצוי ב-Vercel תחת <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded font-mono">ONBOARDING_WEBHOOK_SECRET</code>,
              ובאותו שם ב-Apps Script → Project Settings → Script properties.
            </p>
          </div>
        </div>
      </details>
    </section>
  );
}
