/**
 * Guides catalog - English (EN).
 *
 * EN companion for `lib/seo/guides-catalog.ts`. Contains English translations
 * of the 5 most commercially valuable Hebrew guides, targeting:
 * (a) Israeli founders who prefer English-language content
 * (b) US/EU investors researching the Israeli MedTech / venture ecosystem
 * (c) Global ChatGPT / Claude / Gemini users asking about Helsinki
 * Committee, FDA 510(k) for Israeli startups, etc.
 *
 * Each EN entry has the SAME `slug` shape as its Hebrew counterpart via the
 * `hebrewSlug` field, which powers the hreflang alternate link.
 *
 * The 5 guides were selected based on:
 * - MedTech-specific topics have genuine English demand globally
 * - Fundraising-for-Israeli-startups queries are often in English
 * - mah-ze-venture-builder / what-is-venture-builder has clear crossover
 */
import type { GuideFigure, GuideSource } from './guides-catalog';

export type GuideCategoryEn =
 | 'startup-basics'
 | 'product-development'
 | 'medtech'
 | 'fundraising'
 | 'regulatory'
 | 'comparison';

export interface GuideSectionEn {
 heading: string;
 paragraphs: string[];
 list?: string[];
 figure?: GuideFigure;
}

export interface GuideHowToStepEn {
 name: string;
 text: string;
 url?: string;
}

export interface GuideFaqEn {
 q: string;
 a: string;
}

export interface GuideEn {
 slug: string;
 /** Hebrew sibling slug - powers hreflang alternate link. */
 hebrewSlug: string;
 category: GuideCategoryEn;
 targetKeyword: string;
 relatedKeywords: string[];
 h1: string;
 metaTitle: string;
 metaDescription: string;
 speakableAnswer: string;
 lastUpdated: string;
 readingTimeMinutes: number;
 sections: GuideSectionEn[];
 howToSteps?: GuideHowToStepEn[];
 faqs: GuideFaqEn[];
 /** Sources the facts were verified against; omit for pure-advice guides. */
 sources?: GuideSource[];
 /** Slugs of other EN guides to link as "related". */
 relatedGuideSlugs: string[];
 ctaServicePath: string;
 ctaLabel: string;
}

export const GUIDE_CATEGORIES_EN: Record<GuideCategoryEn, { en: string; description: string }> = {
 'startup-basics': {
 en: 'Startup Basics',
 description: 'Idea, team, company formation - the foundation of a fundable startup.',
 },
 'product-development': {
 en: 'Product Development',
 description: 'MVP, pricing, engineering, CTO services - building a product that works.',
 },
 medtech: {
 en: 'MedTech & Health',
 description: 'Building a medical startup in Israel - regulation, data, clinical pilots.',
 },
 fundraising: {
 en: 'Fundraising',
 description: 'Pitch decks, business plans, investors - the path to capital.',
 },
 regulatory: {
 en: 'Regulatory',
 description: 'FDA, CE, Helsinki Committee - the official guides to what you must know.',
 },
 comparison: {
 en: 'Comparisons',
 description: 'Venture Builder vs Accelerator vs Incubator - what fits your startup.',
 },
};

