'use client';

import { useState, useTransition } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { unblockAction } from '../actions';

interface BlocklistRow {
  id: string;
  email: string | null;
  ipHash: string | null;
  reason: string | null;
  addedAt: string;
  expiresAt: string | null;
}

export function BlocklistTable({ rows }: { rows: BlocklistRow[] }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove(row: BlocklistRow) {
    setError(null);
    startTransition(async () => {
      const res = await unblockAction({
        email: row.email ?? undefined,
        ipHash: row.ipHash ?? undefined,
      });
      if (!res.success) {
        setError(res.error ?? 'הסרה נכשלה');
        return;
      }
      setHidden((prev) => new Set([...prev, row.id]));
    });
  }

  const visible = rows.filter((r) => !hidden.has(r.id));

  return (
    <>
      {error && (
        <div className="mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>
      )}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">סוג</th>
              <th className="px-3 py-2 font-medium">ערך</th>
              <th className="px-3 py-2 font-medium">סיבה</th>
              <th className="px-3 py-2 font-medium">נחסם</th>
              <th className="px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  {r.email ? (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">email</span>
                  ) : (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-700">IP hash</span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-slate-700">
                  {r.email ?? (r.ipHash ? `${r.ipHash.slice(0, 12)}…` : '—')}
                </td>
                <td className="px-3 py-2 text-slate-500">{r.reason ?? '—'}</td>
                <td className="px-3 py-2 text-slate-500">
                  {new Date(r.addedAt).toLocaleDateString('he-IL')}
                </td>
                <td className="px-3 py-2">
                  <button
                    disabled={isPending}
                    onClick={() => remove(r)}
                    className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    הסר
                  </button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-400">
                  הblocklist ריק.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
