'use client';

/**
 * AboutContent — About Us page (fully i18n).
 * Hero  ->  Founders (3-col)  ->  Management (2-col centered)  ->  Group Photo  ->  CTA
 */

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { ArrowLeft, ArrowRight, Linkedin } from 'lucide-react';

// =============================================================================
// TEAM DATA
// =============================================================================

interface TeamMember {
  id: string;
  nameKey: string;
  roleKey: string;
  image: string;
  bioKey: string;
  linkedin?: string;
  objectPosition?: string;
}

const founderIds: TeamMember[] = [
  // TODO: Replace images for Alon, Ido with updated professional photos (to be provided)
  { id: 'alon', nameKey: 'about.member.alon.name', roleKey: 'about.member.alon.role', image: '/images/team/alon.jpg', bioKey: 'about.member.alon.bio', objectPosition: 'center 15%' },
  { id: 'ido', nameKey: 'about.member.ido.name', roleKey: 'about.member.ido.role', image: '/images/ido2.png', bioKey: 'about.member.ido.bio', objectPosition: 'center 10%' },
  { id: 'avraham', nameKey: 'about.member.avraham.name', roleKey: 'about.member.avraham.role', image: '/images/team/avraham.jpg', bioKey: 'about.member.avraham.bio', objectPosition: 'center 10%' },
];

const managementIds: TeamMember[] = [
  // TODO: Replace image for Noam with updated professional photo (to be provided)
  { id: 'noam', nameKey: 'about.member.noam.name', roleKey: 'about.member.noam.role', image: '/images/noam2.png', bioKey: 'about.member.noam.bio', objectPosition: 'center 20%' },
  { id: 'lioz', nameKey: 'about.member.lioz.name', roleKey: 'about.member.lioz.role', image: '/images/team/lioz.jpg', bioKey: 'about.member.lioz.bio', objectPosition: 'center 10%' },
];

// =============================================================================
// PORTRAIT CARD
// =============================================================================

