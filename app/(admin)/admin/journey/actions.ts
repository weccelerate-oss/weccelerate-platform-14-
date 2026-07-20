/**
 * Founder Journey — Admin Server Actions
 *
 * CRUD over chapters and questions, ordering, publish toggle, and a one-click
 * seed of the cleaned "מרעיון למיזם" workbook content. Mirrors the Learning
 * CMS actions: verifyAdmin() on every action, dual revalidatePath.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { seedJourney } from '@/lib/journey/seed';

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }
  return session.user;
}

function generateSlug(input: string): string {
  const base = (input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9֐-׿\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return base || `item-${Date.now()}`;
}

function revalidate() {
  revalidatePath('/admin/journey');
  revalidatePath('/portal/journey');
}

type Res = { success: boolean; error?: string };

function fail(error: unknown, fallback: string): { success: false; error: string } {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(`[Admin Journey] ${fallback}:`, msg);
  return { success: false, error: `${fallback}: ${msg}` };
}

// ---------------------------------------------------------------------------
// CHAPTERS
// ---------------------------------------------------------------------------

export interface ChapterFormData {
  name: string;
  slug?: string;
  description?: string;
  investorLook?: string;
  icon?: string;
  status?: 'DRAFT' | 'PUBLISHED';
}

export async function createChapterAction(data: ChapterFormData): Promise<Res> {
  try {
    await verifyAdmin();
    const slug = generateSlug(data.slug || data.name);
    const existing = await prisma.journeyChapter.findUnique({ where: { slug } });
    if (existing) return { success: false, error: `slug "${slug}" כבר קיים` };

    const count = await prisma.journeyChapter.count();
    await prisma.journeyChapter.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        investorLook: data.investorLook || null,
        icon: data.icon || 'Sparkles',
        status: data.status || 'PUBLISHED',
        displayOrder: count,
      },
    });
    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה ביצירת פרק');
  }
}

export async function updateChapterAction(id: string, data: Partial<ChapterFormData>): Promise<Res> {
  try {
    await verifyAdmin();
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.investorLook !== undefined) updateData.investorLook = data.investorLook || null;
    if (data.icon !== undefined) updateData.icon = data.icon || 'Sparkles';
    if (data.status !== undefined) updateData.status = data.status;
    if (data.slug) {
      const slug = generateSlug(data.slug);
      const clash = await prisma.journeyChapter.findFirst({ where: { slug, NOT: { id } } });
      if (clash) return { success: false, error: `slug "${slug}" כבר קיים` };
      updateData.slug = slug;
    }
    await prisma.journeyChapter.update({ where: { id }, data: updateData });
    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה בעדכון פרק');
  }
}

export async function deleteChapterAction(id: string): Promise<Res> {
  try {
    await verifyAdmin();
    // Cascade removes questions → user answers.
    await prisma.journeyChapter.delete({ where: { id } });
    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה במחיקת פרק');
  }
}

// ---------------------------------------------------------------------------
// QUESTIONS
// ---------------------------------------------------------------------------

export interface QuestionFormData {
  chapterId: string;
  prompt: string;
  helper?: string;
  isRequired?: boolean;
}

export async function createQuestionAction(data: QuestionFormData): Promise<Res> {
  try {
    await verifyAdmin();
    if (!data.prompt?.trim()) return { success: false, error: 'נוסח השאלה חובה' };
    const count = await prisma.journeyQuestion.count({ where: { chapterId: data.chapterId } });
    await prisma.journeyQuestion.create({
      data: {
        chapterId: data.chapterId,
        prompt: data.prompt.trim(),
        helper: data.helper?.trim() || null,
        isRequired: data.isRequired ?? true,
        displayOrder: count,
      },
    });
    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה ביצירת שאלה');
  }
}

export async function updateQuestionAction(
  id: string,
  data: Partial<Omit<QuestionFormData, 'chapterId'>>,
): Promise<Res> {
  try {
    await verifyAdmin();
    const updateData: Record<string, unknown> = {};
    if (data.prompt !== undefined) {
      if (!data.prompt.trim()) return { success: false, error: 'נוסח השאלה חובה' };
      updateData.prompt = data.prompt.trim();
    }
    if (data.helper !== undefined) updateData.helper = data.helper?.trim() || null;
    if (data.isRequired !== undefined) updateData.isRequired = data.isRequired;
    await prisma.journeyQuestion.update({ where: { id }, data: updateData });
    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה בעדכון שאלה');
  }
}

export async function deleteQuestionAction(id: string): Promise<Res> {
  try {
    await verifyAdmin();
    await prisma.journeyQuestion.delete({ where: { id } });
    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה במחיקת שאלה');
  }
}

// ---------------------------------------------------------------------------
// REORDER
// ---------------------------------------------------------------------------

export async function reorderJourneyAction(
  model: 'chapter' | 'question',
  orderedIds: string[],
): Promise<Res> {
  try {
    await verifyAdmin();
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return { success: false, error: 'רשימת מזהים לא תקינה' };
    }
    const delegate = model === 'chapter' ? prisma.journeyChapter : prisma.journeyQuestion;
    const existing = await delegate.findMany({
      where: { id: { in: orderedIds } },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((e: { id: string }) => e.id));
    const valid = orderedIds.filter((id) => existingIds.has(id));
    await prisma.$transaction(
      valid.map((id, index) => delegate.update({ where: { id }, data: { displayOrder: index } })),
    );
    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה בשמירת הסדר');
  }
}

// ---------------------------------------------------------------------------
// SEED
// ---------------------------------------------------------------------------

export async function seedJourneyAction(): Promise<Res & { chapters?: number; questions?: number }> {
  try {
    await verifyAdmin();
    const result = await seedJourney();
    revalidate();
    return { success: true, ...result };
  } catch (error) {
    return fail(error, 'שגיאה בטעינת תוכן המסע');
  }
}
