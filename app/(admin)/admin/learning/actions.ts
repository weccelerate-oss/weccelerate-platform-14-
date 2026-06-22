/**
 * Learning Center — Admin Server Actions
 *
 * Full CRUD over the course catalog (categories → subcategories → lessons),
 * drag-to-reorder, quiz authoring, attachment removal, and a one-click import
 * of the legacy static catalog. Every action verifies the admin role and
 * revalidates both the admin manager and the entrepreneur portal.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { extractYouTubeId, normalizeYouTubeUrl } from '@/lib/learning/youtube';
import { seedLearningCatalog } from '@/lib/learning/seed';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
  revalidatePath('/admin/learning');
  revalidatePath('/portal/learning');
}

/** Uniform action result so consumers can always read `.error`. */
type Res = { success: boolean; error?: string };

function fail(error: unknown, fallback: string): { success: false; error: string } {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(`[Admin Learning] ${fallback}:`, msg);
  return { success: false, error: `${fallback}: ${msg}` };
}

// ---------------------------------------------------------------------------
// CATEGORIES
// ---------------------------------------------------------------------------

export interface CategoryFormData {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}

export async function createCategoryAction(data: CategoryFormData) {
  try {
    await verifyAdmin();
    const slug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);

    const existing = await prisma.courseCategory.findUnique({ where: { slug } });
    if (existing) return { success: false, error: `slug "${slug}" כבר קיים` };

    const count = await prisma.courseCategory.count();
    await prisma.courseCategory.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        icon: data.icon || 'BookOpen',
        color: data.color || 'blue',
        isActive: data.isActive ?? true,
        displayOrder: count,
      },
    });
    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה ביצירת קטגוריה');
  }
}

export async function updateCategoryAction(id: string, data: CategoryFormData) {
  try {
    await verifyAdmin();
    const updateData: Record<string, unknown> = {
      name: data.name,
      description: data.description ?? null,
      icon: data.icon || 'BookOpen',
      color: data.color || 'blue',
    };
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.slug) {
      const slug = generateSlug(data.slug);
      const clash = await prisma.courseCategory.findFirst({ where: { slug, NOT: { id } } });
      if (clash) return { success: false, error: `slug "${slug}" כבר קיים` };
      updateData.slug = slug;
    }
    await prisma.courseCategory.update({ where: { id }, data: updateData });
    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה בעדכון קטגוריה');
  }
}

export async function deleteCategoryAction(id: string): Promise<Res> {
  try {
    await verifyAdmin();
    // Cascade removes subcategories → lessons → progress/attachments/quiz.
    await prisma.courseCategory.delete({ where: { id } });
    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה במחיקת קטגוריה');
  }
}

// ---------------------------------------------------------------------------
// SUBCATEGORIES
// ---------------------------------------------------------------------------

export interface SubcategoryFormData {
  categoryId: string;
  name: string;
  slug?: string;
  description?: string;
}

export async function createSubcategoryAction(data: SubcategoryFormData) {
  try {
    await verifyAdmin();
    const slug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);
    const existing = await prisma.courseSubcategory.findUnique({ where: { slug } });
    if (existing) return { success: false, error: `slug "${slug}" כבר קיים` };

    const count = await prisma.courseSubcategory.count({ where: { categoryId: data.categoryId } });
    await prisma.courseSubcategory.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        categoryId: data.categoryId,
        displayOrder: count,
      },
    });
    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה ביצירת תת-קטגוריה');
  }
}

export async function updateSubcategoryAction(id: string, data: Partial<SubcategoryFormData>) {
  try {
    await verifyAdmin();
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.slug) {
      const slug = generateSlug(data.slug);
      const clash = await prisma.courseSubcategory.findFirst({ where: { slug, NOT: { id } } });
      if (clash) return { success: false, error: `slug "${slug}" כבר קיים` };
      updateData.slug = slug;
    }
    await prisma.courseSubcategory.update({ where: { id }, data: updateData });
    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה בעדכון תת-קטגוריה');
  }
}

export async function deleteSubcategoryAction(id: string): Promise<Res> {
  try {
    await verifyAdmin();
    await prisma.courseSubcategory.delete({ where: { id } });
    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה במחיקת תת-קטגוריה');
  }
}

// ---------------------------------------------------------------------------
// LESSONS
// ---------------------------------------------------------------------------

export interface LessonFormData {
  subcategoryId: string;
  title: string;
  slug?: string;
  description?: string;
  content?: string;
  youtubeUrl?: string;
  duration?: number;
  status: 'DRAFT' | 'PUBLISHED';
}

export async function createLessonAction(data: LessonFormData) {
  try {
    await verifyAdmin();
    const slug = data.slug ? generateSlug(data.slug) : generateSlug(data.title);
    const existing = await prisma.courseLesson.findUnique({ where: { slug } });
    if (existing) return { success: false, error: `slug "${slug}" כבר קיים` };

    const youtubeUrl = data.youtubeUrl ? normalizeYouTubeUrl(data.youtubeUrl) : null;
    const youtubeId = data.youtubeUrl ? extractYouTubeId(data.youtubeUrl) : null;

    const count = await prisma.courseLesson.count({ where: { subcategoryId: data.subcategoryId } });
    await prisma.courseLesson.create({
      data: {
        title: data.title,
        slug,
        description: data.description || null,
        content: data.content || null,
        youtubeUrl,
        youtubeId: youtubeId || null,
        duration: data.duration || null,
        subcategoryId: data.subcategoryId,
        status: data.status,
        isActive: data.status === 'PUBLISHED',
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        displayOrder: count,
      },
    });
    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה ביצירת שיעור');
  }
}

