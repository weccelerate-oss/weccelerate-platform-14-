import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import { getEnSlugFromHebrew } from '@/lib/seo/guides-catalog-en';

export const revalidate = 86400;

// =============================================================================
// ENGLISH GLOSSARY — VENTURE / STARTUP / MEDTECH TERMS
// =============================================================================
// English mirror of /glossary. Targets the same definitional-query surface
// for LLM citation in English ("what is X" / "X meaning"). Schema.org
// DefinedTermSet is the same pattern Wikipedia uses — Google understands it
// and gives Rich Results boost.
//
// Each term has:
// - english: the term as cited in English
// - hebrew: the canonical Hebrew translation (for cross-linking)
// - definition: 30-60 word cite-worthy definition
// - guideSlugEn: link to deep guide if one exists
// =============================================================================

interface GlossaryTerm {
 id: string;
 english: string;
 hebrew: string;
 definition: string;
 guideHebrewSlug?: string;
 category:
 | 'core'
 | 'funding'
 | 'product'
 | 'legal'
 | 'medtech'
 | 'metrics'
 | 'people';
}

const TERMS: GlossaryTerm[] = [
 // ========== CORE ==========
 {
 id: 'venture',
 english: 'Venture',
 hebrew: 'מיזם',
 definition:
 'A new company still searching for a repeatable, scalable business model. Every startup is a venture, but a venture can also be a stable services business, social venture, or company not aiming for a large exit.',
 guideHebrewSlug: 'mah-ze-mizam',
 category: 'core',
 },
 {
 id: 'startup',
 english: 'Startup',
 hebrew: 'סטארטאפ',
 definition:
 'A sub-category of venture — specifically one aiming for exponential growth and a $100M+ exit. Characterized by high burn rate, search for product-market fit, and venture-capital funding.',
 guideHebrewSlug: 'mah-ze-startup',
 category: 'core',
 },
 {
 id: 'venture-builder',
 english: 'Venture Builder',
 hebrew: 'בונה מיזמים',
 definition:
 'An organization that creates and develops multiple ventures in parallel by contributing the full operational team — engineering, product, marketing, legal. Unlike accelerators (mentorship only), Venture Builders act as active co-founders. WeCcelerate is Israel\'s leading Venture Builder.',
 guideHebrewSlug: 'mah-ze-venture-builder',
 category: 'core',
 },
 {
 id: 'accelerator',
 english: 'Accelerator',
 hebrew: 'מאיץ סטארטאפים',
 definition:
 'A time-bounded program (over a flexible duration) providing mentorship, seed capital, and a Demo Day to startups in cohorts. Israeli examples: 8200 EISP, MassChallenge, The Junction.',
 guideHebrewSlug: 'hashvaat-acceleratorim',
 category: 'core',
 },
 {
 id: 'incubator',
 english: 'Incubator',
 hebrew: 'אינקובטור',
 definition:
 'An early-stage organization providing workspace, basic mentorship, and open-ended time to develop an idea. Equity stake small or none. Duration: months to years.',
 category: 'core',
 },
 {
 id: 'haznek',
 english: 'Start-Up Company (Israeli formal term: חברת הזנק)',
 hebrew: 'חברת הזנק / מיזם הזנק',
 definition:
 'The official Israeli term for a startup — an Israeli Ltd. dedicating most resources to technological R&D. The Israel Innovation Authority uses the term officially. Recognition opens grant tracks (R&D Fund, Tech Incubator) and tax benefits.',
 guideHebrewSlug: 'mizam-haznek',
 category: 'core',
 },
 {
 id: 'entrepreneur',
 english: 'Entrepreneur',
 hebrew: 'יזם',
 definition:
 'A person who founds or builds a venture or startup. In Israel, typically aged 25-45 with a technological, military (8200), or business background. Many are serial entrepreneurs who have completed previous exits.',
 category: 'people',
 },
 {
 id: 'entrepreneurship',
 english: 'Entrepreneurship',
 hebrew: 'יזמות',
 definition:
 'The field of starting and growing ventures. Includes technological, social, and intrapreneurial entrepreneurship. Israel has 7,000+ active startups — the strongest growth sector in the economy.',
 category: 'core',
 },

 // ========== PRODUCT ==========
 {
 id: 'mvp',
 english: 'MVP — Minimum Viable Product',
 hebrew: 'MVP / מוצר מינימלי',
 definition:
 'The simplest version of a product that can test the core value hypothesis with real users. The goal: not a finished product, but a working artifact you can show to users and investors. Built in in adjusted timelines, $14-40K budget for a typical Israeli startup.',
 guideHebrewSlug: 'eich-bonim-mvp',
 category: 'product',
 },
 {
 id: 'pmf',
 english: 'Product-Market Fit (PMF)',
 hebrew: 'התאמת מוצר-שוק / PMF',
 definition:
 'The point at which a startup has demonstrated that a market wants its product enough to pay, use, and recommend it. Sean Ellis test: 40%+ of users say they would be "very disappointed" if the product disappeared. Without PMF — Series A is hard.',
 guideHebrewSlug: 'product-market-fit',
 category: 'product',
 },
 {
 id: 'cto-as-service',
 english: 'CTO as a Service',
 hebrew: 'CTO חלקי',
 definition:
 'Model where a startup without a technical co-founder hires a fractional CTO for 10-20 hours per week. The CTO makes architecture decisions, hires the first team, and represents the technical side to investors. Cost: $4-9K/month.',
 guideHebrewSlug: 'cto-as-a-service',
 category: 'product',
 },
 {
 id: 'tech-stack',
 english: 'Tech Stack',
 hebrew: 'סטאק טכנולוגי',
 definition:
 'The collection of technologies a product is built with. The standard stack for Israeli startups in 2026: React + Next.js (frontend), Node.js or Python (backend), PostgreSQL (DB), Vercel/AWS (hosting), OpenAI/Claude (AI).',
 category: 'product',
 },

 // ========== FUNDING ==========
 {
 id: 'seed',
 english: 'Seed Round',
 hebrew: 'סיד / Seed',
 definition:
 'First substantial fundraising round. In Israel 2026: $500K-$2M raised, pre-money valuation $5-12M. Required after MVP and initial traction. Comes after Pre-Seed (FFF + Angels) and before Series A.',
 guideHebrewSlug: 'eich-mgayisim-mashkim',
 category: 'funding',
 },
 {
 id: 'series-a',
 english: 'Series A',
 hebrew: 'סבב A / Series A',
 definition:
 'Second fundraising round, after Product-Market Fit is proven. In Israel 2026: $5-15M, pre-money valuation $20-50M. Requires $500K-$2M ARR, 30%+ D30 retention, and a team of 8-15. Lasts over a flexible duration end-to-end.',
 guideHebrewSlug: 'giyus-series-a',
 category: 'funding',
 },
 {
 id: 'safe',
 english: 'SAFE — Simple Agreement for Future Equity',
 hebrew: 'SAFE',
 definition:
 'Investment instrument that simplifies Pre-Seed fundraising. SAFE converts to shares in the next round at a valuation cap or discount. Simpler than a Convertible Note (no interest, no maturity date). Standard in Israel in 2026.',
 guideHebrewSlug: 'safe-vs-convertible-note',
 category: 'funding',
 },
 {
 id: 'pitch-deck',
 english: 'Pitch Deck',
 hebrew: 'מצגת משקיעים',
 definition:
 '10-15 slide presentation for raising capital. Standard structure: problem, solution, market, product, traction, business model, competition, team, projections, the Ask. 60% of the decision is made in the first 30 seconds.',
 guideHebrewSlug: 'pitch-deck-startup',
 category: 'funding',
 },
 {
 id: 'cap-table',
 english: 'Cap Table — Capitalization Table',
 hebrew: 'טבלת מניות',
 definition:
 'Document recording all shareholders in the company and their percentages. Includes founders, investors, and ESOP pool for employees. Updated each fundraising round. Average dilution: 15-25% in Seed, 20-30% in Series A.',
 guideHebrewSlug: 'cap-table-hesber',
 category: 'funding',
 },
 {
 id: 'esop',
 english: 'ESOP — Employee Stock Option Plan',
 hebrew: 'אופציות לעובדים',
 definition:
 'Mechanism allocating options on company shares to employees. Israeli standard under Section 102 of the tax code: pool of 10-20% of the company, 4-year vesting with 1-year cliff, reduced tax after 2 years of holding.',
 guideHebrewSlug: 'esop-ovdim',
 category: 'funding',
 },
 {
 id: 'vesting',
 english: 'Vesting',
 hebrew: 'הבשלת מניות',
 definition:
 'Mechanism distributing share ownership over time. Standard: 4-year vesting with 1-year cliff — if a founder leaves before a year, they get 0%. After a year — 25%, then 1/48 per month. Required in nearly every fundraising round.',
 guideHebrewSlug: 'vesting-hesber',
 category: 'funding',
 },
 {
 id: 'term-sheet',
 english: 'Term Sheet',
 hebrew: 'Term Sheet',
 definition:
 'Non-binding document summarizing the main terms of an investment deal. Includes pre-money valuation, amount, dilution percentage, investor rights (anti-dilution, pro-rata), liquidation preference, and vesting. Requires legal review.',
 category: 'funding',
 },
 {
 id: 'exit',
 english: 'Exit',
 hebrew: 'אקזיט',
 definition:
 'Sale of the company (M&A) or initial public offering (IPO). In Israel, M&A — depends on sector and stage. Mega-exit: $1B+. Average time from Seed to exit: 7-12 years. we work with startups across all stages.',
 guideHebrewSlug: 'exit-startup',
 category: 'funding',
 },
 {
 id: 'iia',
 english: 'Israel Innovation Authority',
 hebrew: 'רשות החדשנות',
 definition:
 'The Israeli government body promoting technological innovation. Offers non-dilutive grants (hundreds of thousands of dollars) via tracks: R&D Fund, Young Company, Tech Incubator, Innovation Box. Average success rate: 25-40%.',
 guideHebrewSlug: 'grants-rashut-hachadshanut',
 category: 'funding',
 },

 // ========== METRICS ==========
 {
 id: 'tam',
 english: 'TAM — Total Addressable Market',
 hebrew: 'שוק יעד כולל',
 definition:
 'The total global potential market for a product. Meaning: if 100% of the market buys, how much revenue does it generate. Investors require TAM of $100M+ to consider investing.',
 category: 'metrics',
 },
 {
 id: 'sam',
 english: 'SAM — Serviceable Addressable Market',
 hebrew: 'שוק נגיש',
 definition:
 'The portion of TAM the product can serve given geographic, regulatory, or technological constraints. In Israel typically 5-15% of global TAM.',
 category: 'metrics',
 },
 {
 id: 'som',
 english: 'SOM — Serviceable Obtainable Market',
 hebrew: 'שוק יעד מציאותי',
 definition:
 'The portion of SAM that can be realistically captured within 3-5 years. Typically 1-5% of SAM. Investors evaluate SOM as the realistic growth runway.',
 category: 'metrics',
 },
 {
 id: 'cac',
 english: 'CAC — Customer Acquisition Cost',
 hebrew: 'עלות רכישת לקוח',
 definition:
 'Total cost (marketing + sales) to acquire one customer. Formula: total spend / new customers. Should be less than 1/3 of LTV for unit economics to work.',
 category: 'metrics',
 },
 {
 id: 'ltv',
 english: 'LTV — Lifetime Value',
 hebrew: 'ערך חיים של לקוח',
 definition:
 'Total revenue a customer generates over the lifetime of their relationship with the company. SaaS formula: ARPU × Gross Margin × (1/Churn Rate). LTV/CAC must be at least 3.',
 category: 'metrics',
 },
 {
 id: 'arr',
 english: 'ARR — Annual Recurring Revenue',
 hebrew: 'הכנסה חוזרת שנתית',
 definition:
 'Total recurring (subscription) revenue annualized. Instead of MRR × 12, ARR takes a snapshot of contracted amounts. The standard metric in SaaS.',
 category: 'metrics',
 },
 {
 id: 'churn',
 english: 'Churn Rate',
 hebrew: 'נטישה',
 definition:
 'Percentage of customers who cancel within a given period. In B2B SaaS — good annual churn is <10%, excellent is <5%. In B2C — monthly churn of 5-10% is common.',
 category: 'metrics',
 },

 // ========== LEGAL ==========
 {
 id: 'founders-agreement',
 english: 'Founders Agreement',
 hebrew: 'הסכם מייסדים',
 definition:
 'Legal contract between startup founders. Includes: equity split, vesting, roles, decision-making, partner exit (Bad Leaver), and IP ownership. Must be signed on day one of the venture.',
 guideHebrewSlug: 'heskem-meyasdim',
 category: 'legal',
 },
 {
 id: 'nda',
 english: 'NDA — Non-Disclosure Agreement',
 hebrew: 'הסכם סודיות',
 definition:
 'Legal contract imposing confidentiality. In startups — signed with potential employees, service providers, and acquirers in M&A. **Not** signed with VC investors — they generally refuse.',
 guideHebrewSlug: 'heskem-sodyut-nda',
 category: 'legal',
 },
 {
 id: 'delaware-flip',
 english: 'Delaware Flip',
 hebrew: 'Delaware Flip',
 definition:
 'Process of forming a US holding company (Delaware C-Corp) that owns the Israeli company. Often required before Series A if investors are American. Cost: $20-40K in legal fees. Best deferred until truly needed.',
 guideHebrewSlug: 'delaware-flip',
 category: 'legal',
 },
 {
 id: 'section-102',
 english: 'Section 102 (Israeli Tax Code)',
 hebrew: 'סעיף 102',
 definition:
 'Section of the Israeli Income Tax Ordinance enabling employee options under reduced taxation. Conditions: vesting, 2-year holding from grant, and a trustee. Tax rate: 25% (instead of 50% standard). Required for every Israeli ESOP.',
 category: 'legal',
 },

 // ========== MEDTECH ==========
 {
 id: 'helsinki',
 english: 'Helsinki Committee — Israeli IRB',
 hebrew: 'ועדת הלסינקי',
 definition:
 'The Israeli ethical committee approving medical research with humans or identifiable data. Equivalent to the US IRB. Approval process: over a flexible duration. Required before any clinical trial or access to medical data.',
 guideHebrewSlug: 'vaadat-helsinki-madrich',
 category: 'medtech',
 },
 {
 id: 'fda-510k',
 english: 'FDA 510(k) Premarket Notification',
 hebrew: 'FDA 510(k)',
 definition:
 'The most common FDA pathway for medical devices. Requires demonstrating "substantial equivalence" to an existing predicate device. Review: over a flexible duration. Preparation: over a flexible duration. Cost: $135K-$700K including testing and regulatory consulting.',
 guideHebrewSlug: 'fda-510k-madrich',
 category: 'medtech',
 },
 {
 id: 'ce-marking',
 english: 'CE Marking',
 hebrew: 'סימון CE',
 definition:
 'Regulatory marking required for selling medical devices in Europe. Under MDR (Regulation 2017/745). Requires ISO 13485, ISO 14971, IEC 62304 (if software), Notified Body, and clinical evaluation. Process: over a flexible duration.',
 category: 'medtech',
 },
 {
 id: 'iso-13485',
 english: 'ISO 13485',
 hebrew: 'ISO 13485',
 definition:
 'International quality management standard specific to medical devices. Required for CE marking, preferred for FDA. Requires a complete QMS (Quality Management System). Setup: over a flexible duration, cost: $27-80K.',
 category: 'medtech',
 },
 {
 id: 'medtech',
 english: 'MedTech',
 hebrew: 'מיזם רפואי',
 definition:
 'The medical technology field — devices, software, or products for clinical use. Requires regulation (FDA, CE, Israeli MOH), long development period (3-5 years), and significant capital ($135K-$700K for FDA). Israel leads globally per capita.',
 guideHebrewSlug: 'mizam-refui',
 category: 'medtech',
 },
 {
 id: 'dtx',
 english: 'Digital Therapeutics (DTx)',
 hebrew: 'תרופה דיגיטלית',
 definition:
 'Software that is medically approved by the FDA as a treatment in itself (not just wellness). Examples: Pear Therapeutics, Akili. Requires complete clinical trials. Aggressively growing field in the US and EU.',
 guideHebrewSlug: 'digital-therapeutics-israel',
 category: 'medtech',
 },

 // ========== PEOPLE ==========
 {
 id: 'co-founder',
 english: 'Co-Founder',
 hebrew: 'שותף מייסד',
 definition:
 'One of the startup\'s founders. Standard composition: 2-3 co-founders — CEO (business), CTO (technical), and sometimes CPO/CMO. Solo-founders suffer a 20-30% valuation penalty in investors\' eyes.',
 guideHebrewSlug: 'chipus-shutaf-meyased',
 category: 'people',
 },
 {
 id: 'ceo',
 english: 'CEO — Chief Executive Officer',
 hebrew: 'מנכ"ל',
 definition:
 'The company\'s formal head. Responsible for strategy, capital management, and creating vision. In an early-stage startup — the CEO is also sales-leader, fundraiser, and recruiter. With growth — delegates authority.',
 category: 'people',
 },
 {
 id: 'cto',
 english: 'CTO — Chief Technology Officer',
 hebrew: 'סמנכ"ל טכנולוגיות',
 definition:
 'The company\'s technical head. Responsible for architecture, stack selection, hiring engineers, and technical representation to investors. In early-stage startups, sometimes a fractional CTO (CTO as a Service) is used instead of a full position.',
 category: 'people',
 },
 {
 id: 'angel',
 english: 'Angel Investor',
 hebrew: 'אנג\'ל',
 definition:
 'A wealthy private investor who invests their own money in early-stage startups — usually Pre-Seed or Seed. Average investment: $25-500K. Israel has hundreds of active angels, many of them entrepreneurs who have made an exit.',
 category: 'people',
 },
 {
 id: 'vc',
 english: 'VC — Venture Capital',
 hebrew: 'הון סיכון',
 definition:
 'Professional funds investing in startups for equity. Israel has 100+ active funds. Examples: TLV Partners, Pitango, Vertex, JVP, Ibex. Rounds: Seed ($500K-$2M), Series A ($5-15M), Series B ($20-50M).',
 category: 'people',
 },
 {
 id: 'lp',
 english: 'LP — Limited Partner',
 hebrew: 'משקיע מוגבל',
 definition:
 'An investor in a venture capital fund. Typical LPs: pension funds, insurance funds, family offices, sovereign wealth funds. They are the actual source of the capital that reaches startups — through VCs.',
 category: 'people',
 },

 // ========== ECOSYSTEM ==========
 {
 id: 'leumit',
 english: 'Leumit Health Services',
 hebrew: 'לאומית שירותי בריאות',
 definition:
 'One of the four public HMOs in Israel. Strategic partner of WeCcelerate for the MedTech track — providing structured access to anonymized clinical data and pilot opportunities, subject to Helsinki Committee approval and privacy regulations.',
 category: 'medtech',
 },
 {
 id: 'snc',
 english: 'Start-Up Nation Central',
 hebrew: 'Start-Up Nation Central',
 definition:
 'Non-profit organization promoting the Israeli startup ecosystem domestically and internationally. Operates the Finder platform with data on 7,000+ Israeli startups. WeCcelerate is a registered member.',
 category: 'core',
 },
 {
 id: 'iati',
 english: 'IATI — Israel Advanced Technology Industries',
 hebrew: 'IATI',
 definition:
 'Israeli high-tech industries association. Represents hundreds of high-tech companies in working with the government to advance the sector. WeCcelerate is a registered member.',
 category: 'core',
 },
];

