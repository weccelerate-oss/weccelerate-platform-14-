'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import {
  Accessibility,
  Keyboard,
  Eye,
  MousePointer2,
  Type,
  Contrast,
  Palette,
  Pause,
  Link2,
  ScanLine,
  Mail,
  Phone,
  User,
  CheckCircle2,
  Shield,
  Globe,
  Monitor,
  ImageIcon,
} from 'lucide-react';

export function AccessibilityContent() {
  const { t, dir } = useLanguage();

  const actions = [
    { icon: Globe, text: t('accessibility.actions.semantic') },
    { icon: Keyboard, text: t('accessibility.actions.keyboard') },
    { icon: Accessibility, text: t('accessibility.actions.skipNav') },
    { icon: Shield, text: t('accessibility.actions.aria') },
    { icon: CheckCircle2, text: t('accessibility.actions.forms') },
    { icon: Contrast, text: t('accessibility.actions.contrast') },
    { icon: Eye, text: t('accessibility.actions.focus') },
    { icon: Pause, text: t('accessibility.actions.motion') },
    { icon: Type, text: t('accessibility.actions.rtl') },
    { icon: ImageIcon, text: t('accessibility.actions.images') },
  ];

  const widgetFeatures = [
    { icon: Type, text: t('accessibility.widget.fontSize') },
    { icon: Contrast, text: t('accessibility.widget.contrast') },
    { icon: Palette, text: t('accessibility.widget.grayscale') },
    { icon: Pause, text: t('accessibility.widget.animations') },
    { icon: Link2, text: t('accessibility.widget.links') },
    { icon: MousePointer2, text: t('accessibility.widget.cursor') },
    { icon: ScanLine, text: t('accessibility.widget.guide') },
  ];

  return (
    <main id="main-content" dir={dir}>
      {/* Hero Section */}
      <section
        className="relative py-20 md:py-28 bg-[#070b1e]"
        aria-labelledby="a11y-hero-heading"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-[#070b1e] via-[#070b1e]/95 to-[#0d1321]/90" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" />

        <div className="relative z-10 container-corporate w-full">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-sm text-white/40">
                <li>
                  <Link
                    href="/"
                    className="hover:text-white transition-colors"
                  >
                    {t('accessibility.breadcrumb.home')}
                  </Link>
                </li>
                <li>
                  <span className="mx-2">/</span>
                </li>
                <li className="text-[#c8a951]">
                  {t('accessibility.breadcrumb.current')}
                </li>
              </ol>
            </nav>

            <h1
              id="a11y-hero-heading"
              className="heading-display text-white mb-6"
            >
              {t('accessibility.hero.title1')}
              <br />
              <span className="bg-gradient-to-r from-[#c8a951] to-[#e8d48b] bg-clip-text text-transparent">
                {t('accessibility.hero.title2')}
              </span>
            </h1>

            <p className="text-lg text-white/50 leading-relaxed max-w-2xl">
              {t('accessibility.hero.updated')}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-[#070b1e]">
        <div className="container-corporate">
          <div className="max-w-[800px] mx-auto space-y-12">
            {/* Introduction */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {t('accessibility.intro.title')}
              </h2>
              <p className="text-white/60 leading-relaxed">
                {t('accessibility.intro.text')}
              </p>
            </div>

            {/* What we've done */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                {t('accessibility.actions.title')}
              </h2>
              <ul className="space-y-4">
                {actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="p-2 bg-white/5 rounded-lg flex-shrink-0 mt-0.5">
                      <action.icon
                        className="w-5 h-5 text-[#c8a951]"
                        aria-hidden="true"
                      />
                    </div>
                    <span className="text-white/60 leading-relaxed">
                      {action.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Accessibility Widget */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {t('accessibility.widget.title')}
              </h2>
              <p className="text-white/60 leading-relaxed mb-6">
                {t('accessibility.widget.text')}
              </p>
              <ul className="space-y-3">
                {widgetFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <feature.icon
                      className="w-4 h-4 text-[#c8a951]"
                      aria-hidden="true"
                    />
                    <span className="text-white/60">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Standard */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {t('accessibility.standard.title')}
              </h2>
              <p className="text-white/60 leading-relaxed">
                {t('accessibility.standard.text')}
              </p>
            </div>

            {/* Browser Compatibility */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                <Monitor
                  className="inline-block w-6 h-6 me-2 text-[#c8a951]"
                  aria-hidden="true"
                />
                {t('accessibility.browsers.title')}
              </h2>
              <p className="text-white/60 leading-relaxed">
                {t('accessibility.browsers.text')}
              </p>
            </div>

            {/* Contact */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                {t('accessibility.contact.title')}
              </h2>
              <p className="text-white/60 leading-relaxed mb-6">
                {t('accessibility.contact.text')}
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-white/70">
                  <User
                    className="w-5 h-5 text-[#c8a951]"
                    aria-hidden="true"
                  />
                  {t('accessibility.contact.name')}
                </li>
                <li>
                  <a
                    href="mailto:info@weccelerate.co.il"
                    className="flex items-center gap-3 text-white/70 hover:text-[#c8a951] transition-colors"
                  >
                    <Mail
                      className="w-5 h-5 text-[#c8a951]"
                      aria-hidden="true"
                    />
                    {t('accessibility.contact.email')}
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+972555647538"
                    className="flex items-center gap-3 text-white/70 hover:text-[#c8a951] transition-colors"
                  >
                    <Phone
                      className="w-5 h-5 text-[#c8a951]"
                      aria-hidden="true"
                    />
                    {t('accessibility.contact.phone')}
                  </a>
                </li>
              </ul>
              <p className="text-white/50 text-sm mt-6">
                {t('accessibility.contact.response')}
              </p>
            </div>

            {/* Disclaimer */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {t('accessibility.disclaimer.title')}
              </h2>
              <p className="text-white/60 leading-relaxed">
                {t('accessibility.disclaimer.text')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
