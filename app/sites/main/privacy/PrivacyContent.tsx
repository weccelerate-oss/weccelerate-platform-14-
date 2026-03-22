'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { PrivacyBody } from './privacy-content';

// =============================================================================
// PRIVACY PAGE CONTENT — Client wrapper for i18n
// =============================================================================

export function PrivacyContent() {
  const { t, dir } = useLanguage();

  return (
    <main id="main-content" dir={dir}>
      {/* Hero Section */}
      <section
        className="relative py-20 md:py-28 bg-[#070b1e]"
        aria-labelledby="privacy-hero-heading"
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
                <li className="text-[#c8a951]">
                  {dir === 'rtl' ? 'מדיניות פרטיות' : 'Privacy Policy'}
                </li>
              </ol>
            </nav>

            <h1
              id="privacy-hero-heading"
              className="heading-display text-white mb-6"
            >
              {dir === 'rtl' ? 'מדיניות' : 'Privacy'}
              <br />
              <span className="bg-gradient-to-r from-[#c8a951] to-[#e8d48b] bg-clip-text text-transparent">
                {dir === 'rtl' ? 'פרטיות' : 'Policy'}
              </span>
            </h1>

            <p className="text-lg text-white/50 leading-relaxed max-w-2xl">
              {dir === 'rtl'
                ? 'עדכון אחרון: פברואר 2026'
                : 'Last Updated: February 2026'}
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="section-padding bg-[#070b1e]">
        <div className="container-corporate">
          <div className="max-w-[800px] mx-auto">
            <PrivacyBody />
          </div>
        </div>
      </section>
    </main>
  );
}
