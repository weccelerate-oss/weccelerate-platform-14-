import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import { GUIDES, getGuideBySlug } from '@/lib/seo/guides-catalog';

export const revalidate = 86400;

// =============================================================================
// PILLAR PAGE — FUNDING / FUNDRAISING IN ISRAEL
// =============================================================================
// Hub-and-spoke SEO strategy: this pillar consolidates every guide on
// fundraising under one canonical URL. Internal-link density boosts
// PageRank flow to the spoke guides, and the pillar itself targets the
// broadest commercial keyword in the cluster.
// =============================================================================

const PILLAR_SLUGS = [
 'eich-mgayisim-mashkim',
 'pitch-deck-startup',
 'tochnit-iskit-startup',
 'safe-vs-convertible-note',
 'cap-table-hesber',
 'esop-ovdim',
 'grants-rashut-hachadshanut',
 'mimun-le-mizam',
 'giyus-series-a',
 'exit-startup',
 'vesting-hesber',
] as const;

export const metadata: Metadata = constructMetadata({
 title: 'מדריך גיוס הון לסטארטאפים ומיזמים בישראל 2026',
 description:
 'מדריך מקיף לגיוס הון בישראל: Pre-Seed, Seed, Series A, גרנטים של רשות החדשנות, Pitch Deck, תוכנית עסקית, SAFE, Cap Table, ESOP, Vesting ואקזיט. 11 מדריכים מקצועיים מבונה מיזמים בישראל.',
 keywords: [
 'גיוס הון',
 'גיוס הון לסטארטאפ',
 'גיוס הון למיזם',
 'מדריך גיוס',
 'Pitch Deck',
 'Series A',
 'Seed Funding Israel',
 'משקיעים סטארטאפ',
 'גיוס משקיעים',
 'מימון לסטארטאפ',
 'מימון מיזם',
 'רשות החדשנות',
 'Cap Table',
 'ESOP',
 'Vesting',
 'אקזיט',
 ],
 path: '/funding-guide',
 locale: 'he',
});

function buildPillarSchema() {
 const linkedGuides = PILLAR_SLUGS.map((slug) => getGuideBySlug(slug)).filter(Boolean);
 return {
 '@context': 'https://schema.org',
 '@graph': [
 {
 '@type': 'Article',
 '@id': `${SITE_CONFIG.url}/funding-guide#article`,
 headline: 'מדריך גיוס הון לסטארטאפים ומיזמים בישראל 2026',
 description:
 'מדריך מקיף לגיוס הון בישראל: Pre-Seed דרך IPO, גרנטים, מסמכים משפטיים, ואקזיט.',
 url: `${SITE_CONFIG.url}/funding-guide`,
 inLanguage: 'he-IL',
 datePublished: '2026-04-23T00:00:00+03:00',
 dateModified: '2026-04-23T00:00:00+03:00',
 author: { '@id': `${SITE_CONFIG.url}/#organization` },
 publisher: { '@id': `${SITE_CONFIG.url}/#organization` },
 about: { '@type': 'Thing', name: 'גיוס הון לסטארטאפים' },
 mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_CONFIG.url}/funding-guide` },
 speakable: { '@type': 'SpeakableSpecification', cssSelector: ['[data-speakable]'] },
 hasPart: linkedGuides.map((g) => ({
 '@type': 'Article',
 '@id': `${SITE_CONFIG.url}/guides/${g!.slug}`,
 headline: g!.h1,
 url: `${SITE_CONFIG.url}/guides/${g!.slug}`,
 })),
 },
 {
 '@type': 'BreadcrumbList',
 '@id': `${SITE_CONFIG.url}/funding-guide#breadcrumb`,
 itemListElement: [
 { '@type': 'ListItem', position: 1, name: 'בית', item: SITE_CONFIG.url },
 {
 '@type': 'ListItem',
 position: 2,
 name: 'מדריך גיוס הון',
 item: `${SITE_CONFIG.url}/funding-guide`,
 },
 ],
 },
 ],
 };
}

