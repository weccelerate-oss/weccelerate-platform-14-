'use client';

/**
 * Full-width section that wraps <LeadForm /> with the service pitch on one
 * side. Dropped into the homepage CTA and the bottom of each service page so
 * the highest-intent pages carry a form instead of only a link to /contact.
 */

import { CheckCircle2 } from 'lucide-react';
import { LeadForm } from '@/components/forms/LeadForm';
import { useLanguage } from '@/lib/i18n';

interface LeadFormSectionProps {
  formType: string;
  service?: string | null;
  /** Section heading (left column). Defaults to a generic pitch. */
  title?: string;
  text?: string;
  /** Three short proof points shown under the text. */
  bullets?: string[];
  id?: string;
}

export function LeadFormSection({ formType, service, title, text, bullets, id = 'lead-form' }: LeadFormSectionProps) {
  const { t } = useLanguage();
  const points = bullets ?? [t('lead.section.b1'), t('lead.section.b2'), t('lead.section.b3')];

  return (
    <section id={id} className="relative py-20 sm:py-28 overflow-hidden scroll-mt-24">
      <div className="absolute inset-0 bg-[#0a0e27]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" />
      <div className="absolute -top-24 end-0 w-[480px] h-[480px] bg-[#c8a951]/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="container-corporate relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6">
            <p className="text-[#c8a951] text-sm font-semibold uppercase tracking-[0.2em] mb-5">
              {t('lead.section.tag')}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight text-balance">
              {title ?? t('lead.section.title')}
            </h2>
            <p className="text-white/55 text-lg leading-relaxed mb-8 max-w-xl">
              {text ?? t('lead.section.text')}
            </p>
            <ul className="space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-white/75">
                  <CheckCircle2 className="w-5 h-5 text-[#c8a951] mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6">
            <div className="bg-white/[0.03] border border-white/[0.08] p-6 sm:p-8 rounded-sm backdrop-blur-sm">
              <LeadForm formType={formType} service={service} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
