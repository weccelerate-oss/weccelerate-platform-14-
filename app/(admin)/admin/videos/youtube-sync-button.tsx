'use client';

import { useState, useTransition } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { syncYouTubeAction } from '../actions';

export function YouTubeSyncButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ message: string; ok: boolean } | null>(null);

  const handleSync = () => {
    startTransition(async () => {
      const res = await syncYouTubeAction();
      setResult({
        message: ('message' in res ? res.message : res.error) ?? '',
        ok: res.success,
      });
      setTimeout(() => setResult(null), 6000);
    });
  };

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span
          className={`text-sm flex items-center gap-1 ${
            result.ok ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {result.ok ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {result.message}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        )}
        <span>{isPending ? 'מסנכרן...' : 'סנכרון YouTube'}</span>
      </button>
    </div>
  );
}
