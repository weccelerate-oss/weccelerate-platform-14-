'use client';

/**
 * "עדכונים" — the entrepreneur's unread notifications.
 *
 * The dashboard already queried these but never rendered them, so an advisor's
 * reply reached the DB and stopped there. Now it surfaces here: click an
 * update to mark it read and jump to whatever it points at (the journey
 * question, usually).
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, ChevronLeft, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UpdateItem {
  id: string;
  title: string;
  message: string;
  link: string | null;
  type: string;
  createdAt: string;
}

export function UpdatesPanel({ updates }: { updates: UpdateItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(updates);
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  if (items.length === 0) return null;

  const markRead = async (ids: string[]) => {
    try {
      await fetch('/api/portal/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
    } catch {
      /* the badge is not worth blocking navigation over */
    }
  };

  const open = (item: UpdateItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    void markRead([item.id]);
    if (item.link) {
      startTransition(() => router.push(item.link!));
    }
  };

  const clearAll = async () => {
    setBusy(true);
    const ids = items.map((i) => i.id);
    setItems([]);
    await markRead(ids);
    setBusy(false);
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#c8a951]/28 bg-gradient-to-br from-[#c8a951]/[0.10] to-white/[0.02] backdrop-blur-md overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[#c8a951]/15 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#c8a951]" />
          <h2 className="text-sm sm:text-[15px] font-semibold text-white/90">עדכונים</h2>
          <span className="rounded-full bg-[#c8a951] text-[#1d1704] text-[10.5px] font-bold px-1.5 py-px">
            {items.length}
          </span>
        </div>
        <button
          onClick={clearAll}
          disabled={busy}
          className="flex items-center gap-1 text-[11.5px] text-white/40 hover:text-[#e8d48b] transition-colors cursor-pointer disabled:opacity-40"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          סמן הכל כנקרא
        </button>
      </div>

      <ul className="divide-y divide-white/[0.06] m-0 p-0 list-none">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => open(item)}
              className="w-full text-right flex items-start gap-3 px-4 sm:px-5 py-3.5 hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
              <span
                className={cn(
                  'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full',
                  item.type === 'success'
                    ? 'bg-[#c8a951]/15 text-[#e8d48b]'
                    : 'bg-white/[0.06] text-white/50',
                )}
              >
                <MessageSquare className="w-4 h-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-semibold text-white/90">{item.title}</span>
                <span className="block text-[12.5px] text-white/50 mt-0.5 leading-relaxed line-clamp-2">
                  {item.message}
                </span>
                <span className="block text-[11px] text-white/30 mt-1">{relativeTime(item.createdAt)}</span>
              </span>
              {item.link && <ChevronLeft className="w-4 h-4 text-white/25 shrink-0 mt-2" />}
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function relativeTime(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '';
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `לפני ${mins} דק'`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'אתמול';
  if (days < 7) return `לפני ${days} ימים`;
  return new Date(then).toLocaleDateString('he-IL');
}
