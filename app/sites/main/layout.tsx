import { ReactNode } from 'react';
import { CorporateNavbar } from '@/components/layout/CorporateNavbar';
import { OrganizationSchema } from '@/components/seo/organization-schema';
import { ServiceSchema } from '@/components/seo/service-schema';
import { WhatsAppFloat } from '@/components/ui/WhatsAppFloat';
import { AccessibilityWidget } from '@/components/ui/AccessibilityWidget';

interface MainSiteLayoutProps {
  children: ReactNode;
}

export default function MainSiteLayout({ children }: MainSiteLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* GEO Authority - JSON-LD Schemas */}
      <OrganizationSchema 
        includeLeumitAffiliation={true} 
        variant="main" 
      />
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
