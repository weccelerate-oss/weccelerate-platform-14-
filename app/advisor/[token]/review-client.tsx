'use client';

/**
 * Advisor review — client side: the thread + reply box.
 */

import { useState } from 'react';
import { BadgeCheck, MessageSquare, Send, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentView {
  id: string;
  authorType: 'ENTREPRENEUR' | 'ADVISOR';
  authorName: string;
  body: string;
  createdAt: string;
}

interface Props {
  token: string;
  advisorEmail: string;
  entrepreneur: { name: string; company: string | null };
  chapterName: string;
  questionPrompt: string;
  answerContent: string;
  answerStatus: string;
  aiFeedback: string | null;
  comments: CommentView[];
}

export function AdvisorReviewClient(props: Props) {
  const [comments, setComments] = useState<CommentView[]>(props.comments);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (draft.trim().length < 2 || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/advisor/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: props.token, body: draft.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'השליחה נכשלה — נסה שוב');
        return;
      }
      setComments((prev) => [...prev, data.comment]);
      setDraft('');
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch {
      setError('בעיית תקשורת — נסה שוב');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* who */}
      <div className="rounded-2xl border border-[#c8a951]/30 bg-[#c8a951]/[0.07] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c8a951] to-[#e8d48b] grid place-items-center text-[#070b1e]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white/95">
              {props.entrepreneur.name}
              {props.entrepreneur.company && (
                <span className="text-white/40 font-normal text-sm"> · {props.entrepreneur.company}</span>
              )}
            </div>
            <div className="text-xs text-white/40">ביקש/ה את המשוב שלך ({props.advisorEmail})</div>
          </div>
        </div>
      </div>

      {/* question + answer */}
      <div className="rounded-2xl border border-white/[0.09] bg-white/[0.03] overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.07] bg-white/[0.02]">
          <div className="text-[11px] tracking-wider text-[#c8a951] font-bold">{props.chapterName}</div>
          <h1 className="text-base font-bold text-white/95 mt-0.5">{props.questionPrompt}</h1>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-1.5 text-[11px] text-white/40 mb-2">
            התשובה של {props.entrepreneur.name}
            {props.answerStatus === 'READY' && (
              <span className="inline-flex items-center gap-1 text-[#e8d48b]">
                <BadgeCheck className="w-3.5 h-3.5" /> סומנה כמוכנה להצגה
              </span>
            )}
          </div>
          <p className="text-[14.5px] leading-relaxed text-white/80 whitespace-pre-line m-0">
            {props.answerContent}
          </p>
        </div>
      </div>

      {/* Kochavi feedback */}
      {props.aiFeedback && (
        <div className="rounded-2xl border border-[#c8a951]/25 bg-gradient-to-br from-[#c8a951]/[0.10] to-[#c8a951]/[0.03] px-5 py-4">
          <div className="flex items-center gap-2 text-[11px] tracking-[0.16em] text-[#e8d48b] font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            המשוב של כוכבי (AI) — לעיונך
          </div>
          <p className="text-[13.5px] text-white/70 leading-relaxed whitespace-pre-line m-0">{props.aiFeedback}</p>
        </div>
      )}

      {/* thread */}
      <div className="rounded-2xl border border-white/[0.09] bg-white/[0.03] px-5 py-4">
        <div className="flex items-center gap-2 text-[11px] tracking-wider text-white/45 font-bold mb-3">
          <MessageSquare className="w-3.5 h-3.5" />
          השיחה ({comments.length})
        </div>
        <div className="space-y-3">
          {comments.length === 0 && (
            <p className="text-sm text-white/35 m-0">עוד אין הודעות — התגובה שלך תפתח את השיחה.</p>
          )}
          {comments.map((c) => (
            <div
              key={c.id}
              className={cn(
                'rounded-xl px-4 py-3 text-[13.5px] leading-relaxed max-w-[92%]',
                c.authorType === 'ADVISOR'
                  ? 'bg-[#c8a951]/[0.12] border border-[#c8a951]/30 mr-auto'
                  : 'bg-white/[0.05] border border-white/[0.09] ml-auto',
              )}
            >
              <div className={cn('text-[10.5px] font-bold mb-1', c.authorType === 'ADVISOR' ? 'text-[#e8d48b]' : 'text-white/45')}>
                {c.authorType === 'ADVISOR' ? `${c.authorName} · מלווה` : c.authorName}
                <span className="font-normal text-white/30 mr-2">
                  {new Date(c.createdAt).toLocaleDateString('he-IL')}
                </span>
              </div>
              <div className="text-white/80 whitespace-pre-line">{c.body}</div>
            </div>
          ))}
        </div>

        {/* reply */}
        <div className="mt-4 pt-4 border-t border-white/[0.07]">
          <textarea
            dir="rtl"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="כתוב את המשוב שלך ליזם..."
            rows={4}
            className="w-full resize-y rounded-xl bg-[#03061a]/60 border border-white/[0.1] focus:border-[#c8a951] focus:ring-[3px] focus:ring-[#c8a951]/15 outline-none px-4 py-3 text-[15px] leading-relaxed text-white/90 placeholder:text-white/25"
          />
          {error && <p className="text-[13px] text-amber-400/90 mt-2 mb-0">{error}</p>}
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={submit}
              disabled={sending || draft.trim().length < 2}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-[#c8a951] to-[#e8d48b] text-[#1d1704] font-bold px-6 py-2.5 text-sm shadow-[0_8px_26px_-10px_rgba(200,169,81,.6)] hover:brightness-105 active:scale-[0.97] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {sending ? 'שולח...' : 'שלח משוב ליזם'}
            </button>
            {sent && <span className="text-[13px] text-emerald-400">נשלח! היזם יקבל התראה בפורטל ✓</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
