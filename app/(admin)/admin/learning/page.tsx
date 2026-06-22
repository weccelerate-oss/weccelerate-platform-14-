/**
 * Admin: Learning Center management.
 *
 * Full control over the course catalog — categories, subcategories, lessons,
 * videos, attachments, quizzes, ordering and publish state.
 */

export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { getAdminCatalog, type AdminCategory } from '@/lib/learning/repository';
import { LearningManager } from './learning-manager';

export const metadata: Metadata = {
  title: 'ניהול שיעורים | Admin',
  description: 'ניהול מרכז הלמידה — קטגוריות, שיעורים, סרטונים ובחנים',
};

export default async function AdminLearningPage() {
  let catalog: AdminCategory[] = [];
  let loadError: string | null = null;
  try {
    catalog = await getAdminCatalog();
  } catch (err) {
    loadError = err instanceof Error ? err.message : String(err);
    console.error('[Admin Learning] load failed:', err);
  }

  const totals = catalog.reduce(
    (acc, c) => {
      acc.subcategories += c.subcategories.length;
      for (const s of c.subcategories) acc.lessons += s.lessons.length;
      return acc;
    },
    { subcategories: 0, lessons: 0 },
  );

  return (
    <div className="p-4 sm:p-6 pt-14 lg:pt-6">
      <LearningManager
        catalog={catalog}
        stats={{
          categories: catalog.length,
          subcategories: totals.subcategories,
          lessons: totals.lessons,
        }}
        loadError={loadError}
      />
    </div>
  );
}
