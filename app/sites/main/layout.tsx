import { ReactNode } from 'react';
import { CorporateNavbar } from '@/components/layout/CorporateNavbar';
import { WhatsAppFloat } from '@/components/ui/WhatsAppFloat';
import { StickyLeadBar } from '@/components/forms/StickyLeadBar';
import { UnlessPath } from '@/components/layout/UnlessPath';
import { SlideInOffer } from '@/components/forms/SlideInOffer';
import { AccessibilityWidget } from '@/components/ui/AccessibilityWidget';

interface MainSiteLayoutProps {
  children: ReactNode;
}

export default function MainSiteLayout({ children }: MainSiteLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/*
        Organization JSON-LD is emitted ONCE from the root `app/layout.tsx`
        via <GeoSchema /> — see components/seo/GeoSchema.tsx. A duplicate
        <OrganizationSchema /> used to live here; it was removed 2026-04-24
        because it emitted the same @id and contained factual errors.
        Service JSON-LD is likewise NOT emitted site-wide. Until 2026-11 a
        <ServiceSchema services={['all']} /> here put four generic services
        (with @ids of pages that do not exist, one typed FinancialService) on
        every page. Each /services/* page emits its own Service node via
        <ServicePageSchema />.
      */}

      {/* Corporate Navbar — skip link handled globally in root layout.
          Hidden on paid landing pages (/lp/*): one page, one action. */}
      <UnlessPath prefixes={['/lp']}>
        <CorporateNavbar />
      </UnlessPath>

      {/* Main content */}
      {children}

      {/* Floating WhatsApp CTA (hidden on phones while the sticky bar shows) */}
      <WhatsAppFloat />
      <StickyLeadBar />
      <SlideInOffer />

      {/* Accessibility Widget — חוק נגישות ישראל */}
      <AccessibilityWidget />
    </div>
  );
}
