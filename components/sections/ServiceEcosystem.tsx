'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Box, Code2, HeartPulse, Megaphone, ArrowLeft, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { servicesHe, servicesEn, type Service } from '@/lib/services-data';
import { useLanguage } from '@/lib/i18n';

// =============================================================================
// ICON MAP
// =============================================================================

const iconMap: Record<string, React.ElementType> = {
  'business-consulting': Target,
  'physical-product': Box,
  'digital-product': Code2,
  'marketing': Megaphone,
  'medtech-leumit': HeartPulse,
};

// =============================================================================
// SERVICE CARD — Framer Motion interactive card
// =============================================================================

function ServiceCard({
  service,
  index,
}: {
  service: Service;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { t, dir } = useLanguage();
  const Icon = iconMap[service.id] || Target;
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link href={`/services/${service.id}`} className="block h-full">
        {/* Premium border wrapper for MedTech */}
        <div
          className={`relative h-full rounded-xl ${
            service.isPremium ? 'premium-border-wrapper p-[1px]' : ''
          }`}
        >
          <motion.div
            className={`relative h-full rounded-xl overflow-hidden
              ${service.isPremium
                ? 'border-0'
                : 'border border-white/[0.06]'
              }
            `}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{
              y: -8,
              boxShadow: service.isPremium
                ? '0 0 40px rgba(59,130,246,0.15), 0 0 80px rgba(200,169,81,0.1)'
                : '0 0 40px rgba(200,169,81,0.12), 0 20px 40px rgba(0,0,0,0.3)',
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
          >
            {/* Background Image */}
            <motion.div
              className="absolute inset-0 z-0"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={service.imageSrc}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </motion.div>

            {/* Dark Overlay */}
            <div
              className={`absolute inset-0 z-[1] transition-opacity duration-300 ${
                service.isPremium
                  ? 'bg-gradient-to-t from-[#070b1e]/95 via-[#0a1030]/85 to-[#0a1030]/75'
                  : 'bg-gradient-to-t from-[#070b1e]/95 via-[#070b1e]/85 to-[#070b1e]/70'
              } ${isHovered ? 'opacity-90' : 'opacity-100'}`}
            />

            {/* Content */}
            <div className="relative z-10 p-8 flex flex-col h-full">
              {/* Premium badge */}
              {service.isPremium && (
                <div className="absolute top-4 end-4">
                  <span className="inline-flex items-center gap-1.5 bg-gold-500/15 text-gold-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-gold-500/20 backdrop-blur-sm">
                    {t('services.ecosystem.leumit')}
                  </span>
                </div>
              )}

              {/* Partnership logos for MedTech */}
              {service.isPremium && (
                <div className="absolute bottom-20 end-6 z-10">
                  <Image
                    src="/images/leumit-weccelerate.png"
                    alt="Leumit × WeCcelerate"
                    width={140}
                    height={40}
                    className="h-8 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                  />
                </div>
              )}

              {/* Icon */}
              <motion.div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm transition-colors duration-300 ${
                  service.isPremium
                    ? 'bg-blue-500/15'
                    : 'bg-gold-500/15'
                }`}
                animate={{
                  backgroundColor: isHovered
                    ? service.isPremium
                      ? 'rgba(59,130,246,0.25)'
                      : 'rgba(200,169,81,0.25)'
                    : service.isPremium
                      ? 'rgba(59,130,246,0.15)'
                      : 'rgba(200,169,81,0.15)',
                }}
                transition={{ duration: 0.3 }}
              >
                <Icon
                  className={`w-7 h-7 ${
                    service.isPremium ? 'text-blue-400' : 'text-gold-400'
                  }`}
                />
              </motion.div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">
                {service.title}
              </h3>

              {/* Short description */}
              <p className="text-white/60 text-sm leading-relaxed mb-6 flex-grow drop-shadow-md">
                {service.shortDescription}
              </p>

              {/* Hover CTA — slides in */}
              <div className="h-10 relative">
                <AnimatePresence>
                  {isHovered ? (
                    <motion.span
                      key="cta"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className={`inline-flex items-center gap-2 text-sm font-semibold ${
                        service.isPremium
                          ? 'text-blue-400'
                          : 'text-gold-400'
                      }`}
                    >
                      {t('services.ecosystem.discover')}
                      <DirArrow className="w-4 h-4" />
                    </motion.span>
                  ) : (
                    <motion.div
                      key="line"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`w-8 h-[2px] rounded-full ${
                        service.isPremium
                          ? 'bg-blue-500/30'
                          : 'bg-gold-500/30'
                      }`}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom glow line */}
            <motion.div
              className={`absolute bottom-0 left-0 right-0 h-[1px] z-10 ${
                service.isPremium
                  ? 'bg-gradient-to-r from-transparent via-blue-500/50 to-transparent'
                  : 'bg-gradient-to-r from-transparent via-gold-500/30 to-transparent'
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}

// =============================================================================
// SERVICE ECOSYSTEM — Main exported section
// =============================================================================

export function ServiceEcosystem() {
  const { t, lang } = useLanguage();
  const servicesList = lang === 'he' ? servicesHe : servicesEn;

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e] via-[#0d1321] to-[#070b1e]" />

      <div className="container-corporate relative z-10">
        {/* Section Header */}
        <ScrollReveal variant="blur">
          <div className="text-center mb-16 sm:mb-20">
            <p className="text-gold-500 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              {t('services.ecosystem.tag')}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              {t('services.ecosystem.title')}
            </h2>
            <p className="text-white/40 text-lg mt-4 max-w-xl mx-auto">
              {t('services.ecosystem.subtitle')}
            </p>
          </div>
        </ScrollReveal>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesList.map((service, idx) => (
            <ServiceCard key={service.id} service={service} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
