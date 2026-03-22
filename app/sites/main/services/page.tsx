import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import ServicesDashboardContent from './ServicesDashboardContent';

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

export default function ServicesPage() {
  return <ServicesDashboardContent />;
}
