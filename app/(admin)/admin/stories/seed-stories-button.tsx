'use client';

import { useState } from 'react';
import { Download, Loader2, CheckCircle } from 'lucide-react';
import { seedStoriesFromMockAction } from '../actions';

export function SeedStoriesButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleSeed() {
    setLoading(true);
    setResult(null);
    try {
      const res = await seedStoriesFromMockAction();
      if (res.success) {
        setResult({ success: true, message: `יובאו ${res.count} המלצות בהצלחה! רענן את הדף.` });
        // Auto-reload after short delay
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setResult({ success: false, message: res.error || 'שגיאה בייבוא' });
      }
    } catch {
      setResult({ success: false, message: 'שגיאה בלתי צפויה' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-amber-900 mb-1">
        אין המלצות במערכת
      </h3>
      <p className="text-sm text-amber-700 mb-4">
        ההמלצות מהאתר הראשי עדיין לא יובאו למערכת הניהול. לחץ כדי לייבא את כל ההמלצות ולאפשר עריכה מהאדמין.
      </p>
      <button
        onClick={handleSeed}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 text-sm font-medium"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {loading ? 'מייבא...' : 'ייבא המלצות מהאתר'}
      </button>

      {result && (
        <div className={`mt-3 text-sm flex items-center gap-2 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
          {result.success && <CheckCircle className="w-4 h-4" />}
          {result.message}
        </div>
      )}
    </div>
  );
}
