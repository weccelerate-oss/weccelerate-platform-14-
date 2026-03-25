'use client';

import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import { servicesHe, servicesEn } from '@/lib/services-data';

interface ServiceFullSectionsProps {
  serviceId: string;
}

export default function ServiceFullSections({ serviceId }: ServiceFullSectionsProps) {
  const { lang } = useLanguage();
  const services = lang === 'he' ? servicesHe : servicesEn;
  const service = services.find((s) => s.id === serviceId);

  if (!service) return null;

  const { intro, sections } = service.fullContent;
  const hasImages = sections.some((s) => s.image);

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1321] to-[#070b1e]" />

      <div className="container-corporate relative z-10">
        {/* Section heading */}
        <div className="text-center mb-14">
          <span className="inline-block text-[#c8a951] text-sm font-bold uppercase tracking-[0.2em] mb-4">
            {lang === 'he' ? 'מה כולל השירות?' : 'What Does the Service Include?'}
          </span>
          <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            {intro}
          </p>
        </div>

        {/* Sections grid */}
        <div className={`grid ${hasImages ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-6`}>
          {sections.map((section, idx) => (
            <article
              key={idx}
              className="relative rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-500 group"
            >
              {/* Section image */}
              {section.image && (
                <div className="relative w-full h-40 overflow-hidden">
                  <Image
                    src={section.image}
                    alt={section.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e] via-[#070b1e]/40 to-transparent" />
                </div>
              )}

              <div className="p-8">
                {/* Step number */}
                <div className="w-8 h-8 rounded-lg bg-[#c8a951]/15 text-[#c8a951] flex items-center justify-center text-sm font-bold mb-5">
                  {idx + 1}
                </div>

                <h3 className="text-lg font-bold text-[#e8d48b] mb-3 tracking-tight">
                  {section.title}
                </h3>

                <p className="text-white/50 text-sm leading-relaxed">
                  {section.text}
                </p>
              </div>

              {/* Bottom glow on hover */}
              <div className="absolute bottom-0 left-4 right-4 h-[1px] rounded-full bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
