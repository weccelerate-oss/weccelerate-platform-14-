import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { ServicePageSchema } from '@/components/seo/ServicePageSchema';
import DigitalProductContent from './DigitalProductContent';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = constructMetadata({
 title: 'פיתוח מוצר דיגיטלי | Digital Product Development',
 description:
 'פיתוח אפליקציות ומערכות WEB מקצה לקצה. מאפיון UX/UI דרך כתיבת קוד ועד להשקה בחנויות.',
 keywords: [
 'פיתוח אפליקציות',
 'פיתוח אפליקציה למיזם',
 'פיתוח אפליקציה לסטארטאפ',
 'UX UI Design',
 'App Development Israel',
 'פיתוח מוצר דיגיטלי',
 'MVP Development',
 'בניית MVP',
 'פיתוח אפליקציה תל אביב',
 'React Native development',
 'SaaS development Israel',
 'web application development',
 'CTO as a Service',
 'שכירת CTO',
 'פיתוח טכנולוגי למיזם',
 'פיתוח לסטארטאפ',
 ],
 path: '/services/digital-product',
 locale: 'he',
});

// =============================================================================
// PAGE
// =============================================================================

export default function DigitalProductPage() {
 return (
 <>
 <ServicePageSchema
 serviceId="digital-product"
 title="פיתוח מוצר דיגיטלי"
 titleEn="Digital Product Development"
 description="פיתוח אפליקציות ומערכות WEB מקצה לקצה. מאפיון UX/UI דרך כתיבת קוד ועד להשקה."
 descriptionEn="End-to-end app and web system development. From UX/UI design through coding to store launch. MVP development, SaaS platforms, and mobile apps."
 path="/services/digital-product"
 category="Software Development"
 faqs={[
 {
 question: 'כמה עולה לפתח אפליקציה בישראל?',
 answer: 'עלות פיתוח אפליקציה משתנה בהתאם לסוג ולמורכבות. MVP בסיסי: 50,000-150,000 ₪. אפליקציה מלאה עם Backend: 150,000-500,000 ₪. פלטפורמת SaaS מורכבת: 300,000 ₪ ומעלה. WeCcelerate מציעה מחשבון עלויות חינמי באתר.',
 },
 {
 question: 'How long does it take to develop an MVP?',
 answer: 'At WeCcelerate, MVP development typically takes over a flexible duration depending on complexity. A simple mobile app MVP: over a flexible duration. A web platform with user dashboard: over a flexible duration. A complex SaaS with integrations: over a flexible duration.',
 },
 {
 question: 'מה ההבדל בין MVP לבין מוצר מלא?',
 answer: 'MVP (Minimum Viable Product) הוא גרסה ראשונית עם הפיצ׳רים החיוניים בלבד, שמטרתה לאמת את הרעיון מול משתמשים אמיתיים. מוצר מלא כולל את כל הפיצ׳רים, סקייל, אופטימיזציה ועיצוב מושלם. ב-WeCcelerate ממליצים תמיד להתחיל מ-MVP.',
 },
 ]}
 />
 <DigitalProductContent />
 </>
 );
}
