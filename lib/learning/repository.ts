/**
 * Learning Center data access.
 *
 * The DB (CourseCategory → CourseSubcategory → CourseLesson) is the source of
 * truth. The static `COURSES_DATA` catalog is kept only as a seed source and
 * a safety-net fallback: if the DB is empty (not yet seeded) or unreachable,
 * the portal still renders the original catalog so entrepreneurs never see a
 * blank Learning Center.
 */

import { prisma } from '@/lib/db';
import { COURSES_DATA } from '@/lib/courses-data';
import type {
  CategoryData,
  LessonAttachmentData,
  QuizData,
} from '@/lib/courses-data';

// ---------------------------------------------------------------------------
// Admin-facing shapes (carry ids + status + draft lessons)
// ---------------------------------------------------------------------------

export interface AdminLesson {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  youtubeUrl: string | null;
  youtubeId: string | null;
  duration: number | null;
  displayOrder: number;
  status: 'DRAFT' | 'PUBLISHED';
  attachments: LessonAttachmentData[];
  quiz: QuizData | null; // includes correctId (admin only)
}

export interface AdminSubcategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  lessons: AdminLesson[];
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  displayOrder: number;
  isActive: boolean;
  subcategories: AdminSubcategory[];
}

// Prisma row shapes (kept loose — lib/db is typed as `any`).
type LessonRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  youtubeUrl: string | null;
  youtubeId: string | null;
  duration: number | null;
  displayOrder: number;
  status: 'DRAFT' | 'PUBLISHED';
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    mimeType: string | null;
    size: number | null;
  }>;
  quiz?: {
    id: string;
    title: string | null;
    passScore: number;
    questions: Array<{
      id: string;
      prompt: string;
      options: unknown;
      correctId: string;
    }>;
  } | null;
};

function mapQuiz(quiz: LessonRow['quiz'], includeAnswer: boolean): QuizData | null {
  if (!quiz) return null;
  return {
    id: quiz.id,
    title: quiz.title,
    passScore: quiz.passScore,
    questions: (quiz.questions ?? []).map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: Array.isArray(q.options)
        ? (q.options as { id: string; text: string }[])
        : [],
      ...(includeAnswer ? { correctId: q.correctId } : {}),
    })),
  };
}

function mapAttachments(
  rows: LessonRow['attachments'],
): LessonAttachmentData[] {
  return (rows ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    url: a.url,
    mimeType: a.mimeType,
    size: a.size,
  }));
}

const LESSON_INCLUDE = {
  attachments: { orderBy: { displayOrder: 'asc' as const } },
  quiz: { include: { questions: { orderBy: { displayOrder: 'asc' as const } } } },
};

// ---------------------------------------------------------------------------
// Portal: published catalog (CategoryData[]) with answer-stripped quizzes
// ---------------------------------------------------------------------------

export async function getPublishedCatalog(): Promise<CategoryData[]> {
  try {
    const cats = await prisma.courseCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        subcategories: {
          orderBy: { displayOrder: 'asc' },
          include: {
            lessons: {
              where: { status: 'PUBLISHED' },
              orderBy: { displayOrder: 'asc' },
              include: LESSON_INCLUDE,
            },
          },
        },
      },
    });

    const mapped: CategoryData[] = (cats ?? []).map((c: any) => ({
      name: c.name,
      slug: c.slug,
      description: c.description ?? '',
      icon: c.icon ?? 'BookOpen',
      color: c.color ?? 'blue',
      image: '',
      subcategories: (c.subcategories ?? []).map((s: any) => ({
        name: s.name,
        slug: s.slug,
        description: s.description ?? '',
        lessons: (s.lessons ?? []).map((l: LessonRow) => ({
          title: l.title,
          slug: l.slug,
          youtubeUrl: l.youtubeUrl ?? '',
          youtubeId: l.youtubeId ?? '',
          description: l.description ?? '',
          content: l.content,
          attachments: mapAttachments(l.attachments),
          quiz: mapQuiz(l.quiz ?? null, /* includeAnswer */ false),
        })),
      })),
    }));

    // Keep only categories that actually have published lessons.
    const nonEmpty = mapped
      .map((c) => ({
        ...c,
        subcategories: c.subcategories.filter((s) => s.lessons.length > 0),
      }))
      .filter((c) => c.subcategories.length > 0);

    if (nonEmpty.length === 0) {
      // DB not seeded yet — fall back to the static catalog so the portal
      // is never blank.
      return COURSES_DATA;
    }

    // Carry over the nice background images from the static catalog when the
    // slugs match (the DB doesn't store them).
    const imageBySlug = new Map(COURSES_DATA.map((c) => [c.slug, c.image]));
    for (const c of nonEmpty) {
      c.image = imageBySlug.get(c.slug) ?? c.image;
    }

    return nonEmpty;
  } catch (err) {
    console.error('[learning] getPublishedCatalog failed, using static fallback:', err);
    return COURSES_DATA;
  }
}

// ---------------------------------------------------------------------------
// Admin: full catalog (all categories + draft lessons + answers)
// ---------------------------------------------------------------------------

export async function getAdminCatalog(): Promise<AdminCategory[]> {
  const cats = await prisma.courseCategory.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      subcategories: {
        orderBy: { displayOrder: 'asc' },
        include: {
          lessons: {
            orderBy: { displayOrder: 'asc' },
            include: LESSON_INCLUDE,
          },
        },
      },
    },
  });

  return (cats ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    icon: c.icon ?? null,
    color: c.color ?? null,
    displayOrder: c.displayOrder,
    isActive: c.isActive,
    subcategories: (c.subcategories ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description ?? null,
      displayOrder: s.displayOrder,
      lessons: (s.lessons ?? []).map((l: LessonRow) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        description: l.description,
        content: l.content,
        youtubeUrl: l.youtubeUrl,
        youtubeId: l.youtubeId,
        duration: l.duration,
        displayOrder: l.displayOrder,
        status: l.status,
        attachments: mapAttachments(l.attachments),
        quiz: mapQuiz(l.quiz ?? null, /* includeAnswer */ true),
      })),
    })),
  }));
}
