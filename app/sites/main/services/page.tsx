import { Metadata } from 'next';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import { services } from '@/lib/services-data';
import ServicesDashboardContent from './ServicesDashboardContent';
import { LeadFormSection } from '@/components/forms/LeadFormSection';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = constructMetadata({
  title: 'השירותים שלנו | WeCcelerate — ייעוץ, פיתוח וליווי סטארטאפים',
  description:
    'גלו את מגוון השירותים של WeCcelerate: ייעוץ עסקי ואסטרטגי, פיתוח מוצר פיזי ודיגיטלי, ומסלול MedTech בשיתוף לאומית. ליווי מקצה לקצה ליזמים.',
  keywords: [
    'שירותי מאיץ סטארטאפים',
    'ייעוץ עסקי ליזמים',
    'פיתוח מוצר פיזי',
    'פיתוח אפליקציה',
    'MedTech ישראל',
    'WeCcelerate שירותים',
    'גיוס הון סטארטאפ',
    'ליווי יזמים ישראל',
  ],
  path: '/services',
});

// =============================================================================
// PAGE COMPONENT
// =============================================================================

// The real service pages, as an ItemList — replaces the generic site-wide
// ServiceSchema that used to describe services with no page of their own.
function buildServicesListSchema() {
  const url = `${SITE_CONFIG.url}/services`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#webpage`,
        url,
        name: 'השירותים של WeCcelerate',
        inLanguage: 'he-IL',
        isPartOf: { '@id': `${SITE_CONFIG.url}/#website` },
        about: { '@id': `${SITE_CONFIG.url}/#organization` },
        mainEntity: { '@id': `${url}#list` },
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#list`,
        itemListElement: services.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: s.title,
          url: `${url}/${s.id}`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'בית', item: SITE_CONFIG.url },
          { '@type': 'ListItem', position: 2, name: 'שירותים', item: url },
        ],
      },
    ],
  };
}

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildServicesListSchema()) }}
      />
      <ServicesDashboardContent />
      <LeadFormSection formType="page_cta" />
    </>
  );
}
