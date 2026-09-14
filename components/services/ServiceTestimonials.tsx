import { Quote } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/testimonials';

/**
 * Three client quotes above the FAQ and the lead form on every service
 * page. Quotes only — no metrics, no outcomes — by owner decision.
 */
export function ServiceTestimonials({ title = 'מה אומרים יזמים שעבדו איתנו' }: { title?: string }) {
  return (
    <section aria-labelledby="service-testimonials-title" className="relative py-16 sm:py-20">
      <div className="absolute inset-0 bg-[#0a0e27]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/25 to-transparent" />
      <div className="container-corporate relative z-10">
        <p className="text-[#c8a951] text-sm font-semibold uppercase tracking-[0.2em] mb-4">לקוחות</p>
        <h2 id="service-testimonials-title" className="text-3xl sm:text-4xl font-bold text-white mb-10 tracking-tight">{title}</h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <li key={t.name} className="flex flex-col gap-5 rounded-sm border border-white/[0.08] bg-white/[0.03] p-6">
              <Quote className="w-6 h-6 text-[#c8a951]" aria-hidden="true" />
              <blockquote className="flex-1 text-white/85 leading-relaxed">{t.quote}</blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[#c8a951]/15 border border-[#c8a951]/30 text-[#e8d48b] text-sm font-bold flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  {t.initials}
                </span>
                <span className="flex flex-col">
                  <span className="text-white font-semibold text-sm">{t.name}</span>
                  <span className="text-white/50 text-xs">{t.role}, {t.company}</span>
                </span>
              </figcaption>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
