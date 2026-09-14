import { ChevronDown } from 'lucide-react';
import type { ServiceFaqItem } from '@/lib/services-faqs';

/**
 * Visible FAQ for a service page. Native <details> so it works without JS
 * and is keyboard-accessible. The matching FAQPage JSON-LD is emitted by
 * <ServicePageSchema faqs={…}> in page.tsx from the same data.
 */
export function ServiceFaq({ items, title = 'שאלות נפוצות' }: { items: ServiceFaqItem[]; title?: string }) {
  if (!items?.length) return null;
  return (
    <section id="faq" aria-labelledby="service-faq-title" className="relative py-16 sm:py-20 scroll-mt-24">
      <div className="absolute inset-0 bg-[#070b1e]" />
      <div className="container-corporate relative z-10 max-w-3xl">
        <p className="text-[#c8a951] text-sm font-semibold uppercase tracking-[0.2em] mb-4">FAQ</p>
        <h2 id="service-faq-title" className="text-3xl sm:text-4xl font-bold text-white mb-8 tracking-tight">{title}</h2>
        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {items.map((item, i) => (
            <details key={i} className="group py-1">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none py-4 text-white font-semibold text-lg [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a951]/50 rounded-sm">
                <span>{item.question}</span>
                <ChevronDown className="w-5 h-5 text-[#c8a951] flex-shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="pb-5 text-white/65 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
