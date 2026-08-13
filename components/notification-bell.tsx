'use client';

/**
 * Unread-notifications bell, shared by the entrepreneur portal and the
 * advisor desk.
 *
 * The updates panel on the dashboard was the only place a mentor's reply
 * surfaced — and it sits below an early return for entrepreneurs with no
 * project, so plenty of them never saw it at all. The conversation itself
 * happens on the journey screen, which had no indicator whatsoever. In the
 * navbar it is visible from every page, and the mentor gets the same thing on
 * their desk for incoming requests.
 *
 * Marking read goes through /api/portal/notifications/read, which scopes the
 * update to the caller's own rows — so it is safe for any signed-in role.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADVISOR_AVATAR } from '@/lib/advisors';

export interface BellNotification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  type: string;
  createdAt: string;
}

export function NotificationBell({ initial }: { initial: BellNotification[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Keep in step with the server on navigation — a reply that arrives while
  // the tab is open shows up on the next page change.
  useEffect(() => {
    setItems(initial);
  }, [initial]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

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

  const openItem = (item: BellNotification) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    void markRead([item.id]);
    setOpen(false);
    if (item.link) router.push(item.link);
    else router.refresh();
  };

  const clearAll = async () => {
    const ids = items.map((i) => i.id);
    setItems([]);
    await markRead(ids);
    router.refresh();
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={items.length ? `${items.length} עדכונים חדשים` : 'עדכונים'}
        aria-expanded={open}
        className={cn(
          'relative p-2 rounded-lg transition-colors',
          items.length
            ? 'text-[#e8d48b] hover:bg-[#c8a951]/10'
            : 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]',
        )}
      >
        <Bell className="w-4 h-4" />
        {items.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#c8a951] text-[#1d1704] text-[10px] font-bold grid place-items-center">
            {items.length > 9 ? '9+' : items.length}
          </span>
        )}
      </button>

      {open && (
        <div
          dir="rtl"
          className="absolute left-0 mt-2 w-[min(88vw,340px)] rounded-2xl border border-white/[0.1] bg-[#0b1029] shadow-[0_18px_48px_rgba(0,0,0,0.55)] overflow-hidden z-50"
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.07]">
            <span className="text-[12.5px] font-bold text-white/85">עדכונים</span>
            {items.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-[11px] text-white/35 hover:text-[#e8d48b] transition-colors cursor-pointer"
              >
                <Check className="w-3 h-3" />
                סמן הכל כנקרא
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-[12.5px] text-white/35 text-center m-0">אין עדכונים חדשים</p>
          ) : (
            <ul className="m-0 p-0 list-none max-h-[60vh] overflow-y-auto divide-y divide-white/[0.05]">
              {items.map((item) => {
                // A reply from a mentor or the team wears the WeCcelerate mark;
                // anything else gets a neutral glyph.
                const fromHouse = item.type === 'success';
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => openItem(item)}
                      className="w-full text-right flex items-start gap-2.5 px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <span
                        className={cn(
                          'mt-0.5 grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full',
                          fromHouse
                            ? 'border border-[#c8a951]/35 bg-[#03061a]'
                            : 'bg-white/[0.06] text-white/45',
                        )}
                      >
                        {fromHouse ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={ADVISOR_AVATAR} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
                        ) : (
                          <MessageSquare className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] font-semibold text-white/90">{item.title}</span>
                        <span className="block text-[11.5px] text-white/45 mt-0.5 leading-relaxed line-clamp-2">
                          {item.message}
                        </span>
                        <span className="block text-[10.5px] text-white/25 mt-1">{relativeTime(item.createdAt)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
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
