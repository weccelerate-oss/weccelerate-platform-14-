import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { ServicePageSchema } from '@/components/seo/ServicePageSchema';
import PhysicalProductContent from './PhysicalProductContent';
import { SERVICE_FAQS } from '@/lib/services-faqs';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = constructMetadata({
 title: 'פיתוח מוצר פיזי | Physical Product Development',
 description:
 'מעיצוב תעשייתי דרך אב-טיפוס ועד לייצור המוני. תהליך הנדסי מקצה לקצה להבאת מוצר פיזי לשוק.',
 keywords: [
 'פיתוח מוצר פיזי',
 'פיתוח מוצר למיזם',
 'אב טיפוס',
 'עיצוב תעשייתי',
 'Prototyping Israel',
 'Product Development',
 'ייצור המוני',
 'industrial design Israel',
 'הנדסת מוצר',
 '3D printing prototype',
 'CNC machining',
 'פיתוח חומרה למיזם',
 'מיזם חומרה',
 'IoT product development',
 ],
 path: '/services/physical-product',
 locale: 'he',
});

// =============================================================================
// PAGE
// =============================================================================

export default function PhysicalProductPage() {
 return (
 <>
 <ServicePageSchema
 serviceId="physical-product"
 title="פיתוח מוצר פיזי"
 titleEn="Physical Product Development"
 description="מעיצוב תעשייתי דרך אב-טיפוס ועד לייצור המוני. תהליך הנדסי מקצה לקצה."
 descriptionEn="From industrial design through prototyping to mass manufacturing. End-to-end engineering process to bring a physical product to market."
 path="/services/physical-product"
 category="Product Development"
 faqs={SERVICE_FAQS['physical-product']}
 />
 <PhysicalProductContent />
 </>
 );
}