function PortraitCard({ member, t }: { member: TeamMember; t: (key: string) => string }) {
  const name = t(member.nameKey);

  return (
    <article
      className="group text-center"
      itemScope
      itemType="https://schema.org/Person"
    >
      {/* Photo */}
      <div className="relative aspect-square w-[240px] mx-auto mb-6 overflow-hidden rounded-2xl bg-[#0a0a0a] ring-1 ring-white/[0.06]">
        <Image
          src={member.image}
          alt={name}
          fill
          className="object-cover grayscale contrast-125 brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 ease-out"
          style={{ objectPosition: member.objectPosition || 'center 20%' }}
          sizes="(max-width: 768px) 100vw, 33vw"
          itemProp="image"
          priority
        />

        {/* Bottom gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e] via-[#070b1e]/20 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500" />

        {/* Gold shimmer on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#c8a951]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* LinkedIn overlay */}
        {member.linkedin && (
          <div className="absolute bottom-4 start-4 end-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center rounded-lg transition-colors mx-auto"
              aria-label={`LinkedIn — ${name}`}
              itemProp="sameAs"
            >
              <Linkedin className="w-5 h-5 text-white" />
            </a>
          </div>
        )}
      </div>

      {/* Info */}
      <h3
        className="text-xl font-bold text-white group-hover:text-[#c8a951] transition-colors duration-300"
        itemProp="name"
      >
        {name}
      </h3>
      <p
        className="text-sm text-[#c8a951] font-medium mb-3 tracking-wide"
        itemProp="jobTitle"
      >
        {t(member.roleKey)}
      </p>
      <p
        className="text-sm text-white/45 leading-relaxed max-w-xs mx-auto"
        itemProp="description"
      >
        {t(member.bioKey)}
      </p>
    </article>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export default function AboutContent() {
  const { t, dir } = useLanguage();
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <main id="main-content">
      {/* ================================================================= */}
      {/* HERO                                                               */}
      {/* ================================================================= */}
      <section
        className="relative py-16 md:py-24 overflow-hidden bg-[#070b1e]"
        aria-labelledby="about-hero-heading"
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #c8a951 1px, transparent 1px),
                              radial-gradient(circle at 75% 75%, #c8a951 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Ambient glows */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[400px] bg-[#c8a951]/[0.04] rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[300px] bg-[#c8a951]/[0.03] rounded-full blur-[120px] pointer-events-none" />

        {/* Gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" />

        <div className="container-corporate relative z-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex items-center gap-2 text-sm text-white/40">
              <li>
                <Link href="/" className="hover:text-white/70 transition-colors">
                  {t('about.breadcrumb.home')}
                </Link>
              </li>
              <li><span className="mx-2">/</span></li>
              <li className="text-[#c8a951]">{t('about.breadcrumb.current')}</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <span className="inline-block text-[#c8a951] text-sm font-semibold tracking-[0.2em] uppercase mb-4">
              {t('about.hero.tag')}
            </span>

            <h1
              id="about-hero-heading"
              data-speakable
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-[#c8a951] to-[#e8d48b] bg-clip-text text-transparent">
                {t('about.hero.title1')}
              </span>
            </h1>

            <h2 data-speakable className="text-xl md:text-2xl text-white/60 font-light mb-8 leading-relaxed max-w-2xl">
              <strong className="text-white font-medium">WeCcelerate</strong>{' '}
              {t('about.hero.subtitle')}
            </h2>

            <p data-speakable className="text-lg text-white/40 leading-relaxed max-w-2xl">
              {t('about.hero.description')}
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* FOUNDERS (3-col)                                                   */}
      {/* ================================================================= */}
      <section
        className="section-padding bg-[#070b1e]"
        aria-labelledby="founders-heading"
      >
        <div className="container-corporate">
          <header className="max-w-2xl mb-16">
            <span className="text-sm font-semibold text-[#c8a951] uppercase tracking-[0.2em]">
              {t('about.founders.tag')}
            </span>
            <h2
              id="founders-heading"
              className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4"
            >
              {t('about.founders.title')}
            </h2>
            <p className="text-lg text-white/50 leading-relaxed">
              {t('about.founders.text')}
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-12 justify-items-center items-start max-w-4xl mx-auto">
            {founderIds.map((member) => (
              <PortraitCard key={member.id} member={member} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* MANAGEMENT (2-col centered)                                        */}
      {/* ================================================================= */}
      <section
        className="section-padding bg-[#0d1321]"
        aria-labelledby="management-heading"
      >
        {/* Top border */}
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="container-corporate">
          <header className="max-w-2xl mb-16">
            <span className="text-sm font-semibold text-[#c8a951] uppercase tracking-[0.2em]">
              {t('about.management.tag')}
            </span>
            <h2
              id="management-heading"
              className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4"
            >
              {t('about.management.title')}
            </h2>
            <p className="text-lg text-white/50 leading-relaxed">
              {t('about.management.text')}
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-12 justify-items-center items-start max-w-2xl mx-auto">
            {managementIds.map((member) => (
              <PortraitCard key={member.id} member={member} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* GROUP PHOTO                                                        */}
      {/* ================================================================= */}
      <motion.section
        className="section-padding bg-[#070b1e] relative overflow-hidden"
        aria-labelledby="group-photo-heading"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/20 to-transparent" />

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#c8a951]/[0.03] rounded-full blur-[180px] pointer-events-none" />

        <div className="container-corporate relative z-10 text-center">
          <span className="text-sm font-semibold text-[#c8a951] uppercase tracking-[0.2em]">
            {t('about.group.tag')}
          </span>
          <h2
            id="group-photo-heading"
            className="text-3xl md:text-4xl font-bold text-white mt-3 mb-12"
          >
            {t('about.group.title')}
          </h2>

          {/* Group Photo */}
          <div className="relative max-w-5xl mx-auto mb-12 rounded-2xl overflow-hidden ring-1 ring-white/[0.08] shadow-2xl shadow-black/40">
            <Image
              src="/images/team/weccelerate_group.jpg"
              alt={t('about.group.alt')}
              width={1400}
              height={700}
              className="w-full h-auto"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
            />
          </div>

          {/* Description */}
          <p className="text-lg text-white/50 leading-relaxed max-w-3xl mx-auto">
            {t('about.group.text')}
          </p>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* CTA                                                                */}
      {/* ================================================================= */}
      <section className="section-padding bg-[#050810]">
        <div className="container-corporate text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
            {t('about.cta.title')}
          </h2>
          <p className="text-lg text-white/40 max-w-xl mx-auto mb-10 leading-relaxed">
            {t('about.cta.text')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/services"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-10 py-4 text-lg font-bold hover:scale-[1.03] transition-all duration-300 rounded-sm"
            >
              {t('about.cta.apply')}
              <DirArrow className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/[0.12] text-white/70 px-10 py-4 text-lg font-medium hover:bg-white/[0.05] hover:text-white hover:border-white/[0.2] transition-all duration-300 rounded-sm"
            >
              {t('about.cta.contact')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
