/**
 * Projects Management Page
 *
 * Admin page for managing entrepreneur projects, stages, and files.
 */

export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { Suspense } from 'react';
import { ProjectsTable } from './projects-table';
import { CreateProjectDialog } from './create-project-dialog';

export const metadata: Metadata = {
  title: 'ניהול פרויקטים | Admin',
  description: 'ניהול פרויקטים של יזמים',
};

async function getProjects() {
  try {
    const { prisma } = await import('@/lib/db');

    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, company: true, phone: true },
        },
        files: {
          orderBy: { uploadedAt: 'desc' },
          take: 10,
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { files: true, notes: true },
        },
      },
    });
    return projects;
  } catch (error) {
    console.error('[Admin] Error fetching projects:', error);
    return [];
  }
}

async function getEntrepreneurs() {
  try {
    const { prisma } = await import('@/lib/db');
    const users = await prisma.user.findMany({
      where: { role: 'ENTREPRENEUR', isActive: true },
      select: { id: true, name: true, email: true, company: true },
      orderBy: { name: 'asc' },
    });
    return users;
  } catch (error) {
    console.error('[Admin] Error fetching entrepreneurs:', error);
    return [];
  }
}

export default async function ProjectsManagementPage() {
  const [projects, entrepreneurs] = await Promise.all([getProjects(), getEntrepreneurs()]);

  const stats = {
    total: projects.length,
    active: projects.filter((p: { isArchived: boolean }) => !p.isArchived).length,
    inProgress: projects.filter((p: { status: string }) => ['DEVELOPMENT', 'FUNDING_PREP', 'ACTIVE_FUNDING'].includes(p.status)).length,
    graduated: projects.filter((p: { status: string }) => p.status === 'GRADUATED').length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-14 lg:pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">ניהול פרויקטים</h1>
          <p className="text-sm text-slate-500 mt-1">נהל פרויקטים, שלבים, וקבצים של יזמים</p>
        </div>
        <CreateProjectDialog entrepreneurs={entrepreneurs} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-sm text-slate-500">סה״כ פרויקטים</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
          <p className="text-sm text-slate-500">פעילים</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          <p className="text-sm text-slate-500">בתהליך</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-2xl font-bold text-purple-600">{stats.graduated}</p>
          <p className="text-sm text-slate-500">בוגרים</p>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <Suspense fallback={<div className="p-6">טוען...</div>}>
          <ProjectsTable projects={projects} />
        </Suspense>
      </div>
    </div>
  );
}
