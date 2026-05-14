/**
 * MedTech Solutions Page - Leumit Subdomain
 * 
 * Route: leumit.weccelerate.co.il/services
 * 
 * Target Audience: Medical/HealthTech Startups
 * Focus: Regulatory, Clinical Trials, Data Validation
 * 
 * GEO Strategy:
 * - Accordion FAQ for each service (AI-extractable answers)
 * - Service structured data (JSON-LD)
 * - Question-based H3 headers
 */

import { Metadata } from 'next';
import Link from 'next/link';
import {
 ArrowLeft,
 ChevronDown,
 Shield,
 FlaskConical,
 Database,
 FileCheck,
 Stethoscope,
 Lock,
 Globe,
 Clock,
 CheckCircle2,
 ArrowUpRight,
 HelpCircle,
 Building2,
 Users,
 Award,
} from 'lucide-react';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = {
 title: { absolute: 'שירותי MedTech | ייעוץ רגולטורי, ניסויים קליניים ואימות דאטה - WeCcelerate' },
 description: 'שירותי MedTech מקצועיים לסטארטאפים רפואיים: ייעוץ רגולטורי (CE, משרד הבריאות), גישה לניסויים קליניים, ואימות דאטה רפואי. בשיתוף לאומית שירותי בריאות.',
 keywords: [
 'ייעוץ רגולטורי',
 'אישור CE',
 'ניסויים קליניים ישראל',
 'דאטה רפואי',
 'סטארטאפ רפואי',
 'MedTech Israel',
 'אישור משרד הבריאות',
 ],
 openGraph: {
 title: 'שירותי MedTech - WeCcelerate x Leumit',
 description: 'ייעוץ רגולטורי, ניסויים קליניים ואימות דאטה לסטארטאפים רפואיים',
 type: 'website',
 locale: 'he_IL',
 },
};

// =============================================================================
// SERVICE DATA
// =============================================================================

interface ServiceFAQ {
 question: string;
 questionEn: string;
 answer: string;
}

interface Service {
 id: string;
 icon: React.ComponentType<{ className?: string }>;
 title: string;
 titleEn: string;
 subtitle: string;
 description: string;
 features: string[];
 faqs: ServiceFAQ[];
 cta: {
 text: string;
 href: string;
 };
 stats?: {
 value: string;
 label: string;
 };
}