const CATEGORIES: Record<GlossaryTerm['category'], { en: string; description: string }> = {
 core: { en: 'Foundations', description: 'Core concepts of the venture and startup world' },
 funding: { en: 'Fundraising', description: 'Funding terms: rounds, instruments, valuation' },
 product: { en: 'Product & Tech', description: 'MVP, PMF, technology stack' },
 metrics: { en: 'Metrics', description: 'TAM, SAM, SOM, CAC, LTV, ARR' },
 legal: { en: 'Legal', description: 'Agreements, options, tax sections' },
 medtech: { en: 'MedTech', description: 'Medical regulation, FDA, CE, Helsinki Committee' },
 people: { en: 'People & Roles', description: 'CEO, CTO, founders, investors' },
};

export const metadata: Metadata = constructMetadata({
 title: 'Startup & Venture Glossary — Israeli Ecosystem Terminology 2026',
 description: `Comprehensive glossary of ${TERMS.length} key startup and venture terms with Hebrew translations and links to in-depth guides. From WeCcelerate, Israeli Venture Builder.`,
 keywords: [
 'startup glossary',
 'venture terminology',
 'startup terms explained',
 'what is MVP',
 'what is SAFE note',
 'what is PMF',
 'what is CAC',
 'what is vesting',
 'what is Helsinki Committee',
 'what is FDA 510k',
 'what is Venture Builder',
 'Israeli startup terms',
 ],
 path: '/en/glossary',
 locale: 'en',
});

