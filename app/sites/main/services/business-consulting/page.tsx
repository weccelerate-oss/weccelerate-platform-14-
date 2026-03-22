import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { ServicePageSchema } from '@/components/seo/ServicePageSchema';
import BusinessConsultingContent from './BusinessConsultingContent';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = constructMetadata({
  title: 'ייעוץ עסקי ואסטרטגי | Business Consulting',
  description:
    'ייעוץ עסקי מלא ליזמים — תוכנית עסקית, מחקר שוק, תוכנית פיננסית ותקציר מנהלים. בונים את היסודות לגיוס הון והצלחה עסקית.',
  keywords: [
    'ייעוץ עסקי לסטארטאפים',
    'תוכנית עסקית',
    'מחקר שוק',
    'Business Plan Israel',
    'Startup Consulting',
    'business consulting Tel Aviv',
    'תוכנית פיננסית',
    'executive summary',
    'ייעוץ עסקי ירושלים',
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
        ratingValue={4.9}
        reviewCount={67}
        faqs={[
          {
            question: 'מה כולל ייעוץ עסקי של WeCcelerate?',
            answer: 'הייעוץ העסקי כולל מחקר שוק מעמיק, בניית תוכנית שיווקית, תוכנית פיננסית מפורטת, תקציר מנהלים מקצועי ותוכנית עסקית מלאה — כל מה שנדרש לגיוס הון ולבניית עסק מצליח.',
          },
          {
            question: 'כמה זמן לוקח לבנות תוכנית עסקית?',
            answer: 'תוכנית עסקית מלאה עם WeCcelerate נבנית בדרך כלל תוך 4-8 שבועות, תלוי במורכבות המיזם ובהיקף מחקר השוק הנדרש.',
          },
          {
            question: 'How much does business consulting cost at WeCcelerate?',
            answer: 'WeCcelerate offers tailored business consulting packages. Pricing depends on the scope — from market research only to full business plan + fundraising support. Contact us for a free consultation.',
          },
        ]}
      />
      <BusinessConsultingContent />
    </>
  );
}
