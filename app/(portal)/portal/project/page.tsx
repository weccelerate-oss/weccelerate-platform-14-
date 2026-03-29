/**
 * My Project Page
 *
 * Full project view: details, service timeline, notes.
 */

export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ProjectPageContent } from './content';

export const metadata: Metadata = {
  title: 'הפרויקט שלי | WeCcelerate Portal',
  description: 'פרטי הפרויקט שלך - שירותים, התקדמות, קבצים',
};

export default async function ProjectPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/portal/project');

  // Fetch project
  let project: any = null;
  try {
    const { prisma } = await import('@/lib/db');
    project = await prisma.project.findFirst({
      where: { userId: session.user.id!, isArchived: false },
      include: {
        files: { orderBy: { uploadedAt: 'desc' }, take: 20 },
        notes: { where: { isPrivate: false }, orderBy: { createdAt: 'desc' }, take: 10 },
        user: { select: { name: true, email: true, phone: true, company: true } },
      },
    });
  } catch (err) {
    console.warn('[Project Page] DB error:', err);
  }

  // Fetch Pipedrive activities and match to services
  let matchedServices: import('@/lib/service-matcher').MatchedService[] = [];
  let dealStatus: string | undefined;

  if (project?.pipedriveId) {
    try {
      const { pipedriveClient } = await import('@/lib/pipedrive');
      const [deal, activities] = await Promise.all([
        pipedriveClient.getDeal(project.pipedriveId),
        pipedriveClient.getDealActivities(project.pipedriveId),
      ]);

      dealStatus = deal?.status || 'open';

      const mapped = activities
        .filter((a) => a.type !== 'note')
        .map((a) => ({
          id: a.id, type: a.type, subject: a.subject, done: a.done,
          dueDate: a.due_date, dueTime: a.due_time, addTime: a.add_time,
          markedDoneTime: a.marked_as_done_time, location: a.location,
        }));

      const { matchActivitiesToServices } = await import('@/lib/service-matcher');
      matchedServices = matchActivitiesToServices(mapped);
    } catch (err) {
      console.warn('[Project Page] Pipedrive error:', err);
    }
  }

  return (
    <ProjectPageContent
      project={project}
      matchedServices={matchedServices}
      dealStatus={dealStatus}
    />
  );
}
