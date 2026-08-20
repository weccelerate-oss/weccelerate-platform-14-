'use client';

/**
 * Advisor desk — client side.
 *
 * Two lists: the threads waiting on the advisor and everything else. A card
 * expands in place into the full context (question, the entrepreneur's answer,
 * the AI review, the conversation) plus the reply box, so answering never
 * costs a page load.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Inbox,
  LogOut,
  MessageSquare,
  Send,
  Sparkles,
  Users,
  Table2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationBell, type BellNotification } from '@/components/notification-bell';

export interface DeskComment {
  id: string;
  authorType: 'ENTREPRENEUR' | 'ADVISOR' | 'ADMIN';
  authorName: string;
  body: string;
  createdAt: string;
}

export interface DeskThread {
  answerId: string;
  entrepreneur: { id: string; name: string; company: string | null };
  advisorName: string | null;
  chapterName: string;
  questionPrompt: string;
  answerContent: string;
  answerStatus: string;
  aiFeedback: string | null;
  requestedAt: string;
  lastActivityAt: string;
  needsReply: boolean;
  comments: DeskComment[];
}

export interface DeskAdvisee {
  id: string;
  name: string;
  company: string | null;
  plan: string;
  advisorName: string | null;
  answersCount: number;
  openThreads: number;
  lastLoginAt: string | null;
}

type Tab = 'waiting' | 'all' | 'people';

export function AdvisorDesk({
  advisorName,
  isAdmin,
  threads: initialThreads,
  advisees,
  notifications = [],
}: {
  advisorName: string;
  isAdmin: boolean;
  threads: DeskThread[];
  advisees: DeskAdvisee[];
  /** Unread notifications — new requests and follow-ups from entrepreneurs. */
  notifications?: BellNotification[];
}) {
  const [threads, setThreads] = useState(initialThreads);
  const [tab, setTab] = useState<Tab>('waiting');

  // A ?thread=<answerId> deep link — from a notification — opens that card
  // directly. It also forces the "all" tab, because the thread being linked
  // to may well be one that has already been answered.
  const searchParams = useSearchParams();
  const deepLinkThread = searchParams.get('thread');
  const [openId, setOpenId] = useState<string | null>(deepLinkThread);

  useEffect(() => {
    if (!deepLinkThread) return;
    setOpenId(deepLinkThread);
    if (!initialThreads.some((t) => t.answerId === deepLinkThread && t.needsReply)) {
      setTab('all');
    }
  }, [deepLinkThread, initialThreads]);

  const waiting = useMemo(() => threads.filter((t) => t.needsReply), [threads]);
  const answered = useMemo(() => threads.filter((t) => !t.needsReply), [threads]);

  const visible = tab === 'waiting' ? waiting : tab === 'all' ? threads : [];

  const onReplied = (answerId: string, comment: DeskComment) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.answerId === answerId
          ? {
              ...t,
              comments: [...t.comments, comment],
              needsReply: false,
              lastActivityAt: comment.createdAt,
            }
          : t,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-[#070b1e] text-white" dir="rtl">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(900px 460px at 88% -8%, rgba(200,169,81,0.11), transparent 60%), radial-gradient(700px 460px at -8% 42%, rgba(63,86,201,0.11), transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* ── header ─────────────────────────────────────────────── */}
        <header className="flex items-start justify-between gap-4 mb-7">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/weccelerate-gold-trimmed.png" alt="WeCcelerate" className="h-9 w-auto shrink-0" />
            <div className="min-w-0">
              <div className="text-[10.5px] tracking-[0.24em] text-[#c8a951] font-bold">אזור המלווה</div>
              <div className="text-[15px] font-bold text-white/95 truncate">
                בוקר טוב, {advisorName}
                {isAdmin && <span className="text-white/40 font-normal text-[13px]"> · תצוגת אדמין</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
          <NotificationBell initial={notifications} />
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-1.5 shrink-0 rounded-xl border border-white/[0.12] px-3 py-2 text-[12.5px] text-white/55 hover:text-white/90 hover:border-white/25 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            התנתק
          </button>
          </div>
        </header>

        {/* ── the one number that matters ─────────────────────────── */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6">
          <Stat
            icon={<Inbox className="w-4 h-4" />}
            value={waiting.length}
            label="ממתינות לך"
            accent={waiting.length > 0}
          />
          <Stat icon={<MessageSquare className="w-4 h-4" />} value={threads.length} label="שיחות פתוחות" />
          <Stat icon={<Users className="w-4 h-4" />} value={advisees.length} label="היזמים שלי" />
        </div>

        {/* ── tabs ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 mb-5 border-b border-white/[0.08]">
          <TabButton active={tab === 'waiting'} onClick={() => setTab('waiting')}>
            ממתינות לתשובה
            {waiting.length > 0 && (
              <span className="mr-1.5 rounded-full bg-[#c8a951] text-[#1d1704] text-[10.5px] font-bold px-1.5 py-px">
                {waiting.length}
              </span>
            )}
          </TabButton>
          <TabButton active={tab === 'all'} onClick={() => setTab('all')}>
            כל השיחות
          </TabButton>
          <TabButton active={tab === 'people'} onClick={() => setTab('people')}>
            היזמים שלי
          </TabButton>
        </div>

        {/* ── people tab ──────────────────────────────────────────── */}
        {tab === 'people' && (
          <div className="space-y-2.5">
            {advisees.length === 0 && (
              <Empty
                title="עוד לא שויכו אליך יזמים"
                body="מנהל המערכת משייך יזמים מתוכנית המשקיעים למלווה. ברגע שישויך אליך יזם — הוא יופיע כאן."
              />
            )}
            {advisees.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-white/[0.09] bg-white/[0.03] px-4 py-3.5 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c8a951] to-[#e8d48b] grid place-items-center text-[#070b1e] font-bold text-[13px] shrink-0">
                  {p.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold text-white/90 truncate">
                    {p.name}
                    {p.company && <span className="text-white/35 font-normal"> · {p.company}</span>}
                  </div>
                  <div className="text-[11.5px] text-white/40 mt-0.5">
                    {p.answersCount} תשובות במסע · {p.openThreads} שיחות איתך
                    {isAdmin && p.advisorName && ` · מלווה: ${p.advisorName}`}
                  </div>
                </div>
                {p.openThreads === 0 && (
                  <span className="text-[11px] text-white/30 shrink-0">טרם פנה אליך</span>
                )}
                <Link
                  href={`/advisor/entrepreneur/${p.id}/trackers`}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-[#c8a951]/30 px-3 py-1.5 text-[11.5px] font-semibold text-[#e8d48b] hover:bg-[#c8a951]/10 transition-colors"
                >
                  <Table2 className="w-3.5 h-3.5" />
                  שיחות ופניות
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* ── thread lists ────────────────────────────────────────── */}
        {tab !== 'people' && (
          <div className="space-y-3">
            {visible.length === 0 && (
              <Empty
                title={tab === 'waiting' ? 'הכול מטופל — אין פניות ממתינות' : 'עוד אין פניות'}
                body={
                  tab === 'waiting'
                    ? answered.length > 0
                      ? 'ענית לכל מה שהגיע. פנייה חדשה תופיע כאן וגם תישלח לך במייל.'
                      : 'כשיזם ישלח אליך תשובה לחוות דעת — היא תופיע כאן וגם תישלח לך במייל.'
                    : 'כשיזם ישלח אליך תשובה לחוות דעת — היא תופיע כאן וגם תישלח לך במייל.'
                }
              />
            )}
            {visible.map((t) => (
              <ThreadCard
                key={t.answerId}
                thread={t}
                isAdmin={isAdmin}
                open={openId === t.answerId}
                onToggle={() => setOpenId(openId === t.answerId ? null : t.answerId)}
                onReplied={(c) => onReplied(t.answerId, c)}
              />
            ))}
          </div>
        )}

        <p className="text-[11.5px] text-white/25 text-center mt-10">
          WeCcelerate · אזור המלווה — היזמים רואים את השם שלך, לא את כתובת המייל.
        </p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────

function ThreadCard({
  thread,
  isAdmin,
  open,
  onToggle,
  onReplied,
}: {
  thread: DeskThread;
  isAdmin: boolean;
  open: boolean;
  onToggle: () => void;
  onReplied: (c: DeskComment) => void;
}) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSent, setJustSent] = useState(false);

  const submit = async () => {
    const body = draft.trim();
    if (body.length < 2 || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/advisor/desk-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId: thread.answerId, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'השליחה נכשלה — נסה שוב');
        return;
      }
      onReplied(data.comment);
      setDraft('');
      setJustSent(true);
      setTimeout(() => setJustSent(false), 4000);
    } catch {
      setError('בעיית תקשורת — נסה שוב');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white/[0.03] overflow-hidden transition-colors',
        thread.needsReply ? 'border-[#c8a951]/35' : 'border-white/[0.09]',
      )}
    >
      {/* summary row — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-right px-4 sm:px-5 py-4 flex items-start gap-3 hover:bg-white/[0.02] transition-colors cursor-pointer"
        aria-expanded={open}
      >
        <div
          className={cn(
            'w-9 h-9 rounded-full grid place-items-center font-bold text-[13px] shrink-0',
            thread.needsReply
              ? 'bg-gradient-to-br from-[#c8a951] to-[#e8d48b] text-[#070b1e]'
              : 'bg-white/[0.07] text-white/60',
          )}
        >
          {thread.entrepreneur.name.charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-white/90">{thread.entrepreneur.name}</span>
            {thread.entrepreneur.company && (
              <span className="inline-flex items-center gap-1 text-[11.5px] text-white/35">
                <Building2 className="w-3 h-3" />
                {thread.entrepreneur.company}
              </span>
            )}
            {thread.needsReply ? (
              <span className="rounded-full bg-[#c8a951]/15 border border-[#c8a951]/35 text-[#e8d48b] text-[10.5px] font-bold px-2 py-px">
                ממתין לתשובתך
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10.5px] text-emerald-400/75">
                <CheckCircle2 className="w-3 h-3" /> נענה
              </span>
            )}
            {isAdmin && thread.advisorName && (
              <span className="text-[10.5px] text-white/30">מלווה: {thread.advisorName}</span>
            )}
          </div>
          <div className="text-[13px] text-white/60 mt-1 line-clamp-2 leading-relaxed">
            {thread.questionPrompt}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/30">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {relativeTime(thread.lastActivityAt)}
            </span>
            {thread.comments.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {thread.comments.length}
              </span>
            )}
            {thread.chapterName && <span>{thread.chapterName}</span>}
          </div>
        </div>

        <ChevronDown
          className={cn('w-4 h-4 text-white/30 shrink-0 mt-1 transition-transform', open && 'rotate-180')}
        />
      </button>

      {/* expanded body */}
      {open && (
        <div className="px-4 sm:px-5 pb-5 border-t border-white/[0.07] pt-4 space-y-4">
          {/* the answer */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/40 mb-1.5">
              התשובה של {thread.entrepreneur.name}
              {thread.answerStatus === 'READY' && (
                <span className="inline-flex items-center gap-1 text-[#e8d48b]">
                  <BadgeCheck className="w-3.5 h-3.5" /> סומנה כמוכנה להצגה
                </span>
              )}
            </div>
            <p className="text-[14px] leading-relaxed text-white/80 whitespace-pre-line m-0 bg-white/[0.04] border border-white/[0.07] rounded-lg px-4 py-3">
              {thread.answerContent}
            </p>
          </div>

          {/* the AI review, for context */}
          {thread.aiFeedback && (
            <div className="rounded-xl border border-[#c8a951]/22 bg-[#c8a951]/[0.06] px-4 py-3">
              <div className="flex items-center gap-1.5 text-[10.5px] tracking-[0.14em] text-[#e8d48b] font-bold mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                חוות הדעת האוטומטית — לעיונך
              </div>
              <p className="text-[13px] text-white/65 leading-relaxed whitespace-pre-line m-0">
                {thread.aiFeedback}
              </p>
            </div>
          )}

          {/* conversation */}
          {thread.comments.length > 0 && (
            <div className="space-y-2">
              {thread.comments.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    'rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed max-w-[92%]',
                    c.authorType === 'ADVISOR'
                      ? 'bg-[#c8a951]/[0.12] border border-[#c8a951]/28 mr-auto'
                      : c.authorType === 'ADMIN'
                        ? 'bg-[#3f56c9]/[0.14] border border-[#3f56c9]/35 mr-auto'
                        : 'bg-white/[0.05] border border-white/[0.09] ml-auto',
                  )}
                >
                  <div
                    className={cn(
                      'text-[10.5px] font-bold mb-0.5',
                      c.authorType === 'ADVISOR'
                        ? 'text-[#e8d48b]'
                        : c.authorType === 'ADMIN'
                          ? 'text-[#9fb0ff]'
                          : 'text-white/45',
                    )}
                  >
                    {c.authorName}
                    {c.authorType === 'ADMIN' && ' · צוות WeCcelerate'}
                    <span className="font-normal text-white/25 mr-2">{relativeTime(c.createdAt)}</span>
                  </div>
                  <div className="text-white/80 whitespace-pre-line">{c.body}</div>
                </div>
              ))}
            </div>
          )}

          {/* reply */}
          {isAdmin ? (
            <p className="text-[12.5px] text-white/35 m-0">
              תצוגת אדמין — רק המלווה המשויך יכול להשיב ליזם.
            </p>
          ) : (
            <div>
              <textarea
                dir="rtl"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`המשוב שלך ל${thread.entrepreneur.name}...`}
                rows={4}
                className="w-full resize-y rounded-xl bg-[#03061a]/60 border border-white/[0.1] focus:border-[#c8a951] focus:ring-[3px] focus:ring-[#c8a951]/15 outline-none px-4 py-3 text-[14.5px] leading-relaxed text-white/90 placeholder:text-white/25 transition-colors"
              />
              {error && <p className="text-[13px] text-amber-400/90 mt-2 mb-0">{error}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={submit}
                  disabled={sending || draft.trim().length < 2}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-[#c8a951] to-[#e8d48b] text-[#1d1704] font-bold px-5 py-2.5 text-[13.5px] shadow-[0_8px_26px_-10px_rgba(200,169,81,.6)] hover:brightness-105 active:scale-[0.97] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'שולח...' : 'שלח משוב ליזם'}
                </button>
                {justSent && (
                  <span className="text-[12.5px] text-emerald-400">
                    נשלח — היזם רואה את התשובה ומקבל עדכון בפורטל ✓
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border px-3 py-3 sm:px-4',
        accent ? 'border-[#c8a951]/35 bg-[#c8a951]/[0.08]' : 'border-white/[0.09] bg-white/[0.03]',
      )}
    >
      <div className={cn('flex items-center gap-1.5', accent ? 'text-[#e8d48b]' : 'text-white/35')}>
        {icon}
        <span className="text-[10.5px] font-bold tracking-[0.1em]">{label}</span>
      </div>
      <div className={cn('text-2xl font-bold mt-1', accent ? 'text-[#e8d48b]' : 'text-white/85')}>{value}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 sm:px-4 py-2.5 text-[13px] font-semibold border-b-2 -mb-px transition-colors cursor-pointer',
        active
          ? 'border-[#c8a951] text-[#e8d48b]'
          : 'border-transparent text-white/40 hover:text-white/70',
      )}
    >
      {children}
    </button>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-12 text-center">
      <Inbox className="w-8 h-8 mx-auto text-white/15 mb-3" />
      <h2 className="text-[15px] font-bold text-white/80 m-0 mb-1.5">{title}</h2>
      <p className="text-[13px] text-white/40 m-0 max-w-sm mx-auto leading-relaxed">{body}</p>
    </div>
  );
}

/** "לפני 3 שעות" / "אתמול" / a date once it stops being recent. */
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
