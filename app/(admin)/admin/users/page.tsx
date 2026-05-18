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
    return users;
  } catch (error) {
    console.error('[Admin] Error fetching users:', error);
    return [];
  }
}

export default async function UsersManagementPage() {
  const users = await getUsers();

  const entrepreneurs = users.filter((u: { role?: string | null }) => u.role === 'ENTREPRENEUR');
  const stats = {
    total: users.length,
    active: users.filter((u: { isActive?: boolean | null }) => u.isActive).length,
    entrepreneurs: entrepreneurs.length,
    mentors: users.filter((u: { role?: string | null }) => u.role === 'MENTOR').length,
    entrepreneursLoggedIn: entrepreneurs.filter(
      (u: { lastLoginAt?: Date | null }) => u.lastLoginAt,
    ).length,
    entrepreneursPending: entrepreneurs.filter(
      (u: { lastLoginAt?: Date | null }) => !u.lastLoginAt,
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

      {/* Entrepreneur onboarding funnel — quick proof that the portal works for them */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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
            <p className="text-2xl font-bold text-amber-700">{stats.entrepreneursPending}</p>
            <p className="text-sm text-amber-700/70">/ {stats.entrepreneurs}</p>
          </div>
          <p className="text-sm text-amber-800 mt-1">יזמים שטרם נכנסו לפורטל</p>
          <p className="text-xs text-amber-700/60 mt-0.5">קיבלו גישה, לא התחברו עדיין</p>
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
