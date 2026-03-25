'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Star,
  StarOff,
  Eye,
  EyeOff,
  ExternalLink,
  Building2
} from 'lucide-react';
import { StoryFormDialog } from './story-form-dialog';
import { deleteStoryAction, toggleStoryActiveAction, toggleStoryFeaturedAction } from '../actions';

interface Story {
  id: string;
  companyName: string;
  logoUrl: string | null;
  industry: string | null;
  website: string | null;
  quote: string;
  personName: string | null;
  personRole: string | null;
  slug: string;
  programName: string | null;
  collaborationDate: string | null;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
}

interface StoriesTableProps {
  stories: Story[];
}

export function StoriesTable({ stories }: StoriesTableProps) {
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string, companyName: string) => {
    if (confirm(`האם למחוק את "${companyName}"?`)) {
      startTransition(async () => {
        try {
          const result = await deleteStoryAction(id);
          if (!result.success) {
            alert(result.error || 'שגיאה במחיקת הסיפור');
          }
        } catch (err) {
          alert('שגיאה בתקשורת עם השרת: ' + (err instanceof Error ? err.message : String(err)));
        }
        router.refresh();
      });
    }
    setOpenMenuId(null);
  };

  const handleToggleActive = (id: string) => {
    startTransition(async () => {
      try {
        const result = await toggleStoryActiveAction(id);
        if (!result.success) {
          alert(result.error || 'שגיאה בעדכון הנראות');
        }
      } catch (err) {
        alert('שגיאה בתקשורת עם השרת: ' + (err instanceof Error ? err.message : String(err)));
      }
      router.refresh();
    });
    setOpenMenuId(null);
  };

  const handleToggleFeatured = (id: string) => {
    startTransition(async () => {
      try {
        const result = await toggleStoryFeaturedAction(id);
        if (!result.success) {
          alert(result.error || 'שגיאה בעדכון מומלץ');
        }
      } catch (err) {
        alert('שגיאה בתקשורת עם השרת: ' + (err instanceof Error ? err.message : String(err)));
      }
      router.refresh();
    });
    setOpenMenuId(null);
  };

  if (stories.length === 0) {
    return (
      <div className="p-12 text-center">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">אין סיפורי הצלחה</h3>
        <p className="text-slate-500">התחל להוסיף סיפורי הצלחה של הסטארטאפים שלך</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-slate-100">
        {stories.map((story) => (
          <div key={story.id} className="p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {story.logoUrl ? (
                  <img src={story.logoUrl} alt={story.companyName} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 text-sm">{story.companyName}</p>
                  {story.personName && (
                    <p className="text-xs text-slate-500">{story.personName}{story.personRole && ` • ${story.personRole}`}</p>
                  )}
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">{story.quote}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {story.industry && (
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{story.industry}</span>
                    )}
                    {story.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px]">
                        <Eye className="w-2.5 h-2.5" /> פעיל
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px]">
                        <EyeOff className="w-2.5 h-2.5" /> מוסתר
                      </span>
                    )}
                    {story.isFeatured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px]">
                        <Star className="w-2.5 h-2.5" /> מומלץ
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setOpenMenuId(openMenuId === story.id ? null : story.id)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4 text-slate-500" />
                </button>
                {openMenuId === story.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                    <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                      <StoryFormDialog mode="edit" story={story}>
                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <Pencil className="w-4 h-4" /> ערוך
                        </button>
                      </StoryFormDialog>
                      <button onClick={() => handleToggleActive(story.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        {story.isActive ? <><EyeOff className="w-4 h-4" /> הסתר</> : <><Eye className="w-4 h-4" /> הצג</>}
                      </button>
                      <button onClick={() => handleToggleFeatured(story.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        {story.isFeatured ? <><StarOff className="w-4 h-4" /> הסר מומלץ</> : <><Star className="w-4 h-4" /> סמן כמומלץ</>}
                      </button>
                      {story.website && (
                        <a href={story.website} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <ExternalLink className="w-4 h-4" /> לאתר החברה
                        </a>
                      )}
                      <hr className="my-1" />
                      <button onClick={() => handleDelete(story.id, story.companyName)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" /> מחק
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">חברה</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">תעשייה</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">ציטוט</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">תוכנית</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-slate-600">סטטוס</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-slate-600">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stories.map((story) => (
              <tr key={story.id} className="hover:bg-slate-50">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {story.logoUrl ? (
                      <img src={story.logoUrl} alt={story.companyName} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{story.companyName}</p>
                      {story.personName && <p className="text-sm text-slate-500">{story.personName}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4"><span className="text-sm text-slate-600">{story.industry || '-'}</span></td>
                <td className="px-4 py-4 max-w-xs"><p className="text-sm text-slate-600 line-clamp-2">{story.quote}</p></td>
                <td className="px-4 py-4"><span className="text-sm text-slate-600">{story.programName || '-'}</span></td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {story.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"><Eye className="w-3 h-3" /> פעיל</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs"><EyeOff className="w-3 h-3" /> מוסתר</span>
                    )}
                    {story.isFeatured && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs"><Star className="w-3 h-3" /> מומלץ</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="relative flex items-center justify-center">
                    <button onClick={() => setOpenMenuId(openMenuId === story.id ? null : story.id)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-slate-500" />
                    </button>
                    {openMenuId === story.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                          <StoryFormDialog mode="edit" story={story}>
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"><Pencil className="w-4 h-4" /> ערוך</button>
                          </StoryFormDialog>
                          <button onClick={() => handleToggleActive(story.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            {story.isActive ? <><EyeOff className="w-4 h-4" /> הסתר</> : <><Eye className="w-4 h-4" /> הצג</>}
                          </button>
                          <button onClick={() => handleToggleFeatured(story.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                            {story.isFeatured ? <><StarOff className="w-4 h-4" /> הסר מומלץ</> : <><Star className="w-4 h-4" /> סמן כמומלץ</>}
                          </button>
                          {story.website && (
                            <a href={story.website} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                              <ExternalLink className="w-4 h-4" /> לאתר החברה
                            </a>
                          )}
                          <hr className="my-1" />
                          <button onClick={() => handleDelete(story.id, story.companyName)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" /> מחק
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