export async function updateLessonAction(id: string, data: Partial<LessonFormData>) {
  try {
    await verifyAdmin();
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.content !== undefined) updateData.content = data.content || null;
    if (data.duration !== undefined) updateData.duration = data.duration || null;
    if (data.subcategoryId !== undefined) updateData.subcategoryId = data.subcategoryId;
    if (data.youtubeUrl !== undefined) {
      updateData.youtubeUrl = data.youtubeUrl ? normalizeYouTubeUrl(data.youtubeUrl) : null;
      updateData.youtubeId = data.youtubeUrl ? extractYouTubeId(data.youtubeUrl) || null : null;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
      updateData.isActive = data.status === 'PUBLISHED';
      // Stamp publishedAt the first time it goes live.
      if (data.status === 'PUBLISHED') {
        const existing = await prisma.courseLesson.findUnique({
          where: { id },
          select: { publishedAt: true },
        });
        if (!existing?.publishedAt) updateData.publishedAt = new Date();
      }
    }
    if (data.slug) {
      const slug = generateSlug(data.slug);
      const clash = await prisma.courseLesson.findFirst({ where: { slug, NOT: { id } } });
      if (clash) return { success: false, error: `slug "${slug}" כבר קיים` };
      updateData.slug = slug;
    }
    await prisma.courseLesson.update({ where: { id }, data: updateData });
    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה בעדכון שיעור');
  }
}

export async function setLessonStatusAction(id: string, status: 'DRAFT' | 'PUBLISHED') {
  return updateLessonAction(id, { status });
}

export async function deleteLessonAction(id: string): Promise<Res> {
  try {
    await verifyAdmin();
    await prisma.courseLesson.delete({ where: { id } });
    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה במחיקת שיעור');
  }
}

// ---------------------------------------------------------------------------
// REORDER (categories / subcategories / lessons)
// ---------------------------------------------------------------------------

type ReorderModel = 'category' | 'subcategory' | 'lesson';

export async function reorderAction(model: ReorderModel, orderedIds: string[]) {
  try {
    await verifyAdmin();
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return { success: false, error: 'רשימת מזהים לא תקינה' };
    }

    const delegate =
      model === 'category'
        ? prisma.courseCategory
        : model === 'subcategory'
          ? prisma.courseSubcategory
          : prisma.courseLesson;

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
// QUIZ
// ---------------------------------------------------------------------------

export interface QuizQuestionInput {
  prompt: string;
  options: { id: string; text: string }[];
  correctId: string;
}

export interface QuizFormData {
  title?: string;
  passScore: number;
  questions: QuizQuestionInput[];
}

export async function saveQuizAction(lessonId: string, data: QuizFormData) {
  try {
    await verifyAdmin();

    if (!data.questions || data.questions.length === 0) {
      // No questions → remove the quiz entirely.
      await prisma.quiz.deleteMany({ where: { lessonId } });
      revalidate();
      return { success: true };
    }

    // Validate each question has options and a valid correct answer.
    for (const q of data.questions) {
      if (!q.prompt?.trim()) return { success: false, error: 'לכל שאלה חייבת להיות כותרת' };
      if (!q.options || q.options.length < 2)
        return { success: false, error: 'לכל שאלה חייבות להיות לפחות 2 תשובות' };
      if (!q.options.some((o) => o.id === q.correctId))
        return { success: false, error: 'יש לסמן תשובה נכונה לכל שאלה' };
    }

    const passScore = Math.min(100, Math.max(0, Math.round(data.passScore || 70)));

    // Upsert the quiz, then replace all questions (simplest correct approach).
    await prisma.$transaction(async (tx: any) => {
      const quiz = await tx.quiz.upsert({
        where: { lessonId },
        update: { title: data.title || null, passScore },
        create: { lessonId, title: data.title || null, passScore },
        select: { id: true },
      });
      await tx.quizQuestion.deleteMany({ where: { quizId: quiz.id } });
      for (let i = 0; i < data.questions.length; i++) {
        const q = data.questions[i];
        await tx.quizQuestion.create({
          data: {
            quizId: quiz.id,
            prompt: q.prompt,
            options: q.options,
            correctId: q.correctId,
            displayOrder: i,
          },
        });
      }
    });

    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה בשמירת הבוחן');
  }
}

// ---------------------------------------------------------------------------
// ATTACHMENTS (delete; upload handled by /api/admin/learning/attachments)
// ---------------------------------------------------------------------------

export async function deleteAttachmentAction(id: string) {
  try {
    await verifyAdmin();
    await prisma.lessonAttachment.delete({ where: { id } });
    revalidate();
    return { success: true };
  } catch (error) {
    return fail(error, 'שגיאה במחיקת קובץ');
  }
}

// ---------------------------------------------------------------------------
// SEED — import the legacy static catalog into the DB
// ---------------------------------------------------------------------------

export async function seedLearningAction(): Promise<
  Res & { categories?: number; subcategories?: number; lessons?: number }
> {
  try {
    await verifyAdmin();
    const result = await seedLearningCatalog();
    revalidate();
    return { success: true, ...result };
  } catch (error) {
    return fail(error, 'שגיאה בייבוא הקטלוג');
  }
}