const medtechServices: Service[] = [
 {
 id: 'regulatory',
 icon: Shield,
 title: 'ייעוץ רגולטורי',
 titleEn: 'Regulatory Consulting',
 subtitle: 'CE Mark, משרד הבריאות',
 description: 'אנו עוזרים בכל תהליך הרגולציה, עם דגש על סיוע ליזם להתנהל בצורה נכונה ופשוטה יחסית בתוך עולם הרגולציה — מהכנת התיק הרגולטורי ועד קבלת האישורים.',
 features: [
 'הכנת תיק טכני (Technical File)',
 'הסמכת CE Mark לשוק האירופי',
 'אישור משרד הבריאות הישראלי',
 'ייעוץ סיווג מכשיר רפואי',
 'הכנה לביקורות ואודיטים',
 ],
 faqs: [
 {
 question: 'כמה זמן לוקח לקבל אישור רגולטורי?',
 questionEn: 'How long does regulatory approval take?',
 answer: 'תהליך אישור CE אורך בממוצע בלוחות זמנים תלויי-מסלול מהגשת התיק המלא. אנו מסייעים בהכנת התיק בצורה מקיפה שמפחיתה את הסיכוי לבקשות הבהרה ומקצרת את הזמן לאישור. לפרויקטים מורכבים יותר, התהליך יכול להימשך בלוחות זמנים תלויי-מסלול.',
 },
 {
 question: 'האם אתם עוזרים גם עם אישור CE באירופה?',
 questionEn: 'Do you help with CE Mark approval in Europe?',
 answer: 'כן, אנו מספקים ליווי מלא לקבלת סימון CE תחת רגולציית MDR החדשה. זה כולל הכנת תיק טכני, ניהול קשר עם Notified Body, והכנה לביקורות. יש לנו ניסיון עם חברות מובילות באירופה.',
 },
 {
 question: 'מה ההבדל בין סיווג Class I ל-Class II?',
 questionEn: 'What is the difference between Class I and Class II devices?',
 answer: 'מכשירים מסוג Class I נחשבים לסיכון נמוך ולרוב פטורים מהגשת 510(k). מכשירים מסוג Class II הם בסיכון בינוני ודורשים הגשת 510(k) להוכחת שקילות מהותית למוצר קיים. אנו עוזרים בהגדרת הסיווג הנכון ובבניית האסטרטגיה הרגולטורית המתאימה.',
 },
 ],
 cta: {
 text: 'קבלו ייעוץ רגולטורי',
 href: '/contact?service=regulatory',
 },
 stats: {
 value: '95%',
 label: 'אחוז הצלחה באישורים',
 },
 },
 {
 id: 'early-stage',
 icon: FlaskConical,
 title: 'חוות דעת רפואיות וייעוץ מוקדם',
 titleEn: 'Medical Opinions & Early-Stage Consulting',
 subtitle: 'חוות דעת מומחים, סקירות שוק ורגולציה',
 description: 'חוות דעת מרופאים מומחים לטובת בחינת רלוונטיות המיזם מבחינה קלינית. עזרה בשלבים המוקדמים — סקירות שוק, ייעוץ רגולטורי ובחינת כדאיות.',
 features: [
 'חוות דעת מרופאים מומחים',
 'בחינת רלוונטיות קלינית למיזם',
 'סקירות שוק מעמיקות',
 'ליווי רגולטורי בשלבים מוקדמים',
 'ניתוח מתחרים בתחום ה-MedTech',
 'ייעוץ מומחים לבחינת כדאיות',
 ],
 faqs: [
 {
 question: 'איך מתבצע תהליך קבלת חוות דעת רפואית?',
 questionEn: 'How does the medical opinion process work?',
 answer: 'אנו מחברים את היזם לרופאים מומחים בתחום הרלוונטי מתוך רשת לאומית. הרופאים בוחנים את המיזם מבחינה קלינית ומספקים חוות דעת מקצועית על הרלוונטיות, הפוטנציאל והאתגרים. התהליך אורך בממוצע בלוחות זמנים מותאמים.',
 },
 {
 question: 'מה כוללת סקירת שוק בתחום ה-MedTech?',
 questionEn: 'What does a MedTech market survey include?',
 answer: 'סקירת השוק כוללת מיפוי מתחרים, ניתוח מגמות, הערכת גודל שוק, זיהוי הזדמנויות וסקירת רגולציה רלוונטית. אנו מספקים דו"ח מפורט שמסייע ליזם לקבל החלטות מושכלות ולהציג את המיזם בפני משקיעים.',
 },
 {
 question: 'האם הייעוץ מתאים למיזמים בשלבים מוקדמים מאוד?',
 questionEn: 'Is the consulting suitable for very early-stage ventures?',
 answer: 'בהחלט. הדגש שלנו הוא דווקא על שלבים מוקדמים — שם ניתן לחסוך הרבה זמן וכסף על ידי בחינה מקצועית של הכדאיות, הרלוונטיות הקלינית ומסלול הרגולציה הנכון.',
 },
 ],
 cta: {
 text: 'קבלו ייעוץ מוקדם',
 href: '/contact?service=early-stage',
 },
 stats: {
 value: '2000+',
 label: 'רופאים מומחים',
 },
 },
 {
 id: 'data-validation',
 icon: Database,
 title: 'אימות ועיבוד דאטה רפואי',
 titleEn: 'Medical Data Validation',
 subtitle: 'דאטה אנונימי ומאובטח',
 description: 'גישה לדאטה רפואי אנונימי ומאובטח לצורכי פיתוח, אימון מודלים, ואימות אלגוריתמים. הדאטה עובר תהליך אנונימיזציה קפדני ועומד בכל תקני האבטחה.',
 features: [
 'דאטה אנונימי לפי תקני HIPAA',
 'מאגרי תמונות רפואיות',
 'רשומות רפואיות מובנות',
 'דאטה לאימון AI/ML',
 'סביבת Sandbox מאובטחת',
 'API לגישה לדאטה בזמן אמת',
 ],
 faqs: [
 {
 question: 'איך הדאטה מאונונם ומאובטח?',
 questionEn: 'How is the data anonymized and secured?',
 answer: 'הדאטה עובר תהליך אנונימיזציה מתקדם שמסיר כל מידע מזהה (PII) בהתאם לתקני HIPAA ו-GDPR. הגישה לדאטה מתבצעת רק דרך סביבת Sandbox מאובטחת, ללא אפשרות להורדת דאטה גולמי. כל הפעילות מנוטרת ומתועדת.',
 },
 {
 question: 'האם אפשר להשתמש בדאטה לאימון מודלי AI?',
 questionEn: 'Can the data be used for AI model training?',
 answer: 'כן, הדאטה שלנו אידיאלי לאימון מודלים. יש לנו מאגרים של תמונות רפואיות (רנטגן, MRI, CT), רשומות טקסטואליות, ונתוני מעבדה. ניתן לעבוד על הדאטה בסביבה שלנו עם GPU חזק, או לקבל דאטה סינתטי מבוסס על הדאטה האמיתי.',
 },
 {
 question: 'מה סוגי הדאטה הזמינים?',
 questionEn: 'What types of data are available?',
 answer: 'זמינים: רשומות רפואיות אלקטרוניות (EMR), תמונות רפואיות (רדיולוגיה, פתולוגיה, דרמטולוגיה), נתוני מעבדה, מרשמים ותרופות, ונתוני התנהגות בריאותית. ניתן לבקש חיתוכים ספציפיים לפי גיל, מגדר, אבחנות, ועוד.',
 },
 ],
 cta: {
 text: 'בקשו גישה לדאטה',
 href: '/contact?service=data',
 },
 stats: {
 value: '10M+',
 label: 'רשומות רפואיות',
 },
 },
 {
 id: 'compliance',
 icon: FileCheck,
 title: 'ציות ואבטחת מידע',
 titleEn: 'Compliance & Security',
 subtitle: 'HIPAA, GDPR, ISO 27001',
 description: 'סיוע בהטמעת תהליכי ציות לרגולציות פרטיות ואבטחת מידע. הכנה להסמכות ובניית מערכות ניהול אבטחת מידע.',
 features: [
 'הטמעת HIPAA compliance',
 'התאמה ל-GDPR',
 'הכנה להסמכת ISO 27001',
 'בניית מדיניות אבטחת מידע',
 'הדרכות עובדים',
 'ביקורות וסקרי סיכונים',
 ],
 faqs: [
 {
 question: 'האם חובה לעמוד ב-HIPAA?',
 questionEn: 'Is HIPAA compliance mandatory?',
 answer: 'אם אתם עובדים עם דאטה רפואי של מטופלים אמריקאים או שואפים לפעול בשוק האמריקאי - כן, HIPAA הוא חובה. גם אם אתם פועלים רק בישראל, עמידה בסטנדרטים של HIPAA מוסיפה אמינות ומכינה אתכם להתרחבות עתידית.',
 },
 {
 question: 'מה הקשר בין ISO 27001 לרגולציה רפואית?',
 questionEn: 'What is the connection between ISO 27001 and medical regulation?',
 answer: 'ISO 27001 הוא תקן בינלאומי לניהול אבטחת מידע. הוא לא ספציפי לרפואה, אבל הוא נדרש לעתים קרובות על ידי בתי חולים, קופות חולים, ורגולטורים כתנאי לעבודה עם דאטה רפואי. ההסמכה מראה שיש לכם מערכת ניהול אבטחה בוגרת.',
 },
 ],
 cta: {
 text: 'בדקו עמידה בתקנים',
 href: '/contact?service=compliance',
 },
 stats: {
 value: '100%',
 label: 'עמידה בתקנים',
 },
 },
];

