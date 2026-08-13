'use client';

/**
 * Admin oversight of the mentor conversations: who is waiting, how long, how
 * the mentor answered — and a box to step in.
 */

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  MessageSquare,
  Send,
  Sparkles,
  Timer,
  UserRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminReplyToThreadAction, markAdvisorThreadNotificationsReadAction } from '../actions';

export interface AdminComment {
  id: string;
  authorType: 'ENTREPRENEUR' | 'ADVISOR' | 'ADMIN';
  authorName: string;
  body: string;
  createdAt: string;
}

export interface AdminThread {
  answerId: string;
  entrepreneur: { id: string; name: string; company: string | null };
  advisor: { id: string; name: string } | null;
  chapterName: string;
  questionPrompt: string;
  answerContent: string;
  aiFeedback: string | null;
  requestedAt: string;
  awaitingReply: boolean;
  waitingMs: number;
  overdue: boolean;
  /** How long the mentor took to answer the first time, or null if never. */
  firstReplyMs: number | null;
  entrepreneurMessages: number;
  advisorMessages: number;
  comments: AdminComment[];
}

type Filter = 'overdue' | 'waiting' | 'all';

export function AdvisorThreadsClient({
  threads: initial,
  unreadCount,
  overdueAfterMs,
}: {
  threads: AdminThread[];
  unreadCount: number;
  overdueAfterMs: number;
}) {
  const router = useRouter();
  const [threads, setThreads] = useState(initial);
  // A ?thread=<answerId> deep link — from a notification — opens that
  // conversation. It wins over the default filter, which would otherwise hide
  // the very thread the admin clicked through to read.
  const searchParams = useSearchParams();
  const deepLinkThread = searchParams.get('thread');

  const [filter, setFilter] = useState<Filter>(
    deepLinkThread
      ? 'all'
      : initial.some((t) => t.overdue)
        ? 'overdue'
        : initial.some((t) => t.awaitingReply)
          ? 'waiting'
          : 'all',
  );
  const [openId, setOpenId] = useState<string | null>(deepLinkThread);

  useEffect(() => {
    if (!deepLinkThread) return;
    setOpenId(deepLinkThread);
    setFilter('all');
  }, [deepLinkThread]);

  // Landing on this screen is reading the notifications that pointed at it.
  useEffect(() => {
    if (unreadCount > 0) void markAdvisorThreadNotificationsReadAction();
  }, [unreadCount]);

  const overdue = useMemo(() => threads.filter((t) => t.overdue), [threads]);
  const waiting = useMemo(() => threads.filter((t) => t.awaitingReply), [threads]);

  // Median rather than mean: one mentor who answered after three weeks should
  // not make the whole team look slow.
  const medianFirstReply = useMemo(() => {
    const values = threads
      .map((t) => t.firstReplyMs)
      .filter((v): v is number => typeof v === 'number' && v >= 0)
      .sort((a, b) => a - b);
    if (values.length === 0) return null;
    const mid = Math.floor(values.length / 2);
    return values.length % 2 ? values[mid] : Math.round((values[mid - 1] + values[mid]) / 2);
  }, [threads]);

  const visible = filter === 'overdue' ? overdue : filter === 'waiting' ? waiting : threads;

  const onReplied = (answerId: string, comment: AdminComment) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.answerId === answerId
          ? { ...t, comments: [...t.comments, comment], awaitingReply: false, overdue: false, waitingMs: 0 }
          : t,
      ),
    );
    router.refresh();
  };

  // Per-mentor responsiveness, so a slow mentor is visible as a person and not
  // just as a pile of late threads.
  const byAdvisor = useMemo(() => {
    const map = new Map<string, { name: string; waiting: number; overdue: number; replies: number[] }>();
    for (const t of threads) {
      if (!t.advisor) continue;
      const entry = map.get(t.advisor.id) ?? { name: t.advisor.name, waiting: 0, overdue: 0, replies: [] };
      if (t.awaitingReply) entry.waiting += 1;
      if (t.overdue) entry.overdue += 1;
      if (typeof t.firstReplyMs === 'number') entry.replies.push(t.firstReplyMs);
      map.set(t.advisor.id, entry);
    }
    return [...map.entries()].map(([id, e]) => ({
      id,
      name: e.name,
      waiting: e.waiting,
      overdue: e.overdue,
      avgReplyMs: e.replies.length
        ? Math.round(e.replies.reduce((a, b) => a + b, 0) / e.replies.length)
        : null,
    }));
  }, [threads]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-royal-500" />
          התכתבויות מלווים
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          כל שיחה בין יזם למלווה. רואים כמה זמן פנייה ממתינה, איך המלווה ענה, וכמה כל צד כותב —
          ואפשר להצטרף לשיחה בעצמך.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="באיחור" value={overdue.length} icon={<AlertTriangle className="w-4 h-4" />} alert={overdue.length > 0} />
        <Stat label="ממתינות למענה" value={waiting.length} icon={<Clock className="w-4 h-4" />} />
        <Stat label="סה״כ שיחות" value={threads.length} icon={<MessageSquare className="w-4 h-4" />} />
        <Stat
          label="זמן מענה חציוני"
          text={medianFirstReply === null ? '—' : formatDuration(medianFirstReply)}
          icon={<Timer className="w-4 h-4" />}
        />
      </div>

      {byAdvisor.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-semibold text-slate-500 mb-3">לפי מלווה</div>
          <div className="flex flex-wrap gap-2">
            {byAdvisor.map((a) => (
              <div
                key={a.id}
                className={cn(
                  'rounded-xl border px-3 py-2 text-xs',
                  a.overdue > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200',
                )}
              >
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <UserRound className="w-3.5 h-3.5 text-slate-400" />
                  {a.name}
                </div>
                <div className={cn('mt-0.5', a.overdue > 0 ? 'text-red-700' : 'text-slate-500')}>
                  {a.waiting} ממתינות
                  {a.overdue > 0 && ` · ${a.overdue} באיחור`}
                  {a.avgReplyMs !== null && ` · מענה ממוצע ${formatDuration(a.avgReplyMs)}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 border-b border-slate-200">
        <Tab active={filter === 'overdue'} onClick={() => setFilter('overdue')}>
          באיחור
          {overdue.length > 0 && (
            <span className="mr-1.5 rounded-full bg-red-600 text-white text-[10.5px] font-bold px-1.5 py-px">
              {overdue.length}
            </span>
          )}
        </Tab>
        <Tab active={filter === 'waiting'} onClick={() => setFilter('waiting')}>
          ממתינות למענה ({waiting.length})
        </Tab>
        <Tab active={filter === 'all'} onClick={() => setFilter('all')}>
          כל השיחות ({threads.length})
        </Tab>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 m-0">
            {filter === 'overdue'
              ? `אין פניות שממתינות יותר מ-${formatDuration(overdueAfterMs)}`
              : filter === 'waiting'
                ? 'כל הפניות נענו'
                : 'עוד לא נשלחו פניות למלווים'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((t) => (
            <ThreadCard
              key={t.answerId}
              thread={t}
              open={openId === t.answerId}
              onToggle={() => setOpenId(openId === t.answerId ? null : t.answerId)}
              onReplied={(c) => onReplied(t.answerId, c)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ThreadCard({
  thread,
  open,
  onToggle,
  onReplied,
}: {
  thread: AdminThread;
  open: boolean;
  onToggle: () => void;
  onReplied: (c: AdminComment) => void;
}) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    const body = draft.trim();
    if (body.length < 2) return;
    setError(null);
    startTransition(async () => {
      const res = await adminReplyToThreadAction(thread.answerId, body);
      if (!res.success || !res.comment) {
        setError(res.error ?? 'השליחה נכשלה');
        return;
      }
      setDraft('');
      onReplied(res.comment);
    });
  };

  // A thread where the entrepreneur has written a lot more than the mentor is
  // the "חופר" signal the admin asked for.
  const lopsided = thread.entrepreneurMessages >= 3 && thread.entrepreneurMessages > thread.advisorMessages * 2;

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border overflow-hidden',
        thread.overdue ? 'border-red-300' : thread.awaitingReply ? 'border-amber-300' : 'border-slate-200',
      )}
    >
      <button
        onClick={onToggle}
        className="w-full text-right p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
        aria-expanded={open}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-500 to-cyan-500 grid place-items-center text-white font-semibold flex-shrink-0">
          {thread.entrepreneur.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-900">{thread.entrepreneur.name}</span>
            {thread.entrepreneur.company && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Building2 className="w-3 h-3" />
                {thread.entrepreneur.company}
              </span>
            )}
            <span className="text-xs text-slate-400">←</span>
            <span className="text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5">
              {thread.advisor?.name ?? 'ללא מלווה'}
            </span>

            {thread.overdue ? (
              <span className="text-[11px] font-bold rounded-full bg-red-100 text-red-700 px-2 py-0.5">
                ממתין {formatDuration(thread.waitingMs)}
              </span>
            ) : thread.awaitingReply ? (
              <span className="text-[11px] font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5">
                ממתין {formatDuration(thread.waitingMs)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                <CheckCircle2 className="w-3 h-3" /> נענה
              </span>
            )}

            {lopsided && (
              <span
                title="היזם כתב הרבה יותר מהמלווה בשיחה הזו"
                className="text-[11px] rounded-full bg-slate-100 text-slate-600 px-2 py-0.5"
              >
                {thread.entrepreneurMessages}↔{thread.advisorMessages}
              </span>
            )}
          </div>

          <div className="text-sm text-slate-600 mt-1 line-clamp-2">{thread.questionPrompt}</div>

          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 flex-wrap">
            <span>נשלח {new Date(thread.requestedAt).toLocaleDateString('he-IL')}</span>
            {thread.firstReplyMs !== null && <span>מענה ראשון אחרי {formatDuration(thread.firstReplyMs)}</span>}
            {thread.chapterName && <span>{thread.chapterName}</span>}
          </div>
        </div>

        <ChevronDown className={cn('w-4 h-4 text-slate-300 flex-shrink-0 mt-1 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/50">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
              התשובה של {thread.entrepreneur.name}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line m-0 bg-white rounded-lg border border-slate-200 px-4 py-3">
              {thread.answerContent}
            </p>
          </div>

          {thread.aiFeedback && (
            <div>
              <div className="text-[11px] font-semibold text-amber-700 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                חוות הדעת האוטומטית
              </div>
              <p className="text-[13px] text-amber-900/80 leading-relaxed whitespace-pre-line m-0 bg-amber-50 rounded-lg border border-amber-200 px-4 py-3">
                {thread.aiFeedback}
              </p>
            </div>
          )}

          {thread.comments.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400">השיחה</div>
              {thread.comments.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    'rounded-lg px-3.5 py-2.5 text-[13px] leading-relaxed max-w-[92%] border',
                    c.authorType === 'ADVISOR'
                      ? 'bg-purple-50 border-purple-200 mr-auto'
                      : c.authorType === 'ADMIN'
                        ? 'bg-royal-50 border-royal-200 mr-auto'
                        : 'bg-white border-slate-200 ml-auto',
                  )}
                >
                  <div
                    className={cn(
                      'text-[10.5px] font-bold mb-0.5',
                      c.authorType === 'ADVISOR'
                        ? 'text-purple-700'
                        : c.authorType === 'ADMIN'
                          ? 'text-royal-700'
                          : 'text-slate-500',
                    )}
                  >
                    {c.authorName}
                    {c.authorType === 'ADVISOR' && ' · מלווה'}
                    {c.authorType === 'ADMIN' && ' · צוות'}
                    <span className="font-normal text-slate-400 mr-2">
                      {new Date(c.createdAt).toLocaleString('he-IL', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-slate-700 whitespace-pre-line">{c.body}</div>
                </div>
              ))}
            </div>
          )}

          <div>
            <textarea
              dir="rtl"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`להצטרף לשיחה כצוות WeCcelerate...`}
              rows={3}
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-400"
            />
            {error && <p className="text-[13px] text-red-600 mt-2 mb-0">{error}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={submit}
                disabled={isPending || draft.trim().length < 2}
                className="flex items-center gap-2 px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {isPending ? 'שולח...' : 'שלח ליזם'}
              </button>
              <span className="text-[11.5px] text-slate-400">
                נשלח בשם &quot;צוות WeCcelerate&quot; — היזם והמלווה שניהם מקבלים עדכון.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  text,
  icon,
  alert,
}: {
  label: string;
  value?: number;
  text?: string;
  icon: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <div className={cn('rounded-xl border px-4 py-3', alert ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200')}>
      <div className={cn('flex items-center gap-1.5', alert ? 'text-red-600' : 'text-slate-400')}>
        {icon}
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <div className={cn('text-2xl font-bold mt-1', alert ? 'text-red-700' : 'text-slate-900')}>
        {text ?? value}
      </div>
    </div>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer',
        active ? 'border-royal-600 text-royal-700' : 'border-transparent text-slate-400 hover:text-slate-600',
      )}
    >
      {children}
    </button>
  );
}

/** "3 שעות" / "יומיים" — coarse on purpose; nobody needs minutes here. */
function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${Math.max(1, mins)} דק'`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} שעות`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'יום';
  if (days === 2) return 'יומיים';
  return `${days} ימים`;
}
