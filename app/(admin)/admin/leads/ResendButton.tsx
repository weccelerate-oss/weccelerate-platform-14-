'use client';

import { useState, useTransition } from 'react';
import { RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { resendLeadAction } from './actions';

export function ResendButton({ leadId, label = 'שלח שוב' }: { leadId: string; label?: string }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await resendLeadAction(leadId);
            setResult({ ok: r.success, text: r.success ? 'נשלח לזאפ' : r.error || 'נכשל' });
          })
        }
        className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        <RefreshCw className={`w-3 h-3 ${pending ? 'animate-spin' : ''}`} aria-hidden="true" />
        {label}
      </button>
      {result && (
        <span className={`inline-flex items-center gap-1 text-xs ${result.ok ? 'text-emerald-700' : 'text-red-700'}`} role="status">
          {result.ok ? <Check className="w-3 h-3" aria-hidden="true" /> : <AlertTriangle className="w-3 h-3" aria-hidden="true" />}
          {result.text}
        </span>
      )}
    </span>
  );
}
