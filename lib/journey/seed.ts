/**
 * Seed the Founder Journey chapters + questions from `JOURNEY_DATA`.
 *
 * Idempotent: chapters upsert by slug; questions match by (chapterId, prompt)
 * so re-running never duplicates and never touches existing
 * UserJourneyAnswer rows (answers attach to question ids, which are stable
 * once created).
 */

import { prisma } from '@/lib/db';
import { JOURNEY_DATA } from '@/lib/journey/seed-data';

export interface JourneySeedResult {
  chapters: number;
  questions: number;
}

export async function seedJourney(): Promise<JourneySeedResult> {
  let chapters = 0;
  let questions = 0;

  for (let ci = 0; ci < JOURNEY_DATA.length; ci++) {
    const ch = JOURNEY_DATA[ci];
    const chapter = await prisma.journeyChapter.upsert({
      where: { slug: ch.slug },
      update: {
        name: ch.name,
        description: ch.description,
        investorLook: ch.investorLook,
        icon: ch.icon,
        displayOrder: ci,
        status: 'PUBLISHED',
      },
      create: {
        name: ch.name,
        slug: ch.slug,
        description: ch.description,
        investorLook: ch.investorLook,
        icon: ch.icon,
        displayOrder: ci,
        status: 'PUBLISHED',
      },
      select: { id: true },
    });
    chapters++;

    // Existing questions for this chapter, keyed by prompt (stable identity —
    // the workbook questions don't change wording between seed runs).
    const existing = await prisma.journeyQuestion.findMany({
      where: { chapterId: chapter.id },
      select: { id: true, prompt: true },
    });
    const byPrompt = new Map<string, string>(
      existing.map((q: { id: string; prompt: string }) => [q.prompt, q.id]),
    );

    for (let qi = 0; qi < ch.questions.length; qi++) {
      const q = ch.questions[qi];
      const existingId = byPrompt.get(q.prompt);
      if (existingId) {
        await prisma.journeyQuestion.update({
          where: { id: existingId },
          data: { helper: q.helper, displayOrder: qi },
        });
      } else {
        await prisma.journeyQuestion.create({
          data: {
            chapterId: chapter.id,
            prompt: q.prompt,
            helper: q.helper,
            displayOrder: qi,
          },
        });
      }
      questions++;
    }
  }

  return { chapters, questions };
}
