/**
 * Progress Page
 *
 * Full progress view: Pipedrive activities timeline.
 */

export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ProgressPageContent } from './content';

export const metadata: Metadata = {
  title: 'התקדמות | WeCcelerate Portal',
  description: 'מעקב התקדמות הפרויקט שלך',
};

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/portal/progress');

  // Fetch project
  let project: { name: string; pipedriveId: string | null } | null = null;
  try {
    const { prisma } = await import('@/lib/db');
    project = await prisma.project.findFirst({
      where: { userId: session.user.id!, isArchived: false },
      select: { name: true, pipedriveId: true },
    });
  } catch (err) {
    console.warn('[Progress] DB error:', err);
  }

  // Fetch activities from Pipedrive
  let dealActivities: { id: number; type: string; subject: string; done: boolean; dueDate: string | null; dueTime: string | null; addTime: string; markedDoneTime: string | null; location: string | null }[] = [];
  let dealStatus: string | undefined;

  if (project?.pipedriveId) {
    try {
      const { pipedriveClient } = await import('@/lib/pipedrive');
      const [deal, activities] = await Promise.all([
        pipedriveClient.getDeal(project.pipedriveId),
        pipedriveClient.getDealActivities(project.pipedriveId),
      ]);

      dealStatus = deal?.status || 'open';

      dealActivities = activities
        .filter((a) => a.type !== 'note')
        .map((a) => ({
          id: a.id, type: a.type, subject: a.subject, done: a.done,
          dueDate: a.due_date, dueTime: a.due_time, addTime: a.add_time,
          markedDoneTime: a.marked_as_done_time, location: a.location,
        }))
        .sort((a, b) => {
          if (a.done !== b.done) return a.done ? 1 : -1;
          return (b.dueDate || b.addTime).localeCompare(a.dueDate || a.addTime);
        });
    } catch (err) {
      console.warn('[Progress] Pipedrive error:', err);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b1e]" dir="rtl">
      <ProgressPageContent
        projectName={project?.name}
        hasProject={!!project}
        dealActivities={dealActivities}
        dealStatus={dealStatus}
      />
    </div>
  );
}
