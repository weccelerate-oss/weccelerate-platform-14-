'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Loader2, Phone, Mail, MessageCircle } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export default function CTAForm() {
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.set('site', 'leumit');
    formData.set('formType', 'leumit_landing');
    formData.set(
      'sourceUrl',
      typeof window !== 'undefined' ? window.location.href : 'https://leumit.weccelerate.co.il'
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
          'linear-gradient(180deg, #040B16 0%, #060F1F 50%, #040B16 100%)',
      }}
    >
      {/* ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, rgba(212,175,55,0.04) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

      <div className="container-corporate relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-5 gap-10 xl:gap-12 items-center">
          {/* Left — copy */}
          <div className="xl:col-span-2 text-center xl:text-right">
            {/* Partnership logo */}
            <ScrollReveal variant="up">
              <div className="flex xl:justify-start justify-center mb-6">
                <motion.div
                  className="relative inline-block"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[100px] rounded-full pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(ellipse at center, rgba(6,182,212,0.12) 0%, transparent 70%)',
                    }}
                  />
                  <Image
                    src="/images/leumit-weccelerate-transparent.png"
                    alt="Leumit × WeCcelerate"
                    width={320}
                    height={90}
                    className="relative h-16 sm:h-20 w-auto object-contain drop-shadow-[0_0_25px_rgba(6,182,212,0.3)]"
                  />
                </motion.div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="up" delay={50}>
              <p className="text-cyan-400 text-sm font-bold uppercase tracking-[0.22em] mb-4">
                מוכנים להתחיל?
              </p>
            </ScrollReveal>
            <ScrollReveal variant="up" delay={100}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                בואו{' '}
                <span className="bg-gradient-to-l from-cyan-400 to-[#D4AF37] bg-clip-text text-transparent">
                  נדבר.
                </span>
              </h2>
            </ScrollReveal>
            <ScrollReveal variant="up" delay={200}>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                שיחה ראשונית של 20 דקות עם יועץ בכיר — ללא התחייבות, ללא עלות. נכיר את הרעיון שלכם ונגיד לכם בכנות אם המסלול מתאים.
              </p>
            </ScrollReveal>

            <ScrollReveal variant="up" delay={300}>
              <div className="space-y-4 text-right">
                <a
                  href="tel:+972555647538"
                  className="flex items-center gap-3 text-white/70 hover:text-cyan-400 transition-colors group"
                >
                  <span className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <Phone className="w-4 h-4 text-cyan-400" />
                  </span>
                  <span dir="ltr" className="text-sm font-medium">
                    +972-55-564-7538
                  </span>
                </a>
                <a
                  href="mailto:info@weccelerate.co.il"
                  className="flex items-center gap-3 text-white/70 hover:text-cyan-400 transition-colors group"
                >
                  <span className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <Mail className="w-4 h-4 text-cyan-400" />
                  </span>
                  <span className="text-sm font-medium">info@weccelerate.co.il</span>
                </a>
                <a
                  href="https://wa.me/972555647538"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white/70 hover:text-emerald-400 transition-colors group"
                >
                  <span className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                  </span>
                  <span className="text-sm font-medium">WhatsApp</span>
                </a>
              </div>
            </ScrollReveal>
          </div>

          {/* Right — form */}
          <ScrollReveal variant="right" delay={200}>
            <div className="xl:col-span-3">
              <div className="relative rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 sm:p-8 md:p-10 backdrop-blur-sm">
                {submitted ? (
                  <div className="text-center py-10">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/15 border border-cyan-400/30">
                      <CheckCircle2 className="h-8 w-8 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">תודה על פנייתך!</h3>
                    <p className="text-white/60">
                      קיבלנו את ההודעה. נחזור אליכם תוך 24 שעות עם פרטים נוספים.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="l-name" className="block text-xs font-semibold text-white/60 mb-2">
                          שם מלא *
                        </label>
                        <input
                          id="l-name"
                          name="name"
                          type="text"
                          required
                          disabled={isPending}
                          placeholder="ישראל ישראלי"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/60 focus:bg-white/10 transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="l-phone" className="block text-xs font-semibold text-white/60 mb-2">
                          טלפון *
                        </label>
                        <input
                          id="l-phone"
                          name="phone"
                          type="tel"
                          required
                          disabled={isPending}
                          dir="ltr"
                          placeholder="050-123-4567"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/60 focus:bg-white/10 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="l-email" className="block text-xs font-semibold text-white/60 mb-2">
                        אימייל *
                      </label>
                      <input
                        id="l-email"
                        name="email"
                        type="email"
                        required
                        disabled={isPending}
                        dir="ltr"
                        placeholder="example@email.com"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/60 focus:bg-white/10 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="l-company" className="block text-xs font-semibold text-white/60 mb-2">
                        שם החברה / הסטארטאפ
                      </label>
                      <input
                        id="l-company"
                        name="company"
                        type="text"
                        disabled={isPending}
                        placeholder="שם הסטארטאפ או חברה"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/60 focus:bg-white/10 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="l-message" className="block text-xs font-semibold text-white/60 mb-2">
                        ספרו לנו על הרעיון הרפואי שלכם
                      </label>
                      <textarea
                        id="l-message"
                        name="message"
                        rows={4}
                        disabled={isPending}
                        placeholder="במה הרעיון עוסק? באיזה שלב אתם? מה האתגר הראשי?"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/60 focus:bg-white/10 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-8 py-4 text-base font-bold hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 rounded-lg shadow-lg shadow-cyan-500/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          שולח...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          שלחו — נחזור אליכם היום
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-white/30 pt-2">
                      בלחיצה על &quot;שלחו&quot; אני מאשר/ת את{' '}
                      <a href="/privacy" className="text-cyan-400/70 hover:text-cyan-400 underline">
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
