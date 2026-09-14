'use client';

/**
 * Lead form inside a guide, matched to what the guide is about.
 *
 * Every guide belongs to a category (startup-basics, fundraising, ...).
 * The category decides which service the lead is tagged with and what the
 * form says, so a reader of a fundraising guide is asked about their raise,
 * not offered a generic "contact us". Two placements:
 *   - `mid`: a slim card after the second section, while attention is high
 *   - `end`: the full card that replaces the old text link at the bottom
 * No numbers or promises in the copy, by owner decision (2026-09-10).
 */

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LeadForm } from '@/components/forms/LeadForm';

interface GuideCta {
  service: string;
  servicePath: string;
  heading: string;
  sub: string;
  midHeading: string;
}

const BY_CATEGORY: Record<string, GuideCta> = {
  'startup-basics': {
    service: 'business-consulting',
    servicePath: '/services/business-consulting',
    heading: 'רוצים לדבר על הרעיון שלכם?',
    sub: 'שיחת היכרות חינם עם יועץ. נבין יחד מה השלב, מה חסר ומה הצעד הבא.',
    midHeading: 'יש לכם רעיון בשלב הזה? דברו איתנו',
  },
  fundraising: {
    service: 'investors',
    servicePath: '/services/investors',
    heading: 'מתכוננים לגיוס?',
    sub: 'שיחת היכרות חינם על המצגת, המודל והמשקיעים שמתאימים לשלב שלכם.',
    midHeading: 'רוצים חוות דעת על הגיוס שלכם?',
  },
  'product-development': {
    service: 'digital-product',
    servicePath: '/services/digital-product',
    heading: 'צריכים לבנות את המוצר?',
    sub: 'שיחת היכרות חינם על ה-MVP, הטכנולוגיה והצוות שמתאימים לרעיון.',
    midHeading: 'רוצים לדבר על המוצר שלכם?',
  },
  medtech: {
    service: 'medtech-leumit',
    servicePath: '/services/medtech-leumit',
    heading: 'מיזם רפואי? יש לנו מסלול ייעודי',
    sub: 'שיחת היכרות חינם על המסלול עם לאומית שירותי בריאות, הרגולציה והפיילוט.',
    midHeading: 'מיזם רפואי? דברו איתנו על המסלול',
  },
  regulatory: {
    service: 'medtech-leumit',
    servicePath: '/services/medtech-leumit',
    heading: 'צריכים ליווי ברגולציה?',
    sub: 'שיחת היכרות חינם על הדרך הרגולטורית שמתאימה למוצר שלכם.',
    midHeading: 'שאלה על רגולציה? דברו איתנו',
  },
  comparison: {
    service: 'business-consulting',
    servicePath: '/services/business-consulting',
    heading: 'לא בטוחים מה מתאים לכם?',
    sub: 'שיחת היכרות חינם. נעזור לכם להבין איזה מסלול נכון למיזם.',
    midHeading: 'רוצים עזרה בבחירה?',
  },
};

const DEFAULT: GuideCta = BY_CATEGORY['startup-basics'];

export function guideCta(category: string | null | undefined): GuideCta {
  return (category && BY_CATEGORY[category]) || DEFAULT;
}

interface GuideLeadFormProps {
  category: string | null | undefined;
  placement: 'mid' | 'end';
  /** The guide's own CTA label, when the catalog has one. */
  ctaLabel?: string;
  /** The guide's own service path, when the catalog has one. */
  ctaServicePath?: string;
}

export function GuideLeadForm({ category, placement, ctaLabel, ctaServicePath }: GuideLeadFormProps) {
  const cta = guideCta(category);
  const servicePath = ctaServicePath || cta.servicePath;

  if (placement === 'mid') {
    return (
      <aside
        aria-label="השאירו פרטים"
        className="my-12 rounded-2xl border border-[#c8a951]/25 bg-[#c8a951]/[0.05] p-6 md:p-7"
      >
        <LeadForm
          formType="guide_inline"
          service={cta.service}
          heading={cta.midHeading}
          subheading={cta.sub}
        />
      </aside>
    );
  }

  return (
    <section
      id="lead-form"
      className="mt-14 relative overflow-hidden rounded-2xl border border-[#c8a951]/30 bg-gradient-to-br from-[#c8a951]/[0.10] via-transparent to-[#c8a951]/[0.04] p-7 md:p-8 scroll-mt-24"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(200,169,81,0.10) 0%, transparent 70%)' }}
      />
      <div className="relative z-10 flex flex-col gap-6">
        <LeadForm
          formType="guide_inline"
          service={cta.service}
          heading={ctaLabel || cta.heading}
          subheading={cta.sub}
        />
        <Link
          href={servicePath}
          className="inline-flex items-center gap-2 self-start text-sm font-semibold text-white/70 hover:text-white transition-colors"
        >
          עוד על השירות
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
