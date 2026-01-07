/**
 * News Table Component
 * 
 * Table displaying all news updates with edit/delete actions.
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Edit,
  Trash2,
  Pin,
  MoreVertical,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteNewsAction, updateNewsAction } from '../actions';
import type { NewsUpdate } from '@prisma/client';

interface NewsTableProps {
  news: NewsUpdate[];
}

export function NewsTable({ news }: NewsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleToggleActive = (item: NewsUpdate) => {
    setActionId(item.id);
    startTransition(async () => {
      await updateNewsAction(item.id, { isActive: !item.isActive });
      router.refresh();
      setActionId(null);
    });
  };

  const handleTogglePinned = (item: NewsUpdate) => {
    setActionId(item.id);
    startTransition(async () => {
      await updateNewsAction(item.id, { isPinned: !item.isPinned });
      router.refresh();
      setActionId(null);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק עדכון זה?')) return;
    
    setActionId(id);
    startTransition(async () => {
      await deleteNewsAction(id);
      router.refresh();
      setActionId(null);
    });
  };

  const urgencyColors: Record<string, string> = {
    NORMAL: 'bg-slate-100 text-slate-700',
    IMPORTANT: 'bg-blue-100 text-blue-700',
    URGENT: 'bg-orange-100 text-orange-700',
    BREAKING: 'bg-red-100 text-red-700',
  };

  if (news.length === 0) {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500">אין עדכונים עדיין</p>
        <p className="text-sm text-slate-400 mt-1">הוסף עדכון חדש בטופס משמאל</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {news.map((item) => (
        <div
          key={item.id}
          className={cn(
            'p-4 hover:bg-slate-50 transition-colors',
            isPending && actionId === item.id && 'opacity-50'
          )}
        >
          <div className="flex items-start gap-4">
            {/* Status indicators */}
            <div className="flex flex-col items-center gap-2">
              <span className={cn(
                'px-2 py-1 text-xs font-medium rounded-full',
                urgencyColors[item.urgencyLevel]
              )}>
                {item.urgencyLevel}
              </span>
              {item.isPinned && (
                <Pin className="w-4 h-4 text-amber-500" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className={cn(
                    'font-medium',
                    item.isActive ? 'text-slate-900' : 'text-slate-400'
                  )}>
                    {item.title}
                  </h3>
                  {item.titleEn && (
                    <p className="text-sm text-slate-400 mt-0.5" dir="ltr">
                      {item.titleEn}
                    </p>
                  )}
                  {item.excerpt && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {item.excerpt}
                    </p>
                  )}
                </div>

                {/* Status badge */}
                <span className={cn(
                  'px-2 py-1 text-xs rounded-full flex-shrink-0',
                  item.isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                )}>
                  {item.isActive ? 'פעיל' : 'לא פעיל'}
                </span>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span>
                  נוצר: {new Date(item.createdAt).toLocaleDateString('he-IL')}
                </span>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-royal-600 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    קישור
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleActive(item)}
                disabled={isPending}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  item.isActive
                    ? 'text-emerald-600 hover:bg-emerald-50'
                    : 'text-slate-400 hover:bg-slate-100'
                )}
                title={item.isActive ? 'הסתר' : 'הצג'}
              >
                {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleTogglePinned(item)}
                disabled={isPending}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  item.isPinned
                    ? 'text-amber-600 hover:bg-amber-50'
                    : 'text-slate-400 hover:bg-slate-100'
                )}
                title={item.isPinned ? 'בטל נעיצה' : 'נעץ'}
              >
                <Pin className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                disabled={isPending}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                title="מחק"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NewsTable;
