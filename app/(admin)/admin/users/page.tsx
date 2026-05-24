/**
 * User Management Page
 *
 * List and manage entrepreneurs and other users.
 */

export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { Suspense } from 'react';
import { UsersTable } from './users-table';
import { CreateUserDialog } from './create-user-dialog';
import { OnboardingStatusCard } from './onboarding-status-card';

export const metadata: Metadata = {
  title: 'ניהול משתמשים | Admin',
  description: 'ניהול יזמים ומשתמשים',
};

export interface WelcomeEmailStatus {
  // 'sent' = Resend accepted it; 'failed' = Resend rejected/threw;
  // 'none' = no welcome attempt logged for this user.
  status: 'sent' | 'failed' | 'none';
  at: string | null;
  source: string | null;
  error: string | null;
  // True when status came from a real ActivityLog row. False when we
  // inferred it from provisionedSource/provisionedAt because the user
  // pre-dates the success-logging code (so we know the auto-provision
  // flow *ran* — and that flow always tries to send — but no explicit
  // success or failure was recorded).
  confirmed: boolean;
}

export interface SpamBlockEntry {
  at: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  company: string | null;
  score: number | null;
  reasons: string[];
  codes: string[];
  source: string | null;
}

export interface OnboardingActivity {
  counts: {
    provisioned: number;
    spamBlocked: number;
    unauthorized: number;
    validationFailed: number;
    emailSent: number;
    emailFailed: number;
  };
  lastSuccess: { at: string; email: string | null; source: string | null } | null;
  /** AO-20: also carry email + source so the banner / detail row can show
   *  exactly which integration failed, not just the action name. */
  lastFailure: {
    at: string;
    action: string;
    detail: string | null;
    email: string | null;
    source: string | null;
  } | null;
  /** ALL spam blocks in the 30-day window, newest first. Lets the admin
   *  review what got rejected and decide whether anything was a false
   *  positive worth recovering by adding the user manually. */
  spamBlocks: SpamBlockEntry[];
  daysSinceLastEvent: number | null;
  /** Chronological feed of the most recent webhook events (up to 12). Lets
   *  the admin see exactly what happened in the last 24 hours without
   *  digging through the users table. */
  recentEvents: Array<{
    at: string;
    action: string;
    email: string | null;
    name: string | null;
  }>;
  /** Total spam-block rows actually present (after take cap). Lets the UI
   *  warn when the user is viewing a truncated list. */
  spamBlocksTotal: number;
  /** True when activityLog query hit the take-limit cap (AO-8). */
  spamBlocksTruncated: boolean;
}

const ONBOARDING_ACTIONS = [
  'user.provisioned',
  'onboarding.spam_blocked',
  'onboarding.unauthorized',
  'onboarding.validation_failed',
  'user.welcome_email_sent',
  'user.welcome_email_failed',
];

// AO-8: hard cap on the activity-log query so a flood of spam attempts
// can't render the admin page unbounded. 200 rows comfortably covers a
// month of normal traffic; a footer warns when the cap is hit.
const ONBOARDING_ACTIVITY_LIMIT = 200;

