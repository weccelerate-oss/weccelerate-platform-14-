/**
 * Founder Journey data access.
 *
 * Mirrors lib/learning/repository.ts: a published view for the portal, a full
 * view for the admin CMS, and the per-user answer map. If the DB hasn't been
 * seeded yet the portal falls back to the static JOURNEY_DATA (read-only —
 * answers can't persist until the seed ran, but the entrepreneur never sees a
 * blank screen).
 */

import { prisma } from '@/lib/db';
import { JOURNEY_DATA } from '@/lib/journey/seed-data';

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------

export interface JourneyQuestionView {
  id: string;
  prompt: string;
  helper: string | null;
  displayOrder: number;
  isRequired: boolean;
}

export interface JourneyChapterView {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  investorLook: string | null;
  icon: string | null;
  displayOrder: number;
  questions: JourneyQuestionView[];
}

export interface AdminJourneyChapter extends JourneyChapterView {
  status: 'DRAFT' | 'PUBLISHED';
}

export interface AnswerCommentView {
  id: string;
  authorType: 'ENTREPRENEUR' | 'ADVISOR';
  authorName: string;
  body: string;
  createdAt: string;
}

export interface JourneyAnswerView {
  questionId: string;
  content: string;
  status: 'DRAFT' | 'READY';
  aiFeedback: string | null;
  aiFeedbackAt: string | null;
  updatedAt: string;
  /** Human-mentor thread (INVESTOR_PREP): advisor request stamp + messages. */
  advisorRequestedAt: string | null;
  comments: AnswerCommentView[];
}

// ---------------------------------------------------------------------------
// Portal: published chapters (+ static fallback when DB is empty)
// ---------------------------------------------------------------------------

export async function getPublishedJourney(): Promise<JourneyChapterView[]> {
  try {
    const rows = await prisma.journeyChapter.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { displayOrder: 'asc' },
      include: { questions: { orderBy: { displayOrder: 'asc' } } },
    });

    const mapped: JourneyChapterView[] = (rows ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? null,
      investorLook: c.investorLook ?? null,
      icon: c.icon ?? null,
      displayOrder: c.displayOrder,
      questions: (c.questions ?? []).map((q: any) => ({
        id: q.id,
        prompt: q.prompt,
        helper: q.helper ?? null,
        displayOrder: q.displayOrder,
        isRequired: q.isRequired ?? true,
      })),
    }));

    const nonEmpty = mapped.filter((c) => c.questions.length > 0);
    if (nonEmpty.length > 0) return nonEmpty;
  } catch (err) {
    console.error('[journey] getPublishedJourney failed, using static fallback:', err);
  }

  // DB empty / unreachable — static read-only fallback. Question ids use the
  // "static:" prefix so the answer API can refuse persistence loudly instead
  // of writing rows against ids that won't exist after seeding.
  return JOURNEY_DATA.map((ch, ci) => ({
    id: `static:${ch.slug}`,
    name: ch.name,
    slug: ch.slug,
    description: ch.description,
    investorLook: ch.investorLook,
    icon: ch.icon,
    displayOrder: ci,
    questions: ch.questions.map((q, qi) => ({
      id: `static:${ch.slug}:${qi}`,
      prompt: q.prompt,
      helper: q.helper,
      displayOrder: qi,
      isRequired: true,
    })),
  }));
}

// ---------------------------------------------------------------------------
// Portal: the user's answers as a map
// ---------------------------------------------------------------------------

export async function getUserJourneyAnswers(userId: string): Promise<JourneyAnswerView[]> {
  try {
    const rows = await prisma.userJourneyAnswer.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { comments: { orderBy: { createdAt: 'asc' } } },
    });
    return (rows ?? []).map((a: any) => ({
      questionId: a.questionId,
      content: a.content ?? '',
      status: a.status ?? 'DRAFT',
      aiFeedback: a.aiFeedback ?? null,
      aiFeedbackAt: a.aiFeedbackAt ? a.aiFeedbackAt.toISOString() : null,
      updatedAt: a.updatedAt ? a.updatedAt.toISOString() : new Date(0).toISOString(),
      advisorRequestedAt: a.advisorRequestedAt ? a.advisorRequestedAt.toISOString() : null,
      comments: (a.comments ?? []).map((c: any) => ({
        id: c.id,
        authorType: c.authorType,
        authorName: c.authorName,
        body: c.body,
        createdAt: c.createdAt?.toISOString?.() ?? '',
      })),
    }));
  } catch (err) {
    console.error('[journey] getUserJourneyAnswers failed:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Admin: full journey incl. drafts
// ---------------------------------------------------------------------------

export async function getAdminJourney(): Promise<AdminJourneyChapter[]> {
  const rows = await prisma.journeyChapter.findMany({
    orderBy: { displayOrder: 'asc' },
    include: { questions: { orderBy: { displayOrder: 'asc' } } },
  });

  return (rows ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    investorLook: c.investorLook ?? null,
    icon: c.icon ?? null,
    displayOrder: c.displayOrder,
    status: c.status,
    questions: (c.questions ?? []).map((q: any) => ({
      id: q.id,
      prompt: q.prompt,
      helper: q.helper ?? null,
      displayOrder: q.displayOrder,
      isRequired: q.isRequired ?? true,
    })),
  }));
}
