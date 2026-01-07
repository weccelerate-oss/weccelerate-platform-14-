/**
 * Success Stories Management Page
 * 
 * Admin interface for managing success stories and testimonials.
 */

import { Metadata } from 'next';
import { Plus, Star, Building2, Quote } from 'lucide-react';
import { StoriesTable } from './stories-table';
import { StoryFormDialog } from './story-form-dialog';

export const metadata: Metadata = {
  title: 'סיפורי הצלחה | Admin',
  description: 'ניהול סיפורי הצלחה והמלצות',
};

// Mock data for fallback
const MOCK_STORIES = [
  {
    id: 'story-1',
    companyName: 'HealthTech AI',
    logoUrl: null,
    industry: 'HealthTech',
    website: 'https://healthtech.ai',
    quote: 'וויסלרייט עזרו לנו להפוך מרעיון לחברה עם מוצר ולקוחות משלמים.',
    quoteEn: null,
    personName: 'דני כהן',
    personRole: 'מייסד ומנכ"ל',
    personImage: null,
    metrics: { items: [{ label: 'גיוס', value: '$2M' }] },
    slug: 'healthtech-ai',
    fullStory: null,
    fullStoryEn: null,
    projectLink: null,
    collaborationDate: '2024',
    programName: 'מאיץ לאומית',
    order: 1,
    isActive: true,
    isFeatured: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

async function getStories() {
  try {
    const { prisma } = await import('@/lib/db');
    const stories = await prisma.successStory.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return stories;
  } catch (error) {
    console.warn('[Admin Stories] Database error, using mock data:', error);
    return MOCK_STORIES;
  }
}

export default async function StoriesPage() {
  const stories = await getStories();

  const stats = {
    total: stories.length,
    featured: stories.filter(s => s.isFeatured).length,
    active: stories.filter(s => s.isActive).length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">סיפורי הצלחה</h1>
          <p className="text-slate-500 mt-1">
            {stats.total} סיפורים • {stats.featured} מומלצים • {stats.active} פעילים
          </p>
        </div>
        
        <StoryFormDialog mode="create">
          <button className="flex items-center gap-2 px-4 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>סיפור חדש</span>
          </button>
        </StoryFormDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-sm text-slate-500">סה״כ סיפורים</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.featured}</p>
              <p className="text-sm text-slate-500">מומלצים</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Quote className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
              <p className="text-sm text-slate-500">פעילים</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stories Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <StoriesTable stories={stories} />
      </div>
    </div>
  );
}
