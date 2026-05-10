/**
 * Business Solutions Page - Biz Subdomain
 * 
 * Route: biz.weccelerate.co.il/services
 * 
 * Target Audience: General Business/Startup Founders
 * Focus: Fundraising, MVP Development, Global Expansion
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
  Rocket,
  TrendingUp,
  Globe,
  Code,
  Users,
  Target,
  PiggyBank,
  Presentation,
  Building2,
  CheckCircle2,
  Award,
  Briefcase,
  Lightbulb,
  MapPin,
  DollarSign,
  BarChart3,
  Handshake,
} from 'lucide-react';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = {
  title: { absolute: 'שירותים עסקיים | גיוס הון, פיתוח MVP והתרחבות גלובלית - WeCcelerate' },
  description: 'שירותי פיתוח עסקי מקיפים: אסטרטגיית גיוס הון, פיתוח MVP, ליווי להתרחבות גלובלית, וקשרים עסקיים. WeCcelerate - האצת סטארטאפים.',
  keywords: [
    'גיוס הון סטארטאפ',
    'פיתוח MVP',
    'התרחבות גלובלית',
    'ייעוץ עסקי',
    'משקיעים לסטארטאפ',
    'מאיץ עסקי',
    'pitching investors',
  ],
  openGraph: {
    title: 'שירותי פיתוח עסקי - WeCcelerate',
    description: 'גיוס הון, פיתוח MVP והתרחבות גלובלית לסטארטאפים',
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
  gradient?: string;
}

const businessServices: Service[] = [
  {
    id: 'fundraising',
    icon: TrendingUp,
    title: 'אסטרטגיית גיוס הון',
    titleEn: 'Fundraising Strategy',
    subtitle: 'Seed, Series A, VC Relations',
    description: 'ליווי מקצועי בכל שלבי גיוס ההון - מבניית המצגת והשווי, דרך פיתוח קשרים עם משקיעים, ועד סגירת הסבב בהצלחה.',
    features: [
      'בניית Pitch Deck מקצועי',
      'הערכת שווי (Valuation)',
      'גישה לרשת 500+ משקיעים',
      'הכנה לפגישות משקיעים',
      'ניהול משא ומתן וסגירה',
      'Due Diligence support',
    ],
    faqs: [
      {
        question: 'כמה הון אפשר לגייס דרככם?',
        questionEn: 'How much capital can we raise through you?',
        answer: 'הסטארטאפים שלנו גייסו מ-$500K ועד $15M בסבבים שונים. גובה הגיוס תלוי בשלב החברה, המוצר, והשוק. אנחנו עוזרים לכם להגדיר יעד ריאלי ולבנות אסטרטגיה להגיע אליו. יש לנו ניסיון בגיוסי Pre-Seed, Seed, ו-Series A.',
      },
      {
        question: 'מה ההבדל בין סבבי Seed ל-Series A?',
        questionEn: 'What is the difference between Seed and Series A rounds?',
        answer: 'סבב Seed (בדרך כלל $500K-$3M) מיועד לחברות בשלב מוקדם - בניית המוצר הראשוני והוכחת ההתאמה לשוק. Series A ($3M-$15M) מגיע כשיש PMF ברור ורוצים להאיץ צמיחה. אנחנו עוזרים להגדיר מה הסבב המתאים לכם ולהכין את החברה בהתאם.',
      },
      {
        question: 'האם יש לכם קשרים עם קרנות הון סיכון?',
        questionEn: 'Do you have connections with VC funds?',
        answer: 'יש לנו קשרים פעילים עם מעל 500 משקיעים, כולל קרנות הון סיכון ישראליות ובינלאומיות (Pitango, JVP, Viola, Sequoia, Insight), משקיעי אנג\'ל מובילים, ו-Corporate VCs. אנחנו עושים התאמה בין הסטארטאפ למשקיעים הרלוונטיים ופותחים דלתות.',
      },
    ],
    cta: {
      text: 'תכננו אסטרטגיית גיוס',
      href: '/contact?service=fundraising',
    },
    stats: {
      value: '$50M+',
      label: 'גויסו על ידי סטארטאפים שלנו',
    },
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    id: 'mvp',
    icon: Code,
    title: 'פיתוח MVP',
    titleEn: 'MVP Development',
    subtitle: 'מרעיון למוצר ראשוני',
    description: 'ליווי בפיתוח MVP (Minimum Viable Product) - מהגדרת הפיצ\'רים הקריטיים, דרך בחירת טכנולוגיה, ועד השקת מוצר שעובד ומאפשר לקבל פידבק מלקוחות.',
    features: [
      'הגדרת פיצ\'רים קריטיים',
      'ייעוץ ארכיטקטורה טכנית',
      'חיבור לצוותי פיתוח מומלצים',
      'בניית Roadmap מוצר',
      'UX/UI Design review',
      'ליווי השקה ראשונית',
    ],
    faqs: [
      {
        question: 'כמה זמן לוקח לבנות MVP?',
        questionEn: 'How long does it take to build an MVP?',
        answer: 'MVP טיפוסי לוקח בין 2-4 חודשים לפיתוח, תלוי במורכבות. אנחנו עוזרים לכם לזהות את הליבה של המוצר ולהתמקד בפיצ\'רים שמספיקים להוכיח ערך - לא יותר. הגישה הזו חוסכת זמן וכסף ומאפשרת לקבל פידבק מהר יותר.',
      },
      {
        question: 'האם אתם מפתחים את ה-MVP בעצמכם?',
        questionEn: 'Do you develop the MVP yourselves?',
        answer: 'אנחנו לא בית תוכנה, אבל יש לנו רשת של צוותי פיתוח מומלצים שעבדנו איתם בהצלחה. התפקיד שלנו הוא לעזור לכם להגדיר מה לבנות, לבחור את הטכנולוגיה הנכונה, ולפקח על הפיתוח. זה מבטיח שתקבלו מוצר טוב במחיר הוגן.',
      },
      {
        question: 'מה כדאי לכלול ב-MVP ומה לדחות?',
        questionEn: 'What should be included in an MVP and what should be postponed?',
        answer: 'הכלל הזהב: רק מה שנדרש להוכיח את הערך המרכזי ללקוח. אם אתם בונים אפליקציה לניהול פגישות - אל תבנו עכשיו אינטגרציות מורכבות. התחילו עם הזמנת פגישה, תזכורת, וביטול. נעזור לכם לעשות את החשיבה הזו ולתעדף נכון.',
      },
    ],
    cta: {
      text: 'תכננו את ה-MVP שלכם',
      href: '/contact?service=mvp',
    },
    stats: {
      value: '3 חודשים',
      label: 'זמן ממוצע ל-MVP',
    },
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'global',
    icon: Globe,
    title: 'התרחבות גלובלית',
    titleEn: 'Global Expansion',
    subtitle: 'ארה"ב, אירופה, אסיה',
    description: 'ליווי בפתיחת שווקים בינלאומיים - מהבנת השוק המקומי, דרך בניית אסטרטגיה מותאמת, ועד יצירת קשרים עסקיים ומציאת שותפים מקומיים.',
    features: [
      'מחקר שוק בינלאומי',
      'אסטרטגיית Go-to-Market',
      'חיבור לשותפים מקומיים',
      'הקמת נוכחות משפטית',
      'לוקליזציה ותרבות עסקית',
      'מענקים והטבות מס',
    ],
    faqs: [
      {
        question: 'מאיזה שוק כדאי להתחיל?',
        questionEn: 'Which market should we start with?',
        answer: 'זה תלוי במוצר שלכם. לסטארטאפים רפואיים, ארה"ב היא לעתים קרובות היעד הראשי בגלל גודל השוק. ל-B2B SaaS, אירופה יכולה להיות נקודת התחלה טובה. לצרכנים, לפעמים שווקים קטנים יותר (הולנד, סינגפור) הם מקום טוב להתנסות לפני ארה"ב.',
      },
      {
        question: 'מה נדרש לפתוח חברה בארה"ב?',
        questionEn: 'What is required to open a company in the US?',
        answer: 'פתיחת חברה בארה"ב (בדרך כלל Delaware C-Corp) היא תהליך פשוט יחסית שלוקח כמה ימים. הסוגיות האמיתיות הן: מבנה מס נכון, חשבון בנק אמריקאי, ויזה לעבודה אם אתם עוברים לשם. אנחנו מחברים אתכם לעורכי דין ורואי חשבון שמכירים סטארטאפים ישראליים.',
      },
      {
        question: 'איך מוצאים לקוחות ראשונים בשוק חדש?',
        questionEn: 'How do you find first customers in a new market?',
        answer: 'השיטה הטובה ביותר היא דרך היכרויות. אנחנו מחברים אתכם ליועצים מקומיים, לבוגרי התוכנית שכבר פעילים בשוק, ולשותפים אסטרטגיים. בנוסף, כנסים מקצועיים ותוכניות Soft Landing (כמו Landing Pad בטורונטו או Station F בפריז) הם דרך מצוינת לבסס נוכחות.',
      },
    ],
    cta: {
      text: 'תכננו התרחבות',
      href: '/contact?service=global',
    },
    stats: {
      value: '15+',
      label: 'מדינות שנכבשו',
    },
    gradient: 'from-purple-500 to-violet-600',
  },
  {
    id: 'strategy',
    icon: Target,
    title: 'ייעוץ אסטרטגי',
    titleEn: 'Strategic Consulting',
    subtitle: 'מודל עסקי ותכנון',
    description: 'ייעוץ אסטרטגי מקיף לבניית מודל עסקי מנצח, זיהוי הזדמנויות שוק, והגדרת יתרון תחרותי ברור.',
    features: [
      'בניית Business Model Canvas',
      'ניתוח שוק ותחרות',
      'הגדרת Value Proposition',
      'אסטרטגיית תמחור',
      'תכנון צמיחה',
      'Pivot consulting',
    ],
    faqs: [
      {
        question: 'מתי כדאי לעשות Pivot?',
        questionEn: 'When should you pivot?',
        answer: 'כדאי לשקול Pivot כשאחרי 6-12 חודשים של מאמץ אין סימנים ברורים ל-Product Market Fit: לקוחות לא חוזרים, עלות גיוס לקוח גבוהה מדי, או המוצר לא פותר בעיה מספיק כואבת. אנחנו עוזרים לנתח את הנתונים בצורה אובייקטיבית ולזהות אם צריך לשנות כיוון ואיך.',
      },
      {
        question: 'איך יודעים שיש Product Market Fit?',
        questionEn: 'How do you know if there is Product Market Fit?',
        answer: 'סימנים ברורים: לקוחות משתמשים במוצר באופן קבוע (Retention גבוה), ממליצים לאחרים (NPS חיובי), ומוכנים לשלם. המבחן הקלאסי: "האם 40% מהלקוחות היו מאוכזבים מאוד אם המוצר ייעלם?". אנחנו עוזרים לכם למדוד ולשפר את הזיקה למוצר.',
      },
    ],
    cta: {
      text: 'קבלו ייעוץ אסטרטגי',
      href: '/contact?service=strategy',
    },
    stats: {
      value: '85%',
      label: 'מהסטארטאפים שרדו את השנה הראשונה',
    },
    gradient: 'from-orange-500 to-amber-600',
  },
  {
    id: 'networking',
    icon: Handshake,
    title: 'קשרים עסקיים',
    titleEn: 'Business Networking',
    subtitle: 'מנטורים, שותפים ולקוחות',
    description: 'חיבור לרשת הקשרים העסקית שלנו - מנטורים מנוסים, שותפים אסטרטגיים, לקוחות פוטנציאליים, ויזמים אחרים.',
    features: [
      'מנטורים מובילים בתעשייה',
      'חיבור ללקוחות Enterprise',
      'שותפויות אסטרטגיות',
      'קהילת יזמים',
      'אירועי Networking',
      'מפגשי Demo Day',
    ],
    faqs: [
      {
        question: 'איך נבחרים המנטורים?',
        questionEn: 'How are mentors selected?',
        answer: 'המנטורים שלנו הם יזמים מצליחים, מנהלים בכירים, ומומחים בתחומם עם ניסיון רלוונטי לסטארטאפ שלכם. אחרי שמבינים את הצרכים שלכם, אנחנו מציעים 2-3 מנטורים פוטנציאליים לבחירה. המיצוי הוא לפי תחום, שלב, והתאמה אישית.',
      },
      {
        question: 'מה קורה ב-Demo Day?',
        questionEn: 'What happens on Demo Day?',
        answer: 'Demo Day הוא אירוע שבו הסטארטאפים מציגים בפני קהל של משקיעים, שותפים פוטנציאליים, ותקשורת. זו הזדמנות להשיג חשיפה, לפתוח שיחות עם משקיעים, וליצור קשרים עסקיים. אנחנו מכינים אתכם עם Pitch coaching ומזמינים את המשקיעים הרלוונטיים.',
      },
    ],
    cta: {
      text: 'הצטרפו לרשת',
      href: '/contact?service=networking',
    },
    stats: {
      value: '200+',
      label: 'מנטורים ומומחים',
    },
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    id: 'grants',
    icon: PiggyBank,
    title: 'מענקים והטבות',
    titleEn: 'Grants & Incentives',
    subtitle: 'רשות החדשנות, מס הכנסה',
    description: 'סיוע בהגשת בקשות למענקים ממשלתיים, הטבות מס לסטארטאפים, ותוכניות תמיכה שונות.',
    features: [
      'מענקי רשות החדשנות',
      'הטבות מס R&D',
      'תוכניות Horizon Europe',
      'מענקים למפעלים מועדפים',
      'הגשה ומעקב',
      'דוחות למענקים',
    ],
    faqs: [
      {
        question: 'מי זכאי למענק מרשות החדשנות?',
        questionEn: 'Who is eligible for Innovation Authority grants?',
        answer: 'סטארטאפים ישראליים שמפתחים טכנולוגיה חדשנית. רשות החדשנות מממנת עד 50% מעלויות המחקר והפיתוח (עד 85% לחברות בפריפריה או מסלולים מיוחדים). נדרש להוכיח חדשנות טכנולוגית ופוטנציאל עסקי. אנחנו עוזרים בהכנת הבקשה.',
      },
      {
        question: 'כמה זמן לוקח לקבל אישור למענק?',
        questionEn: 'How long does it take to get grant approval?',
        answer: 'תהליך אישור מענק רשות החדשנות לוקח בממוצע 3-4 חודשים. לתוכניות אירופאיות (Horizon) - 6-9 חודשים. חשוב להגיש בקשה מוקדם ולתכנן את ה-Cash Flow בהתאם. אנחנו עוזרים להאיץ את התהליך עם בקשות מסודרות.',
      },
    ],
    cta: {
      text: 'בדקו זכאות למענקים',
      href: '/contact?service=grants',
    },
    stats: {
      value: '₪20M+',
      label: 'מענקים שהושגו',
    },
    gradient: 'from-pink-500 to-rose-600',
  },
];

// =============================================================================
// JSON-LD STRUCTURED DATA
// =============================================================================

function generateServiceSchema(service: Service) {
  return {
    '@type': 'Service',
    '@id': `https://biz.weccelerate.co.il/services#${service.id}`,
    name: service.titleEn,
    alternateName: service.title,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: 'WeCcelerate',
      url: 'https://weccelerate.co.il',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Israel',
    },
    serviceType: 'Business Development',
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
        '@id': 'https://biz.weccelerate.co.il/services',
        name: 'שירותים עסקיים - WeCcelerate',
        description: 'גיוס הון, פיתוח MVP והתרחבות גלובלית לסטארטאפים',
        inLanguage: 'he',
      },
      // All Services
      ...businessServices.map(generateServiceSchema),
      // FAQ Schema
      generateFAQSchema(businessServices),
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
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 to-slate-900" />
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
              <li className="text-yellow-400">שירותים עסקיים</li>
            </ol>
          </nav>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 mb-6">
            <Briefcase className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">
              פיתוח עסקי והאצה
            </span>
          </div>

          <h1 className="heading-display text-white mb-6">
            שירותים
            <br />
            <span className="text-yellow-400">עסקיים</span>
          </h1>

          <p className="text-xl text-slate-300 mb-8 max-w-2xl">
            מגיוס הון ופיתוח MVP ועד התרחבות גלובלית -
            כל מה שסטארטאפ צריך כדי לצמוח ולהצליח.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-slate-400">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              <span>$50M+ גויסו</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <BarChart3 className="w-5 h-5 text-yellow-500" />
              <span>150+ סטארטאפים הואצו</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Globe className="w-5 h-5 text-yellow-500" />
              <span>15+ מדינות</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Service Card with Hover Effect
function ServiceCard({ service }: { service: Service }) {
  return (
    <article
      className="group bg-white border border-slate-100 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 relative overflow-hidden"
      itemScope
      itemType="https://schema.org/Service"
    >
      {/* Gradient accent on hover */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${service.gradient || 'from-yellow-500 to-amber-500'} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-right`} />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className={`w-14 h-14 bg-gradient-to-br ${service.gradient || 'from-slate-100 to-slate-200'} bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <service.icon className="w-7 h-7 text-slate-700" />
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
        {service.features.length > 4 && (
          <li className="text-sm text-slate-400">
            +{service.features.length - 4} עוד...
          </li>
        )}
      </ul>

      {/* CTA */}
      <Link
        href={service.cta.href}
        className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 text-sm font-semibold group-hover:bg-yellow-500 group-hover:text-slate-900 transition-colors"
      >
        {service.cta.text}
        <ArrowLeft className="w-4 h-4" />
      </Link>

      {/* Hidden schema data */}
      <meta itemProp="alternateName" content={service.titleEn} />
    </article>
  );
}

