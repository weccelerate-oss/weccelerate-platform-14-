'use client';

/**
 * ContactContent — Client wrapper for the Contact page.
 * All UI text uses useLanguage() / t() for i18n.
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { ContactForm } from './ContactForm';
import { NavigationButtons, LocationMap } from '@/components/ui/NavigationButtons';
import { TrackedLink } from '@/components/ui/TrackedLink';

export default function ContactContent() {
  const { t } = useLanguage();

  return (
    <main id="main-content">
      {/* Hero */}
      <section className="relative bg-[#070b1e] py-16 md:py-24">
        <div className="absolute bottom-0 start-0 end-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" />
        <div className="container-corporate">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-white/40">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {t('contact.breadcrumb.home')}
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="bg-gradient-to-r from-[#c8a951] to-[#e8d48b] bg-clip-text text-transparent">
                {t('contact.breadcrumb.current')}
              </li>
            </ol>
          </nav>

          <h1 data-speakable className="heading-display text-white mb-6">
            {t('contact.hero.title1')}
            <br />
            <span className="bg-gradient-to-r from-[#c8a951] to-[#e8d48b] bg-clip-text text-transparent">
              {t('contact.hero.title2')}
            </span>
          </h1>
          <p data-speakable className="text-xl text-white/60 max-w-2xl leading-relaxed">
            {t('contact.hero.text')}
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section-padding bg-[#070b1e]">
        <div className="container-corporate">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Details Sidebar */}
            <aside className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="heading-3 text-white mb-6">{t('contact.details.title')}</h2>
                <ul className="space-y-5">
                  <li>
                    <TrackedLink
                      trackAction="click.phone"
                      trackMeta={{ location: 'contact-page' }}
                      href="tel:+972555647538"
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-10 h-10 bg-white/[0.05] group-hover:bg-[#c8a951] flex items-center justify-center flex-shrink-0 transition-colors">
                        <Phone className="w-5 h-5 text-white/60 group-hover:text-[#070b1e] transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm text-white/40">{t('contact.info.phone')}</p>
                        <p className="font-medium text-white" dir="ltr">
                          055-564-7538
                        </p>
                      </div>
                    </TrackedLink>
                  </li>
                  <li>
                    <TrackedLink
                      trackAction="click.whatsapp"
                      trackMeta={{ location: 'contact-page' }}
                      href="https://wa.me/972555647538"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-10 h-10 bg-emerald-500/10 group-hover:bg-emerald-500 flex items-center justify-center flex-shrink-0 transition-colors">
                        <MessageCircle className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm text-white/40">WhatsApp</p>
                        <p className="font-medium text-emerald-400">{t('contact.details.whatsapp')}</p>
                      </div>
                    </TrackedLink>
                  </li>
                  <li>
                    <TrackedLink
                      trackAction="click.email"
                      trackMeta={{ location: 'contact-page' }}
                      href="mailto:info@weccelerate.co.il"
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-10 h-10 bg-white/[0.05] group-hover:bg-[#c8a951] flex items-center justify-center flex-shrink-0 transition-colors">
                        <Mail className="w-5 h-5 text-white/60 group-hover:text-[#070b1e] transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm text-white/40">{t('contact.info.email')}</p>
                        <p className="font-medium text-white">
                          info@weccelerate.co.il
                        </p>
                      </div>
                    </TrackedLink>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white/60" />
                    </div>
                    <div>
                      <p className="text-sm text-white/40">{t('contact.details.office')}</p>
                      <p className="font-medium text-white mb-3">
                        {t('contact.info.addressValue')}
                      </p>
                      <NavigationButtons variant="dark" size="md" />
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#c8a951]/10 to-[#c8a951]/5 border border-[#c8a951]/20 p-6">
                <h3 className="text-sm font-semibold text-[#c8a951] mb-2">
                  {t('contact.accompaniment.title')}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {t('contact.accompaniment')}
                </p>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] p-6">
                <h3 className="text-sm font-semibold text-white mb-2">
                  {t('contact.hours.title')}
                </h3>
                <ul className="space-y-1 text-sm text-white/60">
                  <li>{t('contact.hours.weekdays')}</li>
                  <li>{t('contact.hours.weekend')}</li>
                </ul>
              </div>

              {/* Embedded Map */}
              <LocationMap variant="dark" height="250px" />
            </aside>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <h2 className="heading-3 text-white mb-6">{t('contact.form.sendMessage')}</h2>
              <Suspense fallback={<div className="py-12 text-center text-white/40">{t('contact.form.loading')}</div>}>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
