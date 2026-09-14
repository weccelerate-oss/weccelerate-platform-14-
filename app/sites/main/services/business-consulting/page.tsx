import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { ServicePageSchema } from '@/components/seo/ServicePageSchema';
import BusinessConsultingContent from './BusinessConsultingContent';
import { SERVICE_FAQS } from '@/lib/services-faqs';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = constructMetadata({
 title: 'ייעוץ עסקי ואסטרטגי | Business Consulting',
 description:
 'ייעוץ עסקי מלא ליזמים — תוכנית עסקית, מחקר שוק, תוכנית פיננסית ותקציר מנהלים. בונים את היסודות לגיוס הון והצלחה עסקית.',
 keywords: [
 'ייעוץ עסקי לסטארטאפים',
 'ייעוץ עסקי למיזמים',
 'ייעוץ עסקי ליזמים',
 'תוכנית עסקית',
 'תוכנית עסקית למיזם',
 'מחקר שוק',
 'Business Plan Israel',
 'Startup Consulting',
 'business consulting Tel Aviv',
 'תוכנית פיננסית',
 'executive summary',
 'ייעוץ עסקי ירושלים',
 'ליווי מיזמים',
 'בונה מיזמים',
 'הקמת מיזם',
 'יזמות',
 ],
 path: '/services/business-consulting',
 locale: 'he',
});

// =============================================================================
// PAGE
// =============================================================================

export default function BusinessConsultingPage() {
 return (
 <>
 <ServicePageSchema
 serviceId="business-consulting"
 title="ייעוץ עסקי ואסטרטגי"
 titleEn="Business Consulting & Strategy"
 description="ייעוץ עסקי מלא ליזמים — תוכנית עסקית, מחקר שוק, תוכנית פיננסית ותקציר מנהלים."
 descriptionEn="Full business consulting for entrepreneurs — business plan, market research, financial plan, and executive summary. Building the foundations for fundraising and business success."
 path="/services/business-consulting"
 category="Business Consulting"
 faqs={SERVICE_FAQS['business-consulting']}
 />
 <BusinessConsultingContent />
 </>
 );
}
