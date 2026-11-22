import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { constructMetadata } from '@/lib/seo';
import { services } from '@/lib/services-data';
import { ServiceDetailContent } from './ServiceDetailContent';
import { ServicePageSchema } from '@/components/seo/ServicePageSchema';
import { SERVICE_FAQS } from '@/lib/services-faqs';

// =============================================================================
// STATIC PARAMS
// =============================================================================

export function generateStaticParams() {
  const dedicatedPages = ['business-consulting', 'physical-product', 'digital-product', 'medtech-leumit', 'marketing'];
  return services
    .filter((s) => !dedicatedPages.includes(s.id))
    .map((s) => ({ id: s.id }));
}

// =============================================================================
// METADATA
// =============================================================================

const metaMap: Record<string, { title: string; description: string; keywords: string[]; titleEn?: string; descriptionEn?: string; category?: string }> = {
  'business-consulting': {
    title: 'ייעוץ עסקי ואסטרטגי | Business Consulting',
    description:
      'ייעוץ עסקי מלא ליזמים — תוכנית עסקית, מחקר שוק, תוכנית פיננסית ותקציר מנהלים. בונים את היסודות לגיוס הון והצלחה עסקית.',
    keywords: [
      'ייעוץ עסקי לסטארטאפים',
      'תוכנית עסקית',
      'מחקר שוק',
      'Business Plan Israel',
      'Startup Consulting',
    ],
  },
  'physical-product': {
    title: 'פיתוח מוצר פיזי | Physical Product Development',
    description:
      'מעיצוב תעשייתי דרך אב-טיפוס ועד לייצור המוני. תהליך הנדסי מקצה לקצה להבאת מוצר פיזי לשוק.',
    keywords: [
      'פיתוח מוצר פיזי',
      'אב טיפוס',
      'עיצוב תעשייתי',
      'Prototyping Israel',
      'Product Development',
    ],
  },
  'digital-product': {
    title: 'פיתוח מוצר דיגיטלי | Digital Product Development',
    description:
      'פיתוח אפליקציות ומערכות WEB מקצה לקצה. מאפיון UX/UI דרך כתיבת קוד ועד להשקה בחנויות.',
    keywords: [
      'פיתוח אפליקציות',
      'UX UI Design',
      'App Development Israel',
      'פיתוח מוצר דיגיטלי',
      'MVP Development',
    ],
  },
  'medtech-leumit': {
    title: 'מסלול MedTech לאומית | Medical Accelerator',
    description:
      'המסלול היוקרתי למיזמים רפואיים בשיתוף לאומית שירותי בריאות. חוות דעת מרופאים מומחים, ליווי רגולטורי מלא וסקירות שוק.',
    keywords: [
      'מאיץ רפואי',
      'Medical Accelerator',
      'MedTech Israel',
      'לאומית שירותי בריאות',
      'ליווי רגולטורי',
    ],
  },
  'investors': {
    title: 'השקעה בסטארטאפים — למשקיעים | WeCcelerate',
    description:
      'מצאו את ההשקעה הבאה שלכם — מיזמים שעברו אקסלרציה מלאה, מוכנים להשקעה ומותאמים לתחומי העניין שלכם.',
    keywords: [
      'השקעה בסטארטאפים',
      'משקיעים',
      'גיוס הון',
      'Startup Investment Israel',
      'Angel Investors',
      'Venture Capital',
    ],
    titleEn: 'For Investors',
    descriptionEn:
      'Startup investment opportunities for investors: ventures that completed the WeCcelerate acceleration process, matched to each investor and their fields of interest.',
    category: 'Investor Relations',
  },
  'investor-preparation': {
    title: 'הכנה לפגישת משקיעים ו-Pitch | WeCcelerate',
    description:
      'תיכנסו לפגישת המשקיעים עם ביטחון מלא. סימולציות, תרגול Pitch, הכנה ל-100 השאלות הקשות וחיבור ישיר למשקיעים רלוונטיים.',
    keywords: [
      'הכנה למשקיעים',
      'Pitch Deck',
      'גיוס הון סטארטאפ',
      'Investor Meeting Preparation',
      'פגישת משקיעים',
    ],
    titleEn: 'Investor Preparation',
    descriptionEn:
      'Investor-meeting preparation for founders: pitch practice, meeting simulations, preparation for investor questions and introductions to relevant investors.',
    category: 'Fundraising Preparation',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const meta = metaMap[id];
  if (!meta) return {};

  return constructMetadata({
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    path: `/services/${id}`,
    locale: 'he',
  });
}

// =============================================================================
// PAGE
// =============================================================================

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = services.find((s) => s.id === id);
  if (!service) notFound();

  // Same data feeds the FAQPage schema and the visible accordion, so what
  // Google is told matches what a visitor sees.
  const meta = metaMap[id];
  const faqs = SERVICE_FAQS[id] ?? [];

  return (
    <>
      {meta && (
        <ServicePageSchema
          serviceId={id}
          title={service.title}
          titleEn={meta.titleEn ?? service.title}
          description={meta.description}
          descriptionEn={meta.descriptionEn ?? meta.description}
          path={`/services/${id}`}
          category={meta.category ?? 'Business Consulting'}
          faqs={faqs}
        />
      )}
      <ServiceDetailContent serviceId={id} />
    </>
  );
}
