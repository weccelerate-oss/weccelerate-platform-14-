/**
 * My Project Page
 *
 * Full project details: timeline, deal activities, purchased services, notes.
 */

export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ProjectPageContent } from './content';

export const metadata: Metadata = {
  title: 'הפרויקט שלי | WeCcelerate Portal',
  description: 'פרטי הפרויקט שלך - ציר זמן, שירותים, פעילויות',
};

async function getProjectData(userId: string) {
  try {
    const { prisma } = await import('@/lib/db');
    const project = await prisma.project.findFirst({
      where: { userId, isArchived: false },
      include: {
        files: { orderBy: { uploadedAt: 'desc' }, take: 20 },
        notes: { where: { isPrivate: false }, orderBy: { createdAt: 'desc' }, take: 10 },
        user: { select: { name: true, email: true, phone: true, company: true } },
      },
    });
    return { project };
  } catch (err) {
    console.warn('[Project Page] DB error:', err);
    return { project: null };
  }
}

export default async function ProjectPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/portal/project');

  const data = await getProjectData(session.user.id!);

  let dealProducts: { id: number; name: string; price: number; quantity: number; sum: number; currency: string; completed: boolean; active: boolean }[] = [];
  let dealActivities: { id: number; type: string; subject: string; done: boolean; dueDate: string | null; dueTime: string | null; addTime: string; markedDoneTime: string | null; location: string | null }[] = [];
  let pipedriveStages: { id: number; name: string; orderNr: number }[] = [];
  let currentStageId: number | undefined;
  let dealStatus: string | undefined;

  if (data.project?.pipedriveId) {
    try {
      const { pipedriveClient } = await import('@/lib/pipedrive');
      const deal = await pipedriveClient.getDeal(data.project.pipedriveId);

      const [products, activities, stages] = await Promise.all([
        pipedriveClient.getDealProducts(data.project.pipedriveId),
        pipedriveClient.getDealActivities(data.project.pipedriveId),
        deal ? pipedriveClient.getPipelineStages(deal.pipeline_id) : Promise.resolve([]),
      ]);

      dealStatus = deal?.status || 'open';
      currentStageId = deal?.stage_id;

      pipedriveStages = stages.map((s) => ({ id: s.id, name: s.name, orderNr: s.order_nr }));

      dealProducts = products.map((p) => ({
        id: p.id, name: p.name, price: p.item_price, quantity: p.quantity,
        sum: p.sum, currency: p.currency || 'ILS',
        completed: dealStatus === 'won' || !p.active_flag,
        active: p.active_flag && dealStatus === 'open',
      }));

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
      console.warn('[Project Page] Pipedrive error:', err);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b1e]" dir="rtl">
      <ProjectPageContent
        project={data.project}
        dealProducts={dealProducts}
        dealActivities={dealActivities}
        pipedriveStages={pipedriveStages}
        currentStageId={currentStageId}
        dealStatus={dealStatus}
      />
    </div>
  );
}
