'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { servicesHe, servicesEn } from '@/lib/services-data';

interface ServiceFullSectionsProps {
  serviceId: string;
}

// Dynamic span patterns based on section count
function getSpanMap(count: number): string[] {
  if (count === 3) return ['md:col-span-2', '', 'md:col-span-3'];
  if (count === 4) return ['md:col-span-2', '', '', 'md:col-span-2'];
  if (count === 5) return ['md:col-span-2', '', '', 'md:col-span-2', 'md:col-span-3'];
  if (count === 6) return ['md:col-span-2', '', '', 'md:col-span-2', 'md:col-span-2', ''];
  if (count === 7) return ['md:col-span-2', '', '', 'md:col-span-2', 'md:col-span-2', '', 'md:col-span-3'];
  return Array(count).fill('');
}

export default function ServiceFullSections({ serviceId }: ServiceFullSectionsProps) {
  const { lang } = useLanguage();
  const services = lang === 'he' ? servicesHe : servicesEn;
  const service = services.find((s) => s.id === serviceId);

  if (!service) return null;

  const { intro, sections } = service.fullContent;
  const hasImages = sections.some((s) => s.image);
  const spanMap = getSpanMap(sections.length);

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1321] to-[#070b1e]" />

      <div className="container-corporate relative z-10">
        {/* Section heading */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block text-[#c8a951] text-sm font-bold uppercase tracking-[0.3em] mb-4">
            {lang === 'he' ? 'מה כולל השירות?' : 'What Does the Service Include?'}
          </span>
          <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            {intro}
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {sections.map((section, idx) => {
            const span = spanMap[idx] || '';
            const isFullWidth = span === 'md:col-span-3';

            return (
              <div key={idx} className={span}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  className={`relative group overflow-hidden rounded-2xl border border-white/[0.06] cursor-default ${
                    hasImages
                      ? isFullWidth ? 'h-[280px] sm:h-[260px]' : 'h-[340px] sm:h-[320px]'
                      : ''
                  }`}
                >
                  {/* Background image */}
                  {section.image && (
                    <>
                      <Image
                        src={section.image}
                        alt={section.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/20 group-hover:from-black/65 group-hover:via-black/30 transition-all duration-500" />
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px rgba(200,169,81,0.3), 0 0 20px rgba(200,169,81,0.08)' }} />
                    </>
                  )}

                  <div className={`relative z-10 ${hasImages ? 'h-full flex flex-col justify-end' : ''} p-6 sm:p-8 ${!section.image ? 'bg-white/[0.03] hover:bg-white/[0.05] transition-colors duration-500' : ''}`}>
                    {/* Step number */}
                    <div className={`${hasImages ? 'absolute top-5 right-5 sm:top-6 sm:right-6' : 'mb-5'}`}>
                      <div className={`${hasImages ? 'w-10 h-10 rounded-xl' : 'w-8 h-8 rounded-lg'} bg-[#c8a951]/15 border border-[#c8a951]/25 ${hasImages ? 'backdrop-blur-sm' : ''} flex items-center justify-center group-hover:bg-[#c8a951]/25 transition-colors duration-500`}>
                        <span className="text-[#c8a951] font-bold text-sm">{String(idx + 1).padStart(2, '0')}</span>
                      </div>
                    </div>

                    <h3 className={`${hasImages ? 'text-xl sm:text-2xl' : 'text-lg'} font-bold text-white mb-2 group-hover:text-[#e8d48b] transition-colors duration-300 tracking-tight`}>
                      {section.title}
                    </h3>

                    <p className={`text-white/60 text-sm sm:text-[15px] leading-relaxed group-hover:text-white/70 transition-colors duration-300 ${isFullWidth ? 'max-w-xl' : 'max-w-sm'}`}>
                      {section.text}
                    </p>
                  </div>

                  {/* Bottom glow */}
                  <div className="absolute bottom-0 left-6 right-6 sm:left-8 sm:right-8 h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
