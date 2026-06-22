/**
 * Seed the DB course catalog from the static `COURSES_DATA`.
 *
 * Idempotent: upserts by slug at every level, so it's safe to run repeatedly
 * and safe to run against a DB that already has lazily-seeded rows (created by
 * the progress route's `ensureLessonSeeded`). Existing UserLessonProgress rows
 * are preserved because lessons are matched by their stable slug.
 *
 * Every seeded lesson is marked PUBLISHED so the portal (which only shows
 * PUBLISHED lessons) renders the full catalog immediately after seeding.
 */

import { prisma } from '@/lib/db';
import { COURSES_DATA } from '@/lib/courses-data';

export interface SeedResult {
  categories: number;
  subcategories: number;
  lessons: number;
}

export async function seedLearningCatalog(): Promise<SeedResult> {
  let categories = 0;
  let subcategories = 0;
  let lessons = 0;

  for (let ci = 0; ci < COURSES_DATA.length; ci++) {
    const cat = COURSES_DATA[ci];
    const category = await prisma.courseCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        displayOrder: ci,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        displayOrder: ci,
        isActive: true,
      },
      select: { id: true },
    });
    categories++;

    for (let si = 0; si < cat.subcategories.length; si++) {
      const sub = cat.subcategories[si];
      const subcategory = await prisma.courseSubcategory.upsert({
        where: { slug: sub.slug },
        update: {
          name: sub.name,
          description: sub.description,
          displayOrder: si,
          categoryId: category.id,
        },
        create: {
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          displayOrder: si,
          categoryId: category.id,
        },
        select: { id: true },
      });
      subcategories++;

      for (let li = 0; li < sub.lessons.length; li++) {
        const lesson = sub.lessons[li];
        await prisma.courseLesson.upsert({
          where: { slug: lesson.slug },
          update: {
            title: lesson.title,
            description: lesson.description,
            youtubeUrl: lesson.youtubeUrl,
            youtubeId: lesson.youtubeId,
            displayOrder: li,
            subcategoryId: subcategory.id,
            status: 'PUBLISHED',
            isActive: true,
            // Only set publishedAt if not already published.
            publishedAt: new Date(),
          },
          create: {
            title: lesson.title,
            slug: lesson.slug,
            description: lesson.description,
            youtubeUrl: lesson.youtubeUrl,
            youtubeId: lesson.youtubeId,
            displayOrder: li,
            subcategoryId: subcategory.id,
            status: 'PUBLISHED',
            isActive: true,
            publishedAt: new Date(),
          },
        });
        lessons++;
      }
    }
  }

  return { categories, subcategories, lessons };
}
