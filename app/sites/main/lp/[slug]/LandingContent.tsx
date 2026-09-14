'use client';

/**
 * Distraction-free landing page for paid campaigns:
 *   hero + form above the fold → proof (quotes) → FAQ → form again.
 * No navbar, one action. Every form tags the lead `landing_paid` + service,
 * so the dashboard and Pipedrive show which campaign page converted.
 */

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Phone } from 'lucide-react';
import { LeadForm } from '@/components/forms/LeadForm';
import { ServiceTestimonials } from '@/components/services/ServiceTestimonials';
import { ServiceFaq } from '@/components/services/ServiceFaq';
import { SERVICE_FAQS } from '@/lib/services-faqs';
import type { LandingPage } from '@/lib/landing-pages';

export function LandingContent({ page }: { page: LandingPage }) {
  return (
    <main id="main-content" className="min-h-screen bg-[#070b1e] text-white" dir="rtl">
      {/* Slim header: logo + phone, nothing else */}
      <header className="border-b border-white/[0.06]">
        <div className="container-corporate flex items-center justify-between py-4">
          <Link href="/" aria-label="WeCcelerate" className="flex items-center gap-2">
            <Image
              src="/images/logos/weccelerate-logo-wide.jpeg"
              alt="WeCcelerate"
              width={320}
              height={96}
              priority
              className="h-16 w-auto object-contain"
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
              }}
            />
          </Link>
          <a href="tel:+972555647538" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white" dir="ltr">
            <Phone className="w-4 h-4" aria-hidden="true" />
            055-564-7538
          </a>
        </div>
      </header>

      {/* Hero + form */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(700px_400px_at_80%_0%,rgba(200,169,81,0.14),transparent_70%)]" aria-hidden="true" />
        <div className="container-corporate relative z-10 py-12 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-6">
            <p className="text-[#c8a951] text-sm font-semibold uppercase tracking-[0.2em] mb-4">{page.eyebrow}</p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black leading-[1.12] tracking-tight whitespace-pre-line text-balance mb-5">
              {page.headline}
            </h1>
            <p className="text-white/65 text-lg leading-relaxed max-w-xl mb-8">{page.sub}</p>
            <ul className="space-y-3 mb-8">
              {page.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-white/80">
                  <CheckCircle2 className="w-5 h-5 text-[#c8a951] mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <p className="text-white/40 text-sm">בשותפות עם לאומית שירותי בריאות · מוכר על ידי רשות החדשנות · תל אביב וירושלים</p>
          </div>
          <div className="lg:col-span-6">
            <div id="lead-form" className="scroll-mt-24 rounded-2xl border border-[#c8a951]/30 bg-[#0d1321] p-6 sm:p-8 shadow-2xl shadow-black/40">
              <LeadForm formType="landing_paid" service={page.service} heading={page.formHeading} subheading={page.formSub} />
            </div>
          </div>
        </div>
      </section>

      <ServiceTestimonials />
      <ServiceFaq items={SERVICE_FAQS[page.faqKey] ?? []} />

      {/* Second form for readers who scrolled */}
      <section className="relative py-16 sm:py-20">
        <div className="absolute inset-0 bg-[#0a0e27]" />
        <div className="container-corporate relative z-10 max-w-2xl">
          <div className="rounded-2xl border border-[#c8a951]/30 bg-[#0d1321] p-6 sm:p-8">
            <LeadForm formType="landing_paid" service={page.service} heading={page.formHeading} subheading={page.formSub} />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-white/40">
        <p>וויסלרייט בע״מ · ח.פ 515962819 · הרכבת 58, תל אביב · <Link href="/privacy" className="hover:text-white/70">מדיניות פרטיות</Link></p>
      </footer>
    </main>
  );
}
