import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { ServicePageSchema } from '@/components/seo/ServicePageSchema';
import DigitalProductContent from './DigitalProductContent';
import { SERVICE_FAQS } from '@/lib/services-faqs';

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
 faqs={SERVICE_FAQS['digital-product']}
 />
 <DigitalProductContent />
 </>
 );
}
