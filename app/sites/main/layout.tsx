import { ReactNode } from 'react';
import { CorporateNavbar } from '@/components/layout/CorporateNavbar';
import { ServiceSchema } from '@/components/seo/service-schema';
import { WhatsAppFloat } from '@/components/ui/WhatsAppFloat';
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
      */}
      <ServiceSchema
        services={['all']}
        site="main"
        includeRating={true}
      />

      {/* Corporate Navbar — skip link handled globally in root layout */}
      <CorporateNavbar />

      {/* Main content */}
      {children}

      {/* Floating WhatsApp CTA */}
      <WhatsAppFloat />

      {/* Accessibility Widget — חוק נגישות ישראל */}
      <AccessibilityWidget />
    </div>
  );
}