// =============================================================================
// JSON-LD STRUCTURED DATA
// =============================================================================

function generateServiceSchema(service: Service) {
 return {
 '@type': 'Service',
 '@id': `https://leumit.weccelerate.co.il/services#${service.id}`,
 name: service.titleEn,
 alternateName: service.title,
 description: service.description,
 provider: {
 '@type': 'Organization',
 name: 'WeCcelerate',
 url: 'https://weccelerate.co.il',
 parentOrganization: {
 '@type': 'Organization',
 name: 'Leumit Health Services',
 },
 },
 areaServed: {
 '@type': 'Country',
 name: 'Israel',
 },
 serviceType: 'MedTech Consulting',
 hasOfferCatalog: {
 '@type': 'OfferCatalog',
 name: service.title,
 itemListElement: service.features.map((feature, index) => ({
 '@type': 'Offer',
 itemOffered: {
 '@type': 'Service',
 name: feature,
 },
 position: index + 1,
 })),
 },
 };
}

function generateFAQSchema(services: Service[]) {
 const allFaqs = services.flatMap((service) =>
 service.faqs.map((faq) => ({
 '@type': 'Question',
 name: faq.question,
 acceptedAnswer: {
 '@type': 'Answer',
 text: faq.answer,
 },
 }))
 );

 return {
 '@type': 'FAQPage',
 mainEntity: allFaqs,
 };
}

