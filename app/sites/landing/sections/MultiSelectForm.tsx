'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Users,
  FileText,
  Search,
  Smartphone,
  Package,
  Megaphone,
  Stethoscope,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SafeImage } from '@/components/landing-helpers/SafeImage';
import { Sparkles } from '@/components/landing-helpers/FloatingDecor';
import { HoneypotFields } from '@/components/forms/HoneypotFields';

interface Option {
  id: string;
  icon: React.ElementType;
  label: string;
}

const OPTIONS: Option[] = [
  { id: 'consulting', icon: Briefcase, label: 'ייעוץ עסקי כללי' },
  { id: 'investors', icon: Users, label: 'הכנה למשקיעים' },
  { id: 'business-plan', icon: FileText, label: 'תוכנית עסקית' },
  { id: 'market-research', icon: Search, label: 'מחקר שוק' },
  { id: 'app-dev', icon: Smartphone, label: 'פיתוח אפליקציה' },
  { id: 'product-dev', icon: Package, label: 'פיתוח מוצר פיזי' },
  { id: 'marketing', icon: Megaphone, label: 'שיווק ומיתוג' },
  { id: 'medtech', icon: Stethoscope, label: 'רגולציה רפואית' },
];

export default function MultiSelectForm() {
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState<'select' | 'details'>('select');
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function toggleOption(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.set('site', 'landing');
    formData.set('formType', 'landing_multiselect');
    formData.set(
      'sourceUrl',
      typeof window !== 'undefined' ? window.location.href : 'https://landing.weccelerate.co.il'
    );
    const interestLabels = selected
      .map((id) => OPTIONS.find((o) => o.id === id)?.label)
      .filter(Boolean)
      .join(', ');
    const existingMessage = (formData.get('message') as string) || '';
    formData.set(
      'message',
      `תחומי עניין: ${interestLabels}${existingMessage ? `\n\n${existingMessage}` : ''}`
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

  if (submitted) {
    return (
      <section id="form" className="relative py-20 md:py-28 bg-[#070b1e]">
        <div className="container-corporate">
          <div className="max-w-xl mx-auto text-center p-10 rounded-2xl border border-[#c8a951]/30 bg-gradient-to-b from-[#c8a951]/[0.05] to-transparent">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#c8a951]/15 border border-[#c8a951]/40">
              <CheckCircle2 className="h-10 w-10 text-[#c8a951]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">תודה!</h2>
            <p className="text-white/60 leading-relaxed">
              קיבלנו את הפנייה שלך. יועץ בכיר יחזור אליך היום לתיאום שיחת הייעוץ החינמית.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="form" className="relative py-20 md:py-28 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #070b1e 0%, #0a0e27 50%, #070b1e 100%)',
        }}
      />
      <Sparkles color="#C8A951" count={20} />
      <div className="container-corporate relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <ScrollReveal variant="up">
              <p className="text-[#c8a951] text-sm font-bold uppercase tracking-[0.22em] mb-4">
                שלב 1 מתוך 2
              </p>
            </ScrollReveal>
            <ScrollReveal variant="up" delay={100}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                מה הכי חסר לכם עכשיו?
              </h2>
            </ScrollReveal>
            <ScrollReveal variant="up" delay={200}>
              <p className="text-white/55 text-lg">
                בחרו אחד או יותר — נתאים לכם שיחה עם המומחה הרלוונטי.
              </p>
            </ScrollReveal>
          </div>

          {/* Big floating illustration */}
          {step === 'select' && (
            <div className="hidden md:flex justify-center mb-8">
              <motion.div
                className="relative w-40 h-40"
                animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <SafeImage
                  src="/images/landing-assets/landing/idea-illustration.png"
                  alt="רעיון"
                  fill
                  className="object-contain drop-shadow-[0_0_30px_rgba(200,169,81,0.4)]"
                  sizes="160px"
                />
              </motion.div>
            </div>
          )}

          {step === 'select' ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
                {OPTIONS.map((opt, idx) => {
                  const Icon = opt.icon;
                  const isSelected = selected.includes(opt.id);
                  return (
                    <ScrollReveal key={opt.id} variant="scale" delay={idx * 50}>
                      <motion.button
                        type="button"
                        onClick={() => toggleOption(opt.id)}
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        className={`group relative w-full p-5 rounded-2xl border-2 transition-colors duration-300 text-center ${
                          isSelected
                            ? 'border-[#c8a951] bg-[#c8a951]/10 shadow-lg shadow-[#c8a951]/20'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                            className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#c8a951] flex items-center justify-center"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[#070b1e]" />
                          </motion.div>
                        )}
                        <Icon
                          className={`w-8 h-8 mx-auto mb-3 transition-colors ${
                            isSelected ? 'text-[#c8a951]' : 'text-white/50 group-hover:text-white/80'
                          }`}
                        />
                        <span
                          className={`text-sm font-semibold transition-colors ${
                            isSelected ? 'text-white' : 'text-white/70'
                          }`}
                        >
                          {opt.label}
                        </span>
                      </motion.button>
                    </ScrollReveal>
                  );
                })}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  disabled={selected.length === 0}
                  onClick={() => setStep('details')}
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-10 py-4 text-base font-bold hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#c8a951]/30 transition-all duration-300 rounded-xl shadow-lg shadow-[#c8a951]/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  קדימה, בואו נדבר
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                {selected.length > 0 && (
                  <p className="text-xs text-white/40 mt-3">
                    נבחרו {selected.length} תחומים
                  </p>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
              <HoneypotFields />
              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lp-name" className="block text-xs font-semibold text-white/60 mb-2">
                    שם מלא *
                  </label>
                  <input
                    id="lp-name"
                    name="name"
                    type="text"
                    required
                    disabled={isPending}
                    placeholder="ישראל ישראלי"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#c8a951]/60 focus:bg-white/10 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="lp-phone" className="block text-xs font-semibold text-white/60 mb-2">
                    טלפון *
                  </label>
                  <input
                    id="lp-phone"
                    name="phone"
                    type="tel"
                    required
                    disabled={isPending}
                    dir="ltr"
                    placeholder="050-123-4567"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#c8a951]/60 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lp-email" className="block text-xs font-semibold text-white/60 mb-2">
                  אימייל *
                </label>
                <input
                  id="lp-email"
                  name="email"
                  type="email"
                  required
                  disabled={isPending}
                  dir="ltr"
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#c8a951]/60 focus:bg-white/10 transition-all"
                />
              </div>

              <div>
                <label htmlFor="lp-message" className="block text-xs font-semibold text-white/60 mb-2">
                  רוצים להוסיף משהו? (לא חובה)
                </label>
                <textarea
                  id="lp-message"
                  name="message"
                  rows={3}
                  disabled={isPending}
                  placeholder="ספרו לנו קצת על הרעיון שלכם"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#c8a951]/60 focus:bg-white/10 transition-all resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  disabled={isPending}
                  className="sm:flex-shrink-0 px-6 py-3 rounded-lg border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-all text-sm"
                >
                  ← חזרה
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-8 py-4 text-base font-bold hover:scale-[1.02] transition-all duration-300 rounded-lg shadow-lg shadow-[#c8a951]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      שולח...
                    </>
                  ) : (
                    <>שלחו — קבלו שיחה היום</>
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-white/30 pt-2">
                בלחיצה על &quot;שלחו&quot; אני מאשר/ת את{' '}
                <a href="/privacy" className="text-[#c8a951]/70 hover:text-[#c8a951] underline">
                  מדיניות הפרטיות
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
