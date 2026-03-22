import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { ServicePageSchema } from '@/components/seo/ServicePageSchema';
import MedTechContent from './MedTechContent';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = constructMetadata({
  title: 'מסלול MedTech לאומית | Medical Deep-Tech Accelerator',
  description:
    'המסלול היוקרתי למיזמים רפואיים בשיתוף לאומית שירותי בריאות. חוות דעת מרופאים מומחים, ליווי רגולטורי מלא וסקירות שוק לסטארטאפים בשלבים מוקדמים.',
  keywords: [
    'מאיץ רפואי',
    'Medical Accelerator',
    'MedTech Israel',
    'לאומית שירותי בריאות',
    'סטארטאפ בריאות דיגיטלית',
    'Digital Health Startup',
    'ליווי רגולטורי',
    'חוות דעת רפואיות',
    'Helsinki Committee',
    'clinical pilot Israel',
    'medical device startup',
  ],
  path: '/services/medtech-leumit',
  locale: 'he',
});

// =============================================================================
// PAGE
// =============================================================================

export default function MedTechLeumitPage() {
  return (
    <>
      <ServicePageSchema
        serviceId="medtech-leumit"
        title="מסלול MedTech לאומית"
        titleEn="Leumit MedTech Accelerator Track"
        description="המסלול היוקרתי למיזמים רפואיים בשיתוף לאומית שירותי בריאות — חוות דעת מרופאים מומחים, ליווי רגולטורי מלא וסקירות שוק."
        descriptionEn="Premium MedTech accelerator track in partnership with Leumit Health Services. Expert physician opinions, full regulatory guidance, and market reviews for early-stage healthcare startups."
        path="/services/medtech-leumit"
        category="Healthcare Acceleration"
        ratingValue={4.9}
        reviewCount={47}
        faqs={[
          {
            question: 'מה מסלול MedTech של WeCcelerate ולאומית כולל?',
            answer: 'המסלול כולל: חוות דעת מרופאים מומחים של לאומית, סקירת שוק מעמיקה, ליווי רגולטורי (CE, משרד הבריאות), גישה לנתוני בריאות אנונימיים, אפשרות לפיילוט קליני ברשת לאומית, וחיבור למשקיעים מתמחים בהלת\'טק.',
          },
          {
            question: 'How do I apply for the WeCcelerate-Leumit MedTech track?',
            answer: 'Apply through the WeCcelerate website contact form selecting "MedTech Leumit Track". Requirements: an innovative healthcare solution, founding team with relevant expertise, and willingness to pilot within the Israeli healthcare system. Acceptance is on a rolling basis.',
          },
          {
            question: 'האם צריך להיות רופא כדי להגיש מועמדות למסלול MedTech?',
            answer: 'לא, אין צורך להיות רופא. WeCcelerate מחפשת צוותים עם שילוב של מומחיות טכנולוגית וקלינית. אם אין לכם רופא בצוות, WeCcelerate יכולה לחבר אתכם עם יועצים רפואיים מרשת לאומית.',
          },
        ]}
      />
      <MedTechContent />
    </>
  );
}