async function getOnboardingActivity(): Promise<OnboardingActivity> {
  const { prisma } = await import('@/lib/db');
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    const rows = await prisma.activityLog.findMany({
      where: {
        action: { in: ONBOARDING_ACTIONS },
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: ONBOARDING_ACTIVITY_LIMIT,
      select: {
        action: true,
        createdAt: true,
        description: true,
        metadata: true,
      },
    });

    // Count actual total of spam-blocks in the window so we can warn about
    // truncation independently of the page-bound row list above.
    const spamBlocksTotal = await prisma.activityLog
      .count({
        where: {
          action: 'onboarding.spam_blocked',
          createdAt: { gte: thirtyDaysAgo },
        },
      })
      .catch(() => 0);

    const counts = {
      provisioned: 0,
      spamBlocked: 0,
      unauthorized: 0,
      validationFailed: 0,
      emailSent: 0,
      emailFailed: 0,
    };
    let lastSuccess: OnboardingActivity['lastSuccess'] = null;
    let lastFailure: OnboardingActivity['lastFailure'] = null;
    const spamBlocks: SpamBlockEntry[] = [];
    for (const row of rows) {
      const meta = (row.metadata as Record<string, unknown> | null) ?? {};
      switch (row.action) {
        case 'user.provisioned':
          counts.provisioned++;
          if (!lastSuccess) {
            lastSuccess = {
              at: row.createdAt.toISOString(),
              email: typeof meta.email === 'string' ? meta.email : null,
              source: typeof meta.source === 'string' ? meta.source : null,
            };
          }
          break;
        case 'onboarding.spam_blocked':
          counts.spamBlocked++;
          spamBlocks.push({
            at: row.createdAt.toISOString(),
            email: typeof meta.email === 'string' ? meta.email : null,
            name: typeof meta.name === 'string' ? meta.name : null,
            phone: typeof meta.phone === 'string' ? meta.phone : null,
            company: typeof meta.company === 'string' ? meta.company : null,
            score: typeof meta.spamScore === 'number' ? meta.spamScore : null,
            reasons: Array.isArray(meta.spamReasons)
              ? (meta.spamReasons as unknown[]).map(String)
              : [],
            codes: Array.isArray(meta.spamCodes)
              ? (meta.spamCodes as unknown[]).map(String)
              : [],
            source: typeof meta.source === 'string' ? meta.source : null,
          });
          break;
        case 'onboarding.unauthorized':
          counts.unauthorized++;
          break;
        case 'onboarding.validation_failed':
          counts.validationFailed++;
          break;
        case 'user.welcome_email_sent':
          counts.emailSent++;
          break;
        case 'user.welcome_email_failed':
          counts.emailFailed++;
          break;
      }
      if (
        !lastFailure &&
        ['onboarding.unauthorized', 'onboarding.validation_failed', 'user.welcome_email_failed'].includes(
          row.action,
        )
      ) {
        lastFailure = {
          at: row.createdAt.toISOString(),
          action: row.action,
          detail: row.description ?? null,
          // AO-20: preserve email + source so the banner doesn't lose the
          // most useful context for debugging "which integration broke".
          email: typeof meta.email === 'string' ? meta.email : null,
          source: typeof meta.source === 'string' ? meta.source : null,
        };
      }
    }

    const lastEvent = rows[0];
    const daysSinceLastEvent = lastEvent
      ? Math.floor((Date.now() - lastEvent.createdAt.getTime()) / 86_400_000)
      : null;

    // Slice the top 12 most recent events (rows is already createdAt desc)
    // for the chronological feed.
    const recentEvents = rows.slice(0, 12).map(
      (row: { action: string; createdAt: Date; metadata: unknown }) => {
        const meta = (row.metadata as Record<string, unknown> | null) ?? {};
        return {
          at: row.createdAt.toISOString(),
          action: row.action,
          email: typeof meta.email === 'string' ? meta.email : null,
          name: typeof meta.name === 'string' ? meta.name : null,
        };
      },
    );

    return {
      counts,
      lastSuccess,
      lastFailure,
      spamBlocks,
      daysSinceLastEvent,
      recentEvents,
      spamBlocksTotal,
      spamBlocksTruncated: rows.length >= ONBOARDING_ACTIVITY_LIMIT,
    };
  } catch (error) {
    console.error('[Admin] Onboarding activity lookup failed:', error);
    return {
      counts: { provisioned: 0, spamBlocked: 0, unauthorized: 0, validationFailed: 0, emailSent: 0, emailFailed: 0 },
      lastSuccess: null,
      lastFailure: null,
      spamBlocks: [],
      daysSinceLastEvent: null,
      recentEvents: [],
      spamBlocksTotal: 0,
      spamBlocksTruncated: false,
    };
  }
}