export const GUIDES_EN: readonly GuideEn[] = [
 // ---------------------------------------------------------------------------
 // 1. WHAT IS A VENTURE BUILDER
 // ---------------------------------------------------------------------------
 // Sources (checked 2026-10-22):
 // - Israel Innovation Authority, "Venture Incubators Funding Program - Incubators Fund":
 //   https://innovationisrael.org.il/en/programs/technological-incubators-2024/
 //   incubators invest in early-stage companies and support them from idea to commercial product; chosen in a
 //   competitive procedure for a 5-year concession.
 // No official definition of "venture builder" exists; the model description is qualitative. All third-party
 // studio examples, equity ranges, portfolio-size ranges and survival statistics from the old entry were removed
 // as unverifiable.
 {
 slug: 'what-is-venture-builder',
 hebrewSlug: 'mah-ze-venture-builder',
 category: 'comparison',
 targetKeyword: 'what is a venture builder',
 relatedKeywords: [
 'venture builder definition',
 'venture builder vs accelerator',
 'venture studio',
 'startup studio',
 'venture builder Israel'],
 h1: 'Guide: what is a venture builder and how does it work?',
 metaTitle: 'What Is a Venture Builder? A Founder\'s Guide | WeCcelerate',
 metaDescription:
 'What is a venture builder, how it differs from an accelerator, an incubator and a VC fund, what founders give and get, and how to tell if the model fits you.',
 speakableAnswer:
 'A venture builder, also called a startup studio, is an organization that builds new companies together with founders. Instead of only mentoring or investing, it works inside the venture from the early stages, on product, technology, business model and fundraising, and in return becomes a partner in the company. Terms differ from one builder to another.',
 lastUpdated: '2026-10-22',
 readingTimeMinutes: 6,
 sections: [
 {
 heading: 'What is a venture builder?',
 paragraphs: [
 'A venture builder is an organization that builds startups together with their founders, working inside the company from the early stages rather than advising it from the outside. You will also see the names "startup studio" and "venture studio" for the same idea.',
 'In practice, a venture builder brings people and processes that a young company does not have yet: product thinking, engineering, design, business modeling, go-to-market work and preparation for investors. In exchange, it usually becomes a shareholder or a long-term partner in the company. There is no single legal or official definition, so the exact terms, depth of involvement and stage of entry differ from one venture builder to another.'],
 },
 {
 heading: 'How is a venture builder different from an accelerator?',
 paragraphs: [
 'An accelerator usually runs a time-limited program for teams that already exist, with mentoring, workshops and investor exposure. A venture builder works on the company itself, often before there is a full team, and stays involved for longer.',
 'Put simply, an accelerator helps a team move faster. A venture builder helps build the team, the product and the company. That deeper involvement is why venture builders usually ask for a more significant stake or partnership than a short program would.'],
 },
 {
 heading: 'How is it different from an incubator or a VC fund?',
 paragraphs: [
 'In Israel the word "incubator" also has an official meaning. Under the Israel Innovation Authority\'s Venture Incubators program, incubators are chosen in a competitive procedure for a five-year concession, invest in early-stage technology companies and support them from the idea to a commercial product.',
 'A venture capital fund invests money in companies that already have a team and usually some progress, and it does not do the daily work. A venture builder is closer to a co-founder: it contributes work and know-how, and often helps the company prepare for its first outside investors.'],
 list: [
 'Accelerator: a fixed program for an existing team, focused on speed and investor exposure.',
 'Incubator (IIA program): an approved operator that invests in early-stage technology companies over a longer period.',
 'VC fund: invests capital, sits on the board, does not run the product.',
 'Venture builder: works inside the venture on product, business and fundraising preparation.'],
 },
 {
 heading: 'What does a venture builder actually do?',
 paragraphs: [
 'A venture builder helps a founder turn an idea into a company that can be tested, built and funded. The exact menu depends on the builder, but the work usually covers these areas:'],
 list: [
 'Testing the problem and the market before heavy investment.',
 'Defining the business model and the first go-to-market plan.',
 'Product definition, UX and building a first version (MVP).',
 'Technical leadership until the company has its own CTO.',
 'Company setup and the basic legal and equity structure, with the founder\'s own lawyer.',
 'Pitch deck, business plan and preparation for investor meetings.',
 'Help preparing applications to public programs, such as Israel Innovation Authority tracks.'],
 },
 {
 heading: 'When is a venture builder the right choice?',
 paragraphs: [
 'A venture builder fits best when the founder has a strong understanding of a problem but lacks some of the skills or people needed to build the company. Common examples are a domain expert without a technical co-founder, or a founder who wants a structured way to test an idea before quitting a job.',
 'It is a weaker fit if you already have a complete founding team that can build and sell on its own, or if you are not willing to share ownership or decisions. Before you sign, ask the builder what exactly it will contribute, for how long, who will do the work, what happens if the venture changes direction, and how its stake is defined.'],
 },
 {
 heading: 'How do venture builders work with outside investors?',
 paragraphs: [
 'A venture builder usually helps a company get ready for its first outside investors rather than replacing them. Most ventures still need angel, seed or venture capital funding, and sometimes public programs such as Israel Innovation Authority grants, to grow.',
 'Investors will look at the builder\'s stake, its rights and its role in the company during due diligence. A builder that contributes real work, with a stake and terms that are clear and proportionate, is easier for investors to accept than one with vague rights or an unexplained share of the company. That is one more reason to agree on clear terms early.'],
 },
 {
 heading: 'Questions to ask before you sign',
 paragraphs: [
 'The agreement with a venture builder shapes your cap table for years, so read it with your own lawyer. These questions help compare offers:'],
 list: [
 'What will the builder deliver, by whom, and by when?',
 'Is the stake fixed, or tied to milestones and actual work delivered?',
 'Does the builder\'s equity vest, as founders\' equity usually does?',
 'Who owns the IP created during the engagement?',
 'What happens if either side wants to end the relationship?',
 'How will the builder\'s stake look to future investors?'],
 },
 {
 heading: 'How WeCcelerate works as a venture builder',
 paragraphs: [
 'WeCcelerate is a Venture Builder in Israel since 2018, active in Tel Aviv and Jerusalem and recognized by the Israel Innovation Authority. We work with founders on the business model, product, technology and preparation for fundraising. Our MedTech track runs in partnership with Leumit Health Services and gives founders clinical expertise, regulatory guidance, data access and pilot opportunities, subject to the required approvals.'],
 }],
 faqs: [
 {
 q: 'What is a venture builder?',
 a: 'A venture builder, also called a startup studio, is an organization that builds new companies together with founders. It works inside the venture from the early stages, on product, technology, business model and fundraising preparation, and in return usually becomes a shareholder or long-term partner. There is no official definition, so terms differ between builders.',
 },
 {
 q: 'How is a venture builder different from an accelerator?',
 a: 'An accelerator runs a time-limited program for an existing team, with mentoring and investor exposure. A venture builder works on the company itself, often before the team is complete, and stays involved longer. Because it contributes more daily work, a venture builder usually expects a deeper partnership than an accelerator program does.',
 },
 {
 q: 'What is an incubator in Israel?',
 a: 'In Israel, incubators also exist as an official Israel Innovation Authority program. Under the Venture Incubators program, operators are chosen in a competitive procedure for a five-year concession, invest in early-stage technology startups and support them from idea to commercial product. A venture builder is a private model and does not need that approval.',
 },
 {
 q: 'Who should work with a venture builder?',
 a: 'A venture builder suits founders who understand a problem well but lack part of what is needed to build a company, for example a domain expert without a technical co-founder. It suits less a complete founding team that can build and sell alone, or a founder who does not want to share ownership or decisions.',
 },
 {
 q: 'What should I check in a venture builder agreement?',
 a: 'Check what the builder will deliver and by when, whether its stake is tied to work or milestones, whether its equity vests, who owns the IP, and how either side can exit. Also ask how future investors will see the builder\'s stake. Have your own lawyer review the agreement before you sign it.',
 }],
 sources: [
 { title: 'Venture Incubators Funding Program - Incubators Fund', url: 'https://innovationisrael.org.il/en/programs/technological-incubators-2024/', publisher: 'Israel Innovation Authority' }],
 relatedGuideSlugs: ['venture-vs-startup', 'how-to-start-a-startup-israel', 'raise-funding-israel', 'medtech-startup-israel'],
 ctaServicePath: '/services',
 ctaLabel: 'Talk to WeCcelerate about building your venture',
 },

 // ---------------------------------------------------------------------------
 // 2. HOW TO START A MEDTECH STARTUP IN ISRAEL
 // ---------------------------------------------------------------------------
 // Sources (checked 2026-10-22):
 // - FDA "Classify Your Medical Device" (content current as of 08/26/2026): Class I-III by risk, 510(k) / PMA.
 // - FDA De Novo page (09/30/2025): novel devices with no legally marketed predicate, 150 review day goal.
 // - FDA 510(k) Submission Process page (10/03/2022): 90 FDA day MDUFA goal.
 // - FDA MDUFA Fees page (FY 2027, current as of 10/01/2026): 510(k) $28,653/$7,163, De Novo $191,020/$47,755,
 //   PMA $636,732/$159,183, establishment registration $13,785.
 // - FDA Q-Submission guidance (issued May 29, 2025): Pre-Sub written feedback within 70 days.
 // - EU MDR, Regulation (EU) 2017/745 (EUR-Lex): Art. 51(1) classes I-III; recital on notified body involvement
 //   for IIa/IIb/III and Art. 52(7) for sterile/measuring/reusable class I; recital on software as a device.
 // - Israel Medical Equipment Law, 5772-2012 (Sefer HaChukim 2357, 14.5.2012, fs.knesset.gov.il):
 //   s.2(a) only registered equipment may be manufactured and marketed; s.6(b) registration based on
 //   registration/marketing in a recognized country; s.6(a) registration conditions; First Schedule list (incl. USA, Canada, Australia, Germany, France, UK).
 // - MoH Procedure 14 guide (gov.il, updated 18.05.2026) and chapter PDFs: Helsinki Committee + director approval,
 //   special / non-special trials.
 // - 21 CFR 812.28 (eCFR): FDA acceptance of non-US clinical data under GCP.
 // - Israel Innovation Authority, Royalties & IP page: conditional non-dilutive grants, 3%-5% royalties plus
 //   SOFR-based interest, R&D in Israel, know-how transfer needs IIA approval.
 {
 slug: 'medtech-startup-israel',
 hebrewSlug: 'eich-lehakim-startup-refui',
 category: 'medtech',
 targetKeyword: 'how to start a medtech startup in Israel',
 relatedKeywords: [
 'medtech startup Israel',
 'healthtech startup Israel',
 'medical device startup',
 'digital health Israel',
 'Israeli medtech ecosystem'],
 h1: 'A founder\'s guide: how to start a medtech startup in Israel',
 metaTitle: 'How to Start a MedTech Startup in Israel | WeCcelerate',
 metaDescription:
 'Starting a MedTech startup in Israel: device classification, FDA 510(k), De Novo and PMA with 2027 fees, Israeli registration, Helsinki approval and IIA grants.',
 speakableAnswer:
 'To start a MedTech startup in Israel, define the intended use and device class first, then choose the regulatory path: FDA 510(k), De Novo or PMA in the US, CE marking under the EU MDR, and registration with the Israeli Ministry of Health. Clinical studies in Israel need Helsinki Committee approval, and Israel Innovation Authority grants can fund early R&D.',
 lastUpdated: '2026-10-22',
 readingTimeMinutes: 9,
 sections: [
 {
 heading: 'Start with the intended use, not the technology',
 paragraphs: [
 'In medical devices, the intended use decides almost everything that follows: the device class, the regulatory pathway, the tests, whether you need clinical data, and how much money you need to raise before the first sale. Two products built on the same technology can land in very different classes because of what they claim to do.',
 'So before you build, write one clear sentence on what the device does, for which patients and in which setting. Then check how regulators classify devices with that use. Software counts too. The EU MDR, for example, states that software intended by the manufacturer for a medical purpose qualifies as a medical device in its own right, while general-purpose or wellness software does not.'],
 },
 {
 heading: 'Device classes in the US and the EU',
 paragraphs: [
 'FDA classifies devices into three classes by risk. Class I has the lowest risk and Class III the highest. Non-exempt Class I and Class II devices usually need a 510(k). Class III devices generally need a PMA (premarket approval). A novel device with no legally marketed predicate can use a De Novo request.',
 'In the EU, the Medical Device Regulation (EU) 2017/745 divides devices into classes I, IIa, IIb and III, based on intended purpose and risk. Class IIa, IIb and III devices need a notified body in the conformity assessment. Most Class I devices are self-declared by the manufacturer, but sterile, measuring and reusable surgical Class I devices also involve a notified body for those aspects. The US and EU classes do not map one to one, so check both.'],
 },
 {
 heading: 'Choosing the US pathway: 510(k), De Novo or PMA',
 paragraphs: [
 'A 510(k) shows that your device is substantially equivalent to a device already legally marketed in the US. FDA\'s goal is a decision within 90 FDA days, not counting the time FDA waits for your answers. A De Novo request is for novel devices with no predicate, and FDA\'s goal is a decision within 150 review days. A PMA is the most demanding pathway, for most Class III devices.',
 'FDA fees for fiscal year 2027 (October 1, 2026 to September 30, 2027) show how different the pathways are:'],
 list: [
 '510(k): $28,653, or $7,163 for a qualified small business.',
 'De Novo: $191,020, or $47,755 for a qualified small business.',
 'PMA: $636,732, or $159,183 for a qualified small business.',
 'Annual establishment registration: $13,785.'],
 figure: {
 src: '/images/guides/fda/fda-mdufa-fees-fy2027.webp',
 alt: 'FDA table of medical device user fees for FY 2027, with standard and small business fees for 510(k), 513(g), PMA, De Novo and supplements, and the annual establishment registration fee of $13,785',
 width: 1200,
 height: 1792,
 caption: 'FDA medical device user fees for fiscal year 2027 (October 1, 2026 to September 30, 2027)',
 credit: 'FDA.gov, screenshot taken 2026-10-22',
 sourceUrl: 'https://www.fda.gov/industry/fda-user-fee-programs/medical-device-user-fee-amendments-mdufa-fees',
 },
 },
 {
 heading: 'Ask FDA early',
 paragraphs: [
 'If you are unsure about the pathway, the predicate or the need for clinical data, FDA\'s Q-Submission program lets you send a Pre-Submission with specific questions. Under the current guidance, FDA sends written feedback within 70 days. It is voluntary and works best before you run expensive tests. Our 510(k) guide, /en/guides/fda-510k-israeli-startups, covers the steps in detail.'],
 },
 {
 heading: 'Selling in Israel: registration with the Ministry of Health',
 paragraphs: [
 'Under the Medical Equipment Law, 2012, medical equipment may be manufactured and marketed in Israel only if it is registered in the Ministry of Health medical equipment register, or listed in the law\'s second schedule. Registration requires the Ministry to be satisfied that the benefit outweighs the risk, that the device is effective and of suitable quality, and that it is made under proper manufacturing conditions.',
 'The law has a route for devices that are already registered or allowed for marketing in a "recognized country" and marketed there. The law\'s first schedule lists those countries, and the list includes the United States, Canada, Australia and European countries such as Germany, France and the UK. For many startups this means the Israeli registration can follow a US approval rather than come first.'],
 },
 {
 heading: 'Clinical studies in Israel',
 paragraphs: [
 'Any medical study in humans in Israel, including a pilot of your device or a study on existing medical records, needs approval from the institutional Helsinki Committee and the written approval of the institution director, under the Public Health Regulations of 1980 and Ministry of Health Procedure 14. Some device trials are classified as "non-special" and need Ministry of Health approval too. See /en/guides/helsinki-committee-israel.',
 'Data from a well-run Israeli study can support a US submission. Under 21 CFR 812.28, FDA accepts clinical data from outside the US for a 510(k), De Novo, PMA or IDE if the study follows good clinical practice, including approval by an independent ethics committee before it starts.'],
 },
 {
 heading: 'Funding the early stages',
 paragraphs: [
 'MedTech usually needs more capital and more time before revenue than software. Plan the raise around regulatory milestones, such as a Pre-Submission answer, a completed pilot or a submission, rather than around calendar dates.',
 'The Israel Innovation Authority invests through non-dilutive conditional grants, from ideation through pre-seed, seed and A rounds. A grant is repaid only once the company has revenue from the funded project, through royalties of 3% to 5% of annual revenues plus annual interest based on SOFR, until the grant is repaid. The funded R&D must be done in Israel, and selling or transferring the funded know-how abroad needs IIA approval and a repayment. Check the current program terms on the IIA site before you apply.'],
 },
 {
 heading: 'Common mistakes',
 paragraphs: [
 'Early decisions that often cost founders time:'],
 list: [
 'Building the product before deciding on the intended use and class.',
 'Assuming the US and EU paths are the same, or that the Israeli registration comes first.',
 'Starting a pilot or a data study before Helsinki approval.',
 'Running a clinical study in Israel that does not meet the GCP conditions FDA expects.',
 'Planning the raise on optimistic review times instead of regulatory milestones.'],
 },
 {
 heading: 'How WeCcelerate works with MedTech founders',
 paragraphs: [
 'WeCcelerate is a Venture Builder in Israel since 2018, active in Tel Aviv and Jerusalem and recognized by the Israel Innovation Authority. Our MedTech track runs in partnership with Leumit Health Services and gives founders clinical expertise, regulatory guidance, data access and pilot opportunities, all subject to the required approvals. We work with founders on the intended use, the regulatory plan and the fundraising plan as one roadmap.'],
 }],
 howToSteps: [
 { name: 'Validate the clinical need', text: 'Talk with clinicians in your target specialty to understand the workflow, the problem and whether your solution fits into routine care.' },
 { name: 'Write the intended use and classify the device', text: 'Define what the device does, for whom and where, then find its FDA class and its EU MDR class.' },
 { name: 'Choose the regulatory pathway', text: 'Decide between 510(k), De Novo and PMA for the US, CE marking under the MDR for the EU, and plan the Israeli registration.' },
 { name: 'Incorporate and build the team', text: 'Bring clinical expertise into the team or advisory board from the start.' },
 { name: 'Apply for non-dilutive funding', text: 'Check Israel Innovation Authority programs that fit your stage. The funded R&D must be done in Israel.' },
 { name: 'Get Helsinki approval for your study', text: 'Submit the protocol to the institutional Helsinki Committee, and to the Ministry of Health if the trial is non-special. Do not enroll before the director signs.' },
 { name: 'Prepare and file the submission', text: 'Use a Pre-Submission for open questions, then file with FDA or a notified body.' },
 { name: 'Talk to the WeCcelerate MedTech track', text: 'Book an introductory call about the MedTech track.', url: 'https://weccelerate.co.il/contact' }],
 faqs: [
 {
 q: 'What is the first step in starting a MedTech startup in Israel?',
 a: 'Define the intended use and find the device class in the US and the EU. The class decides the regulatory pathway, the testing, the clinical data you need and how much you need to raise.',
 },
 {
 q: 'What do FDA submissions cost in 2027?',
 a: 'For FDA fiscal year 2027, the 510(k) fee is $28,653 ($7,163 for a qualified small business), De Novo is $191,020 ($47,755), and PMA is $636,732 ($159,183). The annual establishment registration fee is $13,785.',
 },
 {
 q: 'Can an FDA clearance help me register a device in Israel?',
 a: 'Yes. Under the Medical Equipment Law, 2012, a device registered or allowed for marketing in a recognized country, such as the United States, and marketed there can be registered in Israel on that basis.',
 },
 {
 q: 'Do I need Helsinki Committee approval for a pilot?',
 a: 'Yes. Any medical study in humans in Israel, including a device pilot or a study on existing medical records, needs approval from the institutional Helsinki Committee and the institution director before it starts.',
 },
 {
 q: 'How do Israel Innovation Authority grants work?',
 a: 'They are non-dilutive conditional grants. The company repays them only once the funded project generates revenue, through royalties of 3% to 5% of annual revenues plus SOFR-based interest. The funded R&D must be done in Israel.',
 },
 {
 q: 'Will FDA accept data from a clinical study in Israel?',
 a: 'It can. Under 21 CFR 812.28, FDA accepts non-US clinical data if the study is well designed, well conducted and follows good clinical practice, including approval by an independent ethics committee.',
 }],
 sources: [
 { title: 'Classify Your Medical Device', url: 'https://www.fda.gov/medical-devices/overview-device-regulation/classify-your-medical-device', publisher: 'FDA' },
 { title: 'Medical Device User Fee Amendments (MDUFA): Fees', url: 'https://www.fda.gov/industry/fda-user-fee-programs/medical-device-user-fee-amendments-mdufa-fees', publisher: 'FDA' },
 { title: 'De Novo Classification Request', url: 'https://www.fda.gov/medical-devices/premarket-submissions-selecting-and-preparing-correct-submission/de-novo-classification-request', publisher: 'FDA' },
 { title: 'Regulation (EU) 2017/745 on medical devices', url: 'https://eur-lex.europa.eu/eli/reg/2017/745/oj/eng', publisher: 'EUR-Lex' },
 { title: 'חוק ציוד רפואי, התשע"ב-2012', url: 'https://fs.knesset.gov.il/18/law/18_lsr_300799.pdf', publisher: 'Knesset' },
 { title: 'נוהל ניסויים רפואיים בבני אדם', url: 'https://www.gov.il/he/Departments/Guides/protocol-of-medical-research-involving-human-subjects', publisher: 'Israel Ministry of Health' },
 { title: 'Royalties & Intellectual Property', url: 'https://innovationisrael.org.il/en/royalties-intellectual-property/', publisher: 'Israel Innovation Authority' },
 { title: '21 CFR 812.28 -- Acceptance of data from clinical investigations conducted outside the United States', url: 'https://www.ecfr.gov/current/title-21/section-812.28', publisher: 'eCFR' },
 ],
 relatedGuideSlugs: ['helsinki-committee-israel', 'fda-510k-israeli-startups', 'raise-funding-israel', 'what-is-venture-builder'],
 ctaServicePath: '/services/medtech-leumit',
 ctaLabel: 'Learn about the WeCcelerate MedTech track',
 },

 // ---------------------------------------------------------------------------
 // 3. HELSINKI COMMITTEE (IRB) ISRAEL
 // ---------------------------------------------------------------------------
 // Sources (checked 2026-10-22):
 // - MoH guide "נוהל ניסויים רפואיים בבני אדם" (Procedure 14, published 29.11.2021, updated 18.05.2026):
 //   https://www.gov.il/he/Departments/Guides/protocol-of-medical-research-involving-human-subjects
 //   Chapter 1 PDF (14-1/02, in force 01/05/2020): committee composition (7+ members), quorum 5, subcommittee
 //   for existing-data studies (3 members), "special" vs "non-special" criteria for device trials (4.6.2),
 //   annual follow-up, consent waiver for de-identified data, no payment by participants, ICH-GCP + ISO 14155.
 //   Chapter 2 PDF: consent form max 15 pages, font 12+, plain language, Hebrew source + translations.
 //   Chapter 3 PDF (14-3/02): chair classifies within 2 working days, MoH decision 60/45/30 working days,
 //   one round of corrections within 6 months, MyTrial registration before Form 7, insurance min $3,000,000,
 //   device protocol per ISO 14155 Annex A, Form 1b, Form 6/7/8.
 // - MoH Supreme Helsinki Committee page (updated 07.08.2022): genetic / IVF research, meets monthly, ~4 weeks.
 // - MoH Clinical Trials Department landing page: MyTrial, AI-based interventional trial principles.
 // - WMA Declaration of Helsinki page: adopted June 1964, latest amendment October 2024.
 // - 21 CFR 812.28 (eCFR): FDA acceptance of non-US clinical data under GCP incl. IEC review.
 {
 slug: 'helsinki-committee-israel',
 hebrewSlug: 'vaadat-helsinki-madrich',
 category: 'regulatory',
 targetKeyword: 'Helsinki Committee Israel',
 relatedKeywords: [
 'IRB Israel',
 'Helsinki Committee clinical trial',
 'Israeli ethics committee',
 'clinical trial approval Israel',
 'Procedure 14 Ministry of Health',
 'medical device clinical trial Israel'],
 h1: 'Helsinki Committee Israel: how clinical study approval works for MedTech founders',
 metaTitle: 'Helsinki Committee Israel: Approval Guide | WeCcelerate',
 metaDescription:
 'How Helsinki Committee approval works in Israel under MoH Procedure 14: who reviews your study, special vs non-special trials, required documents and timelines.',
 speakableAnswer:
 'The Helsinki Committee is the ethics committee of an Israeli medical institution. Under the Public Health Regulations of 1980 and Ministry of Health Procedure 14, a medical study in humans needs the committee\'s approval and the institution director\'s written approval before any participant is enrolled. Some device trials also need Ministry of Health approval.',
 lastUpdated: '2026-10-22',
 readingTimeMinutes: 9,
 sections: [
 {
 heading: 'What the Helsinki Committee is',
 paragraphs: [
 'Israeli medical institutions that run research in humans have an institutional Helsinki Committee, the local equivalent of an IRB or independent ethics committee. It works under the Public Health Regulations (Medical Experiments in Human Subjects), 1980, and the Ministry of Health\'s Procedure 14 on clinical trials in humans. The name comes from the World Medical Association\'s Declaration of Helsinki, adopted in June 1964 and last amended in October 2024.',
 'Under the regulations, the Director General\'s authority to approve medical experiments in humans is delegated to the directors of medical institutions. The director approves a study only after the institutional committee approves it. When a study also needs Ministry of Health approval, the director signs only after that approval arrives too. Procedure 14 builds on ICH-GCP and, for devices, on ISO 14155.'],
 },
 {
 heading: 'Who sits on the committee',
 paragraphs: [
 'Procedure 14 requires at least seven members: a public representative who is a cleric or a lawyer and not an employee of the institution, three senior physicians (one of them the chair, and at least one an internal medicine specialist), a physician representing management, a senior pharmacist, and an expert with a PhD in a health profession or an expert in ethics or product safety, such as biomedical engineering or biostatistics.',
 'A decision on a new study needs a quorum of at least five members. For studies that use only existing data or questionnaires, the institution director can let a subcommittee of at least three members review them. The Ministry of Health approves the committee\'s appointment, and the appointment is valid for 24 months.'],
 },
 {
 heading: 'Which studies need approval',
 paragraphs: [
 'Procedure 14 applies to all types of medical research in humans covered by the 1980 regulations. For a MedTech startup this usually means one of three situations:'],
 list: [
 'A clinical trial or pilot of your device or software on patients.',
 'A study that collects new data from people, for example a prospective study with questionnaires or measurements.',
 'A retrospective study on existing medical records, for example to train or validate an algorithm. This still needs approval, but the institution may route it to the subcommittee. The committee can waive informed consent for research on de-identified data, provided the de-identification is done only by authorized staff inside the health organization.'],
 },
 {
 heading: '"Special" and "non-special" trials: when the Ministry of Health is involved',
 paragraphs: [
 'Within two working days of receiving a complete application, the committee chair classifies the study as "special" or "non-special". A special trial needs only the institutional committee and the director. A non-special trial is sent to the Ministry of Health in parallel to the committee review.',
 'For devices, Procedure 14 lists the cases that can be classified as special. Examples: a trial with a recognized device used for its accepted indication, where treatment and follow-up are no different from usual care; an efficacy trial, after earlier safety trials in a recognized country or in Israel were completed successfully and reported in the protocol; and collecting data that is not part of routine care with a recognized, non-invasive device such as ECG, EEG or ultrasound. A trial that fits none of these cases, such as a first safety study of a new device, is non-special and goes to the Ministry\'s unit for clinical trials in medical devices and advanced therapies. The application form for a device trial is Form 1b.',
 'For non-special trials, the Ministry\'s decision is due within 60 working days of a complete application if a ministry committee discusses it, 45 working days if it goes to expert opinion, and 30 working days if it is handled by professional review in the department. Time spent waiting for your corrections does not count. You can submit corrections once, within six months of the decision letter. Ministry approval is issued on Form 8. Genetic studies and some other categories go to the Supreme Helsinki Committee, which meets monthly and decides about four weeks after receiving the file from the institutional committee.'],
 figure: {
 src: '/images/guides/en/moh-procedure-14-new-application.webp',
 alt: 'Ministry of Health page for Procedure 14, chapter 3 (new application), in Hebrew, listing the three ministry units and the application forms, including Form 1b for a medical device trial',
 width: 1200,
 height: 1212,
 caption: 'Procedure 14, chapter 3 on the Ministry of Health site: the three units that handle non-special trials and the application forms (Hebrew)',
 credit: 'gov.il, Ministry of Health, screenshot taken 2026-10-22',
 sourceUrl: 'https://www.gov.il/he/pages/protocol-of-medical-research-involving-human-subjects?chapterIndex=4',
 },
 },
 {
 heading: 'What to prepare',
 paragraphs: [
 'The committee reviews, among other things, the protocol, the investigator\'s brochure, safety information, the letter to the participant\'s treating physician (Form 11), any payment offered to participants, and the investigators\' CVs and training. For a device trial:'],
 list: [
 'Protocol written according to ISO 14155 Annex A, and an investigator\'s brochure according to Annex B.',
 'Informed consent form in plain language without medical jargon, no longer than 15 pages, in a font no smaller than 12. The approved Hebrew version is the source for translations, and each participant gets the form in a language they read.',
 'Investigators with GCP training. Medical decisions in the trial are the responsibility of a licensed physician.',
 'Sponsor commitment (Form 4) and the declaration on submission documents (Form 9).',
 'Insurance: a commercial sponsor must insure against participant and third-party claims under Israeli law, with a limit of at least $3,000,000, and give the institution an insurance certificate.'],
 },
 {
 heading: 'After approval',
 paragraphs: [
 'Once the committee approves (Form 6), the sponsor registers the trial on the Ministry\'s MyTrial site where required, and only then can the director sign the approval to run it (Form 7). You may not enroll anyone before the director\'s written approval.',
 'During the trial, changes to documents go to the committee on Form 12, and the committee follows the trial at least once a year. Participants must not pay to take part, and the sponsor supplies the investigational product free of charge for the whole trial.'],
 },
 {
 heading: 'Using the data for FDA',
 paragraphs: [
 'Under 21 CFR 812.28, FDA accepts data from clinical investigations outside the US to support a 510(k), De Novo, PMA or IDE if the study is well designed, well conducted and follows good clinical practice, including review and approval by an independent ethics committee before the study starts. A Helsinki Committee approval is that review in Israel. See /en/guides/fda-510k-israeli-startups for the 510(k) side.',
 'If your product uses AI, note that the Ministry\'s clinical trials department has published principles for evaluating AI-based interventional clinical trials.'],
 },
 {
 heading: 'Common mistakes',
 paragraphs: [
 'Preparation gaps that cost founders time:'],
 list: [
 'Assuming a retrospective data study does not need approval.',
 'A consent form that reads like a protocol, too long or full of medical terms.',
 'Not checking early whether the trial will be special or non-special, and planning a timeline that ignores the Ministry review.',
 'Missing sponsor insurance or an unsigned contract with the institution.',
 'Starting to recruit after committee approval but before the director\'s signature.'],
 },
 {
 heading: 'How WeCcelerate works with founders on clinical studies',
 paragraphs: [
 'WeCcelerate is a Venture Builder in Israel since 2018, active in Tel Aviv and Jerusalem and recognized by the Israel Innovation Authority. Our MedTech track runs in partnership with Leumit Health Services and gives founders clinical expertise, regulatory guidance, data access and pilot opportunities, all subject to the required Helsinki approvals. We help founders plan the study, prepare the submission and connect it to the regulatory and fundraising plan.'],
 }],
 howToSteps: [
 { name: 'Choose the institution and principal investigator', text: 'Each institution has its own committee. Start with the site where your principal investigator works and where the study will run.' },
 { name: 'Check the classification early', text: 'Use Procedure 14 to estimate whether the study will be special or non-special, so you know if the Ministry of Health will review it too.' },
 { name: 'Prepare the documents', text: 'Protocol and investigator\'s brochure (ISO 14155 for devices), consent form, the Procedure 14 forms, investigator CVs and GCP training, and sponsor insurance.' },
 { name: 'Submit to the institutional committee', text: 'Submit through the institution\'s committee office. Non-special trials go to the Ministry of Health in parallel.' },
 { name: 'Answer requests and register the trial', text: 'Respond to committee and Ministry comments, then register on MyTrial where required after the committee approval.' },
 { name: 'Start only after the director signs', text: 'Begin enrollment only after the institution director\'s written approval, and keep reporting changes and progress to the committee.' }],
 faqs: [
 {
 q: 'What is the Helsinki Committee in Israel?',
 a: 'It is the ethics committee of an Israeli medical institution, the local equivalent of an IRB. It reviews medical research in humans under the Public Health Regulations of 1980 and Ministry of Health Procedure 14.',
 },
 {
 q: 'How long does Helsinki Committee approval take?',
 a: 'There is no single national timeline for the institutional committee. The chair classifies the study within two working days of a complete application. For non-special trials, the Ministry of Health aims to decide within 30 to 60 working days of a complete application, depending on the review track.',
 },
 {
 q: 'Do I need approval for a retrospective data study?',
 a: 'Yes. Studies on existing data are covered by Procedure 14. The institution can route them to a subcommittee, and the committee can waive consent for de-identified data if authorized staff inside the health organization do the de-identification.',
 },
 {
 q: 'When does the Ministry of Health need to approve a device trial?',
 a: 'When the trial is classified as non-special, for example a first safety study of a new device that is not yet recognized. The Ministry\'s unit for medical devices and advanced therapies reviews it and issues approval on Form 8.',
 },
 {
 q: 'Can I start recruiting once the committee approves?',
 a: 'No. You can enroll participants only after the institution director signs the approval to run the study (Form 7). Where MyTrial registration is required, it must be done before the director signs.',
 },
 {
 q: 'Will FDA accept data from a study approved by a Helsinki Committee?',
 a: 'It can. Under 21 CFR 812.28, FDA accepts non-US clinical data if the study is well designed and follows good clinical practice, including approval by an independent ethics committee before it starts.',
 }],
 sources: [
 { title: 'נוהל ניסויים רפואיים בבני אדם', url: 'https://www.gov.il/he/Departments/Guides/protocol-of-medical-research-involving-human-subjects', publisher: 'Israel Ministry of Health' },
 { title: 'נוהל 14 פרק 1: פעילות ועדת הלסינקי', url: 'https://www.gov.il/BlobFolder/guide/protocol-of-medical-research-involving-human-subjects/he/clinical_trials_cth_c1.pdf', publisher: 'Israel Ministry of Health' },
 { title: 'נוהל 14 פרק 2: הסכמה מדעת', url: 'https://www.gov.il/BlobFolder/guide/protocol-of-medical-research-involving-human-subjects/he/clinical_trials_cth_14_chap2.pdf', publisher: 'Israel Ministry of Health' },
 { title: 'נוהל 14 פרק 3: הגשת בקשה חדשה', url: 'https://www.gov.il/BlobFolder/guide/protocol-of-medical-research-involving-human-subjects/he/clinical_trials_cth_c3.pdf', publisher: 'Israel Ministry of Health' },
 { title: 'ועדת הלסינקי העליונה לניסויים רפואיים בבני-אדם (מחקר גנטי)', url: 'https://www.gov.il/he/departments/publicbodies/committee-helsinky-clinical-trials-human-subjects', publisher: 'Israel Ministry of Health' },
 { title: 'אגף רוקחות – מחלקה לניסויים קליניים', url: 'https://www.gov.il/he/departments/units/clinical-trials/govil-landing-page', publisher: 'Israel Ministry of Health' },
 { title: 'WMA Declaration of Helsinki', url: 'https://www.wma.net/policies-post/wma-declaration-of-helsinki/', publisher: 'World Medical Association' },
 { title: '21 CFR 812.28 -- Acceptance of data from clinical investigations conducted outside the United States', url: 'https://www.ecfr.gov/current/title-21/section-812.28', publisher: 'eCFR' },
 ],
 relatedGuideSlugs: ['medtech-startup-israel', 'fda-510k-israeli-startups'],
 ctaServicePath: '/services/medtech-leumit',
 ctaLabel: 'Plan your clinical study with the WeCcelerate MedTech track',
 },

 // ---------------------------------------------------------------------------
 // 4. FDA 510(k) FOR ISRAELI STARTUPS
 // ---------------------------------------------------------------------------
 // Sources (checked 2026-10-22):
 // - FDA Premarket Notification 510(k) page (content current as of 08/22/2024): definition, SE,
 //   who submits (foreign manufacturers/exporters), exemptions, no marketing before SE order, eSTAR since 10/01/2023.
 // - FDA 510(k) Submission Process page (current as of 10/03/2022): 15-day acceptance, 60-day substantive
 //   interaction, 180-day AI hold with no extensions, 90 FDA day MDUFA goal, Day 100 missed MDUFA communication.
 // - FDA MDUFA Fees page (FY 2027, current as of 10/01/2026): 510(k) $28,653 / $7,163; establishment registration $13,785.
 // - FDA SBD program page (09/21/2026): $100M gross receipts incl. affiliates, Form FDA 3602N, National Taxing
 //   Authority certification for foreign firms, new request each fiscal year.
 // - FDA Q-Submission guidance (issued May 29, 2025): Pre-Sub written feedback within 70 days.
 // - 21 CFR 812.28 (eCFR): acceptance of clinical data from outside the US, GCP incl. IEC review.
 // - FDA De Novo page (09/30/2025): pathway for novel devices with no legally marketed predicate.
 // Re-check fees every October 1.
 {
 slug: 'fda-510k-israeli-startups',
 hebrewSlug: 'fda-510k-madrich',
 category: 'regulatory',
 targetKeyword: 'FDA 510(k) Israeli startup',
 relatedKeywords: [
 'FDA 510(k) process',
 'FDA clearance medical device',
 'predicate device FDA',
 'Israeli MedTech FDA',
 '510(k) vs De Novo',
 'eSTAR 510(k)',
 'FDA small business fee'],
 h1: 'FDA 510(k) Israeli startup guide: how to get a medical device cleared in the US',
 metaTitle: 'FDA 510(k) for Israeli Startups: 2027 Guide | WeCcelerate',
 metaDescription:
 'How an Israeli MedTech startup gets FDA 510(k) clearance: finding a predicate, eSTAR, the 90 FDA day review goal, FY2027 fees and the small business discount.',
 speakableAnswer:
 'FDA 510(k) is a premarket submission showing that a medical device is as safe and effective as a device already legally marketed in the US. An Israeli startup may not market the device in the US before FDA issues its clearance. The FY2027 fee is $28,653, or $7,163 for a qualified small business.',
 lastUpdated: '2026-10-22',
 readingTimeMinutes: 9,
 sections: [
 {
 heading: 'What a 510(k) is and what you have to prove',
 paragraphs: [
 'A 510(k), also called a Premarket Notification, is a submission to the FDA showing that your device is as safe and effective as a device that is already legally marketed in the US. The legal standard is substantial equivalence (SE), and the device you compare against is called the predicate.',
 'Substantial equivalence covers both safety and effectiveness. FDA first checks that the intended use is the same, then checks whether any technological differences raise new questions of safety or effectiveness. The two devices do not have to be identical.',
 'You may not market the device in the US until FDA issues an order declaring it substantially equivalent. If FDA finds the device not substantially equivalent (NSE), or if no suitable predicate exists, the usual alternative is a De Novo request, the FDA pathway for novel devices with no legally marketed predicate.'],
 },
 {
 heading: 'Does an Israeli company need to file one?',
 paragraphs: [
 'FDA lists foreign manufacturers and exporters, or their US representatives, among the parties that must submit a 510(k) before introducing a device to the US market. An Israeli startup selling into the US is usually in this group.',
 'Not every device needs a 510(k):'],
 list: [
 'Many Class I devices and some Class II devices are exempt, within the limits written in their classification regulation. A device that goes beyond those limits still needs a 510(k).',
 'Class III devices generally need a PMA (premarket approval), not a 510(k).',
 'A device still in development is not marketed yet. A clinical study in the US is regulated separately, under the IDE (Investigational Device Exemption) rules.'],
 },
 {
 heading: 'Step 1: find your product code in the FDA classification database',
 paragraphs: [
 'Before writing anything, look up how similar devices are classified in the FDA Product Classification database. Each device type has a three-letter product code, a regulation number, a device class and the submission type FDA expects.',
 'The screenshot below shows the record for an oximeter: product code DQA, regulation 21 CFR 870.2700, Class 2, submission type 510(k). The record also links to the recognized standards and the FDA guidance for that device type. That is what tells you which tests you will need to show.'],
 figure: {
 src: '/images/guides/fda/fda-product-classification-dqa.webp',
 alt: 'FDA Product Classification database record for an oximeter: product code DQA, regulation number 870.2700, device class 2, submission type 510(k)',
 width: 1200,
 height: 1024,
 caption: 'The classification record for oximeters (product code DQA) in the FDA Product Classification database',
 credit: 'FDA.gov, screenshot taken 2026-10-22',
 sourceUrl: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPCD/classification.cfm?id=DQA',
 },
 },
 {
 heading: 'Step 2: choose a predicate in the 510(k) database',
 paragraphs: [
 'Search the FDA 510(k) database by the product code you found, by device name or by company. Each cleared device has a K number, a decision letter and usually a 510(k) Summary.',
 'Read the predicate\'s summary carefully. It shows what the company claimed, which tests it presented and the exact Indications for Use that were cleared. If your intended use is different, or a technological difference raises a new safety or effectiveness question, the risk of an NSE decision goes up.'],
 figure: {
 src: '/images/guides/fda/fda-510k-database-search.webp',
 alt: 'Search form of the FDA 510(k) Premarket Notification database with fields for 510K Number, Applicant Name, Device Name and Product Code',
 width: 1200,
 height: 562,
 caption: 'The FDA 510(k) database search form. Searching by product code lists the cleared devices in the same category',
 credit: 'FDA.gov, screenshot taken 2026-10-22',
 sourceUrl: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPMN/pmn.cfm',
 },
 },
 {
 heading: 'Step 3: ask FDA your open questions in a Pre-Submission',
 paragraphs: [
 'If you are unsure about the predicate, the test plan or whether you need clinical data, you can send FDA a Pre-Submission (Pre-Sub) under the Q-Submission program. It is a formal written request for feedback on specific questions. Under the current FDA guidance, written feedback is due within 70 days, and you can ask for a meeting after it.',
 'A Pre-Sub is voluntary and it is not a pre-review of your submission. FDA recommends asking before you run the planned tests, because that is when the feedback is most useful.'],
 },
 {
 heading: 'Step 4: submit in eSTAR and follow the review clock',
 paragraphs: [
 'Since October 1, 2023, all 510(k) submissions, unless exempted, must be sent as electronic submissions using eSTAR, FDA\'s structured submission template. The review then runs like this:'],
 list: [
 'Acceptance review: within 15 days of receipt, FDA notifies you whether the submission was accepted for review.',
 'Substantive review: FDA\'s first substantive communication should come within 60 calendar days of receipt. It can be interactive review (questions by email or phone) or an Additional Information (AI) request.',
 'AI hold: after an AI request you have 180 calendar days to send a complete response. FDA grants no extensions beyond 180 days.',
 'Decision: the MDUFA goal is a decision within 90 FDA days. FDA days count from receipt and exclude the days the submission was on hold for your AI response. If there is no decision by day 100, FDA sends a Missed MDUFA Communication.'],
 },
 {
 heading: 'How long it really takes',
 paragraphs: [
 'The 90 days are an FDA review goal only. The clock stops whenever FDA waits for your answers, so the calendar time from submission to decision depends heavily on the quality of the file and how fast you respond.',
 'The longer part is usually the work before submission: design controls, performance testing, biocompatibility, electrical safety and EMC where relevant, software and cybersecurity documentation, and risk management. How long that takes depends on the device and on what you already have.'],
 },
 {
 heading: 'Can you use clinical data from an Israeli study?',
 paragraphs: [
 'Yes, if the study meets FDA\'s conditions. Under 21 CFR 812.28, FDA accepts data from a clinical investigation conducted outside the US to support a 510(k), De Novo, PMA or IDE if the study is well designed, well conducted and run under good clinical practice (GCP). GCP includes review and approval by an independent ethics committee before the study starts and documented informed consent.',
 'In Israel that ethics review is done by the institutional Helsinki Committee. See /en/guides/helsinki-committee-israel for how that approval works.'],
 },
 {
 heading: 'What it costs: FDA fees for fiscal year 2027',
 paragraphs: [
 'FDA fees change every fiscal year, which starts on October 1. For submissions from October 1, 2026 to September 30, 2027:'],
 list: [
 '510(k) user fee: $28,653, or $7,163 for a business with an FDA small business determination (SBD).',
 'Annual establishment registration fee: $13,785. There is no small business rate. FDA may waive it, except for the initial registration, for certain qualified small businesses that show financial hardship.',
 'All 510(k) types (Traditional, Abbreviated and Special) pay the fee. There is no FDA user fee for a 510(k) submitted on behalf of an FDA-accredited third-party reviewer.'],
 },
 {
 heading: 'How to get the small business fee',
 paragraphs: [
 'The reduced fee is not automatic. You file a Small Business Request on Form FDA 3602N and get FDA\'s decision before you pay. To qualify, gross receipts or sales of the company together with all its affiliates must be no more than $100 million for the most recent tax year.',
 'An Israeli company can qualify. As a foreign firm it must include a certification from its National Taxing Authority (in Israel, the Israel Tax Authority) for itself and any foreign affiliates. The determination is valid for one fiscal year, so you apply again each year.'],
 figure: {
 src: '/images/guides/fda/fda-small-business-thresholds.webp',
 alt: 'FDA SBD program revenue thresholds: $100 million for reduced fees, $30 million for a waived first PMA fee, $1 million for a registration fee waiver',
 width: 1200,
 height: 502,
 caption: 'Revenue thresholds in FDA\'s Small Business Determination program. For the 510(k) fee, the $100 million threshold applies',
 credit: 'FDA.gov, screenshot taken 2026-10-22',
 sourceUrl: 'https://www.fda.gov/medical-devices/premarket-submissions-selecting-and-preparing-correct-submission/reduced-or-waived-medical-device-user-fees-small-business-determination-sbd-program',
 },
 },
 {
 heading: 'Common mistakes',
 paragraphs: [
 'Many avoidable delays come from a few early decisions:'],
 list: [
 'Picking a predicate that looks close but has a different intended use.',
 'Writing the Indications for Use too broadly, which pulls in tests and questions you did not plan for.',
 'Running a clinical study in Israel without checking first that it meets the GCP conditions FDA expects.',
 'Paying the full fee because the small business request was not filed in time for that fiscal year.',
 'Treating the 90-day goal as the full timeline and planning the fundraising around it.'],
 },
 {
 heading: 'How WeCcelerate works with founders on a 510(k) plan',
 paragraphs: [
 'WeCcelerate is a Venture Builder in Israel since 2018, active in Tel Aviv and Jerusalem and recognized by the Israel Innovation Authority. Our MedTech track runs in partnership with Leumit Health Services and gives founders clinical expertise, regulatory guidance, data access and pilot opportunities. We work with founders on the intended use, mapping similar devices in the FDA databases and building the regulatory plan, and connect it to the fundraising plan and clinical pilots.'],
 }],
 howToSteps: [
 { name: 'Find your product code and class', text: 'Search the FDA Product Classification database for similar devices and note the product code, class, regulation number and required submission type.' },
 { name: 'Choose a predicate', text: 'Search the 510(k) database by product code and read the 510(k) Summary of each candidate to confirm the intended use matches yours.' },
 { name: 'Resolve open questions in a Pre-Submission', text: 'If the predicate, test plan or need for clinical data is unclear, ask FDA for written feedback before you run the tests.' },
 { name: 'Request small business status', text: 'If receipts, including affiliates, are no more than $100 million, file Form FDA 3602N with an Israel Tax Authority certification before paying the fee.' },
 { name: 'Submit in eSTAR and pay the fee', text: 'Prepare the submission in the eSTAR template, pay the user fee and send it to FDA.' },
 { name: 'Answer FDA requests on time', text: 'Respond to an Additional Information request within 180 calendar days at most. A fast, complete answer shortens the whole process.' }],
 faqs: [
 {
 q: 'How long does FDA 510(k) clearance take?',
 a: 'FDA\'s goal is a decision within 90 FDA days of receipt. FDA days exclude the time the submission waits for your answer to an Additional Information request, so calendar time is longer. Preparing the submission is usually the longest part.',
 },
 {
 q: 'How much is the 510(k) fee in 2027?',
 a: 'For FDA fiscal year 2027 (October 1, 2026 to September 30, 2027) the fee is $28,653, or $7,163 for a qualified small business. There is also an annual establishment registration fee of $13,785, with no small business rate.',
 },
 {
 q: 'Can an Israeli company get the small business fee?',
 a: 'Yes, if its gross receipts and those of all affiliates were no more than $100 million in the most recent tax year. File Form FDA 3602N with a certification from the Israel Tax Authority, and apply again each fiscal year.',
 },
 {
 q: 'Is eSTAR mandatory?',
 a: 'Yes. Since October 1, 2023, all 510(k) submissions, unless exempted, must be submitted electronically using eSTAR.',
 },
 {
 q: 'Will FDA accept clinical data from a study in Israel?',
 a: 'It can. Under 21 CFR 812.28, FDA accepts data from studies outside the US if they are well designed and run under good clinical practice, including review by an independent ethics committee, which in Israel is the Helsinki Committee.',
 },
 {
 q: 'What happens if FDA finds my device not substantially equivalent?',
 a: 'The device cannot be marketed through that 510(k). If there is no suitable predicate, the usual next step is a De Novo request, FDA\'s pathway for novel devices with no legally marketed predicate.',
 }],
 sources: [
 { title: 'Premarket Notification 510(k)', url: 'https://www.fda.gov/medical-devices/premarket-submissions-selecting-and-preparing-correct-submission/premarket-notification-510k', publisher: 'FDA' },
 { title: '510(k) Submission Process', url: 'https://www.fda.gov/medical-devices/premarket-notification-510k/510k-submission-process', publisher: 'FDA' },
 { title: 'Medical Device User Fee Amendments (MDUFA): Fees', url: 'https://www.fda.gov/industry/fda-user-fee-programs/medical-device-user-fee-amendments-mdufa-fees', publisher: 'FDA' },
 { title: 'Reduced Medical Device User Fees: Small Business Determination (SBD) Program', url: 'https://www.fda.gov/medical-devices/premarket-submissions-selecting-and-preparing-correct-submission/reduced-or-waived-medical-device-user-fees-small-business-determination-sbd-program', publisher: 'FDA' },
 { title: 'Requests for Feedback and Meetings for Medical Device Submissions: The Q-Submission Program', url: 'https://www.fda.gov/media/114034/download', publisher: 'FDA' },
 { title: 'De Novo Classification Request', url: 'https://www.fda.gov/medical-devices/premarket-submissions-selecting-and-preparing-correct-submission/de-novo-classification-request', publisher: 'FDA' },
 { title: '21 CFR 812.28 -- Acceptance of data from clinical investigations conducted outside the United States', url: 'https://www.ecfr.gov/current/title-21/section-812.28', publisher: 'eCFR' },
 { title: 'Product Classification: Oximeter (DQA)', url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPCD/classification.cfm?id=DQA', publisher: 'FDA' },
 ],
 relatedGuideSlugs: ['medtech-startup-israel', 'helsinki-committee-israel'],
 ctaServicePath: '/services/medtech-leumit',
 ctaLabel: 'Plan your 510(k) with the WeCcelerate MedTech track',
 },

 // ---------------------------------------------------------------------------
 // 5. RAISE FUNDING IN ISRAEL
 // ---------------------------------------------------------------------------
 // Sources (checked 2026-10-22):
 // - Israel Innovation Authority, "Royalties & Intellectual Property":
 //   https://innovationisrael.org.il/en/royalties-intellectual-property/
 //   non-dilutive investments from ideation through pre-seed, seed and A rounds; conditional grant repaid only from
 //   revenue of the funded project, royalties 3%-5% of annual revenues plus SOFR-based annual interest; funded R&D in
 //   Israel; know-how transfer abroad needs IIA approval and repayment.
 // - Israel Innovation Authority, "Ideation (Tnufa) Incentive Program - Startup Fund":
 //   https://innovationisrael.org.il/en/programs/ideation-tnufa-incentive-program/
 //   conditional grant up to NIS 200,000 over 12 months (80% of approved budget); for prototype, IP protection and
 //   business development, not salaries; repaid via royalties on product sales.
 // - Y Combinator, "The SAFE" documents page: https://www.ycombinator.com/documents
 //   created at YC by Carolynn Levy in 2013; post-money SAFE the YC standard since 2018; converts into shares at a
 //   priced round; not debt; versions: valuation cap, discount, MFN; pro rata in a side letter; tool supports only
 //   US-incorporated companies; non-US forms for Canada, Cayman Islands, Singapore.
 // - Securities Law, 5728-1968, ss.15 and 15A (Hebrew text as consolidated on he.wikisource.org, incl. editorial
 //   note that regulation 2 of the Securities Regulations (Details for ss.15A-15C), 2000 sets the maximum at 35):
 //   no offer to the public without a prospectus; sale to a limited number of investors in 12 months, and to
 //   investors listed in the First Schedule, is not an offer to the public.
 // Removed as unverifiable: ecosystem size stats (VC/angel/family office counts, deal counts), round sizes,
 // valuation multiples, conversion rates of warm vs cold intros, named funds and law firms, the "WeCcelerate
 // investor network" figures.
 {
 slug: 'raise-funding-israel',
 hebrewSlug: 'eich-mgayisim-mashkim',
 category: 'fundraising',
 targetKeyword: 'raise startup funding in Israel',
 relatedKeywords: [
 'fundraising Israel startup',
 'Israeli investors',
 'Seed round Israel',
 'Series A Israel',
 'Israel Innovation Authority grant'],
 h1: 'How to raise startup funding in Israel: a founder\'s guide',
 metaTitle: 'How to Raise Startup Funding in Israel | WeCcelerate',
 metaDescription:
 'How to raise startup funding in Israel: funding stages, Israel Innovation Authority grants, SAFEs and equity rounds, securities law limits, and how to prepare.',
 speakableAnswer:
 'To raise startup funding in Israel, match the source to your stage: founders, angels and Israel Innovation Authority grants for the earliest stage, then seed and Series A investors once you show progress. Prepare a clear deck, a financial model and a clean cap table, and check securities law limits with a lawyer before you approach investors.',
 lastUpdated: '2026-10-22',
 readingTimeMinutes: 7,
 sections: [
 {
 heading: 'How does startup fundraising work in Israel?',
 paragraphs: [
 'Startup fundraising in Israel moves in stages, and each stage has its own typical investors and proof points. The money you raise at each stage should get the company to the milestone that makes the next round possible.',
 'The labels are not legal terms, and investors use them loosely. Still, the logic is consistent:'],
 list: [
 'Pre-seed: founders, friends and family, angel investors, and public programs such as Israel Innovation Authority grants. The goal is to test the problem and build a first version.',
 'Seed: angels, angel groups and seed funds. The goal is to show early users, customers or strong technical progress.',
 'Series A: venture capital funds, often with foreign investors. The goal is to scale something that already works.',
 'Later rounds: growth funds and strategic investors, driven by revenue and growth.'],
 },
 {
 heading: 'What non-dilutive funding is available?',
 paragraphs: [
 'The main non-dilutive source for Israeli tech startups is the Israel Innovation Authority (IIA), which invests through conditional grants from the ideation stage through pre-seed, seed and A rounds. A grant does not cost equity. It is repaid only once the company earns revenue from the funded project, through royalties of 3% to 5% of annual revenues plus annual interest based on SOFR, until the full grant is repaid.',
 'Two conditions matter for later fundraising. The funded R&D must be done in Israel, and selling or transferring the funded know-how outside Israel needs IIA approval and a repayment. Investors will ask about both in due diligence.',
 'For the very first step, the IIA\'s Ideation (Tnufa) program offers entrepreneurs and new Israeli startups a conditional grant of up to NIS 200,000 over 12 months, covering 80% of the approved budget. The money goes to a first prototype, IP protection and business development, not to salaries. Check the current terms on the IIA site before you apply.'],
 figure: {
 src: '/images/guides/en/israel-innovation-authority-conditional-royalties.webp',
 alt: 'Israel Innovation Authority page section "Conditional Royalties" stating that grants are repaid through royalties of 3%-5% of annual revenues plus SOFR-based interest, and a section on the sale or transfer of funded know-how outside Israel with a repayment cap of x6',
 width: 1000,
 height: 967,
 caption: 'The IIA explains that its grants are repaid only from revenue of the funded project, and that moving funded know-how abroad needs approval and repayment',
 credit: 'innovationisrael.org.il, screenshot taken 2026-10-22',
 sourceUrl: 'https://innovationisrael.org.il/en/royalties-intellectual-property/',
 },
 },
 {
 heading: 'SAFE or equity round: which instrument should you use?',
 paragraphs: [
 'Early rounds are usually done either as a priced equity round, where investors buy shares at an agreed valuation, or with a convertible instrument such as a SAFE, which turns into shares at a later priced round.',
 'The SAFE (Simple Agreement for Future Equity) was created at Y Combinator in 2013, and the post-money SAFE has been YC\'s standard since 2018. YC describes it as a short contract that converts into shares when the company raises a priced round, and states that it is not debt. Its standard versions use a valuation cap, a discount, or an MFN clause, with pro rata rights in a separate side letter.',
 'One detail matters for Israeli founders: YC\'s forms and tool are built for US-incorporated companies, and its non-US forms cover Canada, the Cayman Islands and Singapore. If your company is an Israeli Ltd., ask your lawyer which instrument fits Israeli corporate and tax law.'],
 figure: {
 src: '/images/guides/en/y-combinator-safe-documents-page.webp',
 alt: 'Y Combinator SAFE page headed "The SAFE: The standard way startups raise money", stating it was created at Y Combinator by Carolynn Levy in 2013 and explaining that a SAFE converts into shares when the startup raises a priced round',
 width: 1000,
 height: 1231,
 caption: 'Y Combinator\'s official SAFE page explains what a SAFE is and when it converts into shares',
 credit: 'ycombinator.com, screenshot taken 2026-10-22',
 sourceUrl: 'https://www.ycombinator.com/documents',
 },
 },
 {
 heading: 'What does Israeli securities law mean for a private round?',
 paragraphs: [
 'Under Israel\'s Securities Law, 1968, nobody may offer securities to the public without a prospectus approved by the Israel Securities Authority. Section 15A sets out what does not count as an offer to the public, and that is the room most private rounds work in.',
 'In short, selling to a limited number of investors within any 12-month period is not a public offer, and the exact number is set in regulations under the law. Investors of the types listed in the law\'s First Schedule, such as certain institutional and qualified investors, are not counted. Posting a round widely on social media can still create a problem, so plan who you approach with a lawyer.'],
 },
 {
 heading: 'How should you prepare before meeting investors?',
 paragraphs: [
 'Prepare the materials investors will ask for before the first meeting, so that a good conversation does not stall on missing documents. Most early investors expect:'],
 list: [
 'A short pitch deck that tells the story clearly (see /en/guides/startup-pitch-deck).',
 'A financial model with explicit assumptions (see /en/guides/startup-business-plan).',
 'A clean cap table, signed founder agreements with vesting, and IP assigned to the company (see /en/guides/vesting-explained).',
 'A list of investors that actually invest at your stage and in your sector.',
 'A clear answer to how much you are raising and which milestones it will fund.'],
 },
 {
 heading: 'Common fundraising mistakes',
 paragraphs: [
 'Most early rounds stall for reasons the founder controls. Watch for these:'],
 list: [
 'Raising before you can show a milestone that matters to investors at that stage.',
 'Approaching investors who do not invest at your stage or in your sector.',
 'Signing a convertible instrument without understanding how it dilutes you at conversion.',
 'Ignoring IIA conditions on R&D location and know-how transfer when planning the company structure.',
 'Talking to many unqualified investors without checking securities law limits.',
 'Leaving the cap table, vesting and IP assignment to be fixed during due diligence.'],
 },
 {
 heading: 'How WeCcelerate works with founders on fundraising',
 paragraphs: [
 'WeCcelerate is a Venture Builder in Israel since 2018, active in Tel Aviv and Jerusalem and recognized by the Israel Innovation Authority. We work with founders on the investment story, the deck, the financial model and preparation for investor meetings. MedTech founders can also join our track with Leumit Health Services, which offers clinical expertise, regulatory guidance, data access and pilot opportunities.'],
 }],
 howToSteps: [
 { name: 'Define the milestone', text: 'Decide what the round must achieve, such as a working prototype, first customers or a regulatory step, and how much money that takes.' },
 { name: 'Check non-dilutive options', text: 'Review Israel Innovation Authority programs that fit your stage, and their conditions on R&D in Israel and know-how transfer.' },
 { name: 'Clean up the company', text: 'Sign founder agreements with vesting, assign IP to the company and make sure the cap table is accurate.' },
 { name: 'Prepare the materials', text: 'Build a short deck, a financial model with clear assumptions and a basic data room.' },
 { name: 'Choose the instrument', text: 'Decide with your lawyer between a priced round and a convertible instrument that fits an Israeli company.' },
 { name: 'Build a targeted investor list', text: 'List investors who invest at your stage and in your sector, and plan your approach within securities law limits.' },
 { name: 'Run the process and close', text: 'Hold meetings in a focused period, negotiate the term sheet with your lawyer and close the legal documents.' }],
 faqs: [
 {
 q: 'Where does early startup funding in Israel come from?',
 a: 'At the earliest stage, funding usually comes from the founders, friends and family, angel investors and Israel Innovation Authority programs. Seed rounds add angel groups and seed funds, and Series A rounds are usually led by venture capital funds. The right source depends on what you can already show, such as a prototype, users or revenue.',
 },
 {
 q: 'How do Israel Innovation Authority grants work?',
 a: 'IIA grants are non-dilutive and conditional. The company repays them only once it earns revenue from the funded project, through royalties of 3% to 5% of annual revenues plus SOFR-based interest. The funded R&D must be done in Israel, and transferring the funded know-how abroad needs IIA approval and a repayment.',
 },
 {
 q: 'What is the IIA Tnufa program?',
 a: 'Tnufa is the Israel Innovation Authority\'s ideation program for entrepreneurs and new Israeli startups. It offers a conditional grant of up to NIS 200,000 over 12 months, covering 80% of the approved budget, for a prototype, IP protection and business development. It does not fund salaries, and it is repaid through royalties on product sales.',
 },
 {
 q: 'What is a SAFE?',
 a: 'A SAFE (Simple Agreement for Future Equity) is a short contract, created at Y Combinator in 2013, in which an investor funds the company now in exchange for shares later. It converts into shares at the next priced round and is not a loan. YC\'s standard forms are built for US-incorporated companies.',
 },
 {
 q: 'Can an Israeli startup raise from many private investors?',
 a: 'Only within limits. Israel\'s Securities Law, 1968 bans offering securities to the public without an approved prospectus. Selling to a limited number of investors in any 12-month period, a number set in regulations under the law, is not a public offer, and investor types listed in the law\'s First Schedule are not counted. Check the details with a lawyer.',
 },
 {
 q: 'What documents do investors ask for in an early round?',
 a: 'Early investors usually ask for a pitch deck, a financial model with clear assumptions, the cap table, the certificate of incorporation and articles, signed founder agreements with vesting, IP assignment agreements and any material contracts. Having these ready before the first meeting keeps due diligence from slowing down the round.',
 }],
 sources: [
 { title: 'Royalties & Intellectual Property', url: 'https://innovationisrael.org.il/en/royalties-intellectual-property/', publisher: 'Israel Innovation Authority' },
 { title: 'Ideation (Tnufa) Incentive Program - Startup Fund', url: 'https://innovationisrael.org.il/en/programs/ideation-tnufa-incentive-program/', publisher: 'Israel Innovation Authority' },
 { title: 'The SAFE: The standard way startups raise money', url: 'https://www.ycombinator.com/documents', publisher: 'Y Combinator' },
 { title: 'Securities Law, 5728-1968 (Hebrew text)', url: 'https://he.wikisource.org/wiki/%D7%97%D7%95%D7%A7_%D7%A0%D7%99%D7%99%D7%A8%D7%95%D7%AA_%D7%A2%D7%A8%D7%9A', publisher: 'Hebrew Wikisource' }],
 relatedGuideSlugs: ['startup-pitch-deck', 'startup-business-plan', 'vesting-explained', 'how-to-start-a-startup-israel', 'medtech-startup-israel'],
 ctaServicePath: '/services/investor-preparation',
 ctaLabel: 'Prepare for your fundraise with WeCcelerate',
 },

 // ---------------------------------------------------------------------------
 // 6. HOW TO START A STARTUP IN ISRAEL
 // ---------------------------------------------------------------------------
 // Sources (checked 2026-10-22):
 // - Israel Corporations Authority (Ministry of Justice), "בקשה לרישום חברה" (gov.il, page updated 11.06.2025):
 //   https://www.gov.il/he/service/company_registration
 //   online registration in the Companies Register; company types: private company, single-shareholder company
 //   (חברת יחיד), foreign company, public benefit company; related service: annual company fee payment.
 // - Israel Innovation Authority, "Ideation (Tnufa) Incentive Program - Startup Fund":
 //   https://innovationisrael.org.il/en/programs/ideation-tnufa-incentive-program/  (up to NIS 200,000, 12 months, 80%).
 // - Israel Innovation Authority, "Royalties & Intellectual Property":
 //   https://innovationisrael.org.il/en/royalties-intellectual-property/  (3%-5% royalties + SOFR, R&D in Israel).
 // - Israel Innovation Authority, "Innovation Visa for a Foreign Technology Entrepreneur":
 //   https://innovationisrael.org.il/en/programs/tech-innovation-visa/
 //   approved 2024 with the Population and Immigration Authority; B/2 stay permit; IIA only recommends, PIBA
 //   grants; requires a supporting framework; visa for up to two years.
 // - Y Combinator, "How to Split Equity Among Co-Founders" (Michael Seibel, Dec 2, 2015):
 //   https://www.ycombinator.com/blog/splitting-equity-among-founders/  (4-year vesting, 1-year cliff typical).
 // - Eric Ries, "Minimum Viable Product: a guide" (Aug 3, 2009): MVP definition.
 // Removed as unverifiable: startup counts per capita, unicorn counts, funding-per-capita ratios, named exits,
 // "30 interviews / 70% pain" rules, retention thresholds, "60% of disputes", warm-intro conversion rates,
 // registration timing and fee claims, named seed funds, "Israel's leading Venture Builder".
 {
 slug: 'how-to-start-a-startup-israel',
 hebrewSlug: 'eich-lehakim-startup',
 category: 'startup-basics',
 targetKeyword: 'how to start a startup in Israel',
 relatedKeywords: [
 'start a company in Israel',
 'register a startup Israel',
 'Israeli startup company formation',
 'start a venture Israel',
 'founder agreement Israel'],
 h1: 'A founder\'s guide: how to start a startup in Israel',
 metaTitle: 'How to Start a Startup in Israel: Founder Guide | WeCcelerate',
 metaDescription:
 'How to start a startup in Israel: validate the problem, register the company online, sign a founder agreement with vesting, build an MVP, fund the first stage.',
 speakableAnswer:
 'To start a startup in Israel, first confirm that real customers have the problem. Then register a company with the Israel Corporations Authority, which offers online registration, sign a founder agreement with vesting, assign the IP to the company, build a focused MVP, and fund the first stage through founders, angels or Israel Innovation Authority programs.',
 lastUpdated: '2026-10-22',
 readingTimeMinutes: 7,
 sections: [
 {
 heading: 'What is the first step in starting a startup?',
 paragraphs: [
 'The first step is to confirm that a specific group of customers has the problem you want to solve, before you incorporate or write code. A company, a founder agreement and a product all cost money, and none of them help if the problem is not real or not urgent.',
 'Talk with people from the target audience, not friends and family. Ask how they handle the problem today, what it costs them and what they have already tried. Look for repeated pain and for signs that people would pay or change their behavior. Write down what you learn, because it will shape the MVP, the business plan and the pitch.'],
 },
 {
 heading: 'How do you register a company in Israel?',
 paragraphs: [
 'You register a company in Israel with the Companies Registrar at the Israel Corporations Authority, part of the Ministry of Justice, and the registration can be filed online on gov.il. The service lets you choose the company type, such as a private company, a single-shareholder company, a foreign company or a public benefit company.',
 'Most startups register as a private company limited by shares (Ltd.). Before you file, agree with your co-founders on the shareholders, the directors and the share split, and decide whether you need custom articles of association. The Authority publishes guides for the online process and the forms, including declarations by the first directors and shareholders. A registered company also pays an annual fee to the Authority, so keep it on your calendar.'],
 figure: {
 src: '/images/guides/en/israel-companies-registrar-online-company-registration.webp',
 alt: 'gov.il page "בקשה לרישום חברה" (company registration request) of the Israel Corporations Authority, with a link to register a company online and a selector for company type: private company, single-shareholder company, foreign company and public benefit company',
 width: 1000,
 height: 1543,
 caption: 'The Israel Corporations Authority registration page on gov.il, where founders choose the company type and file online',
 credit: 'gov.il, screenshot taken 2026-10-22',
 sourceUrl: 'https://www.gov.il/he/service/company_registration',
 },
 },
 {
 heading: 'Israeli company or Delaware company?',
 paragraphs: [
 'For most Israeli founders an Israeli company is the simple default. A US (often Delaware) parent company becomes relevant when most of your investors, customers or management will be in the US, and some investors ask for it.',
 'The choice has tax, legal and grant consequences, including for Israel Innovation Authority funding, which requires the funded R&D to be done in Israel and IIA approval to transfer funded know-how abroad. Changing the structure later costs time and legal fees, so discuss it with a lawyer and an accountant before your first round, not during it.'],
 },
 {
 heading: 'What should a founder agreement include?',
 paragraphs: [
 'A founder agreement should set out who owns what, how the shares vest, what each founder is responsible for, and what happens if someone leaves. Sign it when you start working together, not after the first round.',
 'A common structure, which Y Combinator describes as typical, is four years of vesting with a one-year cliff: nothing vests in the first year, a quarter vests at the one-year mark, and the rest vests monthly. Also include an assignment of all IP to the company, confidentiality, and clear good leaver and bad leaver terms. Our guide /en/guides/vesting-explained explains how vesting works.'],
 },
 {
 heading: 'How focused should the first product be?',
 paragraphs: [
 'The first product should test the single most important assumption behind the business, and nothing more. Eric Ries defines the minimum viable product as the version of a new product that lets a team collect the maximum amount of validated learning about customers with the least effort.',
 'Decide in advance what you want to learn and how you will measure it, then build only what that test needs. See /en/guides/how-to-build-mvp for a step-by-step approach.'],
 },
 {
 heading: 'How do you fund the first stage?',
 paragraphs: [
 'Early money usually comes from the founders, friends and family, angel investors and public programs. The Israel Innovation Authority\'s Ideation (Tnufa) program offers entrepreneurs and new Israeli startups a conditional grant of up to NIS 200,000 over 12 months, covering 80% of the approved budget, for a prototype, IP protection and business development.',
 'IIA grants are repaid only from revenue of the funded project, through royalties of 3% to 5% of annual revenues plus SOFR-based interest. Our guide /en/guides/raise-funding-israel covers seed rounds, SAFEs and securities law limits.'],
 },
 {
 heading: 'Can a foreign founder start a startup in Israel?',
 paragraphs: [
 'Yes. Since 2024 the Israel Innovation Authority, together with the Population and Immigration Authority, runs an Innovation Visa procedure for foreign technology entrepreneurs who want to set up a company in Israel. The IIA only recommends. The visa itself, a B/2 stay permit for up to two years, is granted by the Population and Immigration Authority.',
 'The application must name a supporting framework that will accompany the entrepreneur, include that framework\'s declaration of support, explain how living costs will be funded, and describe R&D to be done in Israel.'],
 },
 {
 heading: 'Common mistakes when starting a startup',
 paragraphs: [
 'These early mistakes are common and expensive to fix later:'],
 list: [
 'Incorporating and building before talking with real customers.',
 'Splitting equity without vesting, or postponing the founder agreement.',
 'Leaving IP with a founder or a contractor instead of the company.',
 'Choosing a corporate structure without checking tax and grant consequences.',
 'Building a full product when a small test would answer the key question.'],
 },
 {
 heading: 'How WeCcelerate works with early-stage founders',
 paragraphs: [
 'WeCcelerate is a Venture Builder in Israel since 2018, active in Tel Aviv and Jerusalem and recognized by the Israel Innovation Authority. We work with founders from the early stage on testing the problem, the business model, the product and preparation for fundraising. Our MedTech track with Leumit Health Services gives founders clinical expertise, regulatory guidance, data access and pilot opportunities.'],
 }],
 howToSteps: [
 { name: 'Validate the problem', text: 'Interview people from your target audience about how they handle the problem today and what it costs them.' },
 { name: 'Agree on the founding team', text: 'Agree on roles, the share split and commitment before you register.' },
 { name: 'Register the company', text: 'File an online company registration with the Israel Corporations Authority on gov.il.' },
 { name: 'Sign a founder agreement', text: 'Include vesting, IP assignment to the company, confidentiality and leaver terms, drafted by a lawyer.' },
 { name: 'Build a focused MVP', text: 'Test the single most important assumption with the smallest product that can test it.' },
 { name: 'Fund the first stage', text: 'Combine founder money, angels and Israel Innovation Authority programs such as Tnufa.' },
 { name: 'Talk to WeCcelerate', text: 'Book an introductory call about building your venture.', url: 'https://weccelerate.co.il/contact' }],
 faqs: [
 {
 q: 'How do I register a startup company in Israel?',
 a: 'You register with the Companies Registrar at the Israel Corporations Authority, part of the Ministry of Justice. The gov.il service supports online registration and lets you choose the company type, such as a private company or a single-shareholder company. Prepare the shareholder and director details, the share split and the articles of association first.',
 },
 {
 q: 'Should my startup be an Israeli company or a Delaware company?',
 a: 'For most Israeli founders an Israeli company is the simple starting point. A US parent company becomes relevant when most investors, customers or management are in the US. The choice affects tax, legal structure and Israel Innovation Authority grants, so decide it with a lawyer and an accountant before your first round.',
 },
 {
 q: 'What vesting schedule should founders use?',
 a: 'A common structure, which Y Combinator describes as typical, is four years of vesting with a one-year cliff. Nothing vests in the first year, a quarter vests at the one-year mark, and the rest vests monthly over the next three years. The schedule is a contract term, so agree on it in the founder agreement.',
 },
 {
 q: 'Can I get government funding for a new startup in Israel?',
 a: 'Yes. The Israel Innovation Authority\'s Ideation (Tnufa) program offers entrepreneurs and new Israeli startups a conditional grant of up to NIS 200,000 over 12 months, covering 80% of the approved budget. IIA grants are repaid only from revenue of the funded project, through royalties plus SOFR-based interest.',
 },
 {
 q: 'Can a foreigner start a startup in Israel?',
 a: 'Yes. Since 2024 the Israel Innovation Authority runs an Innovation Visa procedure for foreign technology entrepreneurs, with the Population and Immigration Authority. The IIA recommends and the Population and Immigration Authority grants a B/2 stay permit for up to two years. The application must name a supporting framework and describe R&D in Israel.',
 },
 {
 q: 'Do I need a technical co-founder to start?',
 a: 'Not necessarily. You need someone who can make sound technical decisions, but that can be a part-time or fractional CTO, a development partner or a Venture Builder until you recruit a technical co-founder. What matters is that the company owns the code and IP and that the technical plan fits your stage.',
 }],
 sources: [
 { title: 'בקשה לרישום חברה (Company registration request)', url: 'https://www.gov.il/he/service/company_registration', publisher: 'Israel Corporations Authority, Ministry of Justice' },
 { title: 'Ideation (Tnufa) Incentive Program - Startup Fund', url: 'https://innovationisrael.org.il/en/programs/ideation-tnufa-incentive-program/', publisher: 'Israel Innovation Authority' },
 { title: 'Royalties & Intellectual Property', url: 'https://innovationisrael.org.il/en/royalties-intellectual-property/', publisher: 'Israel Innovation Authority' },
 { title: 'Innovation Visa for a Foreign Technology Entrepreneur', url: 'https://innovationisrael.org.il/en/programs/tech-innovation-visa/', publisher: 'Israel Innovation Authority' },
 { title: 'How to Split Equity Among Co-Founders', url: 'https://www.ycombinator.com/blog/splitting-equity-among-founders/', publisher: 'Y Combinator' },
 { title: 'Minimum Viable Product: a guide', url: 'http://www.startuplessonslearned.com/2009/08/minimum-viable-product-guide.html', publisher: 'Eric Ries, Startup Lessons Learned' }],
 relatedGuideSlugs: ['vesting-explained', 'how-to-build-mvp', 'raise-funding-israel', 'what-is-venture-builder', 'cto-as-a-service-israel'],
 ctaServicePath: '/services/business-consulting',
 ctaLabel: 'Start your Israeli startup with WeCcelerate',
 },

 // ---------------------------------------------------------------------------
 // 7. APP DEVELOPMENT COST ISRAEL
 // ---------------------------------------------------------------------------
 // Sources (checked 2026-10-22):
 // - Apple Developer, "Become a member - Apple Developer Program": https://developer.apple.com/programs/enroll/
 //   "The Apple Developer Program is 99 USD per membership year. Prices may vary by region"; fee waiver for
 //   eligible nonprofits, accredited educational institutions and government entities.
 // - Google Play Console Help, "Get started with Play Console":
 //   https://support.google.com/googleplay/android-developer/answer/6112435?hl=en
 //   developer account sign-up steps incl. "Pay registration fee" and developer identity verification.
 // Owner rule: NO development price ranges. All price tiers, percentages ("save 40-60%", "AI adds 20-30%",
 // "maintenance 5-15%", "200% overruns"), the WeCcelerate pricing models (fixed / T&M / Equity-for-Services),
 // "quote within 48 hours" and "2-week scoping" were removed. Only third-party platform fees are stated.
 {
 slug: 'app-development-cost-israel',
 hebrewSlug: 'kama-ole-lefateach-applicatzia',
 category: 'product-development',
 targetKeyword: 'app development cost Israel',
 relatedKeywords: [
 'how much does app development cost in Israel',
 'mobile app cost Israel',
 'startup MVP cost',
 'SaaS development cost Israel',
 'app development budget'],
 h1: 'Guide to app development cost Israel: what drives the price of an app',
 metaTitle: 'App Development Cost in Israel: What Drives It | WeCcelerate',
 metaDescription:
 'What drives app development cost in Israel: scope, platforms, backend, integrations, design, team model and ongoing costs, and how to get quotes to compare.',
 speakableAnswer:
 'App development cost in Israel depends mainly on scope: the number of user flows and screens, which platforms you support, how complex the backend is, how many external integrations you need, the design level and the team model. Ongoing costs such as hosting, maintenance and app store fees continue after launch, so plan for them from the start.',
 lastUpdated: '2026-10-22',
 readingTimeMinutes: 6,
 sections: [
 {
 heading: 'How much does it cost to develop an app in Israel?',
 paragraphs: [
 'There is no fair single price for "an app", because the cost is set by the scope of what you build. Two products that look similar on the surface can differ widely in effort once you count the backend, the integrations and the edge cases.',
 'A useful quote is built from a written scope: who the users are, what each type of user can do, which platforms you support, what data you store and which outside systems you connect to. Until those are clear, any number you hear is a guess. This guide explains what drives the effort, so you can scope well and compare quotes on the same basis.'],
 },
 {
 heading: 'What factors drive app development cost?',
 paragraphs: [
 'Most of the effort, and therefore the cost, comes from a handful of decisions. Each one can be made smaller for a first version:'],
 list: [
 'Scope: the number of user types, user flows and screens. This is usually the biggest driver.',
 'Platforms: web only, iOS, Android, or all three. Separate native apps mean more code to build and maintain than a single web app or a cross-platform app.',
 'Backend: whether you need accounts, roles, an admin panel, payments, notifications or real-time features.',
 'Integrations: every outside system, such as payments, maps, messaging, calendars or a hospital or ERP system, adds work, testing and failure cases.',
 'Data and security: personal or medical data brings requirements for privacy, access control, logging and sometimes regulation.',
 'Design: ready-made components are faster than a fully custom interface and animations.',
 'AI features: calling an existing model through an API is a different project from training and validating your own model.',
 'Team model: freelancers, an agency, an in-house team or a mix. Seniority affects speed and how much rework you inherit later.'],
 },
 {
 heading: 'Does medical or sensitive data change the cost?',
 paragraphs: [
 'Yes. An app that handles health, financial or other sensitive personal data needs more work on security, privacy, access control and documentation, and that work has to be planned from the start rather than added later.',
 'If the software is intended for a medical purpose, it may itself be regulated as a medical device. That brings requirements for quality management, risk analysis, testing and records that affect both the timeline and the budget. Clarify the intended use before you ask for quotes. Our guides /en/guides/medtech-startup-israel and /en/guides/fda-510k-israeli-startups explain how regulators look at medical software.'],
 },
 {
 heading: 'What ongoing costs come after launch?',
 paragraphs: [
 'An app keeps costing money after launch, and founders often leave this out of the budget. Plan for hosting and cloud services, monitoring, bug fixes, operating system and library updates, security patches, support and small improvements.',
 'Publishing to the app stores has its own fees. Apple states that the Apple Developer Program costs 99 USD per membership year, with prices that may vary by region. Google Play requires a developer account with a registration fee and identity verification before you can publish. Check both pages for the current terms.'],
 },
 {
 heading: 'How can you reduce app development cost?',
 paragraphs: [
 'The most reliable way to reduce cost is to build less in the first version. Start with the smallest product that tests your main assumption, release it to real users and let their behavior decide what comes next.'],
 list: [
 'Write down the one assumption the first version must test, and cut features that do not serve it.',
 'Start on one platform, often the web, unless your users clearly need a native mobile app.',
 'Use proven, well-supported tools and managed services rather than building infrastructure yourself.',
 'Postpone admin panels, complex reports and nice-to-have integrations until users ask for them.',
 'Consider a no-code or low-code prototype for a first test, knowing you may rebuild later.'],
 },
 {
 heading: 'How do you get a quote you can compare?',
 paragraphs: [
 'You get comparable quotes by giving every vendor the same written scope and asking each to break the price down the same way. Otherwise you are comparing different products.'],
 list: [
 'Share a short scope document with user types, main flows, platforms and integrations.',
 'Ask for a breakdown by stage or feature, and what is explicitly out of scope.',
 'Ask who will do the work, their seniority, and who owns the code and IP.',
 'Ask how changes to scope are priced and approved.',
 'Ask what support, warranty and maintenance are included after launch.'],
 },
 {
 heading: 'Common mistakes that raise the cost',
 paragraphs: [
 'These mistakes tend to cost more than any hourly rate difference:'],
 list: [
 'Starting development before the scope is written down.',
 'Agreeing to a fixed price on a vague scope, then paying for every change.',
 'Choosing the cheapest offer without checking who will write the code.',
 'Not owning the code repository, cloud accounts and app store accounts in the company\'s name.',
 'Leaving ongoing costs out of the budget.'],
 },
 {
 heading: 'How WeCcelerate works with founders on product development',
 paragraphs: [
 'WeCcelerate is a Venture Builder in Israel since 2018, active in Tel Aviv and Jerusalem and recognized by the Israel Innovation Authority. We work with founders on defining the product, scoping the first version and building it, with each quote based on a scoping process for the specific venture. Our MedTech track with Leumit Health Services adds clinical expertise, regulatory guidance, data access and pilot opportunities.'],
 }],
 faqs: [
 {
 q: 'How much does it cost to build an app in Israel?',
 a: 'It depends on scope: the number of user types and flows, the platforms, the backend, integrations, data and security needs, design and the team model. Any reliable price comes from a written scope. Ask vendors to price the same scope and break the quote down by stage or feature, so you can compare offers fairly.',
 },
 {
 q: 'Is a web app cheaper than a mobile app?',
 a: 'Often, because one web app runs on all devices while separate native iOS and Android apps mean more code to build, test and maintain. Cross-platform tools reduce that gap. The right choice depends on your users: if they need device features or app store presence, a mobile app may be worth the extra effort.',
 },
 {
 q: 'What ongoing costs should I plan for after launch?',
 a: 'Plan for hosting and cloud services, monitoring, bug fixes, operating system and library updates, security patches, support and small improvements. App store accounts also cost money: Apple charges 99 USD per membership year for the Apple Developer Program, and Google Play charges a registration fee for a developer account.',
 },
 {
 q: 'How do AI features affect the cost of an app?',
 a: 'It depends on the approach. Calling an existing AI model through an API adds integration work, testing and usage fees. Training and validating your own model is a much larger project that needs data, expertise and ongoing evaluation. Define what the AI must do for the user before asking for a quote.',
 },
 {
 q: 'Should I hire a freelancer or a development company?',
 a: 'A freelancer can work well for a small, well-defined scope, but depends on one person. A company brings several roles, such as product, design, development and QA, and more continuity. In both cases, make sure the company owns the code, the cloud accounts and the IP, and that scope changes are agreed in writing.',
 }],
 sources: [
 { title: 'Become a member - Apple Developer Program', url: 'https://developer.apple.com/programs/enroll/', publisher: 'Apple' },
 { title: 'Get started with Play Console', url: 'https://support.google.com/googleplay/android-developer/answer/6112435?hl=en', publisher: 'Google Play Console Help' }],
 relatedGuideSlugs: ['how-to-build-mvp', 'cto-as-a-service-israel', 'how-to-start-a-startup-israel', 'what-is-venture-builder'],
 ctaServicePath: '/services/digital-product',
 ctaLabel: 'Get a custom app development quote',
 },

 // ---------------------------------------------------------------------------
 // 8. STARTUP PITCH DECK GUIDE
 // ---------------------------------------------------------------------------
 // Sources (checked 2026-10-22):
 // - Y Combinator Startup Library, "How to build your seed round pitch deck" (Aaron Harris):
 //   https://www.ycombinator.com/library/2u-how-to-build-your-seed-round-pitch-deck
 //   order: title with one-line description, problem, solution, traction, insight/what makes you special,
 //   business model, market, team (founders, "Nobody cares about your advisors"), the ask (how much and what it
 //   gets you); clarity and concision; each slide a set, ideally 1, probably never more than 3; seed deck not very
 //   different from a Series A deck. Related YC piece by Kevin Hale: "Investors invest in teams not slides.
 //   Your slides should make your ideas more clear."
 // - Sequoia Capital, "Writing a business plan": https://sequoiacap.com/article/writing-a-business-plan/
 //   sections: company purpose, problem, solution, why now, market potential, competition / alternatives,
 //   business model, team, financials, vision.
 // Removed as unverifiable: DocSend "3 minutes / 60% in 30 seconds" figures, slide-count rules, Airbnb and Uber
 // deck descriptions, Tipalti example, tool rankings, WeCcelerate "5 practice rounds with former-investor advisors".
 {
 slug: 'startup-pitch-deck',
 hebrewSlug: 'pitch-deck-startup',
 category: 'fundraising',
 targetKeyword: 'startup pitch deck',
 relatedKeywords: [
 'pitch deck template',
 'investor pitch deck',
 'how to make a pitch deck',
 'seed round pitch deck',
 'pitch deck structure'],
 h1: 'How to build a startup pitch deck investors can follow',
 metaTitle: 'Startup Pitch Deck: What to Include and Why | WeCcelerate',
 metaDescription:
 'How to build a startup pitch deck: the slides investors expect, in what order, based on Y Combinator and Sequoia guidance, plus design tips and common mistakes.',
 speakableAnswer:
 'A startup pitch deck tells the investment story in a short set of slides: what the company does, the problem, the solution, traction, what makes you different, the business model, the market, the team and how much you are raising. Y Combinator and Sequoia both stress clarity and a simple narrative over detail.',
 lastUpdated: '2026-10-22',
 readingTimeMinutes: 6,
 sections: [
 {
 heading: 'What is a startup pitch deck for?',
 paragraphs: [
 'A pitch deck is a short slide presentation that tells investors what your company does, why it matters now and why your team will win. Its job is to earn the next conversation, not to answer every question.',
 'Y Combinator\'s seed deck template, written by Aaron Harris, puts it plainly: founders should strive for clarity and concision, and most seed-stage companies do not have much meaningful detail to explore. When founders pretend otherwise, the story gets muddled and investors get lost.'],
 },
 {
 heading: 'Which slides should a pitch deck include?',
 paragraphs: [
 'A seed deck usually follows the order an investor thinks in: what is this, why does it matter, is it working, and who is building it. YC\'s template follows this order:'],
 list: [
 'Title: the company name and a one-line description of what you do.',
 'Problem: who has it and how it affects real people or businesses.',
 'Solution: what you do, in as few words as possible, with the concrete benefit.',
 'Traction: clear, meaningful numbers if you have them.',
 'Insight: what makes you special and why your approach works.',
 'Business model: how you make money, as far as you know it today.',
 'Market: how big the opportunity can become.',
 'Team: why the founders are suited to this problem.',
 'The ask: how much you are raising and what it gets you.'],
 },
 {
 heading: 'What do Sequoia\'s guidelines add?',
 paragraphs: [
 'Sequoia Capital\'s "Writing a business plan" guidance covers similar ground and adds two sections that many founders skip: why now, and vision. Its list is company purpose, problem, solution, why now, market potential, competition and alternatives, business model, team, financials and vision.',
 'Why now asks what has changed, in technology, regulation or behavior, that makes this the right moment. Competition and alternatives should include what customers do today, not only direct competitors. Vision asks what you will have built in five years if everything goes well.'],
 },
 {
 heading: 'How do you present traction and the ask?',
 paragraphs: [
 'Present traction as a few clear, defined numbers over time, and present the ask as an amount linked to the milestones it will fund. These two slides are where investors check whether the story is real.',
 'For traction, name the metric, define it and show the period: for example, paying customers by month, or active users by week. If you have no revenue yet, show the strongest evidence you do have, such as signed pilots, letters of intent or usage by a design partner. YC\'s template notes that revenue is better, but other metrics are acceptable when revenue does not exist yet.',
 'For the ask, say how much you are raising and what it gets you. YC suggests laying out where the company will be within a year, at a point that should make it ready for the next round. Avoid listing percentages for "use of funds" without milestones attached.'],
 },
 {
 heading: 'How many slides should a pitch deck have?',
 paragraphs: [
 'Use as few slides as the story needs. YC suggests treating each topic as a set of slides, ideally one, and in a seed deck probably never more than three per topic. There is no official number, and what matters more is whether each slide makes one point clearly.',
 'Keep a separate appendix for detail investors may ask for later, such as the financial model, pipeline, technical architecture or regulatory plan.'],
 },
 {
 heading: 'How should a pitch deck look?',
 paragraphs: [
 'Design should make the ideas easier to read, not decorate them. YC\'s design piece by Kevin Hale sums it up: investors invest in teams, not slides, and your slides should make your ideas more clear.'],
 list: [
 'One message per slide, stated in the title.',
 'Large, legible text and few words.',
 'Charts with labeled axes and units.',
 'Real product screenshots instead of mockups where possible.',
 'Consistent fonts and colors, and no animations that hide content.'],
 },
 {
 heading: 'What mistakes weaken a pitch deck?',
 paragraphs: [
 'Most weak decks fail on clarity, not on design. Watch for these:'],
 list: [
 'Starting with features instead of the problem.',
 'A market size slide built top-down from a huge number, with no path to your share of it.',
 'Traction numbers without a time frame or definition.',
 'A team slide that leans on advisors instead of the founders.',
 'An ask without a clear link to the milestones the money will fund.',
 'Claims you cannot back up in the follow-up meeting.'],
 },
 {
 heading: 'Does a MedTech or regulated startup need extra slides?',
 paragraphs: [
 'Yes, usually one or two. Investors in medical devices and other regulated fields want to see the intended use, the regulatory path and the clinical plan, because they decide how much money and time the company needs. Our guides /en/guides/medtech-startup-israel and /en/guides/fda-510k-israeli-startups explain those paths.'],
 },
 {
 heading: 'How WeCcelerate works with founders on the pitch',
 paragraphs: [
 'WeCcelerate is a Venture Builder in Israel since 2018, active in Tel Aviv and Jerusalem and recognized by the Israel Innovation Authority. We work with founders on the investment story, the deck, the supporting financial model and practice for investor meetings. MedTech founders can also join our track with Leumit Health Services, which offers clinical expertise, regulatory guidance, data access and pilot opportunities.'],
 }],
 faqs: [
 {
 q: 'What should a startup pitch deck include?',
 a: 'A seed pitch deck usually includes a title with a one-line description, the problem, the solution, traction, what makes you special, the business model, the market, the team and the ask. Y Combinator\'s template follows this order, and Sequoia adds why now, competition and alternatives, financials and a five-year vision.',
 },
 {
 q: 'How many slides should a pitch deck have?',
 a: 'There is no official number. Use as few slides as the story needs. Y Combinator suggests treating each topic as a set of slides, ideally one and in a seed deck probably never more than three. Put supporting detail, such as the financial model or technical architecture, in a separate appendix.',
 },
 {
 q: 'What is the most important slide in a pitch deck?',
 a: 'There is no single slide that wins a round, but the problem, traction and team slides carry the most weight at seed stage. Y Combinator stresses that the team slide should be about the founders and why they fit the problem. Traction numbers should be clear, defined and tied to a time frame.',
 },
 {
 q: 'Should a pitch deck be in English?',
 a: 'For most Israeli startups, yes. English is the working language of most venture investors, and an English deck can be shared with foreign investors and co-investors without rewriting it. If you are pitching only to a local audience, such as some Israeli angels, a Hebrew version can work, but keep an English version ready.',
 },
 {
 q: 'Is a seed deck different from a Series A deck?',
 a: 'Not by much in structure. Y Combinator notes that its seed template is not very different from best practice for a Series A deck. The difference is in the evidence: a Series A deck needs stronger traction, clearer unit economics and a more detailed plan for how the new money will scale the business.',
 }],
 sources: [
 { title: 'How to build your seed round pitch deck', url: 'https://www.ycombinator.com/library/2u-how-to-build-your-seed-round-pitch-deck', publisher: 'Y Combinator' },
 { title: 'Writing a business plan', url: 'https://sequoiacap.com/article/writing-a-business-plan/', publisher: 'Sequoia Capital' }],
 relatedGuideSlugs: ['startup-business-plan', 'raise-funding-israel', 'how-to-start-a-startup-israel', 'medtech-startup-israel'],
 ctaServicePath: '/services/business-consulting',
 ctaLabel: 'Work on your pitch deck with WeCcelerate',
 },

 // ---------------------------------------------------------------------------
 // 9. HOW TO BUILD AN MVP IN 8 WEEKS
 // ---------------------------------------------------------------------------
 // Sources (checked 2026-10-22):
 // - Eric Ries, "Minimum Viable Product: a guide", Startup Lessons Learned (Aug 3, 2009):
 //   http://www.startuplessonslearned.com/2009/08/minimum-viable-product-guide.html
 //   MVP = "that version of a new product which allows a team to collect the maximum amount of validated
 //   learning about customers with the least effort."
 // - Steve Blank, "What's A Startup? First Principles." (Jan 25, 2010):
 //   https://steveblank.com/2010/01/25/whats-a-startup-first-principles/
 //   startup = an organization formed to search for a repeatable and scalable business model.
 // Removed as unverifiable: "42% of startups fail for no market need", the Airbnb MVP story, "8 weeks" promise,
 // retention thresholds (30% D7 / 20% D30), "production within two weeks", user counts, budget tiers,
 // WeCcelerate success-fee / equity model and client claims, version-pinned stack recommendations.
 {
 slug: 'how-to-build-mvp',
 hebrewSlug: 'eich-bonim-mvp',
 category: 'product-development',
 targetKeyword: 'how to build an MVP',
 relatedKeywords: [
 'MVP development',
 'minimum viable product guide',
 'how to build a startup MVP',
 'MVP scope',
 'MVP metrics'],
 h1: 'A founder\'s guide: how to build an MVP that tests one idea',
 metaTitle: 'How to Build an MVP: A Practical Founder Guide | WeCcelerate',
 metaDescription:
 'How to build an MVP: define the assumption to test, cut the scope, choose simple technology, launch to real users and decide what to do next based on evidence.',
 speakableAnswer:
 'To build an MVP, write down the one assumption your business depends on, decide what evidence would prove or disprove it, and build the smallest product that can produce that evidence. Use proven technology, release it to real users from the target audience, measure what they actually do, and use the results to decide what to build next.',
 lastUpdated: '2026-10-22',
 readingTimeMinutes: 6,
 sections: [
 {
 heading: 'What is an MVP?',
 paragraphs: [
 'An MVP, or minimum viable product, is the smallest version of a product that lets you learn whether your key assumption is true. Eric Ries defines it as the version of a new product that lets a team collect the maximum amount of validated learning about customers with the least effort.',
 'That makes an MVP a learning tool, not a cheap version of the final product. It fits Steve Blank\'s definition of a startup as an organization formed to search for a repeatable and scalable business model: the MVP is how you run that search with real customers.'],
 },
 {
 heading: 'What should the MVP test?',
 paragraphs: [
 'The MVP should test the single assumption that, if wrong, would sink the business. Usually that is whether a specific group of users has the problem badly enough to use, or pay for, your solution.',
 'Write it as one sentence, for example: "Clinic managers will use a tool that does X instead of their current spreadsheet." Then decide what result would count as success, such as repeat use, a signed pilot or a payment, before you build anything.'],
 },
 {
 heading: 'How do you choose the MVP features?',
 paragraphs: [
 'Keep only the features the test cannot work without, and move everything else to a later version. A simple way to do this is to list every feature you have in mind and ask of each one: does the user need this to experience the core value?'],
 list: [
 'Must have: the user cannot reach the core value without it.',
 'Can be manual: someone on the team can do it by hand for the first users.',
 'Later: useful, but it does not affect what you are testing.'],
 },
 {
 heading: 'What technology should an MVP use?',
 paragraphs: [
 'Use technology your team already knows well and that is widely supported, so that time goes into the product rather than infrastructure. Managed services for hosting, authentication, payments and email save weeks of work at this stage.',
 'Avoid building complex infrastructure before you have users. If you are not sure the product needs custom code at all, a no-code or low-code prototype can be enough for a first test, as long as you accept that a later version may need to be rebuilt. Make sure the company owns the code, accounts and data from day one.'],
 },
 {
 heading: 'Does an MVP have to be software?',
 paragraphs: [
 'No. An MVP is anything that produces real evidence about your key assumption, and sometimes the fastest test involves little or no code.',
 'Common forms include a landing page that describes the offer and measures sign-ups, a manual service where the team does by hand what the product will later automate, a clickable prototype tested with target users, or a pilot with one customer using a simple version. Choose the form that gives the most reliable evidence for the least effort, then build software when the evidence justifies it.'],
 },
 {
 heading: 'How long does it take to build an MVP?',
 paragraphs: [
 'It depends on scope, and scope is the part you control. A narrow MVP that tests one assumption on one platform is far faster to build than a product with several user types, native mobile apps, payments and integrations.',
 'Work in short cycles with a demo at the end of each one, so you can see progress and cut scope early. If the timeline keeps growing, the usual cause is features that were added without a clear link to the test.'],
 },
 {
 heading: 'How do you launch and measure an MVP?',
 paragraphs: [
 'Launch to real people from your target audience, not friends and family, and measure what they do, not only what they say. Decide on a few metrics that match the assumption you are testing.'],
 list: [
 'Activation: do new users reach the core value?',
 'Retention: do they come back and use it again?',
 'Willingness to pay: do they pay, sign a pilot or commit in another concrete way?',
 'Qualitative feedback: what do they try to do that the product does not support?'],
 },
 {
 heading: 'What should you do after the MVP?',
 paragraphs: [
 'After the MVP, decide based on the evidence: keep going and add what users need most, change part of the solution and test again, or change direction. All three are valid outcomes of a good MVP.',
 'Write down what you learned and what you will test next. This record is also valuable for investors, because it shows how you make decisions. See /en/guides/startup-pitch-deck for how to present traction.'],
 },
 {
 heading: 'What should not be in an MVP?',
 paragraphs: [
 'Leave out anything that does not help answer the question you are testing. Common examples:'],
 list: [
 'Full admin panels and reporting dashboards.',
 'Support for many languages or markets at once.',
 'Social features, gamification and complex permissions.',
 'Several payment options when one will do.',
 'Infrastructure designed for scale you do not have yet.'],
 },
 {
 heading: 'How WeCcelerate works with founders on MVPs',
 paragraphs: [
 'WeCcelerate is a Venture Builder in Israel since 2018, active in Tel Aviv and Jerusalem and recognized by the Israel Innovation Authority. We work with founders on defining what the MVP must test, scoping it and building it. Our MedTech track with Leumit Health Services gives founders clinical expertise, regulatory guidance, data access and pilot opportunities, subject to the required approvals.'],
 }],
 howToSteps: [
 { name: 'Write the key assumption', text: 'State in one sentence the assumption your business depends on, and what result would prove or disprove it.' },
 { name: 'Cut the scope', text: 'Keep only the features the test cannot work without. Do the rest by hand or later.' },
 { name: 'Choose simple, proven technology', text: 'Use tools the team knows and managed services, and keep the code and accounts in the company\'s name.' },
 { name: 'Build in short cycles', text: 'Demo progress at the end of each cycle and cut scope early when needed.' },
 { name: 'Launch to real users', text: 'Release to people from the target audience and track activation, retention and commitment.' },
 { name: 'Decide on the evidence', text: 'Continue, adjust or change direction based on what users actually did.' },
 { name: 'Talk to WeCcelerate', text: 'Book an introductory call about scoping and building your MVP.', url: 'https://weccelerate.co.il/services/digital-product' }],
 faqs: [
 {
 q: 'What is a minimum viable product?',
 a: 'A minimum viable product (MVP) is the smallest version of a product that lets you learn whether your key assumption about customers is true. Eric Ries defines it as the version of a new product that allows a team to collect the maximum amount of validated learning about customers with the least effort.',
 },
 {
 q: 'How long does it take to build an MVP?',
 a: 'It depends mainly on scope. A narrow MVP that tests one assumption on one platform can be built much faster than a product with several user types, native mobile apps, payments and integrations. Short development cycles with regular demos help you see progress and cut scope early when the timeline grows.',
 },
 {
 q: 'How do I know if my MVP worked?',
 a: 'Decide before launch what result would prove or disprove your assumption. Then measure behavior, not only opinions: whether new users reach the core value, whether they come back, and whether they pay, sign a pilot or commit in another concrete way. Qualitative feedback helps explain the numbers you see.',
 },
 {
 q: 'Can I build an MVP without a developer?',
 a: 'Often, yes. No-code and low-code tools can be enough to test whether users want the solution, and some MVPs are partly manual behind the scenes. The trade-off is that you may need to rebuild once the product grows. Make sure you still own the accounts and the data.',
 },
 {
 q: 'What should I leave out of an MVP?',
 a: 'Leave out anything that does not help answer the question you are testing. Typical examples are full admin panels and reports, support for many languages, social features and gamification, complex permissions, several payment options and infrastructure built for scale you do not have yet. Add them later if users need them.',
 }],
 sources: [
 { title: 'Minimum Viable Product: a guide', url: 'http://www.startuplessonslearned.com/2009/08/minimum-viable-product-guide.html', publisher: 'Eric Ries, Startup Lessons Learned' },
 { title: 'What\'s A Startup? First Principles.', url: 'https://steveblank.com/2010/01/25/whats-a-startup-first-principles/', publisher: 'Steve Blank' }],
 relatedGuideSlugs: ['app-development-cost-israel', 'cto-as-a-service-israel', 'how-to-start-a-startup-israel', 'startup-pitch-deck'],
 ctaServicePath: '/services/digital-product',
 ctaLabel: 'Talk to us about building your MVP',
 },

 // ---------------------------------------------------------------------------
 // 10. CTO AS A SERVICE FOR ISRAELI STARTUPS
 // ---------------------------------------------------------------------------
 // Sources (checked 2026-10-22): none needed. Pure-advice guide with no numbers, dates or legal claims.
 // Removed as unverifiable: "10-20 hours per week", "5-15% equity" for a full-time CTO, "at least 10 years of
 // experience", "5-10 developers" threshold, week-by-week onboarding plan, "always sign an NDA / non-compete"
 // promises, weekly office hours and engineering-network claims about WeCcelerate.
 {
 slug: 'cto-as-a-service-israel',
 hebrewSlug: 'cto-as-a-service',
 category: 'product-development',
 targetKeyword: 'CTO as a Service Israel',
 relatedKeywords: [
 'fractional CTO Israel',
 'hire CTO for startup',
 'when do you need a CTO',
 'startup without technical co-founder',
 'technical due diligence startup'],
 h1: 'CTO as a Service Israel: when a fractional CTO makes sense for your startup',
 metaTitle: 'CTO as a Service in Israel: When It Fits | WeCcelerate',
 metaDescription:
 'CTO as a Service for Israeli startups: what a fractional CTO does, when it fits, what to put in the agreement, and how to plan the move to a full-time CTO.',
 speakableAnswer:
 'CTO as a Service means a startup works with an experienced technology leader part-time instead of hiring a full-time CTO. The fractional CTO owns technical decisions, such as architecture, the development plan, hiring and vendor oversight, and represents the technology to investors, until the company is ready to hire its own CTO.',
 lastUpdated: '2026-10-22',
 readingTimeMinutes: 5,
 sections: [
 {
 heading: 'What is CTO as a Service?',
 paragraphs: [
 'CTO as a Service is an arrangement in which an experienced technology leader works with a startup part-time and takes responsibility for its technical decisions. It is also called a fractional CTO.',
 'The fractional CTO is not just a developer for hire. The role is to decide what to build and how, to make sure the people building it are doing it well, and to be accountable for the technical side toward the founders, the board and investors.'],
 },
 {
 heading: 'When does a startup need CTO as a Service?',
 paragraphs: [
 'CTO as a Service fits when a startup needs senior technical judgment but cannot yet justify, or find, a full-time CTO. Typical situations:'],
 list: [
 'A business or domain founder with no technical co-founder who needs to choose a technology path and a development team.',
 'A startup working with an outside development company that needs someone on its side to review the work.',
 'A young technical team that needs senior guidance on architecture, security or scaling.',
 'A company preparing for fundraising that needs a credible technical plan and someone to handle technical due diligence.'],
 },
 {
 heading: 'What does a fractional CTO do?',
 paragraphs: [
 'A fractional CTO owns the technical direction of the company and checks that it is carried out. The scope should be written down, but it usually includes:'],
 list: [
 'Choosing the architecture, the main technologies and the cloud setup.',
 'Turning the product plan into a technical roadmap and estimates.',
 'Hiring developers or choosing and managing an outside development vendor.',
 'Reviewing code, security and quality practices.',
 'Making sure the company owns its code, accounts, data and IP.',
 'Presenting the technology to investors and answering technical due diligence.'],
 },
 {
 heading: 'CTO as a Service or a technical co-founder?',
 paragraphs: [
 'A fractional CTO solves a gap for a period of time. A technical co-founder is a long-term owner of the company. Investors in early-stage companies usually care about who will lead technology in the long run, so treat CTO as a Service as a bridge, not a permanent substitute, if technology is core to your product.',
 'The bridge can still be valuable: it lets you make sound decisions now, build a first version and recruit a full-time CTO later from a stronger position.'],
 },
 {
 heading: 'How do you choose a fractional CTO?',
 paragraphs: [
 'Choose a fractional CTO by checking relevant experience, independence and how they communicate with non-technical founders. A strong résumé matters less than whether the person has made the kind of decisions your company faces now.'],
 list: [
 'Relevant experience: have they built and shipped products of a similar type, such as a SaaS platform, a mobile app, a data product or regulated medical software?',
 'Stage fit: have they worked with companies at your stage, with a small budget and an unfinished product?',
 'Independence: if they also sell development services, how will they review that work objectively?',
 'Communication: can they explain trade-offs in plain language and write down decisions?',
 'Availability: how quickly can they respond when something breaks or an investor asks a question?',
 'References: speak with founders they worked with, including at least one where things did not go smoothly.'],
 },
 {
 heading: 'What should the agreement include?',
 paragraphs: [
 'Put the arrangement in writing, with clear scope and ownership. Ask your lawyer to cover:'],
 list: [
 'Scope of responsibility, availability and how decisions are documented.',
 'Assignment of all IP and work product to the company.',
 'Confidentiality, and any limits on working with competitors.',
 'Access to code repositories and accounts, held in the company\'s name.',
 'How the engagement ends and how knowledge is handed over.',
 'Payment terms, and if equity is part of it, vesting on the same logic as for founders.'],
 },
 {
 heading: 'When should you hire a full-time CTO?',
 paragraphs: [
 'Hire a full-time CTO when technology leadership becomes a daily, full-time job: the in-house team is growing, the product is complex, or investors expect a dedicated technology leader. The fractional CTO can help define the role, interview candidates and hand over the codebase and decisions in an orderly way.',
 'Plan the handover from the start. Keep architecture decisions, the roadmap and access lists documented as you go, so that a new CTO can take over without depending on one person\'s memory.'],
 },
 {
 heading: 'Common mistakes with outsourced technology leadership',
 paragraphs: [
 'These mistakes are common and avoidable:'],
 list: [
 'Letting the development vendor also act as the company\'s technical judge.',
 'Not writing down the scope, so nobody owns technical decisions.',
 'Code and cloud accounts held by a contractor instead of the company.',
 'Choosing technology for a future scale the company does not have yet.',
 'Waiting until due diligence to discover gaps in security, ownership or documentation.'],
 },
 {
 heading: 'How WeCcelerate works with founders on technology',
 paragraphs: [
 'WeCcelerate is a Venture Builder in Israel since 2018, active in Tel Aviv and Jerusalem and recognized by the Israel Innovation Authority. We work with founders on technical leadership, product definition and building the first version until the company has its own CTO. Scope and terms are set per venture. Our MedTech track with Leumit Health Services adds clinical expertise, regulatory guidance, data access and pilot opportunities.'],
 }],
 faqs: [
 {
 q: 'What is CTO as a Service?',
 a: 'CTO as a Service, or a fractional CTO, is an experienced technology leader who works with a startup part-time and is responsible for its technical decisions. That includes architecture, the technical roadmap, hiring or vendor oversight, code and security review, and representing the technology to investors, until the startup hires its own CTO.',
 },
 {
 q: 'When does a startup need a fractional CTO?',
 a: 'A fractional CTO fits when a startup needs senior technical judgment but is not ready for a full-time CTO. Common cases are a non-technical founder choosing a technology path, a startup that uses an outside development company and needs someone on its side, and a company preparing for technical due diligence.',
 },
 {
 q: 'Does a fractional CTO write code?',
 a: 'Sometimes, but that is not the main job. A fractional CTO decides what to build and how, reviews the work of developers or vendors, and is accountable for technical quality and ownership. If the company needs someone mainly to write code, it needs a developer or a development team, with the CTO overseeing them.',
 },
 {
 q: 'Can CTO as a Service replace a technical co-founder?',
 a: 'For a period of time, yes, but usually not permanently if technology is core to the product. Investors care about who will lead technology over the long term. Treat CTO as a Service as a bridge that lets you make good decisions now and recruit a full-time CTO or technical co-founder from a stronger position.',
 },
 {
 q: 'What should a CTO as a Service agreement include?',
 a: 'It should define the scope of responsibility and availability, assign all IP and work product to the company, cover confidentiality, keep code and accounts in the company\'s name, and explain how the engagement ends and how knowledge is handed over. If equity is part of the deal, it should vest like founder equity.',
 }],
 relatedGuideSlugs: ['how-to-build-mvp', 'app-development-cost-israel', 'how-to-start-a-startup-israel', 'vesting-explained'],
 ctaServicePath: '/services/digital-product',
 ctaLabel: 'Talk to us about CTO as a Service',
 },

 // ---------------------------------------------------------------------------
 // 11. BUSINESS PLAN FOR STARTUPS
 // ---------------------------------------------------------------------------
 // Sources (checked 2026-10-22):
 // - Sequoia Capital, "Writing a business plan": https://sequoiacap.com/article/writing-a-business-plan/
 //   sections: company purpose ("define your company in a single declarative sentence"), problem, solution
 //   ("explain your eureka moment"), why now, market potential, competition / alternatives, business model,
 //   team, financials ("if you have any"), vision ("what will you have built in five years?").
 // - Israel Innovation Authority, "Royalties & Intellectual Property":
 //   https://innovationisrael.org.il/en/royalties-intellectual-property/  (grant repayment through royalties of
 //   3%-5% of annual revenues plus SOFR-based interest) - relevant for modeling IIA grants in the financials.
 // Removed as unverifiable: page counts per section and "40-80 pages", growth rules of thumb, "investors spot a
 // bad model in two minutes", the 8-week WeCcelerate process and deliverables list.
 {
 slug: 'startup-business-plan',
 hebrewSlug: 'tochnit-iskit-startup',
 category: 'fundraising',
 targetKeyword: 'startup business plan',
 relatedKeywords: [
 'startup business plan template',
 'how to write a business plan',
 'investor business plan',
 'business plan vs pitch deck',
 'startup financial model'],
 h1: 'How to write a startup business plan investors will read',
 metaTitle: 'Startup Business Plan: What Investors Read | WeCcelerate',
 metaDescription:
 'How to write a startup business plan: the sections investors expect, based on Sequoia\'s guidance, how to build the financial model, and mistakes to avoid.',
 speakableAnswer:
 'A startup business plan explains what the company does, the problem and solution, why now, the market, competition, business model, team, financials and vision. Keep it short and evidence-based, build a financial model with explicit assumptions, and use the plan to make decisions, not only to impress investors.',
 lastUpdated: '2026-10-22',
 readingTimeMinutes: 6,
 sections: [
 {
 heading: 'What is a startup business plan for?',
 paragraphs: [
 'A startup business plan is a written explanation of how the company will create and capture value, and what it needs to get there. Investors use it to check whether the story in the pitch holds together. Founders use it to test their own thinking and set milestones.',
 'For an early-stage startup the plan does not need to be long. It needs to be clear about what you know, what you assume and how you will find out whether your assumptions are right.'],
 },
 {
 heading: 'Which sections should a startup business plan include?',
 paragraphs: [
 'Sequoia Capital\'s guidance on writing a business plan lists ten sections, which work well as a structure for most startups:'],
 list: [
 'Company purpose: define the company in a single declarative sentence.',
 'Problem: describe the customer\'s pain and how it is handled today.',
 'Solution: explain your insight and why your approach works.',
 'Why now: what has changed that makes this the right moment.',
 'Market potential: who the customer is and how big the market can be.',
 'Competition and alternatives: who else solves the problem, including what customers do today, and how you plan to win.',
 'Business model: how you make money and reach customers.',
 'Team: the founders and key people, and why they fit.',
 'Financials: the numbers you have and the plan ahead.',
 'Vision: what you will have built in five years if everything goes well.'],
 },
 {
 heading: 'How do you write the executive summary?',
 paragraphs: [
 'The executive summary should let a busy reader understand the whole business in one or two pages. Write it last, after the other sections are clear.',
 'Cover, in order: what the company does and for whom, the problem and solution, the evidence so far, the market, the team, and what you are raising and what it will achieve. Use plain language and specific facts rather than adjectives.'],
 },
 {
 heading: 'How do you build the financial model?',
 paragraphs: [
 'Build the financial model from explicit, testable assumptions, not from a target number at the end. Every revenue line should trace back to drivers you can explain: how many customers, at what price, acquired through which channel, at what cost.'],
 list: [
 'Show monthly detail for the period the round will fund, and annual figures after that.',
 'Separate assumptions into one place so readers can see and change them.',
 'Include hiring, salaries and other operating costs, and the cash runway they imply.',
 'If you plan to use Israel Innovation Authority grants, model the repayment: royalties of 3% to 5% of annual revenues plus SOFR-based interest, until the grant is repaid.',
 'Show what the money you are raising pays for, and which milestone it reaches.'],
 },
 {
 heading: 'How do you show the market size credibly?',
 paragraphs: [
 'Show the market size from the bottom up: start from the customers you can actually reach, multiply by what they would pay, and explain each number. This is more convincing than quoting a large industry figure and claiming a small share of it.',
 'Name your first customer segment precisely, for example a type of clinic, company size or region, and estimate how many such customers exist and how you will reach them. Then explain how the company can expand to further segments or markets. Cite the source of every external figure you use, and keep the date of the data, so readers can check it.'],
 },
 {
 heading: 'Business plan or pitch deck: what is the difference?',
 paragraphs: [
 'A pitch deck is a short visual story designed to earn a meeting or support a live presentation. A business plan is a written document that explains the same story in more depth and with the supporting numbers.',
 'Many early investors start with the deck and ask for the financial model and more detail later. Keep the two consistent: the numbers, the market and the ask should match. See /en/guides/startup-pitch-deck.'],
 },
 {
 heading: 'Investor business plan or bank business plan?',
 paragraphs: [
 'A plan for venture investors and a plan for a bank answer different questions. Venture investors want to see how large the company can become and what could make it a big outcome. A bank wants to see how a loan will be repaid, from cash flow and collateral.',
 'If you need both, write two versions from the same model rather than one document that tries to do both.'],
 },
 {
 heading: 'Common business plan mistakes',
 paragraphs: [
 'These mistakes make investors stop reading:'],
 list: [
 'A market size built top-down from a huge number, with no realistic path to your share.',
 'Revenue projections with no explanation of how customers are acquired.',
 'Ignoring competitors, or claiming there are none.',
 'Costs that leave out salaries, regulation, sales or support.',
 'A plan that does not match the deck or the financial model.',
 'Long text that hides the key facts.'],
 },
 {
 heading: 'How WeCcelerate works with founders on business plans',
 paragraphs: [
 'WeCcelerate is a Venture Builder in Israel since 2018, active in Tel Aviv and Jerusalem and recognized by the Israel Innovation Authority. We work with founders on the business model, the plan, the financial model and the pitch, as one consistent story. MedTech founders can also join our track with Leumit Health Services, which offers clinical expertise, regulatory guidance, data access and pilot opportunities.'],
 }],
 faqs: [
 {
 q: 'What should a startup business plan include?',
 a: 'A strong startup business plan covers the company purpose, the problem, the solution, why now, market potential, competition and alternatives, the business model, the team, financials and a vision for the next five years. This follows Sequoia Capital\'s guidance on writing a business plan, and it works for most early-stage startups.',
 },
 {
 q: 'How long should a startup business plan be?',
 a: 'There is no required length. For an early-stage startup, a short, clear plan with a one or two page executive summary and a separate financial model is usually more useful than a long document. Investors want to find the key facts quickly, so every section should earn its place.',
 },
 {
 q: 'What is the difference between a business plan and a pitch deck?',
 a: 'A pitch deck is a short visual story for a meeting or presentation. A business plan is a written document that explains the same story in more depth, with supporting numbers. Many investors start with the deck and ask for the financial model and detail later, so the two must stay consistent.',
 },
 {
 q: 'How detailed should the financial model be?',
 a: 'Show monthly detail for the period the round will fund and annual figures after that. Keep all assumptions in one place, link revenue to clear drivers such as customers, price and acquisition cost, include salaries and operating costs, and show the cash runway. If you use IIA grants, model their royalty repayment too.',
 },
 {
 q: 'Can I write a startup business plan myself?',
 a: 'Yes, and founders should own it, because the plan reflects how they think about the business. Outside help is useful for checking market assumptions, building the financial model and getting feedback from people who read plans regularly. What matters is that the founders can defend every number in it.',
 }],
 sources: [
 { title: 'Writing a business plan', url: 'https://sequoiacap.com/article/writing-a-business-plan/', publisher: 'Sequoia Capital' },
 { title: 'Royalties & Intellectual Property', url: 'https://innovationisrael.org.il/en/royalties-intellectual-property/', publisher: 'Israel Innovation Authority' }],
 relatedGuideSlugs: ['startup-pitch-deck', 'raise-funding-israel', 'how-to-start-a-startup-israel', 'venture-vs-startup'],
 ctaServicePath: '/services/business-consulting',
 ctaLabel: 'Work on your business plan with WeCcelerate',
 },

 // ---------------------------------------------------------------------------
 // 12. VESTING EXPLAINED
 // ---------------------------------------------------------------------------
 // Sources (checked 2026-10-22):
 // - Y Combinator, "How to Split Equity Among Co-Founders" (Michael Seibel, Dec 2, 2015):
 //   https://www.ycombinator.com/blog/splitting-equity-among-founders/
 //   "a typical setup is to have four years of vesting with a one year 'cliff'"; leave within a year = nothing;
 //   25% at one year; then 1/48 of total stock each month; fully vested at four years.
 // - Income Tax Ordinance [New Version], s.102 (Nevo consolidated text):
 //   https://www.nevo.co.il/law_html/law01/255_001.htm
 //   "employee" includes an office holder but excludes a controlling shareholder; trustee approved by the
 //   assessing officer; capital gains track: period of 24 months from allocation and deposit with the trustee;
 //   employment income track: 12 months; allocation via trustee not taxed at allocation, tax at "exercise"
 //   (transfer from trustee or sale by trustee); trustee route excludes an employee who is a controlling shareholder
 //   at or following allocation; election notified with plan approval request at least 30 days before allocation;
 //   capital gains track held to end of period taxed at 25%, earlier release taxed as employment income.
 // - 26 CFR 1.83-2 (eCFR): https://www.ecfr.gov/current/title-26/chapter-I/subchapter-A/part-1/subject-group-ECFR3a0c3c6bb0c14b0/section-1.83-2
 //   section 83(b) election filed not later than 30 days after the date the property was transferred.
 // Removed as unverifiable: "every VC will require vesting / the round won't close", "ESOP 10-20%", "double
 // trigger is standard", the old (wrong) description of 102 ("options sign with vesting and maturity after 2
 // years"), the WeCcelerate "founder agreement" and attorney-network claims.
 {
 slug: 'vesting-explained',
 hebrewSlug: 'vesting-hesber',
 category: 'fundraising',
 targetKeyword: 'vesting explained',
 relatedKeywords: [
 'what is vesting',
 'startup vesting',
 'vesting schedule',
 'vesting cliff',
 'founders vesting',
 'section 102 options Israel'],
 h1: 'Startup equity vesting explained: cliffs, schedules and leavers',
 metaTitle: 'Vesting Explained: Cliff, Schedule, Leavers | WeCcelerate',
 metaDescription:
 'Vesting explained for Israeli founders: how a four-year schedule with a one-year cliff works, good and bad leavers, acceleration, Section 102 options and 83(b).',
 speakableAnswer:
 'Vesting means founders and employees earn their shares or options over time. A common structure is four years with a one-year cliff: nothing vests in the first year, a quarter vests at the one-year mark, and the rest vests monthly. If someone leaves early, the company can usually buy back or cancel the unvested part.',
 lastUpdated: '2026-10-22',
 readingTimeMinutes: 6,
 sections: [
 {
 heading: 'What is vesting?',
 paragraphs: [
 'Vesting is a contract mechanism under which shares or options are earned over time, rather than owned outright from day one. If a founder or employee leaves before their equity has fully vested, the company can usually buy back or cancel the unvested part.',
 'Vesting protects the people who stay. Without it, a co-founder who leaves after a few months could keep a large stake in a company that others go on to build for years. Investors check founder vesting in due diligence for exactly this reason.'],
 },
 {
 heading: 'How does a four-year vesting schedule with a one-year cliff work?',
 paragraphs: [
 'In the most common structure, which Y Combinator describes as a typical setup, shares vest over four years with a one-year cliff. The cliff is the first year: if you leave before it ends, nothing has vested.'],
 list: [
 'Before 12 months: 0% vested.',
 'At 12 months: 25% vests at once.',
 'After that: 1/48 of the total vests each month.',
 'At 48 months: 100% vested.'],
 },
 {
 heading: 'What does vesting look like in numbers?',
 paragraphs: [
 'Here is a worked example for a founder holding 30% of the company on a four-year schedule with a one-year cliff:'],
 list: [
 'Month 11: 0% of the company vested.',
 'Month 12: 7.5% vested (a quarter of 30%).',
 'Month 24: 15% vested.',
 'Month 36: 22.5% vested.',
 'Month 48: the full 30% vested.'],
 },
 {
 heading: 'What happens when a founder leaves: good leaver and bad leaver',
 paragraphs: [
 'What happens to a leaver\'s shares depends on the agreement, and many agreements distinguish between good and bad leavers. The definitions are contract terms, not law, so they must be written precisely.'],
 list: [
 'Good leaver: leaves for reasons the agreement treats as legitimate, such as illness or termination without cause. Usually keeps the vested part.',
 'Bad leaver: leaves in circumstances the agreement defines as a breach, such as joining a competitor or serious misconduct. The agreement may let the company buy back even vested shares, often at a low price.',
 'Avoid vague definitions such as "any reason the board decides". Both sides should know in advance which category applies.'],
 },
 {
 heading: 'What is vesting acceleration?',
 paragraphs: [
 'Acceleration means some or all unvested equity vests early when a defined event happens, usually a sale of the company. With single-trigger acceleration, the sale alone triggers it. With double-trigger acceleration, it takes the sale plus a second event, typically termination of the founder or employee after the sale.',
 'Acquirers often want key people to stay after a deal, so acceleration terms are negotiated. Discuss them with your lawyer when you sign, not when an offer arrives.'],
 },
 {
 heading: 'How does vesting work for employee options in Israel?',
 paragraphs: [
 'Employee options usually vest on a schedule similar to founders\' shares. In Israel, their tax treatment is set mainly by Section 102 of the Income Tax Ordinance, which allows options and shares to be allocated to employees through a trustee approved by the tax assessing officer.',
 'Under the trustee route, the employee is not taxed when the options are granted. Tax is due when the shares are sold by the trustee or transferred from the trustee to the employee. The company chooses a track and notifies the tax assessing officer when it asks for approval of the plan, at least 30 days before the allocation.',
 'On the capital gains track, the shares must stay with the trustee until 24 months have passed from allocation and deposit with the trustee. If they do, the benefit is taxed as a capital gain at 25%. If they are released earlier, the benefit is taxed as employment income. On the employment income track, the trustee period is 12 months.',
 'Note that the trustee route does not apply to an employee who is a controlling shareholder at or following the allocation, so founders who control the company generally fall outside it. Get tax advice before you set up an option plan.'],
 },
 {
 heading: 'Does vesting apply to investors?',
 paragraphs: [
 'No. Investors who buy shares for cash receive them outright, because they have already paid in full. Vesting applies to people who receive equity in exchange for future work, such as founders, employees, advisors and service providers who are paid partly in equity.',
 'When new investors come in, they sometimes ask founders to restart or extend vesting, especially if the founders are already largely vested. That is a negotiation point, so understand what you are agreeing to before you sign the term sheet.'],
 },
 {
 heading: 'What is an 83(b) election?',
 paragraphs: [
 'An 83(b) election is a US tax filing that matters for founders who are US taxpayers and receive shares subject to vesting, typically in a US company. It lets them include the value of the shares in income when the shares are transferred, rather than as they vest.',
 'The deadline is strict. Under US Treasury regulations, the election must be filed no later than 30 days after the date the shares were transferred. Check with a US tax adviser whether it applies to you.'],
 },
 {
 heading: 'How WeCcelerate works with founders on equity',
 paragraphs: [
 'WeCcelerate is a Venture Builder in Israel since 2018, active in Tel Aviv and Jerusalem and recognized by the Israel Innovation Authority. We help founders understand founder agreements, vesting and cap table structure before they sign, working alongside the founders\' own lawyers and accountants. Our MedTech track with Leumit Health Services adds clinical expertise, regulatory guidance, data access and pilot opportunities.'],
 }],
 faqs: [
 {
 q: 'What is vesting in a startup?',
 a: 'Vesting means founders and employees earn their shares or options over time instead of owning them outright from the start. If someone leaves before their equity fully vests, the company can usually buy back or cancel the unvested part. Vesting protects the founders and employees who stay and build the company.',
 },
 {
 q: 'What is a vesting cliff?',
 a: 'A cliff is an initial period during which nothing vests. In the common four-year schedule with a one-year cliff, which Y Combinator describes as typical, a person who leaves before 12 months gets nothing. At 12 months a quarter vests at once, and after that 1/48 of the total vests each month.',
 },
 {
 q: 'Do founders need vesting?',
 a: 'Vesting is not required by law, but it is strongly recommended for every founder, including the CEO. It protects the remaining founders if someone leaves early, and investors check founder vesting in due diligence. Put it in the founder agreement when you start working together, with clear good leaver and bad leaver terms.',
 },
 {
 q: 'What is the difference between single-trigger and double-trigger acceleration?',
 a: 'Both make unvested equity vest early. With single-trigger acceleration, a sale of the company alone causes it. With double-trigger acceleration, it takes the sale plus a second event, usually termination of the founder or employee after the sale. These are negotiated contract terms, so agree on them with your lawyer up front.',
 },
 {
 q: 'How are employee options taxed in Israel?',
 a: 'Mainly under Section 102 of the Income Tax Ordinance. Through an approved trustee, there is no tax at grant, and tax is due when the shares are sold or released. On the capital gains track, if the trustee holds them for 24 months from allocation and deposit, the benefit is taxed as a capital gain at 25%.',
 },
 {
 q: 'Can a founder use Section 102?',
 a: 'Usually not if the founder controls the company. Section 102 of the Income Tax Ordinance defines "employee" to include office holders but excludes a controlling shareholder, and its trustee route does not apply to someone who is a controlling shareholder at or after the allocation. The rules are technical, so ask an Israeli tax adviser before granting equity.',
 }],
 sources: [
 { title: 'How to Split Equity Among Co-Founders', url: 'https://www.ycombinator.com/blog/splitting-equity-among-founders/', publisher: 'Y Combinator' },
 { title: 'Income Tax Ordinance [New Version], section 102 (Hebrew)', url: 'https://www.nevo.co.il/law_html/law01/255_001.htm', publisher: 'Nevo' },
 { title: '26 CFR 1.83-2: Election to include in gross income in year of transfer', url: 'https://www.ecfr.gov/current/title-26/chapter-I/subchapter-A/part-1/subject-group-ECFR3a0c3c6bb0c14b0/section-1.83-2', publisher: 'eCFR, US National Archives' }],
 relatedGuideSlugs: ['how-to-start-a-startup-israel', 'raise-funding-israel', 'cto-as-a-service-israel', 'what-is-venture-builder'],
 ctaServicePath: '/services/business-consulting',
 ctaLabel: 'Talk to us about founder agreements and vesting',
 },

 // ---------------------------------------------------------------------------
 // 13. VENTURE VS STARTUP - THE DIFFERENCE
 // ---------------------------------------------------------------------------
 // Sources (checked 2026-10-22):
 // - Steve Blank, "What's A Startup? First Principles." (Jan 25, 2010):
 //   https://steveblank.com/2010/01/25/whats-a-startup-first-principles/
 //   "an organization formed to search for a repeatable and scalable business model."
 // - Paul Graham, "Startup = Growth" (Sept 2012): https://www.paulgraham.com/growth.html
 //   "A startup is a company designed to grow fast."; "A barbershop isn't designed to grow fast."
 // Note: "venture" (מיזם) has no single formal definition; the distinction is presented as a practical one.
 // Removed as unverifiable: "10x+ per year", "7-12 years to exit", founder dilution figures ("15-25%",
 // "50%+", "20% by Series B"), "70+ hours a week", named companies (Sapiens, Verint, Wiz, Monday.com,
 // Lemonade), "Israel's leading Venture Builder", "WeCcelerate is a Startup Accelerator".
 {
 slug: 'venture-vs-startup',
 hebrewSlug: 'hevdel-mizam-startup',
 category: 'comparison',
 targetKeyword: 'venture vs startup',
 relatedKeywords: [
 'difference between venture and startup',
 'what is a venture',
 'startup or venture',
 'venture vs startup definition',
 'small business vs startup'],
 h1: 'Choosing your path: venture vs startup, and why the difference matters',
 metaTitle: 'Venture vs Startup: The Practical Difference | WeCcelerate',
 metaDescription:
 'Venture vs startup: what each term means, how growth, funding, risk and goals differ, and questions that help founders decide which path fits their business.',
 speakableAnswer:
 'A venture is any new business initiative. A startup is a specific kind of venture built to grow fast: Steve Blank defines it as an organization formed to search for a repeatable and scalable business model. Every startup is a venture, but many ventures, such as a services firm or a local business, are not startups.',
 lastUpdated: '2026-10-22',
 readingTimeMinutes: 5,
 sections: [
 {
 heading: 'What is the difference between a venture and a startup?',
 paragraphs: [
 'A venture is any new business initiative, while a startup is a venture designed to grow fast and at scale. Every startup is a venture, but not every venture is a startup.',
 'Two widely quoted definitions explain the difference. Steve Blank defines a startup as an organization formed to search for a repeatable and scalable business model. Paul Graham puts it more bluntly: a startup is a company designed to grow fast, and a barbershop is not designed to grow fast. A services firm, a local business or a social enterprise can all be excellent ventures without being startups.'],
 },
 {
 heading: 'How do ventures and startups differ in practice?',
 paragraphs: [
 'The label matters because it changes how you fund, staff and run the company. These are the main practical differences:'],
 list: [
 'Growth model: a startup is built for fast growth that does not require costs to grow at the same pace. Many ventures grow steadily and in proportion to the work they do.',
 'Business model: a startup is still searching for a repeatable and scalable model. Many ventures start with a known model, such as selling services or products in a familiar market.',
 'Funding: startups often rely on equity investors who expect a large outcome. Ventures more often use founder money, revenue, bank credit or smaller investors.',
 'Risk: startups accept a high chance of failure in exchange for a chance of a very large result. Many ventures aim for lower risk and earlier profitability.',
 'Success: for a startup, success usually means a large exit or a very large company. For a venture, it can mean a stable, profitable business that the founders own and run.',
 'Ownership: raising equity rounds dilutes founders over time. A venture funded by revenue or debt can keep ownership more concentrated.'],
 },
 {
 heading: 'How do you know which one you are building?',
 paragraphs: [
 'The answer depends on your market, your product and what you want from the business. These questions help:'],
 list: [
 'Is the market large enough to support a very large company?',
 'Can the product serve many more customers without costs rising at the same rate?',
 'Do you want outside investors who will expect fast growth and a large exit?',
 'Are you willing to give up a meaningful share of ownership along the way?',
 'How much risk, and how many years without a stable income, can you accept?'],
 },
 {
 heading: 'Do investors treat ventures and startups differently?',
 paragraphs: [
 'Yes. Venture capital funds look for companies that can grow very large, because a few big outcomes have to make up for many that fail. A business that will grow steadily but not explosively is usually not a fit for them, even if it is a very good business.',
 'That business may be a better fit for bank credit, revenue-based funding, strategic partners or private investors who want steady returns. Choosing the right kind of capital is as important as choosing the right investor.'],
 },
 {
 heading: 'Can a venture become a startup?',
 paragraphs: [
 'Sometimes. A services business can discover a product inside its work, for example a tool it built for its own clients, and spin it out as a startup. In practice this usually means a new business model, often a separate company, and a different way of funding and running it.',
 'The opposite also happens: a startup that does not find a scalable model may become a smaller, profitable business. Neither path is a failure if it matches what the founders and the market can support.'],
 },
 {
 heading: 'How does the choice affect the team and daily work?',
 paragraphs: [
 'A startup is usually built around experiments and speed, while many ventures are built around delivery and steady operations. That difference shows up in who you hire and how you spend each week.',
 'In a startup, the early team spends much of its time testing assumptions about customers, product and channels, and expects to change direction when the evidence says so. In a services venture or a local business, the early team spends more of its time serving customers well and running a reliable operation. Both need discipline, but they reward different skills and a different tolerance for uncertainty.'],
 },
 {
 heading: 'Why the distinction matters for founders',
 paragraphs: [
 'Using the wrong model creates real problems. A founder who raises venture capital for a business that cannot grow fast ends up with expectations the company cannot meet. A founder with a real startup opportunity who avoids outside capital may grow too slowly and lose the market to better-funded competitors.',
 'Decide early, and revisit the decision as you learn more about customers and the market.'],
 },
 {
 heading: 'How WeCcelerate works with founders on both paths',
 paragraphs: [
 'WeCcelerate is a Venture Builder in Israel since 2018, active in Tel Aviv and Jerusalem and recognized by the Israel Innovation Authority. We work with founders on deciding which model fits their idea and on the business model, product and funding plan that follow from it. Our MedTech track with Leumit Health Services gives founders clinical expertise, regulatory guidance, data access and pilot opportunities.'],
 }],
 faqs: [
 {
 q: 'What is the short difference between a venture and a startup?',
 a: 'A venture is any new business initiative. A startup is a venture designed to grow fast and at scale. Steve Blank defines a startup as an organization formed to search for a repeatable and scalable business model. Every startup is a venture, but a services firm or a local business can be a venture without being a startup.',
 },
 {
 q: 'Is a small business a startup?',
 a: 'Usually not. Paul Graham defines a startup as a company designed to grow fast and gives a barbershop as an example of a business that is not. A small business can be very successful and profitable, but if it is not built to grow fast and at scale, it is a venture rather than a startup.',
 },
 {
 q: 'How do I know if my idea is a startup or a venture?',
 a: 'Ask whether the market can support a very large company, whether the product can serve many more customers without costs rising at the same rate, and whether you want outside investors who expect fast growth. If the answers are mostly no, you are probably building a venture, which is a legitimate choice.',
 },
 {
 q: 'Do venture capital funds invest in ventures that are not startups?',
 a: 'Rarely. Venture capital funds look for companies that can grow very large, because a few big outcomes must make up for many failures. A business that grows steadily but not explosively is usually a better fit for bank credit, revenue-based funding, strategic partners or private investors seeking steady returns.',
 },
 {
 q: 'Can a business start as a venture and become a startup?',
 a: 'Sometimes. A services business may find a scalable product inside its work, such as a tool built for its own clients, and spin it out. This usually requires a new business model, often a separate company, and a different way of funding and running it. The reverse also happens when a startup becomes a smaller, profitable business.',
 }],
 sources: [
 { title: 'What\'s A Startup? First Principles.', url: 'https://steveblank.com/2010/01/25/whats-a-startup-first-principles/', publisher: 'Steve Blank' },
 { title: 'Startup = Growth', url: 'https://www.paulgraham.com/growth.html', publisher: 'Paul Graham' }],
 relatedGuideSlugs: ['what-is-venture-builder', 'how-to-start-a-startup-israel', 'raise-funding-israel', 'startup-business-plan'],
 ctaServicePath: '/services',
 ctaLabel: 'Talk to us about the right path for you',
 },];

// =============================================================================
// HELPERS
// =============================================================================

export function getGuideBySlugEn(slug: string): GuideEn | undefined {
 return GUIDES_EN.find((g) => g.slug === slug);
}

export function getRelatedGuidesEn(guide: GuideEn): GuideEn[] {
 return guide.relatedGuideSlugs.map((slug) => getGuideBySlugEn(slug)).filter((g): g is GuideEn => Boolean(g));
}

export function getEnSlugFromHebrew(hebrewSlug: string): string | undefined {
 return GUIDES_EN.find((g) => g.hebrewSlug === hebrewSlug)?.slug;
}

export function getHebrewSlugFromEn(enSlug: string): string | undefined {
 return GUIDES_EN.find((g) => g.slug === enSlug)?.hebrewSlug;
}
