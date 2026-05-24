/**
 * Users Table Component
 * 
 * Table displaying all users with actions.
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  EyeOff,
  KeyRound,
  Trash2,
  Mail,
  Phone,
  Building2,
  ExternalLink,
  User as UserIcon,
  UserCheck,
  UserX,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleUserActiveAction, resetUserPasswordAction, deleteUserAction } from '../actions';
// AO-16: WelcomeEmailStatus is re-exported from page.tsx — single source of truth.
import type { WelcomeEmailStatus } from './page';
import type { User, Project, UserRole } from '@prisma/client';

// Re-export for downstream consumers (kept here so existing
// `import { WelcomeEmailStatus } from './users-table'` callers still work).
export type { WelcomeEmailStatus };

// AO-12: extend the User shape with the auto-provisioning columns the row
// renders, so the badge code no longer needs `as any` casts.
interface UserWithProjects extends User {
  projects: Pick<Project, 'id' | 'name' | 'status'>[];
  _count: { projects: number };
  welcomeEmail?: WelcomeEmailStatus;
  provisionedSource?: string | null;
  provisionedAt?: Date | null;
}

interface UsersTableProps {
  users: UserWithProjects[];
}

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'מנהל',
  ENTREPRENEUR: 'יזם',
  MENTOR: 'מנטור',
  INVESTOR: 'משקיע',
  PARTNER: 'שותף',
};

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  ENTREPRENEUR: 'bg-blue-100 text-blue-700',
  MENTOR: 'bg-purple-100 text-purple-700',
  INVESTOR: 'bg-emerald-100 text-emerald-700',
  PARTNER: 'bg-orange-100 text-orange-700',
};

export function UsersTable({ users }: UsersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loginFilter, setLoginFilter] = useState<
    | 'all'
    | 'logged-in'
    | 'email-sent-pending'
    | 'email-inferred-sent'
    | 'email-failed'
    | 'no-email'
    | 'never'
  >('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showTempPassword, setShowTempPassword] = useState<{
    id: string;
    password: string;
    emailSent: boolean;
    emailError?: string;
  } | null>(null);
  const [resetPasswordCopied, setResetPasswordCopied] = useState(false);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    const emailStatus = user.welcomeEmail?.status ?? 'none';
    const emailConfirmed = user.welcomeEmail?.confirmed ?? false;
    // AO-19: split "sent" by whether it's confirmed (real Resend log) or
    // inferred from provision metadata. The old "no-email" bucket mixed
    // both, which masked accounts that probably-but-not-certainly got
    // an email.
    const matchesLogin =
      loginFilter === 'all' ||
      (loginFilter === 'logged-in' && user.lastLoginAt) ||
      (loginFilter === 'email-sent-pending' &&
        emailStatus === 'sent' &&
        emailConfirmed === true &&
        !user.lastLoginAt) ||
      (loginFilter === 'email-inferred-sent' &&
        emailStatus === 'sent' &&
        emailConfirmed === false &&
        !user.lastLoginAt) ||
      (loginFilter === 'email-failed' && emailStatus === 'failed') ||
      (loginFilter === 'no-email' && emailStatus === 'none' && !user.lastLoginAt) ||
      (loginFilter === 'never' && !user.lastLoginAt);

    return matchesSearch && matchesRole && matchesStatus && matchesLogin;
  });

  const handleToggleActive = (user: UserWithProjects) => {
    setActionId(user.id);
    setOpenMenu(null);
    startTransition(async () => {
      try {
        const result = await toggleUserActiveAction(user.id, !user.isActive);
        if (!result.success) {
          alert(result.error || 'שגיאה בעדכון סטטוס המשתמש');
        }
      } catch (err) {
        alert('שגיאה בתקשורת עם השרת: ' + (err instanceof Error ? err.message : String(err)));
      }
      router.refresh();
      setActionId(null);
    });
  };

  const handleResetPassword = (userId: string) => {
    if (!confirm('האם אתה בטוח שברצונך לאפס את הסיסמה?')) return;

    setActionId(userId);
    setOpenMenu(null);
    startTransition(async () => {
      try {
        const result = await resetUserPasswordAction(userId);
        if (result.success && result.tempPassword) {
          setShowTempPassword({
            id: userId,
            password: result.tempPassword,
            emailSent: result.emailSent ?? false,
            emailError: result.emailError,
          });
          setResetPasswordCopied(false);
        } else if (!result.success) {
          alert(result.error || 'שגיאה באיפוס הסיסמה');
        }
      } catch (err) {
        alert('שגיאה בתקשורת עם השרת: ' + (err instanceof Error ? err.message : String(err)));
      }
      setActionId(null);
    });
  };

  // AO-13: copy temp password to clipboard with visual confirmation —
  // makes it less likely the admin loses the credential to a stray click.
  const handleCopyResetPassword = () => {
    if (!showTempPassword) return;
    navigator.clipboard.writeText(showTempPassword.password).then(
      () => {
        setResetPasswordCopied(true);
        setTimeout(() => setResetPasswordCopied(false), 2000);
      },
      () => {
        // Clipboard API can fail on insecure origins — fall back to a select-all hint.
        alert('לא ניתן להעתיק אוטומטית. סמן את הסיסמה ידנית והעתק.');
      },
    );
  };

  const handleDelete = (userId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק משתמש זה לצמיתות? כל הפרויקטים והקבצים שלו יימחקו.')) return;

    setActionId(userId);
    setOpenMenu(null);
    startTransition(async () => {
      try {
        const result = await deleteUserAction(userId);
        if (!result.success) {
          alert(result.error || 'שגיאה במחיקת המשתמש');
        }
      } catch (err) {
        alert('שגיאה בתקשורת עם השרת: ' + (err instanceof Error ? err.message : String(err)));
      }
      router.refresh();
      setActionId(null);
    });
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="חיפוש לפי שם, אימייל או חברה..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-500/20"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-500/20"
          >
            <option value="ALL">כל התפקידים</option>
            <option value="ENTREPRENEUR">יזמים</option>
            <option value="MENTOR">מנטורים</option>
            <option value="INVESTOR">משקיעים</option>
            <option value="PARTNER">שותפים</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-500/20"
          >
            <option value="all">כל הסטטוסים</option>
            <option value="active">פעילים</option>
            <option value="inactive">לא פעילים</option>
          </select>

          <select
            value={loginFilter}
            onChange={(e) => setLoginFilter(e.target.value as typeof loginFilter)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-500/20"
          >
            <option value="all">מצב כניסה: הכול</option>
            <option value="logged-in">נכנסו לפורטל</option>
            <option value="email-sent-pending">קיבלו מייל (מאומת) וטרם נכנסו</option>
            <option value="email-inferred-sent">הוזמנו (לוג חסר) וטרם נכנסו</option>
            <option value="email-failed">המייל נכשל</option>
            <option value="no-email">לא נשלח מייל</option>
            <option value="never">טרם נכנסו לפורטל</option>
          </select>
        </div>
      </div>

      {/* Temp password notification */}
      {showTempPassword && (
        <div className="m-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-amber-800 mb-1">סיסמה זמנית נוצרה</p>
              {/* Tell the admin whether the email actually went out — if it
                  did, manual copy/paste is just a backup. */}
              <p className="text-sm text-amber-700">
                {showTempPassword.emailSent
                  ? 'הסיסמה נשלחה במייל למשתמש. ההצגה כאן היא גיבוי בלבד.'
                  : showTempPassword.emailError
                    ? `שליחת המייל נכשלה (${showTempPassword.emailError}) — העתק את הסיסמה ושלח ידנית.`
                    : 'העתק את הסיסמה ושלח למשתמש. היא תוצג פעם אחת בלבד.'}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border border-amber-200 font-mono text-lg select-all">
                  {showTempPassword.password}
                </code>
                {/* AO-13: copy-to-clipboard so a backdrop or stray-click
                    accident doesn't lose the only copy of the credential. */}
                <button
                  type="button"
                  onClick={handleCopyResetPassword}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    resetPasswordCopied
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200',
                  )}
                >
                  {resetPasswordCopied ? 'הועתק ✓' : 'העתק'}
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowTempPassword(null)}
              className="text-amber-600 hover:text-amber-800 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <div className="p-12 text-center">
          <UserIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">לא נמצאו משתמשים</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={cn(
                'p-4 hover:bg-slate-50 transition-colors',
                isPending && actionId === user.id && 'opacity-50'
              )}
            >
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                {/* Avatar */}
                <div className={cn(
                  'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0',
                  user.isActive
                    ? 'bg-gradient-to-br from-royal-500 to-cyan-500'
                    : 'bg-slate-400'
                )}>
                  {user.name?.charAt(0) || 'U'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={cn(
                      'font-medium text-sm sm:text-base',
                      user.isActive ? 'text-slate-900' : 'text-slate-400'
                    )}>
                      {user.name}
                    </h3>
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full',
                      ROLE_COLORS[user.role]
                    )}>
                      {ROLE_LABELS[user.role]}
                    </span>
                    {!user.isActive && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-500">
                        לא פעיל
                      </span>
                    )}
                    {/* AO-12: provisionedSource / provisionedAt are now on
                        UserWithProjects, no `as any` needed. */}
                    {user.provisionedSource && (
                      <span
                        title={`נוצר אוטומטית מ-${user.provisionedSource}${user.provisionedAt ? ` ב-${new Date(user.provisionedAt).toLocaleDateString('he-IL')}` : ''}`}
                        className="px-2 py-0.5 text-xs font-medium rounded-full bg-violet-50 text-violet-700 border border-violet-200"
                      >
                        🤖 auto · {user.provisionedSource}
                      </span>
                    )}
                    {user.role === 'ENTREPRENEUR' && (() => {
                      const email = user.welcomeEmail;
                      if (user.lastLoginAt) {
                        return (
                          <span
                            title={`התחבר לאחרונה: ${new Date(user.lastLoginAt).toLocaleString('he-IL')}`}
                            className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            ✅ נכנס לפורטל
                          </span>
                        );
                      }
                      if (email?.status === 'sent') {
                        // The cohort the admin cares most about: the welcome
                        // message went out (confirmed by Resend log, or
                        // inferred from provisioning metadata for users that
                        // pre-date the logger). AO-7: when inferred, never
                        // claim "מייל נשלח" — say "הוזמן (לוג חסר)" so the
                        // admin knows the Resend log can't confirm delivery.
                        const sentAt = email.at ? new Date(email.at) : null;
                        const days = sentAt
                          ? Math.max(0, Math.floor((Date.now() - sentAt.getTime()) / 86_400_000))
                          : null;
                        const tooltipBase = email.confirmed
                          ? sentAt
                            ? `נשלח מייל ב-${sentAt.toLocaleString('he-IL')}${email.source ? ` (${email.source})` : ''}${days !== null ? ` · ${days} ימים ללא כניסה` : ''}`
                            : 'מייל קבלת פנים נשלח'
                          : `המשתמש סופק אוטומטית${email.source ? ` (${email.source})` : ''} — אין לוג Resend מאשר משלוח. ייתכן שהמייל נשלח (זה מה שהקוד עושה) אבל אי-אפשר לוודא.`;
                        return (
                          <span
                            title={tooltipBase}
                            className={cn(
                              'px-2 py-0.5 text-xs font-medium rounded-full border',
                              email.confirmed
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200 border-dashed',
                            )}
                          >
                            {email.confirmed
                              ? `📩 מייל נשלח · ממתין לכניסה${days && days > 0 ? ` · ${days} ימים` : ''}`
                              : '📩 הוזמן (לוג חסר)'}
                          </span>
                        );
                      }
                      if (email?.status === 'failed') {
                        return (
                          <span
                            title={`משלוח המייל נכשל${email.error ? `: ${email.error}` : ''} — לחץ 'אפס סיסמה' כדי לנסות שוב`}
                            className="px-2 py-0.5 text-xs font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200"
                          >
                            ⚠️ המייל נכשל
                          </span>
                        );
                      }
                      return (
                        <span
                          title="לא נשלח מייל קבלת פנים — שחזור סיסמה ידני נחוץ"
                          className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          ⏳ לא נשלח מייל
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-xs sm:text-sm text-slate-500">
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      {user.email}
                    </span>
                    {user.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 flex-shrink-0" />
                        {user.company}
                      </span>
                    )}
                    {user.phone && (
                      <span className="hidden sm:flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {user.phone}
                      </span>
                    )}
                  </div>

                  {/* Mobile-only meta row */}
                  <div className="flex items-center gap-3 mt-2 sm:hidden text-xs text-slate-400">
                    <span>{user._count.projects} פרויקטים</span>
                    <span>הצטרף: {new Date(user.createdAt).toLocaleDateString('he-IL')}</span>
                  </div>
                </div>

                {/* Desktop-only: Projects count */}
                <div className="hidden sm:block text-center px-4">
                  <p className="text-lg font-semibold text-slate-900">
                    {user._count.projects}
                  </p>
                  <p className="text-xs text-slate-500">פרויקטים</p>
                </div>

                {/* Desktop-only: Join date */}
                <div className="hidden lg:block text-center px-4">
                  <p className="text-sm text-slate-900">
                    {new Date(user.createdAt).toLocaleDateString('he-IL')}
                  </p>
                  <p className="text-xs text-slate-500">הצטרף</p>
                </div>

                {/* Desktop-only: Last login */}
                <div className="hidden lg:block text-center px-4">
                  <p className="text-sm text-slate-900">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString('he-IL')
                      : '-'
                    }
                  </p>
                  <p className="text-xs text-slate-500">התחברות אחרונה</p>
                </div>

                {/* Actions */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-slate-500" />
                  </button>

                  {openMenu === user.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenu(null)}
                      />
                      <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20">
                        <button
                          onClick={() => handleToggleActive(user)}
                          className="w-full px-4 py-2 text-sm text-right hover:bg-slate-50 flex items-center gap-2"
                        >
                          {user.isActive ? (
                            <><UserX className="w-4 h-4 text-slate-500" /><span>השבת משתמש</span></>
                          ) : (
                            <><UserCheck className="w-4 h-4 text-emerald-500" /><span>הפעל משתמש</span></>
                          )}
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="w-full px-4 py-2 text-sm text-right hover:bg-slate-50 flex items-center gap-2"
                        >
                          <KeyRound className="w-4 h-4 text-amber-500" />
                          <span>אפס סיסמה</span>
                        </button>
                        <hr className="my-2 border-slate-100" />
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="w-full px-4 py-2 text-sm text-right hover:bg-red-50 text-red-600 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>מחק משתמש</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 text-sm text-slate-500">
        מציג {filteredUsers.length} מתוך {users.length} משתמשים
      </div>
    </div>
  );
}

export default UsersTable;