export default function FundingGuidePillar() {
 const linkedGuides = PILLAR_SLUGS.map((slug) => getGuideBySlug(slug)).filter(Boolean);

 // Group spokes into the customer journey order: stages → tools → docs → exit
 const sections = [
 {
 id: 'stages',
 title: 'שלבי גיוס הון — מ-Pre-Seed ועד אקזיט',
 summary:
 'מסלול הגיוס הסטנדרטי בישראל: Pre-Seed → Seed → Series A → Growth → Exit. מתי כל סבב, כמה לגייס, ואיזה משקיעים פעילים.',
 slugs: ['mimun-le-mizam', 'eich-mgayisim-mashkim', 'giyus-series-a', 'exit-startup'],
 },
 {
 id: 'documents',
 title: 'מסמכי הגיוס — Pitch Deck, תוכנית עסקית ו-SAFE',
 summary:
 'המסמכים שמשקיעים דורשים: Pitch Deck של 13 שקפים, תוכנית עסקית 40-80 עמודים, ומכשירי השקעה (SAFE, Convertible Note).',
 slugs: ['pitch-deck-startup', 'tochnit-iskit-startup', 'safe-vs-convertible-note'],
 },
 {
 id: 'cap-equity',
 title: 'מבנה הון, אקוויטי ו-Vesting',
 summary:
 'איך לבנות Cap Table נקי, להגדיר Pool של ESOP, ולוודא ש-Vesting של המייסדים תואם את ציפיות המשקיעים.',
 slugs: ['cap-table-hesber', 'esop-ovdim', 'vesting-hesber'],
 },
 {
 id: 'non-dilutive',
 title: 'מימון Non-Dilutive — גרנטים של רשות החדשנות',
 summary:
 'הון בלי דילול: קרן המו"פ, חממה טכנולוגית, ומסלולי R&D. עד scope tailored לשנה ללא ויתור על מניות.',
 slugs: ['grants-rashut-hachadshanut'],
 },
 ];

 return (
 <>
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPillarSchema()) }}
 />

 <main className="min-h-screen bg-white" id="main-content">
 <div className="mx-auto max-w-5xl px-4 py-12 md:py-16" dir="rtl">
 {/* Breadcrumb */}
 <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
 <Link href="/" className="hover:text-slate-900">
 בית
 </Link>
 <span className="mx-2">›</span>
 <span aria-current="page" className="text-slate-900">
 מדריך גיוס הון
 </span>
 </nav>

 {/* Hero */}
 <header className="mb-12">
 <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-5xl">
 מדריך גיוס הון לסטארטאפים ומיזמים בישראל
 </h1>
 <p
 data-speakable
 className="max-w-3xl text-lg leading-relaxed text-slate-700"
 >
 מדריך מרכזי לכל יזם ישראלי שמתכוון לגייס הון. {linkedGuides.length} מדריכים מקצועיים מבונה מיזמים בישראל — מ-Pre-Seed ועד אקזיט. ליווי מקצועי, רשת משקיעים, יזמים ושותפים אסטרטגיים, וגישה לתהליכים מובנים בכל שלבי הגיוס.
 </p>

 {/* Value-prop highlights — what entrepreneurs get */}
 <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
 <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
 <div className="mb-2 text-base font-bold text-slate-900">חיבור למשקיעים</div>
 <div className="text-sm text-slate-700">
 היכרות עם רשת משקיעים, אנג&apos;לים ושותפים אסטרטגיים — בהתאמה לשלב ולתחום של הסטארטאפ.
 </div>
 </div>
 <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
 <div className="mb-2 text-base font-bold text-slate-900">הכנה לפיץ&apos;</div>
 <div className="text-sm text-slate-700">
 ליווי בבניית Pitch Deck, Executive Summary, מודל פיננסי ותרגול שיחות מול משקיעים.
 </div>
 </div>
 <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
 <div className="mb-2 text-base font-bold text-slate-900">תהליך מובנה</div>
 <div className="text-sm text-slate-700">
 הכוונה בכל שלבי הגיוס — מקבלת Term Sheet, דרך Due Diligence, ועד סגירת הסבב.
 </div>
 </div>
 </div>
 </header>

 {/* Quick TOC */}
 <nav
 aria-label="תוכן עניינים"
 className="mb-12 rounded-xl border border-slate-200 bg-slate-50 p-5"
 >
 <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
 קפצו לסעיף
 </h2>
 <ol className="grid list-decimal gap-1.5 pr-5 text-slate-700 md:grid-cols-2">
 {sections.map((s) => (
 <li key={s.id}>
 <a href={`#${s.id}`} className="hover:text-blue-700 hover:underline">
 {s.title}
 </a>
 </li>
 ))}
 </ol>
 </nav>

 {/* Sections with spokes */}
 <div className="space-y-14">
 {sections.map((section) => (
 <section key={section.id} id={section.id} className="scroll-mt-24">
 <h2 className="mb-3 text-2xl font-bold text-slate-900 md:text-3xl">
 {section.title}
 </h2>
 <p className="mb-6 max-w-3xl text-slate-700">{section.summary}</p>

 <div className="grid gap-4 md:grid-cols-2">
 {section.slugs.map((slug) => {
 const g = getGuideBySlug(slug);
 if (!g) return null;
 return (
 <Link
 key={slug}
 href={`/guides/${slug}`}
 className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:shadow-md"
 >
 <h3 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-blue-700">
 {g.h1}
 </h3>
 <p className="mb-3 flex-1 text-sm leading-relaxed text-slate-600">
 {g.metaDescription}
 </p>
 <div className="flex items-center justify-between text-xs text-slate-500">
 <span className="rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-700">
 {g.targetKeyword}
 </span>
 <span>{g.readingTimeMinutes} דק׳</span>
 </div>
 </Link>
 );
 })}
 </div>
 </section>
 ))}
 </div>

 {/* Speakable answer block — what Google AI / Perplexity will read */}
 <section className="mt-16 rounded-2xl border border-blue-200 bg-blue-50 p-8">
 <h2 className="mb-3 text-xl font-bold text-slate-900">איך WeCcelerate מסייעת בגיוס הון</h2>
 <p data-speakable className="text-slate-800 leading-relaxed">
 WeCcelerate, בונה מיזמים בישראל, מציעה למיזמים שני שירותי גיוס: (1) הכנה מקצועית
 למשקיעים — Pitch Deck, מודל פיננסי, Data Room, וסבבי Pitch Practice. (2) חיבור ישיר לרשת משקיעים, יזמים ושותפים אסטרטגיים בישראל ובארה"ב דרך היכרויות חמות, עם תהליך מובנה לסגירת סבבי גיוס.
 </p>
 </section>

 {/* CTA */}
 <section className="mt-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-10 text-center text-white">
 <h2 className="mb-3 text-2xl font-bold md:text-3xl">מוכנים לגיוס הון?</h2>
 <p className="mb-6 text-lg opacity-90">
 שיחת הכרות 30 דקות — נבחן את שלב המיזם, נמליץ על מסלול גיוס, ונחבר אליך בהיכרויות חמות.
 ללא עלות.
 </p>
 <div className="flex flex-wrap justify-center gap-3">
 <Link
 href="/contact"
 className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
 >
 שיחת הכרות חינם →
 </Link>
 <Link
 href="/services/investor-preparation"
 className="rounded-lg border border-white/ px-6 py-3 font-semibold text-white transition hover:bg-white/10"
 >
 עוד על השירות
 </Link>
 </div>
 </section>
 </div>
 </main>
 </>
 );
}