function generatePageSchema() {
 return {
 '@context': 'https://schema.org',
 '@graph': [
 // WebPage
 {
 '@type': 'WebPage',
 '@id': 'https://leumit.weccelerate.co.il/services',
 name: 'שירותי MedTech - WeCcelerate',
 description: 'שירותי ייעוץ רגולטורי, ניסויים קליניים ואימות דאטה לסטארטאפים רפואיים',
 inLanguage: 'he',
 },
 // All Services
...medtechServices.map(generateServiceSchema),
 // FAQ Schema
 generateFAQSchema(medtechServices),
 ],
 };
}

// =============================================================================
// COMPONENTS
// =============================================================================

function HeroSection() {
 return (
 <section className="relative min-h-[60vh] flex items-center bg-slate-900">
 {/* Background */}
 <div className="absolute inset-0">
 <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-slate-900" />
 </div>

 {/* Accent */}
 <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500" />

 {/* Content */}
 <div className="relative z-10 container-corporate">
 <div className="max-w-3xl">
 {/* Breadcrumb */}
 <nav aria-label="Breadcrumb" className="mb-8">
 <ol className="flex items-center gap-2 text-sm text-slate-400">
 <li><Link href="/" className="hover:text-white transition-colors">ראשי</Link></li>
 <li><span className="mx-2">/</span></li>
 <li className="text-yellow-400">שירותי MedTech</li>
 </ol>
 </nav>

 {/* Badge */}
 <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-2 mb-6">
 <Stethoscope className="w-4 h-4 text-blue-400" />
 <span className="text-blue-400 text-sm font-medium">
 בשיתוף לאומית שירותי בריאות
 </span>
 </div>

 <h1 className="heading-display text-white mb-6">
 שירותי
 <br />
 <span className="text-yellow-400">MedTech</span>
 </h1>

 <p className="text-xl text-slate-300 mb-8 max-w-2xl">
 ליווי מקצועי לסטארטאפים רפואיים — חוות דעת מרופאים מומחים, ליווי רגולטורי מלא,
 סקירות שוק ועזרה בשלבים המוקדמים של המיזם הרפואי.
 </p>

 {/* Trust Indicators */}
 <div className="flex flex-wrap gap-6">
 <div className="flex items-center gap-2 text-slate-400">
 <Award className="w-5 h-5 text-yellow-500" />
 <span>ליווי מקצועי בתהליך רגולטוריים</span>
 </div>
 <div className="flex items-center gap-2 text-slate-400">
 <Users className="w-5 h-5 text-yellow-500" />
 <span>50+ סטארטאפים נתמכו</span>
 </div>
 </div>
 </div>
 </div>
 </section>
 );
}

// Service Card with Hover Effect
function ServiceCard({ service, index }: { service: Service; index: number }) {
 return (
 <article
 className="group bg-white border border-slate-100 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
 itemScope
 itemType="https://schema.org/Service"
 >
 {/* Header */}
 <div className="flex items-start justify-between mb-6">
 <div className="w-14 h-14 bg-slate-100 group-hover:bg-yellow-500 flex items-center justify-center transition-colors">
 <service.icon className="w-7 h-7 text-slate-700 group-hover:text-slate-900 transition-colors" />
 </div>
 {service.stats && (
 <div className="text-left">
 <p className="text-2xl font-bold text-slate-900">{service.stats.value}</p>
 <p className="text-xs text-slate-500">{service.stats.label}</p>
 </div>
 )}
 </div>

 {/* Content */}
 <h2 className="heading-3 text-slate-900 mb-2" itemProp="name">
 {service.title}
 </h2>
 <p className="text-sm text-yellow-600 font-medium mb-4">
 {service.subtitle}
 </p>
 <p className="text-slate-600 mb-6" itemProp="description">
 {service.description}
 </p>

 {/* Features */}
 <ul className="space-y-2 mb-6">
 {service.features.slice(0, 4).map((feature) => (
 <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
 <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
 <span>{feature}</span>
 </li>
 ))}
 </ul>

 {/* CTA */}
 <Link
 href={service.cta.href}
 className="inline-flex items-center gap-2 text-slate-900 font-semibold group-hover:text-yellow-600 transition-colors"
 >
 {service.cta.text}
 <ArrowLeft className="w-4 h-4" />
 </Link>

 {/* Hidden schema data */}
 <meta itemProp="alternateName" content={service.titleEn} />
 </article>
 );
}

