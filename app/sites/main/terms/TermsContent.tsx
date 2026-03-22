'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { TermsContent as TermsBody } from './terms-content';

// =============================================================================
// TERMS PAGE CONTENT — Client wrapper for i18n
// =============================================================================

export function TermsContent() {
  const { t, dir } = useLanguage();

  return (
    <main id="main-content" dir={dir}>
      {/* Hero Section */}
      <section
        className="relative py-20 md:py-28 bg-[#070b1e]"
        aria-labelledby="terms-hero-heading"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-l from-[#070b1e] via-[#070b1e]/95 to-[#0d1321]/90" />

        {/* Gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" />

        {/* Content */}
        <div className="relative z-10 container-corporate w-full">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-sm text-white/40">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    {t('terms.breadcrumb.home')}
                  </Link>
                </li>
                <li><span className="mx-2">/</span></li>
                <li className="text-[#c8a951]">{t('terms.breadcrumb.current')}</li>
              </ol>
            </nav>

            <h1
              id="terms-hero-heading"
              className="heading-display text-white mb-6"
            >
              {t('terms.hero.title1')}
              <br />
              <span className="bg-gradient-to-r from-[#c8a951] to-[#e8d48b] bg-clip-text text-transparent">
                {t('terms.hero.title2')}
              </span>
            </h1>

            <p className="text-lg text-white/50 leading-relaxed max-w-2xl">
              {t('terms.hero.updated')}
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="section-padding bg-[#070b1e]">
        <div className="container-corporate">
          <div className="max-w-[800px] mx-auto">
            <TermsBody />
          </div>
        </div>
      </section>
    </main>
  );
}
