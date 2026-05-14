'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, XCircle, ShieldAlert, Loader2, Mail, Phone, Building2 } from 'lucide-react';
import { approveLeadAction, rejectLeadAction, markAsSpamAction } from '../actions';

interface ReviewLead {
  id: string;
  createdAt: Date;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  site: string;
  spamScore: number;
  spamReasons: string[];
  spamCodes: string[];
}

export function ReviewRow({ lead }: { lead: ReviewLead }) {
  const [isPending, startTransition] = useTransition();
  const [resolved, setResolved] = useState<'approved' | 'rejected' | 'spam' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dateLabel = new Intl.DateTimeFormat('he-IL', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(lead.createdAt);

  function run(action: 'approve' | 'reject' | 'spam') {
    setError(null);
    startTransition(async () => {
      try {
        let res: { success: boolean; error?: string };
        if (action === 'approve') res = await approveLeadAction(lead.id);
        else if (action === 'reject') res = await rejectLeadAction(lead.id);
        else res = await markAsSpamAction(lead.id, 'Admin marked as spam from review queue');

        if (!res.success) {
          setError(res.error ?? 'הפעולה נכשלה');
          return;
        }
        setResolved(action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'spam');
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  if (resolved) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 opacity-80">
        ✅ {lead.email} —{' '}
        {resolved === 'approved' ? 'אושר ונשלח ל-Zapier' : resolved === 'rejected' ? 'נדחה' : 'נוסף ל-blocklist'}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-slate-900">{lead.name}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                lead.spamScore >= 50 ? 'bg-red-100 text-red-700' :
                lead.spamScore >= 40 ? 'bg-amber-100 text-amber-700' :
                'bg-yellow-100 text-yellow-700'
              }`}
            >
              score {lead.spamScore}
            </span>
            <span className="text-xs text-slate-400">{dateLabel}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>
            {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>}
            {lead.company && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{lead.company}</span>}
            <span className="rounded-full bg-slate-100 px-2 py-0.5">{lead.site}</span>
          </div>
          {lead.message && (
            <div className="mt-2 text-xs text-slate-700 bg-slate-50 rounded p-2 border border-slate-100">
              <strong>הודעה:</strong> {lead.message}
            </div>
          )}
          {lead.spamReasons.length > 0 && (
            <div className="mt-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">סיבות לחשד</div>
              <ul className="mt-0.5 text-xs text-slate-600 space-y-0.5">
                {lead.spamReasons.map((r, i) => (
                  <li key={i}>· {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 flex-shrink-0">
          <button
            disabled={isPending}
            onClick={() => run('approve')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            אשר
          </button>
          <button
            disabled={isPending}
            onClick={() => run('reject')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300 disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            דחה
          </button>
          <button
            disabled={isPending}
            onClick={() => run('spam')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            סמן כספאם
          </button>
        </div>
      </div>
      {error && (
        <div className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>
      )}
    </div>
  );
}
