/**
 * Progress Page
 *
 * Full progress view: Pipedrive timeline + activities.
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

async function getProjectData(userId: string) {
  try {
    const { prisma } = await import('@/lib/db');
    const project = await prisma.project.findFirst({
      where: { userId, isArchived: false },
      select: {
        id: true,
        name: true,
        status: true,
        stage: true,
        timeline: true,
        pipedriveId: true,
      },
    });
    return { project };
  } catch (err) {
    console.warn('[Progress Page] DB error:', err);
    return { project: null };
  }
}

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/portal/progress');

  const data = await getProjectData(session.user.id!);

  let dealActivities: { id: number; type: string; subject: string; done: boolean; dueDate: string | null; dueTime: string | null; addTime: string; markedDoneTime: string | null; location: string | null }[] = [];
  let pipedriveStages: { id: number; name: string; orderNr: number }[] = [];
  let currentStageId: number | undefined;
  let dealStatus: string | undefined;

  if (data.project?.pipedriveId) {
    try {
      const { pipedriveClient } = await import('@/lib/pipedrive');
      const deal = await pipedriveClient.getDeal(data.project.pipedriveId);

      const [activities, stages] = await Promise.all([
        pipedriveClient.getDealActivities(data.project.pipedriveId),
        deal ? pipedriveClient.getPipelineStages(deal.pipeline_id) : Promise.resolve([]),
      ]);

      dealStatus = deal?.status || 'open';
      currentStageId = deal?.stage_id;

      pipedriveStages = stages.map((s) => ({ id: s.id, name: s.name, orderNr: s.order_nr }));

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
      console.warn('[Progress Page] Pipedrive error:', err);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b1e]" dir="rtl">
      <ProgressPageContent
        projectName={data.project?.name}
        projectStatus={data.project?.status}
        projectStage={data.project?.stage}
        projectTimeline={data.project?.timeline as Record<string, unknown> | null}
        dealActivities={dealActivities}
        pipedriveStages={pipedriveStages}
        currentStageId={currentStageId}
        dealStatus={dealStatus}
      />
    </div>
  );
}
