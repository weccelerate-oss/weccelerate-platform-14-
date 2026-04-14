'use client';

import { useState, FormEvent } from 'react';
import { Send, CheckCircle2, Loader2, Calendar, Phone } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export default function CTAFormBiz() {
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.set('site', 'biz');
    formData.set('formType', 'biz_landing');
    formData.set(
      'sourceUrl',
      typeof window !== 'undefined' ? window.location.href : 'https://biz.weccelerate.co.il'
    );

    try {
      const { submitContactForm } = await import('@/app/actions/leads');
      const result = await submitContactForm({ success: false, message: '' }, formData);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.message || 'אירעה שגיאה. נסו שוב.');
      }
    } catch {
      setError('אירעה שגיאה. נסו שוב.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section
      id="contact"
      className="relative py-20 md:py-28 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #070b1e 0%, #0a1020 50%, #070b1e 100%)',
      }}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, rgba(212,175,55,0.04) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      <div className="container-corporate relative z-10">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-2 text-center lg:text-right">
            <ScrollReveal variant="up">
              <p className="text-emerald-400 text-sm font-bold uppercase tracking-[0.22em] mb-4">
                השלב הבא
              </p>
            </ScrollReveal>
            <ScrollReveal variant="up" delay={100}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                בואו נתאם{' '}
                <span className="bg-gradient-to-l from-emerald-300 to-[#D4AF37] bg-clip-text text-transparent">
                  שיחה אסטרטגית.
                </span>
              </h2>
            </ScrollReveal>
            <ScrollReveal variant="up" delay={200}>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                פגישה של 45 דקות עם שותף בכיר — ללא עלות. נכיר את הארגון שלכם, נבין את הכיוון האסטרטגי, ונציג דרכים קונקרטיות להזניק את היחידה הבאה.
              </p>
            </ScrollReveal>

            <ScrollReveal variant="up" delay={300}>
              <div className="space-y-3 text-right">
                <div className="flex items-center gap-3 text-white/70">
                  <span className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">פגישה תוך 7 ימים</div>
                    <div className="text-xs text-white/40">זמינות גבוהה לבקשות ארגוניות</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <span className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      <a href="tel:+972555647538" dir="ltr" className="hover:text-emerald-400">
                        +972-55-564-7538
                      </a>
                    </div>
                    <div className="text-xs text-white/40">שיחה ישירה עם ראש צוות ארגוני</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal variant="right" delay={200}>
            <div className="lg:col-span-3">
              <div className="relative rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 md:p-10 backdrop-blur-sm">
                {submitted ? (
                  <div className="text-center py-10">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-400/30">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">תודה!</h3>
                    <p className="text-white/60">
                      קיבלנו את הפנייה. אחד השותפים הבכירים יחזור אליכם תוך 24 שעות.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
                        {error}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="b-name" className="block text-xs font-semibold text-white/60 mb-2">
                          שם מלא *
                        </label>
                        <input
                          id="b-name"
                          name="name"
                          type="text"
                          required
                          disabled={isPending}
                          placeholder="ישראל ישראלי"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/60 focus:bg-white/10 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="b-phone" className="block text-xs font-semibold text-white/60 mb-2">
                          טלפון *
                        </label>
                        <input
                          id="b-phone"
                          name="phone"
                          type="tel"
                          required
                          disabled={isPending}
                          dir="ltr"
                          placeholder="050-123-4567"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/60 focus:bg-white/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="b-email" className="block text-xs font-semibold text-white/60 mb-2">
                          אימייל עסקי *
                        </label>
                        <input
                          id="b-email"
                          name="email"
                          type="email"
                          required
                          disabled={isPending}
                          dir="ltr"
                          placeholder="name@company.com"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/60 focus:bg-white/10 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="b-company" className="block text-xs font-semibold text-white/60 mb-2">
                          שם החברה *
                        </label>
                        <input
                          id="b-company"
                          name="company"
                          type="text"
                          required
                          disabled={isPending}
                          placeholder="שם הארגון / החברה"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/60 focus:bg-white/10 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="b-message" className="block text-xs font-semibold text-white/60 mb-2">
                        על מה תרצו לדבר?
                      </label>
                      <textarea
                        id="b-message"
                        name="message"
                        rows={4}
                        disabled={isPending}
                        placeholder="באיזה שלב הרעיון? מה היעד העסקי? מה הציר שבו אתם רוצים לחדש?"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/60 focus:bg-white/10 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 text-base font-bold hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 rounded-lg shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          שולח...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          שלחו — נחזור תוך 24 שעות
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-white/30 pt-2">
                      בלחיצה על &quot;שלחו&quot; אני מאשר/ת את{' '}
                      <a href="/privacy" className="text-emerald-400/70 hover:text-emerald-400 underline">
                        מדיניות הפרטיות
                      </a>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
