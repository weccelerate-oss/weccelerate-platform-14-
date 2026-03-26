/**
 * Documents Page
 *
 * Full-page FileVault with all project files.
 */

export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { DocumentsPageContent } from './content';

export const metadata: Metadata = {
  title: 'מסמכים | WeCcelerate Portal',
  description: 'כל המסמכים והקבצים של הפרויקט שלך',
};

async function getProjectFiles(userId: string) {
  try {
    const { prisma } = await import('@/lib/db');
    const project = await prisma.project.findFirst({
      where: { userId, isArchived: false },
      include: {
        files: { orderBy: { uploadedAt: 'desc' } },
      },
    });
    return { project };
  } catch (err) {
    console.warn('[Documents Page] DB error:', err);
    return { project: null };
  }
}

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/portal/documents');

  const data = await getProjectFiles(session.user.id!);

  return (
    <div className="min-h-screen bg-[#070b1e]" dir="rtl">
      <DocumentsPageContent
        files={data.project?.files || []}
        projectId={data.project?.id}
        projectName={data.project?.name}
      />
    </div>
  );
}