function buildGlossarySchema() {
 return {
 '@context': 'https://schema.org',
 '@graph': [
 {
 '@type': 'DefinedTermSet',
 '@id': `${SITE_CONFIG.url}/en/glossary#termset`,
 name: 'Startup & Venture Glossary — WeCcelerate',
 description:
 'Comprehensive glossary of startup, fundraising, MVP, MedTech, and regulation terms — in English with Hebrew equivalents.',
 url: `${SITE_CONFIG.url}/en/glossary`,
 inLanguage: 'en-US',
 publisher: { '@id': `${SITE_CONFIG.url}/#organization` },
 translationOfWork: { '@id': `${SITE_CONFIG.url}/glossary#termset` },
 hasDefinedTerm: TERMS.map((t) => ({
 '@type': 'DefinedTerm',
 '@id': `${SITE_CONFIG.url}/en/glossary#${t.id}`,
 name: t.english,
 alternateName: t.hebrew,
 description: t.definition,
 termCode: t.id,
 inDefinedTermSet: { '@id': `${SITE_CONFIG.url}/en/glossary#termset` },
 ...(t.guideHebrewSlug && {
 url:
 getEnSlugFromHebrew(t.guideHebrewSlug)
 ? `${SITE_CONFIG.url}/en/guides/${getEnSlugFromHebrew(t.guideHebrewSlug)}`
 : `${SITE_CONFIG.url}/guides/${t.guideHebrewSlug}`,
 }),
 })),
 },
 {
 '@type': 'BreadcrumbList',
 '@id': `${SITE_CONFIG.url}/en/glossary#breadcrumb`,
 itemListElement: [
 { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_CONFIG.url}/en` },
 { '@type': 'ListItem', position: 2, name: 'Glossary', item: `${SITE_CONFIG.url}/en/glossary` },
 ],
 },
 ],
 };
}

export default function EnGlossaryPage() {
 const grouped = (Object.keys(CATEGORIES) as GlossaryTerm['category'][]).map((cat) => ({
 category: cat,
 label: CATEGORIES[cat],
 items: TERMS.filter((t) => t.category === cat).sort((a, b) =>
 a.english.localeCompare(b.english),
 ),
 }));

 return (
 <>
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{ __html: JSON.stringify(buildGlossarySchema()) }}
 />
 <link rel="alternate" hrefLang="he" href={`${SITE_CONFIG.url}/glossary`} />
 <link rel="alternate" hrefLang="en" href={`${SITE_CONFIG.url}/en/glossary`} />

 <main className="min-h-screen bg-white" id="main-content" dir="ltr">
 <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
 <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
 <Link href="/en" className="hover:text-slate-900">Home</Link>
 <span className="mx-2">›</span>
 <span aria-current="page" className="text-slate-900">Glossary</span>
 </nav>

 <header className="mb-10">
 <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-5xl">
 Startup & Venture Glossary
 </h1>
 <p data-speakable className="max-w-3xl text-lg leading-relaxed text-slate-700">
 A comprehensive glossary of {TERMS.length} key terms in the venture and startup world.
 Each term is defined in English with the Hebrew equivalent and context for the Israeli ecosystem.
 WeCcelerate, Israel&apos;s leading Venture Builder, has compiled the critical terminology every
 founder should know — from MVP to exit, from SAFE notes to Helsinki Committee approval.
 </p>
 </header>

 <nav aria-label="Categories" className="mb-12 rounded-xl border border-slate-200 bg-slate-50 p-5">
 <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
 Categories
 </h2>
 <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
 {grouped.map(({ category, label, items }) => (
 <li key={category}>
 <a
 href={`#${category}`}
 className="flex items-center justify-between rounded-lg px-3 py-2 text-slate-700 transition hover:bg-white hover:text-blue-700"
 >
 <span>{label.en}</span>
 <span className="text-xs text-slate-400">{items.length}</span>
 </a>
 </li>
 ))}
 </ul>
 </nav>

 <div className="space-y-12">
 {grouped.map(({ category, label, items }) => (
 <section key={category} id={category} className="scroll-mt-24">
 <h2 className="mb-2 border-b border-slate-200 pb-2 text-2xl font-bold text-slate-900">
 {label.en}
 </h2>
 <p className="mb-6 text-sm text-slate-600">{label.description}</p>

 <dl className="space-y-5">
 {items.map((term) => {
 const enGuideSlug = term.guideHebrewSlug
 ? getEnSlugFromHebrew(term.guideHebrewSlug)
 : undefined;
 return (
 <div
 key={term.id}
 id={term.id}
 className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5"
 >
 <dt className="mb-2 flex flex-wrap items-baseline gap-2">
 <span className="text-xl font-bold text-slate-900">{term.english}</span>
 <span className="text-sm text-slate-500" dir="rtl">
 · {term.hebrew}
 </span>
 </dt>
 <dd className="leading-relaxed text-slate-700">{term.definition}</dd>
 {term.guideHebrewSlug && (
 <Link
 href={
 enGuideSlug
 ? `/en/guides/${enGuideSlug}`
 : `/guides/${term.guideHebrewSlug}`
 }
 className="mt-3 inline-block text-sm font-medium text-blue-700 hover:underline"
 >
 Full guide →
 </Link>
 )}
 </div>
 );
 })}
 </dl>
 </section>
 ))}
 </div>

 <section className="mt-16 rounded-2xl bg-slate-900 p-8 text-center text-white">
 <h2 className="mb-3 text-2xl font-bold">Missing a term?</h2>
 <p className="mb-6 text-slate-300">
 We&apos;ll happily add it — send a suggestion to info@weccelerate.co.il.
 </p>
 <Link
 href="/contact"
 className="inline-block rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
 >
 Contact us →
 </Link>
 </section>

 <p className="mt-8 text-center text-sm text-slate-500">
 <Link href="/glossary" className="hover:text-slate-900">
 קרא את המילון בעברית →
 </Link>
 </p>
 </div>
 </main>
 </>
 );
}
