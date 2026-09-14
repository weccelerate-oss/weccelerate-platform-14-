import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { ServicePageSchema } from '@/components/seo/ServicePageSchema';
import MedTechContent from './MedTechContent';
import { SERVICE_FAQS } from '@/lib/services-faqs';

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
 'מיזם רפואי',
 'מיזם MedTech',
 'הקמת מיזם רפואי',
 'Digital Health Startup',
 'Digital Health Venture',
 'ליווי רגולטורי',
 'חוות דעת רפואיות',
 'Helsinki Committee',
 'ועדת הלסינקי',
 'clinical pilot Israel',
 'פיילוט קליני',
 'medical device startup',
 'FDA 510k',
 'CE Marking',
 'מסלול MedTech',
 'גישה לדאטה רפואית',
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
 faqs={SERVICE_FAQS['medtech-leumit']}
 />
 <MedTechContent />
 </>
 );
}
