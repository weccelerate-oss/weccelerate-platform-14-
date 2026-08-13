'use client';

/**
 * Advisor roster management — add, rename, re-address, activate/deactivate.
 *
 * Matches the light admin chrome used by /admin/users rather than the dark
 * portal theme.
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Check,
  Inbox,
  Mail,
  Pencil,
  Plus,
  Send,
  UserCog,
  UserRound,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  createAdvisorAction,
  updateAdvisorAction,
  setAdvisorActiveAction,
  sendAdvisorOnboardingAction,
} from '../actions';

export interface AdvisorRow {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  advisees: number;
  waiting: number;
  lastLoginAt: string | null;
  neverSignedIn: boolean;
  mustChangePassword: boolean;
}

export function AdvisorsClient({
  advisors,
  unassignedInvestorPrep,
}: {
  advisors: AdvisorRow[];
  unassignedInvestorPrep: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<{ email: string; password: string } | null>(null);

  const active = advisors.filter((a) => a.isActive);
  const totalWaiting = advisors.reduce((sum, a) => sum + a.waiting, 0);

  const create = (name: string, email: string) => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const res = await createAdvisorAction({ name, email });
      if (!res.success) {
        setError(res.error ?? 'יצירת המלווה נכשלה');
        return;
      }
      setAdding(false);
      if ('reactivated' in res && res.reactivated) {
        setNotice('החשבון כבר היה קיים כמלווה — הופעל מחדש והשם עודכן.');
      } else if (res.emailSent) {
        setNotice(`${name} נוצר/ה ופרטי הכניסה נשלחו ל-${email}.`);
      } else {
        setTempPassword({ email, password: res.tempPassword ?? '' });
        setError(
          res.emailError
            ? `החשבון נוצר אבל שליחת המייל נכשלה (${res.emailError}) — העבר את הסיסמה ידנית.`
            : 'החשבון נוצר אבל המייל לא נשלח — העבר את הסיסמה ידנית.',
        );
      }
      router.refresh();
    });
  };

  const update = (id: string, name: string, email: string) => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const res = await updateAdvisorAction(id, { name, email });
      if (!res.success) {
        setError(res.error ?? 'העדכון נכשל');
        return;
      }
      setEditingId(null);
      router.refresh();
    });
  };

  const sendOnboarding = (advisor: AdvisorRow) => {
    const ok = window.confirm(
      `לשלוח ל${advisor.name} מייל הצטרפות עם פרטי כניסה?\n\nהסיסמה הנוכחית תוחלף בסיסמה זמנית חדשה שתופיע במייל.`,
    );
    if (!ok) return;
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const res = await sendAdvisorOnboardingAction(advisor.id);
      if (!res.success) {
        setError(res.error ?? 'השליחה נכשלה');
        return;
      }
      if (res.emailSent) {
        setNotice(`מייל ההצטרפות נשלח ל-${advisor.email} עם סיסמה זמנית חדשה.`);
      } else {
        setTempPassword({ email: advisor.email, password: res.tempPassword ?? '' });
        setError(
          res.emailError
            ? `שליחת המייל נכשלה (${res.emailError}) — הסיסמה הוחלפה, העבר אותה ידנית.`
            : 'המייל לא נשלח — הסיסמה הוחלפה, העבר אותה ידנית.',
        );
      }
      router.refresh();
    });
  };

  const toggleActive = (advisor: AdvisorRow) => {
    const next = !advisor.isActive;
    if (!next && advisor.advisees > 0) {
      const ok = window.confirm(
        `ל${advisor.name} משויכים ${advisor.advisees} יזמים. השבתה תשחרר אותם ותצטרך לשייך להם מלווה אחר. להמשיך?`,
      );
      if (!ok) return;
    }
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const res = await setAdvisorActiveAction(advisor.id, next);
      if (!res.success) {
        setError(res.error ?? 'הפעולה נכשלה');
        return;
      }
      if (!next && res.released) {
        setNotice(`${advisor.name} הושבת/ה. ${res.released} יזמים שוחררו וממתינים לשיוך מלווה חדש.`);
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCog className="w-6 h-6 text-royal-500" />
            מלווים
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            המלווים שאפשר לשייך ליזמים בתוכנית ההכנה למשקיעים. הם נכנסים לאזור המלווה שלהם ב-
            <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">/advisor</code> ועונים ליזמים משם.
          </p>
        </div>
        <button
          onClick={() => {
            setAdding(true);
            setEditingId(null);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          מלווה חדש
        </button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="מלווים פעילים" value={active.length} icon={<UserRound className="w-4 h-4" />} />
        <StatCard
          label="פניות שממתינות למענה"
          value={totalWaiting}
          icon={<Inbox className="w-4 h-4" />}
          alert={totalWaiting > 0}
        />
        <StatCard
          label="יזמי תוכנית משקיעים ללא מלווה"
          value={unassignedInvestorPrep}
          icon={<AlertTriangle className="w-4 h-4" />}
          alert={unassignedInvestorPrep > 0}
        />
      </div>

      {unassignedInvestorPrep > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          יש {unassignedInvestorPrep} יזמים בתוכנית ההכנה למשקיעים בלי מלווה משויך — הם לא יכולים לבקש חוות דעת
          אנושית. השיוך נעשה במסך{' '}
          <a href="/admin/users" className="font-semibold underline">
            היזמים
          </a>
          .
        </div>
      )}

      {notice && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex items-start justify-between gap-3">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 flex items-start justify-between gap-3">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {tempPassword && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-sm font-medium text-amber-800 mb-1">
            סיסמה זמנית ל-{tempPassword.email} — מוצגת פעם אחת בלבד
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white px-3 py-2 rounded border border-amber-200 font-mono text-lg select-all">
              {tempPassword.password}
            </code>
            <button
              onClick={() => setTempPassword(null)}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer"
            >
              סגור
            </button>
          </div>
        </div>
      )}

      {/* roster */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {adding && (
          <AdvisorForm
            title="מלווה חדש"
            submitLabel="צור ושלח פרטי כניסה"
            busy={isPending}
            onCancel={() => setAdding(false)}
            onSubmit={create}
          />
        )}

        {advisors.length === 0 && !adding ? (
          <div className="p-12 text-center">
            <UserCog className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">עוד לא הוגדרו מלווים</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {advisors.map((advisor) =>
              editingId === advisor.id ? (
                <AdvisorForm
                  key={advisor.id}
                  title={`עריכת ${advisor.name}`}
                  submitLabel="שמור"
                  busy={isPending}
                  initialName={advisor.name}
                  initialEmail={advisor.email}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(name, email) => update(advisor.id, name, email)}
                />
              ) : (
                <div
                  key={advisor.id}
                  className={cn(
                    'p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors',
                    !advisor.isActive && 'opacity-60',
                  )}
                >
                  <div
                    className={cn(
                      'w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0',
                      advisor.isActive ? 'bg-gradient-to-br from-purple-500 to-royal-500' : 'bg-slate-400',
                    )}
                  >
                    {advisor.name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-sm sm:text-base text-slate-900">{advisor.name}</h3>
                      {!advisor.isActive && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-500">
                          לא פעיל
                        </span>
                      )}
                      {advisor.isActive && advisor.neverSignedIn && (
                        <span
                          title="החשבון נוצר אבל המלווה עוד לא נכנס לאזור המלווה"
                          className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200"
                        >
                          טרם נכנס
                        </span>
                      )}
                      {advisor.waiting > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200">
                          {advisor.waiting} ממתינות למענה
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                      <span className="inline-flex items-center gap-1" dir="ltr">
                        <Mail className="w-3 h-3" />
                        {advisor.email}
                      </span>
                      <span>{advisor.advisees} יזמים משויכים</span>
                      {advisor.lastLoginAt && (
                        <span>כניסה אחרונה: {new Date(advisor.lastLoginAt).toLocaleDateString('he-IL')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => sendOnboarding(advisor)}
                      disabled={isPending || !advisor.isActive}
                      title="שלח מייל הצטרפות — פרטי כניסה ומה התפקיד כולל (מחליף את הסיסמה)"
                      className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(advisor.id);
                        setAdding(false);
                      }}
                      disabled={isPending}
                      title="ערוך שם או כתובת מייל"
                      className="p-2 rounded-lg text-slate-400 hover:text-royal-600 hover:bg-royal-50 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleActive(advisor)}
                      disabled={isPending}
                      title={advisor.isActive ? 'השבת מלווה' : 'הפעל מלווה'}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-40',
                        advisor.isActive
                          ? 'text-slate-500 hover:bg-slate-100'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100',
                      )}
                    >
                      {advisor.isActive ? 'השבת' : 'הפעל'}
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AdvisorForm({
  title,
  submitLabel,
  busy,
  initialName = '',
  initialEmail = '',
  onSubmit,
  onCancel,
}: {
  title: string;
  submitLabel: string;
  busy: boolean;
  initialName?: string;
  initialEmail?: string;
  onSubmit: (name: string, email: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const valid = name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid && !busy) onSubmit(name.trim(), email.trim());
      }}
      className="p-4 bg-slate-50 border-b border-slate-200"
    >
      <div className="text-sm font-medium text-slate-700 mb-3">{title}</div>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="שם מלא (כפי שהיזם יראה)"
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-400"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="advisor@weccelerate.co.il"
          dir="ltr"
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-400"
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={!valid || busy}
            className="flex items-center gap-1.5 px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            {busy ? 'שומר...' : submitLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            ביטול
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-2">
        השם הוא מה שהיזם רואה בשיחה — לא כתובת המייל.
      </p>
    </form>
  );
}

function StatCard({
  label,
  value,
  icon,
  alert,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3',
        alert ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200',
      )}
    >
      <div className={cn('flex items-center gap-1.5', alert ? 'text-amber-700' : 'text-slate-400')}>
        {icon}
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <div className={cn('text-2xl font-bold mt-1', alert ? 'text-amber-800' : 'text-slate-900')}>{value}</div>
    </div>
  );
}
