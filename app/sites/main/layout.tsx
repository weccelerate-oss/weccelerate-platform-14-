import { ReactNode } from 'react';
import { CorporateNavbar } from '@/components/layout/CorporateNavbar';
import { OrganizationSchema } from '@/components/seo/organization-schema';
import { ServiceSchema } from '@/components/seo/service-schema';
import { FAQSchema } from '@/components/seo/faq-schema';

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
      <FAQSchema 
        includeDefaults={true}
        lang="he"
      />

      {/* Skip to main content - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-yellow-500 focus:text-slate-900 focus:px-4 focus:py-2"
      >
        דלג לתוכן הראשי
      </a>

      {/* Corporate Navbar */}
      <CorporateNavbar />

      {/* Main content */}
      {children}
    </div>
  );
}