// FAQ Accordion for each service
function ServiceFAQSection({ service }: { service: Service }) {
 return (
 <section
 className="py-12 border-t border-slate-100"
 aria-labelledby={`faq-${service.id}`}
 >
 <div className="flex items-center gap-3 mb-8">
 <div className="w-10 h-10 bg-slate-100 flex items-center justify-center">
 <service.icon className="w-5 h-5 text-slate-700" />
 </div>
 <h3 id={`faq-${service.id}`} className="heading-3 text-slate-900">
 שאלות נפוצות: {service.title}
 </h3>
 </div>

 <div className="space-y-4">
 {service.faqs.map((faq, index) => (
 <details
 key={index}
 className="group bg-slate-50 border border-slate-100"
 itemScope
 itemProp="mainEntity"
 itemType="https://schema.org/Question"
 >
 <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
 <h4
 className="text-lg font-medium text-slate-900 pl-4"
 itemProp="name"
 >
 {faq.question}
 </h4>
 <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
 </summary>
 <div
 className="px-6 pb-6 text-slate-600 leading-relaxed"
 itemScope
 itemProp="acceptedAnswer"
 itemType="https://schema.org/Answer"
 >
 <p itemProp="text">{faq.answer}</p>
 </div>
 </details>
 ))}
 </div>
 </section>
 );
}

// Main FAQ Section with all services
function FAQSection() {
 return (
 <section className="section-padding bg-white" aria-labelledby="faq-heading">
 <div className="container-corporate">
 <header className="max-w-2xl mb-12">
 <span className="text-sm font-semibold text-yellow-600 uppercase tracking-wider">
 שאלות ותשובות
 </span>
 <h2 id="faq-heading" className="heading-1 text-slate-900 mt-3 mb-4">
 שאלות נפוצות על שירותי MedTech
 </h2>
 <p className="body-large text-slate-600">
 תשובות לשאלות הנפוצות ביותר שאנחנו מקבלים מסטארטאפים רפואיים
 </p>
 </header>

 {medtechServices.map((service) => (
 <ServiceFAQSection key={service.id} service={service} />
 ))}
 </div>
 </section>
 );
}

// CTA Section
function CTASection() {
 return (
 <section className="section-padding bg-slate-900">
 <div className="container-corporate text-center">
 <h2 className="heading-1 text-white mb-6">
 מוכנים להתחיל?
 </h2>
 <p className="body-large text-slate-400 max-w-2xl mx-auto mb-10">
 ספרו לנו על הסטארטאפ שלכם ונבנה יחד תוכנית ליווי מותאמת אישית
 </p>

 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
 <Link
 href="/contact?source=medtech-services"
 className="inline-flex items-center gap-2 bg-yellow-500 text-slate-900 px-8 py-4 font-semibold hover:bg-yellow-400 transition-colors"
 >
 קבלו הצעת מחיר
 <ArrowLeft className="w-5 h-5" />
 </Link>
 <Link
 href="/contact?source=apply"
 className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 font-medium hover:bg-white/10 transition-colors"
 >
 הגישו מועמדות לתוכנית
 </Link>
 </div>
 </div>
 </section>
 );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function MedTechServicesPage() {
 return (
 <>
 {/* JSON-LD Structured Data */}
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{
 __html: JSON.stringify(generatePageSchema()),
 }}
 />

 <main id="main-content">
 {/* Hero */}
 <HeroSection />

 {/* Services Grid */}
 <section className="section-padding bg-slate-50" aria-labelledby="services-heading">
 <div className="container-corporate">
 <header className="max-w-2xl mb-12">
 <span className="text-sm font-semibold text-yellow-600 uppercase tracking-wider">
 השירותים שלנו
 </span>
 <h2 id="services-heading" className="heading-1 text-slate-900 mt-3 mb-4">
 פתרונות מקיפים לסטארטאפים רפואיים
 </h2>
 </header>

 <div className="grid md:grid-cols-2 gap-8">
 {medtechServices.map((service, index) => (
 <ServiceCard key={service.id} service={service} index={index} />
 ))}
 </div>
 </div>
 </section>

 {/* FAQ Section - AI Extractable */}
 <FAQSection />

 {/* CTA */}
 <CTASection />
 </main>
 </>
 );
}
