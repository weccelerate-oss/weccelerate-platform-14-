/**
 * News Ticker Management Page
 * 
 * CRUD interface for managing news ticker updates.
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { NewsTable } from './news-table';
import { NewsForm } from './news-form';
import { prisma } from '@/lib/db';

export const metadata: Metadata = {
  title: 'ניהול עדכונים | Admin',
  description: 'ניהול עדכוני הטיקר',
};

async function getNewsUpdates() {
  try {
    const news = await prisma.newsUpdate.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return news;
  } catch (error) {
    console.error('[Admin] Error fetching news:', error);
    return [];
  }
}

export default async function NewsManagementPage() {
  const news = await getNewsUpdates();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">ניהול עדכונים</h1>
          <p className="text-slate-500 mt-1">נהל את עדכוני הטיקר באתר</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* News Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              הוספת עדכון חדש
            </h2>
            <NewsForm />
          </div>
        </div>

        {/* News Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">
                עדכונים קיימים ({news.length})
              </h2>
            </div>
            <Suspense fallback={<div className="p-6">טוען...</div>}>
              <NewsTable news={news} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
