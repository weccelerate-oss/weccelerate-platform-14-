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
        });
      }
    } catch (error) {
      console.error('[Admin] Welcome-email status lookup failed:', error);
      emailStatus = new Map();
    }

    return users.map((u: { id: string }) => ({
      ...u,
      welcomeEmail: emailStatus.get(u.id) ?? { status: 'none' as const, at: null, source: null, error: null },
    }));
  } catch (error) {
    console.error('[Admin] Error fetching users:', error);
    return [];
  }
}

export default async function UsersManagementPage() {
  const users = await getUsers();

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