// FAQ Accordion
function ServiceFAQSection({ service }: { service: Service }) {
  return (
    <div className="mb-12 last:mb-0">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br ${service.gradient || 'from-slate-100 to-slate-200'} flex items-center justify-center`}>
          <service.icon className="w-5 h-5 text-slate-700" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">
          {service.title}
        </h3>
      </div>

      <div className="space-y-3">
        {service.faqs.map((faq, index) => (
          <details
            key={index}
            className="group bg-white border border-slate-100 overflow-hidden"
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-slate-50 transition-colors">
              <h4
                className="text-base font-medium text-slate-900 pl-4"
                itemProp="name"
              >
                {faq.question}
              </h4>
              <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0" />
            </summary>
            <div
              className="px-5 pb-5 text-slate-600 leading-relaxed border-t border-slate-100 pt-4"
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
            >
              <p itemProp="text">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function FAQSection() {
  return (
    <section className="section-padding bg-slate-50" aria-labelledby="faq-heading">
      <div className="container-corporate">
        <header className="max-w-2xl mb-12">
          <span className="text-sm font-semibold text-yellow-600 uppercase tracking-wider">
            שאלות ותשובות
          </span>
          <h2 id="faq-heading" className="heading-1 text-slate-900 mt-3 mb-4">
            שאלות נפוצות על השירותים שלנו
          </h2>
          <p className="body-large text-slate-600">
            תשובות לשאלות הנפוצות ביותר שאנחנו מקבלים מיזמים וסטארטאפים
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {businessServices.map((service) => (
            <ServiceFAQSection key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Process Section
function ProcessSection() {
  const steps = [
    {
      number: '01',
      title: 'פגישת היכרות',
      description: 'מבינים את העסק שלכם, האתגרים והיעדים',
    },
    {
      number: '02',
      title: 'אבחון צרכים',
      description: 'מזהים את השירותים הרלוונטיים ביותר עבורכם',
    },
    {
      number: '03',
      title: 'בניית תוכנית',
      description: 'מרכיבים תוכנית ליווי מותאמת אישית',
    },
    {
      number: '04',
      title: 'ביצוע וליווי',
      description: 'עובדים יחד להשגת היעדים שהוגדרו',
    },
  ];

  return (
    <section className="section-padding bg-white" aria-labelledby="process-heading">
      <div className="container-corporate">
        <header className="max-w-2xl mb-12 text-center mx-auto">
          <span className="text-sm font-semibold text-yellow-600 uppercase tracking-wider">
            איך זה עובד
          </span>
          <h2 id="process-heading" className="heading-1 text-slate-900 mt-3">
            תהליך העבודה שלנו
          </h2>
        </header>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="text-center relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-0 w-full h-px bg-slate-200 -z-10" />
              )}
              
              <div className="w-16 h-16 bg-slate-900 text-yellow-400 text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
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
          מוכנים להאיץ את הצמיחה?
        </h2>
        <p className="body-large text-slate-400 max-w-2xl mx-auto mb-10">
          ספרו לנו על העסק שלכם ונבנה יחד תוכנית שמתאימה בדיוק לצרכים שלכם
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/contact?source=biz-services"
            className="inline-flex items-center gap-2 bg-yellow-500 text-slate-900 px-8 py-4 font-semibold hover:bg-yellow-400 transition-colors"
          >
            קבלו הצעת מחיר
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link
            href="/contact?source=apply"
            className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 font-medium hover:bg-white/10 transition-colors"
          >
            הגישו מועמדות לתוכנית האצה
          </Link>
        </div>

        {/* Quick contact */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-slate-400">
          <a href="tel:+97235551234" className="flex items-center gap-2 hover:text-white transition-colors">
            <span dir="ltr">03-555-1234</span>
          </a>
          <a href="mailto:biz@weccelerate.co.il" className="flex items-center gap-2 hover:text-white transition-colors">
            biz@weccelerate.co.il
          </a>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function BusinessServicesPage() {
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
                כל מה שסטארטאפ צריך לצמיחה
              </h2>
              <p className="body-large text-slate-600">
                בחרו את השירותים הרלוונטיים עבורכם, או צרו קשר לקבלת תוכנית מותאמת אישית
              </p>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businessServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <ProcessSection />

        {/* FAQ Section - AI Extractable */}
        <FAQSection />

        {/* CTA */}
        <CTASection />
      </main>
    </>
  );
}