async function getUsers() {
  try {
    const { prisma } = await import('@/lib/db');

    const users = await prisma.user.findMany({
      where: {
        role: { in: ['ENTREPRENEUR', 'MENTOR', 'INVESTOR', 'PARTNER'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        projects: {
          where: { isArchived: false },
          select: { id: true, name: true, status: true },
        },
        _count: {
          select: { projects: true },
        },
      },
    });

    // Join in the latest welcome-email outcome per user. One query, then
    // collapse to the most-recent row per userId — keeps the page fast even
    // as the audit log grows.
    let emailStatus: Map<string, WelcomeEmailStatus> = new Map();
    try {
      const logs = await prisma.activityLog.findMany({
        where: {
          action: { in: ['user.welcome_email_sent', 'user.welcome_email_failed'] },
          userId: { in: users.map((u: { id: string }) => u.id) },
        },
        orderBy: { createdAt: 'desc' },
        select: {
          userId: true,
          action: true,
          createdAt: true,
          metadata: true,
        },
      });
      for (const log of logs) {
        if (!log.userId || emailStatus.has(log.userId)) continue; // first hit = latest
        const meta = (log.metadata as Record<string, unknown> | null) ?? {};
        emailStatus.set(log.userId, {
          status: log.action === 'user.welcome_email_sent' ? 'sent' : 'failed',
          at: log.createdAt.toISOString(),
          source: typeof meta.source === 'string' ? meta.source : null,
          error: typeof meta.error === 'string' ? meta.error : null,
          confirmed: true,
        });
      }
    } catch (error) {
      console.error('[Admin] Welcome-email status lookup failed:', error);
      emailStatus = new Map();
    }

    // Fallback inference for users created before the success-logging code
    // existed: if they were auto-provisioned (provisionedSource set) the
    // legacy webhook flow always tried to send. Treat that as a "probably
    // sent" with `confirmed: false` so the UI can mark it as inferred.
    type UserWithProvision = {
      id: string;
      provisionedSource?: string | null;
      provisionedAt?: Date | null;
    };
    return users.map((u: UserWithProvision) => {
      const logged = emailStatus.get(u.id);
      if (logged) return { ...u, welcomeEmail: logged };
      if (u.provisionedSource && u.provisionedAt) {
        return {
          ...u,
          welcomeEmail: {
            status: 'sent' as const,
            at: u.provisionedAt.toISOString(),
            source: u.provisionedSource,
            error: null,
            confirmed: false,
          },
        };
      }
      return {
        ...u,
        welcomeEmail: {
          status: 'none' as const,
          at: null,
          source: null,
          error: null,
          confirmed: true,
        },
      };
    });
  } catch (error) {
    console.error('[Admin] Error fetching users:', error);
    return [];
  }
}

export default async function UsersManagementPage() {
  const [users, onboarding] = await Promise.all([getUsers(), getOnboardingActivity()]);

  const entrepreneurs = users.filter((u: { role?: string | null }) => u.role === 'ENTREPRENEUR');
  // "Awaiting first login" = was given a temp password (mustChangePassword)
  // and has never logged in. This is the cohort the admin asked for: people
  // who received credentials by email but didn't click through yet.
  type UserMeta = {
    lastLoginAt?: Date | null;
    mustChangePassword?: boolean | null;
    welcomeEmail?: WelcomeEmailStatus;
  };
  const stats = {
    total: users.length,
    active: users.filter((u: { isActive?: boolean | null }) => u.isActive).length,
    entrepreneurs: entrepreneurs.length,
    mentors: users.filter((u: { role?: string | null }) => u.role === 'MENTOR').length,
    entrepreneursLoggedIn: entrepreneurs.filter(
      (u: UserMeta) => u.lastLoginAt,
    ).length,
    entrepreneursEmailSent: entrepreneurs.filter(
      (u: UserMeta) => u.welcomeEmail?.status === 'sent',
    ).length,
    entrepreneursEmailSentPending: entrepreneurs.filter(
      (u: UserMeta) => u.welcomeEmail?.status === 'sent' && !u.lastLoginAt,
    ).length,
    entrepreneursEmailFailed: entrepreneurs.filter(
      (u: UserMeta) => u.welcomeEmail?.status === 'failed',
    ).length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-14 lg:pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">ניהול משתמשים</h1>
          <p className="text-sm text-slate-500 mt-1">נהל יזמים, מנטורים ומשתמשים אחרים</p>
        </div>
        <CreateUserDialog />
      </div>

      <OnboardingStatusCard data={onboarding} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-sm text-slate-500">סה״כ משתמשים</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
          <p className="text-sm text-slate-500">פעילים</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-blue-600">{stats.entrepreneurs}</p>
          <p className="text-sm text-slate-500">יזמים</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-purple-600">{stats.mentors}</p>
          <p className="text-sm text-slate-500">מנטורים</p>
        </div>
      </div>

      {/* Entrepreneur onboarding funnel: email delivered → first login */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-200">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-blue-700">{stats.entrepreneursEmailSent}</p>
            <p className="text-sm text-blue-700/70">/ {stats.entrepreneurs}</p>
          </div>
          <p className="text-sm text-blue-800 mt-1">קיבלו מייל קבלת פנים</p>
          <p className="text-xs text-blue-700/60 mt-0.5">לפי לוג Resend (סופק / לא סופק)</p>
        </div>
        <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-emerald-700">{stats.entrepreneursLoggedIn}</p>
            <p className="text-sm text-emerald-700/70">/ {stats.entrepreneurs}</p>
          </div>
          <p className="text-sm text-emerald-800 mt-1">יזמים שכבר נכנסו לפורטל</p>
          <p className="text-xs text-emerald-700/60 mt-0.5">לפי תאריך התחברות אחרון</p>
        </div>
        <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-amber-700">{stats.entrepreneursEmailSentPending}</p>
            <p className="text-sm text-amber-700/70">/ {stats.entrepreneursEmailSent || '—'}</p>
          </div>
          <p className="text-sm text-amber-800 mt-1">קיבלו מייל וטרם נכנסו</p>
          <p className="text-xs text-amber-700/60 mt-0.5">
            {stats.entrepreneursEmailFailed > 0
              ? `+ ${stats.entrepreneursEmailFailed} נכשלו במשלוח`
              : 'דורש פולואפ'}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <Suspense fallback={<div className="p-6">טוען...</div>}>
          <UsersTable users={users} />
        </Suspense>
      </div>
    </div>
  );
}
