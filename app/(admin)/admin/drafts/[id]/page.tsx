/**
 * /admin/drafts/[id] — full preview of a draft guide, rendered with the SAME
 * component the public /guides/[slug] page uses, so what you approve is
 * exactly what readers will see.
 */

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { renderGeneratedGuide } from '@/app/sites/main/guides/[slug]/generated-guide-view';
import { publishDraftAction, discardDraftAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function DraftPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guide = await prisma.generatedGuide.findUnique({ where: { id } });
  if (!guide || guide.status !== 'draft') notFound();

  return (
    <div dir="rtl">
      <div className="sticky top-0 z-50 flex flex-wrap items-center gap-3 border-b-2 border-amber-300 bg-amber-50 px-6 py-3">
        <span className="text-sm font-bold text-amber-900">
          תצוגה מקדימה — הטיוטה לא פורסמה
        </span>
        <span className="text-xs text-amber-800">
          Fact-check {guide.factCheckScore ?? '—'} · SEO {guide.seoScore ?? '—'}
        </span>
        <div className="ms-auto flex items-center gap-2">
          <Link
            href="/admin/drafts"
            className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-semibold text-amber-900 hover:bg-amber-100"
          >
            ← חזרה לרשימה
          </Link>
          <form
            action={async () => {
              'use server';
              await publishDraftAction(id);
              redirect('/admin/drafts');
            }}
          >
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              ✅ פרסם עכשיו
            </button>
          </form>
          <form
            action={async () => {
              'use server';
              await discardDraftAction(id);
              redirect('/admin/drafts');
            }}
          >
            <button
              type="submit"
              className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-50"
            >
              🗑 דחה
            </button>
          </form>
        </div>
      </div>

      {renderGeneratedGuide(guide)}
    </div>
  );
}
