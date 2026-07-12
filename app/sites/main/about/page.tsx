/**
 * WeCcelerate - About Us / מי אנחנו
 *
 * SEO: Organization + Person schemas for E-E-A-T.
 */

import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import AboutContent from './AboutContent';

// =============================================================================
// METADATA
// =============================================================================

// constructMetadata (rather than an inline object) so this page ships with
// alternates.canonical + hreflang like every other indexable marketing page.
export const metadata: Metadata = constructMetadata({
 title: 'אודות WeCcelerate | וויסלרייט — בונה מיזמים ומאיץ סטארטאפים בישראל',
 description:
 'WeCcelerate (וויסלרייט) — בונה המיזמים (Venture Builder) ומאיץ סטארטאפים בישראל. מלווים יזמים מרעיון ועד הצלחה גלובלית: ייעוץ עסקי, פיתוח מוצר, גיוס הון, ומסלול MedTech בלעדי עם לאומית. ליווי סטארטאפים בכל שלבי הפיתוח.',
 keywords: [
 'וויסלרייט',
 'WeCcelerate',
 'Venture Builder ישראל',
 'בונה מיזמים',
 'בונה מיזמים ישראל',
 'מאיץ סטארטאפים',
 'מאיץ מיזמים',
 'יזמות טכנולוגית',
 'יזמות',
 'גיוס הון סטארטאפ',
 'גיוס הון מיזם',
 'ליווי מיזמים',
 'ליווי יזמים',
 'הקמת מיזם בישראל',
 'מיזם הזנק',
 'חברת הזנק',
 ],
 path: '/about',
 locale: 'he',
});

// =============================================================================
// TEAM DATA (for JSON-LD only)
// =============================================================================

interface SchemaPerson {
 name: string;
 jobTitle: string;
 image: string;
}

const teamForSchema: SchemaPerson[] = [
 { name: 'Alon Pinchas', jobTitle: 'CEO & Founder', image: '/images/team/alon.jpg' },
 { name: 'Ido Sabag', jobTitle: 'VP & Head of Technology', image: '/images/ido2.png' },
 { name: 'Avraham Hinuch', jobTitle: 'VP of Marketing', image: '/images/team/avraham.jpg' },
 { name: 'Noam Ohayon', jobTitle: 'Head of Business Development', image: '/images/noam2.png' },
 { name: 'Lioz Zohar', jobTitle: 'Head of Strategy', image: '/images/team/lioz.jpg' },
];

// =============================================================================
// JSON-LD SCHEMA
// =============================================================================

function generateAboutPageSchema() {
 return {
 '@context': 'https://schema.org',
 '@graph': [
 {
 '@type': 'AboutPage',
 '@id': 'https://weccelerate.co.il/about',
 name: 'אודות WeCcelerate',
 description:
 'WeCcelerate — חברת Venture Building ישראלית. ייעוץ, פיתוח וליווי סטארטאפים.',
 inLanguage: 'he',
 isPartOf: {
 '@type': 'WebSite',
 '@id': 'https://weccelerate.co.il',
 name: 'WeCcelerate',
 url: 'https://weccelerate.co.il',
 },
 },
 {
 '@type': 'Organization',
 '@id': 'https://weccelerate.co.il/#organization',
 name: 'WeCcelerate',
 alternateName: 'וויסלרייט',
 url: 'https://weccelerate.co.il',
 logo: 'https://weccelerate.co.il/images/logo.svg',
 description:
 'Venture Builder ומאיץ סטארטאפים ישראלי — ליווי יזמים מקצה לקצה בתחומי הטכנולוגיה, הרפואה וההשקעות.',
 // sameAs: official, owned WeCcelerate profiles. Twitter/X and GitHub
 // are intentionally omitted — Twitter is not company-owned; GitHub
 // is not user-facing. Including unowned profiles hurts entity
 // resolution because LLMs/Google verify ownership by following these
 // links.
 sameAs: [
 'https://www.linkedin.com/company/weccelerate',
 'https://www.facebook.com/weccelerate',
 'https://www.instagram.com/weccelerate.ltd',
 'https://www.youtube.com/@WeCcelerate.Ltd1',
 'https://www.tiktok.com/@weccelerate',
 'https://www.crunchbase.com/organization/weccelerat',
 ],
 employee: teamForSchema.map((p) => ({
 '@type': 'Person',
 name: p.name,
 jobTitle: p.jobTitle,
 image: `https://weccelerate.co.il${p.image}`,
 worksFor: {
 '@type': 'Organization',
 name: 'WeCcelerate',
 },
 })),
 },
 {
 '@type': 'BreadcrumbList',
 itemListElement: [
 { '@type': 'ListItem', position: 1, name: 'בית', item: 'https://weccelerate.co.il' },
 { '@type': 'ListItem', position: 2, name: 'אודות', item: 'https://weccelerate.co.il/about' },
 ],
 },
 ],
 };
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function AboutPage() {
 return (
 <>
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{
 __html: JSON.stringify(generateAboutPageSchema()),
 }}
 />
 <AboutContent />
 </>
 );
}
