import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { constructMetadata } from '@/lib/seo';
import { services } from '@/lib/services-data';
import { ServiceDetailContent } from './ServiceDetailContent';

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

const metaMap: Record<string, { title: string; description: string; keywords: string[] }> = {
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
    title: 'למשקיעים | For Investors',
    description:
      'מצאו את ההשקעה הבאה שלכם — מיזמים שעברו אקסלרציה מלאה, מוכנים להשקעה ומותאמים לתחומי העניין שלכם. חוסכים 80% מתהליך הסינון.',
    keywords: [
      'השקעה בסטארטאפים',
      'משקיעים',
      'גיוס הון',
      'Startup Investment Israel',
      'Angel Investors',
      'Venture Capital',
    ],
  },
  'investor-preparation': {
    title: 'מעטפת הכנה למשקיעים | Investor Preparation',
    description:
      'תיכנסו לפגישת המשקיעים עם ביטחון מלא. סימולציות, תרגול Pitch, הכנה ל-100 השאלות הקשות וחיבור ישיר למשקיעים רלוונטיים.',
    keywords: [
      'הכנה למשקיעים',
      'Pitch Deck',
      'גיוס הון סטארטאפ',
      'Investor Meeting Preparation',
      'פגישת משקיעים',
    ],
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

  return <ServiceDetailContent serviceId={id} />;
}
