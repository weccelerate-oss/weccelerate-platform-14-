/**
 * MVP Calculator Demo Page
 * 
 * Standalone page showcasing the MVP Cost Calculator lead magnet.
 */

'use client';

import { MVPCalculator } from '@/components/tools/MVPCalculator';

export default function MVPCalculatorPage() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-950 py-12 px-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            כמה יעלה לפתח את ה-MVP שלכם?
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            ענו על כמה שאלות פשוטות וקבלו הערכת עלות מיידית לפיתוח המוצר
          </p>
        </div>

        {/* Calculator */}
        <MVPCalculator 
          site="main"
          onLeadCaptured={(leadId) => {
            console.log('Lead captured:', leadId);
            // Track conversion
            if (typeof window !== 'undefined' && 'gtag' in window) {
              (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'conversion', {
                event_category: 'lead_magnet',
                event_label: 'mvp_calculator',
                value: leadId,
              });
            }
          }}
        />

        {/* Trust signals */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm mb-4">מאושר על ידי</p>
          <div className="flex items-center justify-center gap-8 opacity-50">
            <div className="text-slate-400 font-semibold">Leumit</div>
            <div className="text-slate-400 font-semibold">Innovation Authority</div>
            <div className="text-slate-400 font-semibold">SNC</div>
          </div>
        </div>
      </div>
    </main>
  );
}
