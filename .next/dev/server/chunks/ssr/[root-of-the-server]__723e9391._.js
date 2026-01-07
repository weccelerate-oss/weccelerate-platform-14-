module.exports = [
"[next]/internal/font/google/inter_e4ad3ee5.module.css [app-rsc] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "className": "inter_e4ad3ee5-module__JyyZwa__className",
  "variable": "inter_e4ad3ee5-module__JyyZwa__variable",
});
}),
"[next]/internal/font/google/inter_e4ad3ee5.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_e4ad3ee5$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__ = __turbopack_context__.i("[next]/internal/font/google/inter_e4ad3ee5.module.css [app-rsc] (css module)");
;
const fontData = {
    className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_e4ad3ee5$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].className,
    style: {
        fontFamily: "'Inter', 'Inter Fallback'",
        fontStyle: "normal"
    }
};
if (__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_e4ad3ee5$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable != null) {
    fontData.variable = __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_e4ad3ee5$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable;
}
const __TURBOPACK__default__export__ = fontData;
}),
"[next]/internal/font/google/heebo_d1381f28.module.css [app-rsc] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "className": "heebo_d1381f28-module__AwQe_G__className",
  "variable": "heebo_d1381f28-module__AwQe_G__variable",
});
}),
"[next]/internal/font/google/heebo_d1381f28.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$heebo_d1381f28$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__ = __turbopack_context__.i("[next]/internal/font/google/heebo_d1381f28.module.css [app-rsc] (css module)");
;
const fontData = {
    className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$heebo_d1381f28$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].className,
    style: {
        fontFamily: "'Heebo', 'Heebo Fallback'",
        fontStyle: "normal"
    }
};
if (__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$heebo_d1381f28$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable != null) {
    fontData.variable = __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$heebo_d1381f28$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable;
}
const __TURBOPACK__default__export__ = fontData;
}),
"[project]/lib/seo.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * SEO Configuration & Constants
 * 
 * WeCcelerate - General Tech & Business Accelerator
 * 
 * Strategy:
 * - CORE: General tech accelerator (AI, Apps, IoT, Physical Products, SaaS)
 * - SUPERPOWER: MedTech arm with Leumit partnership (unique differentiator)
 * 
 * @module lib/seo
 */ __turbopack_context__.s([
    "BRAND",
    ()=>BRAND,
    "CONTACT",
    ()=>CONTACT,
    "FAQ_DATA",
    ()=>FAQ_DATA,
    "FAQ_ITEMS",
    ()=>FAQ_ITEMS,
    "KEYWORDS",
    ()=>KEYWORDS,
    "PARENT_ORGANIZATION",
    ()=>PARENT_ORGANIZATION,
    "SERVICES",
    ()=>SERVICES,
    "SITE_CONFIG",
    ()=>SITE_CONFIG,
    "SOCIAL_LINKS",
    ()=>SOCIAL_LINKS,
    "USER_INTENT_KEYWORDS",
    ()=>USER_INTENT_KEYWORDS,
    "constructMetadata",
    ()=>constructMetadata,
    "default",
    ()=>__TURBOPACK__default__export__,
    "generatePageDescription",
    ()=>generatePageDescription,
    "getAllKeywords",
    ()=>getAllKeywords,
    "getBrandVariationByIndex",
    ()=>getBrandVariationByIndex,
    "getMedTechKeywords",
    ()=>getMedTechKeywords,
    "getRandomBrandVariation",
    ()=>getRandomBrandVariation,
    "isMedTechService",
    ()=>isMedTechService,
    "viewport",
    ()=>viewport
]);
const SITE_CONFIG = {
    name: 'WeCcelerate',
    url: 'https://weccelerate.co.il',
    // Broader description reflecting general tech + MedTech superpower
    description: {
        short: {
            en: 'Israel\'s leading platform for startup acceleration, app development, and tech ventures. Unique MedTech track with Leumit Health Services.',
            he: 'הפלטפורמה המובילה בישראל לפיתוח מיזמים, אפליקציות ומוצרים טכנולוגיים. זרוע חדשנות ייחודית בתחום הרפואי בשיתוף לאומית.'
        },
        medium: {
            en: 'WeCcelerate accelerates startups across all tech sectors - AI, mobile apps, IoT, SaaS, and physical products. Our exclusive MedTech track with Leumit Health Services provides unmatched access to medical data and clinical validation.',
            he: 'וויסלרייט מאיצה סטארטאפים בכל תחומי הטכנולוגיה - בינה מלאכותית, אפליקציות, IoT, SaaS ומוצרים פיזיים. מסלול ה-MedTech הייחודי שלנו בשיתוף לאומית מספק גישה חסרת תקדים לדאטה רפואי ותיקוף קליני.'
        },
        long: {
            en: 'WeCcelerate is Israel\'s premier technology acceleration platform, supporting entrepreneurs across all sectors from AI and mobile apps to IoT and physical products. Our strategic partnership with Leumit Health Services creates an exclusive MedTech track offering access to anonymized medical data, clinical pilots, and regulatory guidance. Whether you\'re building the next breakthrough app or revolutionizing healthcare, WeCcelerate provides the expertise, resources, and connections to accelerate your success.',
            he: 'וויסלרייט היא פלטפורמת האצת הטכנולוגיה המובילה בישראל, התומכת ביזמים בכל המגזרים - מבינה מלאכותית ואפליקציות מובייל ועד IoT ומוצרים פיזיים. השותפות האסטרטגית שלנו עם לאומית שירותי בריאות יוצרת מסלול MedTech בלעדי המציע גישה לדאטה רפואי אנונימי, פיילוטים קליניים והכוונה רגולטורית. בין אם אתם בונים את האפליקציה הפורצת הבאה או מחוללים מהפכה בתחום הבריאות, וויסלרייט מספקת את המומחיות, המשאבים והקשרים להאיץ את הצלחתכם.'
        }
    },
    subdomains: {
        main: 'https://weccelerate.co.il',
        leumit: 'https://leumit.weccelerate.co.il',
        biz: 'https://biz.weccelerate.co.il',
        portal: 'https://portal.weccelerate.co.il',
        api: 'https://api.weccelerate.co.il'
    },
    locale: 'he-IL',
    alternateLocales: [
        'en-US',
        'en-GB'
    ],
    themeColor: '#1a365d',
    backgroundColor: '#ffffff'
};
const BRAND = {
    name: 'WeCcelerate',
    legalName: 'WeCcelerate Ltd.',
    tagline: 'From Idea to Impact',
    taglineHe: 'מרעיון להשפעה',
    // English brand identity
    english: {
        name: 'WeCcelerate',
        variations: [
            'WeCcelerate',
            'We Accelerate',
            'We-Ccelerate',
            'Weccelerate',
            'We-Accelerate'
        ]
    },
    // Hebrew brand identity
    hebrew: {
        name: 'וויסלרייט',
        variations: [
            'וויסלרייט',
            'ויקלרייט',
            'ווי אקסלרייט',
            'וויסלרייט קידום עסקים',
            'וי-אקסלרייט',
            'ווי סלרייט'
        ]
    },
    // Legacy format for backward compatibility
    variations: {
        english: [
            'WeCcelerate',
            'We Accelerate',
            'We-Ccelerate',
            'Weccelerate',
            'We-Accelerate'
        ],
        hebrew: [
            'וויסלרייט',
            'ויקלרייט',
            'ווי אקסלרייט',
            'וויסלרייט קידום עסקים',
            'וי-אקסלרייט',
            'ווי סלרייט'
        ]
    },
    // Core descriptions - General tech focus with MedTech advantage
    descriptions: {
        short: SITE_CONFIG.description.short,
        medium: SITE_CONFIG.description.medium,
        long: SITE_CONFIG.description.long
    }
};
const PARENT_ORGANIZATION = {
    name: 'לאומית שירותי בריאות',
    nameEn: 'Leumit Health Services',
    nameHe: 'לאומית שירותי בריאות',
    description: {
        en: 'One of Israel\'s four major health funds, providing comprehensive healthcare services to over 700,000 members. Strategic partner for WeCcelerate\'s MedTech acceleration track.',
        he: 'אחת מארבע קופות החולים הגדולות בישראל, המספקת שירותי בריאות מקיפים ליותר מ-700,000 מבוטחים. שותפה אסטרטגית למסלול האצת ה-MedTech של וויסלרייט.'
    },
    url: 'https://www.leumit.co.il',
    logo: 'https://www.leumit.co.il/images/logo.png',
    sameAs: [
        'https://www.facebook.com/LeumitHealth',
        'https://www.linkedin.com/company/leumit-health-services',
        'https://twitter.com/LeumitHealth'
    ],
    // What the partnership provides
    benefits: {
        en: [
            'Access to anonymized medical data',
            'Clinical pilot programs',
            'Medical expert consultations',
            'Regulatory pathway guidance',
            'Real-world validation environment'
        ],
        he: [
            'גישה לדאטה רפואי אנונימי',
            'תוכניות פיילוט קליניות',
            'ייעוץ ממומחים רפואיים',
            'הכוונה בנתיבי רגולציה',
            'סביבת תיקוף בעולם האמיתי'
        ]
    }
};
const KEYWORDS = {
    // ==========================================================================
    // CORE BUSINESS: General Tech & Startup Acceleration
    // ==========================================================================
    // General technology keywords
    tech: {
        english: [
            'Startup Accelerator',
            'Startup Incubator Israel',
            'MVP Development',
            'AI Solutions',
            'App Development',
            'Mobile App Development',
            'Web Application Development',
            'SaaS Development',
            'IoT Solutions',
            'Product Development',
            'Software Development Israel',
            'Tech Startup Support',
            'Full Stack Development',
            'Cloud Solutions',
            'Digital Transformation'
        ],
        hebrew: [
            'אקסלרטור סטארטאפים',
            'חממה טכנולוגית',
            'פיתוח MVP',
            'פיתוח אפליקציות',
            'פיתוח אפליקציות מובייל',
            'פיתוח מערכות ווב',
            'פתרונות בינה מלאכותית',
            'פיתוח SaaS',
            'פתרונות IoT',
            'פיתוח מוצר',
            'פיתוח תוכנה',
            'הקמת סטארטאפ',
            'בניית MVP',
            'טרנספורמציה דיגיטלית',
            'פיתוח פולסטאק'
        ]
    },
    // Startup & entrepreneurship keywords
    startup: {
        english: [
            'How to Start a Startup',
            'Startup Funding Israel',
            'Seed Funding',
            'Series A Investment',
            'Venture Capital Israel',
            'Angel Investment',
            'Startup Mentorship',
            'Business Acceleration',
            'Product Market Fit',
            'Pitch Deck Creation',
            'Investor Relations',
            'Startup Ecosystem Israel',
            'Entrepreneur Support',
            'Business Development',
            'Go-to-Market Strategy'
        ],
        hebrew: [
            'איך מקימים סטארטאפ',
            'גיוס הון לסטארטאפ',
            'גיוס סיד',
            'גיוס סבב A',
            'הון סיכון ישראל',
            'השקעות אנג\'ל',
            'מנטורינג לסטארטאפים',
            'האצת עסקים',
            'התאמת מוצר-שוק',
            'בניית מצגת משקיעים',
            'קשרי משקיעים',
            'אקוסיסטם סטארטאפים',
            'תמיכה ביזמים',
            'פיתוח עסקי',
            'אסטרטגיית כניסה לשוק'
        ]
    },
    // AI & emerging tech keywords
    ai: {
        english: [
            'AI Development',
            'Machine Learning Solutions',
            'ChatGPT Integration',
            'LLM Applications',
            'Computer Vision',
            'Natural Language Processing',
            'AI Automation',
            'Predictive Analytics',
            'AI Consulting',
            'Generative AI',
            'AI for Business',
            'Deep Learning',
            'AI MVP',
            'Custom AI Solutions'
        ],
        hebrew: [
            'פיתוח בינה מלאכותית',
            'פתרונות למידת מכונה',
            'שילוב ChatGPT',
            'אפליקציות LLM',
            'ראייה ממוחשבת',
            'עיבוד שפה טבעית',
            'אוטומציה עם AI',
            'ניתוח חיזוי',
            'ייעוץ בינה מלאכותית',
            'AI גנרטיבי',
            'בינה מלאכותית לעסקים',
            'למידה עמוקה',
            'MVP בינה מלאכותית'
        ]
    },
    // ==========================================================================
    // SUPERPOWER: MedTech Track (Leumit Partnership)
    // ==========================================================================
    // MedTech & healthcare innovation
    medtech: {
        english: [
            'MedTech Startup Israel',
            'Healthcare Innovation',
            'Digital Health',
            'Medical Device Development',
            'Health Tech Accelerator',
            'Leumit Collaboration',
            'Leumit Innovation Partner',
            'Clinical Trials Israel',
            'Medical Data Access',
            'Healthcare AI',
            'Telemedicine Solutions',
            'Remote Patient Monitoring',
            'Health Information Technology',
            'Medical Software Development',
            'Healthcare Startup Accelerator'
        ],
        hebrew: [
            'סטארטאפ מדטק ישראל',
            'חדשנות רפואית',
            'בריאות דיגיטלית',
            'פיתוח מכשור רפואי',
            'אקסלרטור הלת\'טק',
            'שיתוף פעולה לאומית',
            'שותף חדשנות לאומית',
            'ניסויים קליניים ישראל',
            'גישה לדאטה רפואי',
            'בינה מלאכותית לבריאות',
            'פתרונות טלרפואה',
            'ניטור מרחוק',
            'טכנולוגיית מידע רפואי',
            'פיתוח תוכנה רפואית',
            'מיזמים רפואיים'
        ]
    },
    // Regulatory keywords
    regulatory: {
        english: [
            'FDA Approval Process',
            'FDA 510(k)',
            'CE Marking',
            'Medical Device Regulation',
            'Israeli MOH Approval',
            'Regulatory Consulting',
            'MDR Compliance',
            'ISO 13485',
            'HIPAA Compliance',
            'Medical Device Certification',
            'Regulatory Pathway',
            'Clinical Validation'
        ],
        hebrew: [
            'אישור FDA',
            'תהליך FDA',
            'סימון CE',
            'רגולציה מכשור רפואי',
            'אישור משרד הבריאות',
            'ייעוץ רגולטורי',
            'עמידה ב-MDR',
            'ISO רפואי',
            'תיקוף קליני',
            'הסמכת מכשור רפואי',
            'נתיב רגולטורי'
        ]
    },
    // Industry verticals we serve
    industry: {
        english: [
            'FinTech',
            'EdTech',
            'FoodTech',
            'AgriTech',
            'PropTech',
            'RetailTech',
            'InsurTech',
            'LegalTech',
            'CleanTech',
            'HealthTech',
            'MedTech',
            'BioTech',
            'Cybersecurity',
            'Enterprise Software',
            'Consumer Apps'
        ],
        hebrew: [
            'פינטק',
            'אדטק',
            'פודטק',
            'אגריטק',
            'פרופטק',
            'ריטיילטק',
            'אינשורטק',
            'ליגלטק',
            'קלינטק',
            'הלת\'טק',
            'מדטק',
            'ביוטק',
            'סייבר',
            'תוכנה ארגונית',
            'אפליקציות צרכניות'
        ]
    },
    // Legacy format - primary keywords
    primary: {
        he: [
            'הקמת סטארטאפ',
            'פיתוח אפליקציות',
            'בניית MVP',
            'אקסלרטור ישראל',
            'פיתוח מוצר',
            'בינה מלאכותית',
            'האצת סטארטאפים'
        ],
        en: [
            'Startup Accelerator Israel',
            'App Development',
            'MVP Development',
            'Tech Incubator',
            'Product Development',
            'AI Solutions',
            'Startup Acceleration'
        ]
    },
    // Legacy format - secondary keywords
    secondary: {
        he: [
            'פיתוח אפליקציות מובייל',
            'בניית מערכות ווב',
            'גיוס משקיעים',
            'מנטורינג עסקי',
            'פיתוח SaaS',
            'IoT פתרונות',
            'מסלול MedTech עם לאומית'
        ],
        en: [
            'Mobile App Development Israel',
            'Web Application Development',
            'Investor Fundraising',
            'Business Mentoring',
            'SaaS Development',
            'IoT Solutions',
            'MedTech Track with Leumit'
        ]
    },
    // Question-based keywords
    questions: {
        he: [
            'איך מקימים סטארטאפ',
            'כמה עולה לפתח אפליקציה',
            'איך בונים MVP',
            'מה זה וויסלרייט',
            'איך מגייסים משקיעים',
            'איך מפתחים מוצר טכנולוגי',
            'מה ההבדל בין אקסלרטור לחממה'
        ],
        en: [
            'How to start a startup',
            'How much does app development cost',
            'How to build an MVP',
            'What is WeCcelerate',
            'How to raise funding',
            'How to develop a tech product',
            'Difference between accelerator and incubator'
        ]
    }
};
const USER_INTENT_KEYWORDS = KEYWORDS;
const SERVICES = [
    // Core Tech Services
    {
        id: 'full-stack-development',
        name: {
            en: 'Full-Stack Development',
            he: 'פיתוח פולסטאק'
        },
        description: {
            en: 'End-to-end development for web and mobile applications. From concept to deployment, we build scalable, production-ready solutions.',
            he: 'פיתוח מקצה לקצה לאפליקציות ווב ומובייל. מהרעיון ועד להשקה, אנו בונים פתרונות סקיילבליים ומוכנים לפרודקשן.'
        },
        url: '/services/development',
        priceRange: '₪₪₪',
        price: '50000',
        category: 'Software Development',
        duration: '3-6 months',
        icon: 'code'
    },
    {
        id: 'mvp-development',
        name: {
            en: 'MVP Development',
            he: 'פיתוח MVP'
        },
        description: {
            en: 'Rapid prototyping and minimum viable product development. Validate your idea quickly with a working product that attracts investors.',
            he: 'פיתוח אב-טיפוס ומוצר מינימלי בר-קיימא. תקפו את הרעיון שלכם במהירות עם מוצר עובד שמושך משקיעים.'
        },
        url: '/services/mvp',
        priceRange: '₪₪₪',
        price: '35000',
        category: 'Product Development',
        duration: '6-12 weeks',
        icon: 'rocket'
    },
    {
        id: 'ai-integration',
        name: {
            en: 'AI Integration',
            he: 'הטמעת בינה מלאכותית'
        },
        description: {
            en: 'Integrate cutting-edge AI capabilities into your business. From ChatGPT and LLMs to custom machine learning models.',
            he: 'הטמעת יכולות בינה מלאכותית מתקדמות בעסק שלכם. מ-ChatGPT ו-LLMs ועד מודלים מותאמים אישית.'
        },
        url: '/services/ai',
        priceRange: '₪₪₪₪',
        price: '75000',
        category: 'AI & Machine Learning',
        duration: '2-4 months',
        icon: 'brain'
    },
    {
        id: 'mobile-apps',
        name: {
            en: 'Mobile App Development',
            he: 'פיתוח אפליקציות מובייל'
        },
        description: {
            en: 'Native and cross-platform mobile applications for iOS and Android. Beautiful, performant apps that users love.',
            he: 'אפליקציות מובייל נייטיב וקרוס-פלטפורם ל-iOS ו-Android. אפליקציות יפות ומהירות שמשתמשים אוהבים.'
        },
        url: '/services/mobile',
        priceRange: '₪₪₪₪',
        price: '60000',
        category: 'Mobile Development',
        duration: '3-5 months',
        icon: 'smartphone'
    },
    {
        id: 'startup-acceleration',
        name: {
            en: 'Startup Acceleration Program',
            he: 'תוכנית האצת סטארטאפים'
        },
        description: {
            en: 'Comprehensive acceleration program including mentorship, resources, investor connections, and workspace. Turn your idea into a fundable company.',
            he: 'תוכנית האצה מקיפה הכוללת מנטורינג, משאבים, חיבור למשקיעים ומרחב עבודה. הפכו את הרעיון לחברה שניתן להשקיע בה.'
        },
        url: '/services/acceleration',
        priceRange: '₪₪₪',
        price: '0',
        category: 'Business Acceleration',
        duration: '6-12 months',
        icon: 'trending-up'
    },
    {
        id: 'investor-connections',
        name: {
            en: 'Investor Relations & Fundraising',
            he: 'קשרי משקיעים וגיוס הון'
        },
        description: {
            en: 'Direct introductions to VCs, angel investors, and strategic partners. Pitch preparation and investor deck creation included.',
            he: 'היכרות ישירה עם קרנות הון סיכון, משקיעי אנג\'ל ושותפים אסטרטגיים. כולל הכנה לפיץ\' ובניית מצגת משקיעים.'
        },
        url: '/services/investors',
        priceRange: 'Success-based',
        price: '0',
        category: 'Business Development',
        duration: 'Ongoing',
        icon: 'handshake'
    },
    // MedTech Track (Leumit Partnership) - The Superpower
    {
        id: 'medtech-track',
        name: {
            en: 'MedTech Track (Leumit Partnership)',
            he: 'מסלול MedTech (בשיתוף לאומית)'
        },
        description: {
            en: 'Exclusive healthcare innovation track with Leumit Health Services. Access to medical data, clinical pilots, physician consultations, and regulatory guidance.',
            he: 'מסלול חדשנות רפואית בלעדי עם לאומית שירותי בריאות. גישה לדאטה רפואי, פיילוטים קליניים, התייעצות עם רופאים והכוונה רגולטורית.'
        },
        url: '/services/medtech',
        priceRange: '₪₪₪₪₪',
        price: '100000',
        category: 'Healthcare Innovation',
        duration: '12-18 months',
        icon: 'heart-pulse',
        featured: true,
        partnership: 'Leumit Health Services'
    },
    {
        id: 'medical-data-access',
        name: {
            en: 'Medical Data Access',
            he: 'גישה לדאטה רפואי'
        },
        description: {
            en: 'Secure access to anonymized medical data from Leumit for research, AI training, and clinical validation. IRB-approved processes.',
            he: 'גישה מאובטחת לדאטה רפואי אנונימי מלאומית למחקר, אימון AI ותיקוף קליני. תהליכים מאושרי ועדת הלסינקי.'
        },
        url: '/services/data',
        priceRange: 'Contact us',
        price: '0',
        category: 'Healthcare Data',
        duration: 'Project-based',
        icon: 'database',
        partnership: 'Leumit Health Services'
    },
    {
        id: 'regulatory-consulting',
        name: {
            en: 'Regulatory Consulting',
            he: 'ייעוץ רגולטורי'
        },
        description: {
            en: 'Expert guidance through FDA, CE, and Israeli MOH regulatory pathways for medical devices and digital health products.',
            he: 'הכוונה מקצועית בנתיבי הרגולציה של FDA, CE ומשרד הבריאות למכשור רפואי ומוצרי בריאות דיגיטליים.'
        },
        url: '/services/regulatory',
        priceRange: '₪₪₪₪',
        price: '45000',
        category: 'Regulatory Affairs',
        duration: 'Ongoing',
        icon: 'shield-check'
    }
];
const FAQ_ITEMS = [
    // General Questions
    {
        question: {
            he: 'מה זה וויסלרייט?',
            en: 'What is WeCcelerate?'
        },
        answer: {
            he: 'וויסלרייט (WeCcelerate) היא פלטפורמת האצת סטארטאפים ופיתוח מוצרים טכנולוגיים מובילה בישראל. אנו מסייעים ליזמים בכל תחומי הטכנולוגיה - מאפליקציות ובינה מלאכותית ועד IoT ומוצרים פיזיים. יתרון ייחודי שלנו הוא מסלול MedTech בלעדי בשיתוף לאומית שירותי בריאות.',
            en: 'WeCcelerate is Israel\'s leading startup acceleration and tech product development platform. We support entrepreneurs across all tech sectors - from apps and AI to IoT and physical products. Our unique advantage is an exclusive MedTech track in partnership with Leumit Health Services.'
        }
    },
    {
        question: {
            he: 'איך מקימים סטארטאפ?',
            en: 'How do you start a startup?'
        },
        answer: {
            he: 'הקמת סטארטאפ מתחילה בזיהוי בעיה אמיתית ופיתוח פתרון. דרך WeCcelerate תקבלו ליווי מקיף: עזרה בגיבוש הרעיון, בניית MVP, חיבור למשקיעים ומנטורינג מיזמים מנוסים. התהליך כולל אפיון מוצר, פיתוח, בדיקות שוק וגיוס הון.',
            en: 'Starting a startup begins with identifying a real problem and developing a solution. Through WeCcelerate you\'ll receive comprehensive support: help refining your idea, MVP development, investor connections, and mentoring from experienced entrepreneurs. The process includes product definition, development, market testing, and fundraising.'
        }
    },
    {
        question: {
            he: 'כמה עולה לפתח אפליקציה?',
            en: 'How much does it cost to develop an app?'
        },
        answer: {
            he: 'עלות פיתוח אפליקציה תלויה במורכבות ובפיצ\'רים. MVP בסיסי יכול לעלות 35,000-50,000 ש"ח, אפליקציה מלאה 60,000-150,000 ש"ח, ופרויקטים מורכבים יותר. ב-WeCcelerate אנו מציעים הערכת עלויות חינמית ומסלולי תשלום גמישים.',
            en: 'App development costs depend on complexity and features. A basic MVP can cost $10,000-15,000, a full app $15,000-40,000, and complex projects more. At WeCcelerate we offer free cost estimates and flexible payment plans.'
        }
    },
    {
        question: {
            he: 'מה היתרון של מסלול MedTech עם לאומית?',
            en: 'What is the advantage of the MedTech track with Leumit?'
        },
        answer: {
            he: 'מסלול ה-MedTech בשיתוף לאומית מספק יתרונות בלעדיים: גישה לדאטה רפואי אנונימי של מאות אלפי מבוטחים, אפשרות לפיילוטים קליניים במרפאות, התייעצות עם רופאים ומומחים, הכוונה רגולטורית (FDA, CE) ואמינות מוגברת מול משקיעים.',
            en: 'The MedTech track with Leumit provides exclusive advantages: access to anonymized medical data from hundreds of thousands of patients, clinical pilot opportunities in clinics, consultation with physicians and experts, regulatory guidance (FDA, CE), and enhanced credibility with investors.'
        }
    },
    {
        question: {
            he: 'איך מגייסים כסף לסטארטאפ?',
            en: 'How do you raise funding for a startup?'
        },
        answer: {
            he: 'גיוס הון מתחיל בהכנת מצגת משקיעים (Pitch Deck) מקצועית והוכחת התאמת מוצר-שוק. WeCcelerate מחברת אתכם ישירות לקרנות הון סיכון, משקיעי אנג\'ל ושותפים אסטרטגיים. אנו מלווים בהכנה לפגישות, משא ומתן ועד לסגירת העסקה.',
            en: 'Fundraising starts with preparing a professional investor presentation (Pitch Deck) and proving product-market fit. WeCcelerate connects you directly to venture capital funds, angel investors, and strategic partners. We guide you through meeting preparation, negotiation, and deal closing.'
        }
    },
    {
        question: {
            he: 'באילו תחומים אתם עובדים?',
            en: 'What industries do you work in?'
        },
        answer: {
            he: 'אנו עובדים בכל תחומי הטכנולוגיה: בינה מלאכותית, אפליקציות מובייל, SaaS, IoT, פינטק, אדטק, פודטק, ריטיילטק, סייבר ועוד. בנוסף, יש לנו מסלול MedTech ייחודי למיזמים בתחום הבריאות בשיתוף לאומית.',
            en: 'We work across all tech sectors: AI, mobile apps, SaaS, IoT, FinTech, EdTech, FoodTech, RetailTech, Cybersecurity, and more. Additionally, we have a unique MedTech track for healthcare ventures in partnership with Leumit.'
        }
    },
    {
        question: {
            he: 'מה ההבדל בין אקסלרטור לאינקובטור?',
            en: 'What is the difference between an accelerator and an incubator?'
        },
        answer: {
            he: 'אינקובטור מתמקד בשלבים המוקדמים ביותר ומספק זמן ומרחב לפיתוח הרעיון. אקסלרטור כמו WeCcelerate מיועד לסטארטאפים עם רעיון מגובש או מוצר ראשוני ומאיץ את הצמיחה באמצעות מנטורינג אינטנסיבי, משאבים, פיתוח וחיבור למשקיעים בתקופה קצרה.',
            en: 'An incubator focuses on the earliest stages and provides time and space to develop the idea. An accelerator like WeCcelerate is designed for startups with a defined concept or initial product and accelerates growth through intensive mentoring, resources, development, and investor connections in a short period.'
        }
    },
    {
        question: {
            he: 'כמה זמן לוקח לפתח MVP?',
            en: 'How long does it take to develop an MVP?'
        },
        answer: {
            he: 'פיתוח MVP אופייני לוקח 6-12 שבועות, תלוי במורכבות. ב-WeCcelerate אנו משתמשים במתודולוגיות Agile ו-Lean Startup כדי לספק מוצר עובד במהירות, לקבל משוב מהשוק ולשפר באופן מתמיד.',
            en: 'A typical MVP development takes 6-12 weeks, depending on complexity. At WeCcelerate we use Agile and Lean Startup methodologies to deliver a working product quickly, get market feedback, and continuously improve.'
        }
    }
];
const FAQ_DATA = FAQ_ITEMS;
const SOCIAL_LINKS = {
    facebook: 'https://www.facebook.com/WeCcelerate',
    linkedin: 'https://www.linkedin.com/company/weccelerate',
    twitter: 'https://twitter.com/WeCcelerate',
    instagram: 'https://www.instagram.com/weccelerate',
    youtube: 'https://www.youtube.com/@WeCcelerate',
    github: 'https://github.com/weccelerate',
    tiktok: 'https://www.tiktok.com/@weccelerate'
};
const CONTACT = {
    email: 'info@weccelerate.co.il',
    phone: '+972-3-555-1234',
    phoneDisplay: '03-555-1234',
    whatsapp: '+972-50-555-1234',
    address: {
        street: 'Rothschild Boulevard 1',
        streetHe: 'שדרות רוטשילד 1',
        city: 'Tel Aviv',
        cityHe: 'תל אביב',
        country: 'Israel',
        countryHe: 'ישראל',
        postalCode: '6688101',
        full: 'Rothschild Boulevard 1, Tel Aviv, Israel 6688101',
        fullHe: 'שדרות רוטשילד 1, תל אביב, ישראל 6688101'
    },
    hours: {
        weekdays: '09:00-18:00',
        friday: '09:00-14:00',
        saturday: 'Closed'
    }
};
function constructMetadata(options) {
    const { title, description, keywords = [], path = '', image = '/images/og-default.jpg', noIndex = false, locale = 'he', type = 'website', publishedTime, modifiedTime, authors = [
        'WeCcelerate Team'
    ] } = options;
    const hebrewBrandVariation = getRandomBrandVariation('hebrew');
    const primaryKeyword = locale === 'he' ? 'פיתוח אפליקציות | אקסלרטור סטארטאפים ישראל' : 'App Development | Startup Accelerator Israel';
    const fullTitle = `${title} | WeCcelerate - ${primaryKeyword}`;
    const fullDescription = description || (locale === 'he' ? `${hebrewBrandVariation} - ${SITE_CONFIG.description.medium.he}` : `WeCcelerate - ${SITE_CONFIG.description.medium.en}`);
    const allKeywords = [
        ...BRAND.english.variations,
        ...BRAND.hebrew.variations,
        ...KEYWORDS.primary.he,
        ...KEYWORDS.primary.en,
        ...keywords
    ];
    const url = `${SITE_CONFIG.url}${path}`;
    return {
        title: {
            default: fullTitle,
            template: `%s | WeCcelerate - ${primaryKeyword}`
        },
        description: fullDescription,
        keywords: allKeywords,
        authors: authors.map((name)=>({
                name
            })),
        creator: 'WeCcelerate',
        publisher: 'WeCcelerate',
        robots: noIndex ? {
            index: false,
            follow: false
        } : {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1
            }
        },
        openGraph: {
            type,
            title: fullTitle,
            description: fullDescription,
            url,
            siteName: 'WeCcelerate',
            locale: locale === 'he' ? 'he_IL' : 'en_US',
            alternateLocale: locale === 'he' ? [
                'en_US'
            ] : [
                'he_IL'
            ],
            images: [
                {
                    url: image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`,
                    width: 1200,
                    height: 630,
                    alt: `${title} - WeCcelerate`
                }
            ],
            ...publishedTime && {
                publishedTime
            },
            ...modifiedTime && {
                modifiedTime
            }
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description: fullDescription,
            site: '@WeCcelerate',
            creator: '@WeCcelerate',
            images: [
                image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`
            ]
        },
        alternates: {
            canonical: url,
            languages: {
                'he-IL': url,
                'en-US': `${SITE_CONFIG.url}/en${path}`
            }
        },
        verification: {
            google: process.env.GOOGLE_SITE_VERIFICATION,
            yandex: process.env.YANDEX_VERIFICATION,
            yahoo: process.env.YAHOO_VERIFICATION
        },
        applicationName: 'WeCcelerate',
        generator: 'Next.js',
        referrer: 'origin-when-cross-origin',
        category: 'technology',
        other: {
            'msapplication-TileColor': SITE_CONFIG.themeColor,
            'apple-mobile-web-app-capable': 'yes',
            'apple-mobile-web-app-status-bar-style': 'default',
            'apple-mobile-web-app-title': 'WeCcelerate',
            'format-detection': 'telephone=no'
        }
    };
}
const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: [
        {
            media: '(prefers-color-scheme: light)',
            color: SITE_CONFIG.themeColor
        },
        {
            media: '(prefers-color-scheme: dark)',
            color: '#0f172a'
        }
    ]
};
function getRandomBrandVariation(language) {
    const variations = language === 'english' ? BRAND.english.variations : BRAND.hebrew.variations;
    return variations[Math.floor(Math.random() * variations.length)];
}
function getBrandVariationByIndex(language, index) {
    const variations = language === 'english' ? BRAND.english.variations : BRAND.hebrew.variations;
    return variations[index % variations.length];
}
function generatePageDescription(pageContext, locale = 'he', variationIndex) {
    const brandVariation = variationIndex !== undefined ? getBrandVariationByIndex(locale === 'he' ? 'hebrew' : 'english', variationIndex) : getRandomBrandVariation(locale === 'he' ? 'hebrew' : 'english');
    if (locale === 'he') {
        return `${pageContext} | ${brandVariation} - ${SITE_CONFIG.description.short.he}`;
    }
    return `${pageContext} | ${brandVariation} - ${SITE_CONFIG.description.short.en}`;
}
function getAllKeywords(locale = 'en') {
    const languageKey = locale === 'en' ? 'english' : 'hebrew';
    return [
        ...KEYWORDS.tech[languageKey],
        ...KEYWORDS.startup[languageKey],
        ...KEYWORDS.ai[languageKey],
        ...KEYWORDS.medtech[languageKey],
        ...KEYWORDS.industry[languageKey]
    ];
}
function getMedTechKeywords(locale = 'en') {
    const languageKey = locale === 'en' ? 'english' : 'hebrew';
    return [
        ...KEYWORDS.medtech[languageKey],
        ...KEYWORDS.regulatory[languageKey]
    ];
}
function isMedTechService(serviceId) {
    const medtechServices = [
        'medtech-track',
        'medical-data-access',
        'regulatory-consulting'
    ];
    return medtechServices.includes(serviceId);
}
const __TURBOPACK__default__export__ = {
    SITE_CONFIG,
    BRAND,
    PARENT_ORGANIZATION,
    KEYWORDS,
    USER_INTENT_KEYWORDS,
    SERVICES,
    FAQ_ITEMS,
    FAQ_DATA,
    SOCIAL_LINKS,
    CONTACT,
    constructMetadata,
    viewport,
    getRandomBrandVariation,
    getBrandVariationByIndex,
    generatePageDescription,
    getAllKeywords,
    getMedTechKeywords,
    isMedTechService
};
}),
"[project]/components/seo/GeoSchema.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FaqPageSchema",
    ()=>FaqPageSchema,
    "GeoSchema",
    ()=>GeoSchema,
    "OrganizationSchema",
    ()=>OrganizationSchema,
    "ServicesSchema",
    ()=>ServicesSchema,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
/**
 * GEO Schema Component - The Holy Grail JSON-LD for AI/LLM Optimization
 * 
 * This component generates a comprehensive graph of linked entities optimized
 * for both traditional search engines (SEO) and AI/LLM-powered generative
 * engines (GEO - Generative Engine Optimization).
 * 
 * Key Features:
 * 1. Organization Schema with Parent Organization (Authority Transfer)
 * 2. Service Catalog (hasOfferCatalog)
 * 3. FAQPage Schema (Voice Search & Chatbot Optimization)
 * 4. LocalBusiness Schema (Local SEO)
 * 5. BreadcrumbList Schema (Navigation)
 * 6. WebSite Schema (Sitelinks Search Box)
 * 
 * @module components/seo/GeoSchema
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/seo.ts [app-rsc] (ecmascript)");
;
;
// Alias for backward compatibility
const FAQ_DATA = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FAQ_ITEMS"];
const KEYWORDS = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["USER_INTENT_KEYWORDS"];
// =============================================================================
// SCHEMA BUILDERS
// =============================================================================
/**
 * Build Organization Schema with Parent Organization (Authority Transfer)
 * This is CRITICAL for transferring Leumit's domain authority to WeCcelerate
 */ function buildOrganizationSchema() {
    return {
        '@type': 'Organization',
        '@id': `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/#organization`,
        name: 'WeCcelerate',
        alternateName: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BRAND"].english.variations,
            ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BRAND"].hebrew.variations
        ],
        legalName: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BRAND"].legalName,
        description: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BRAND"].descriptions.long.he,
        url: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url,
        logo: {
            '@type': 'ImageObject',
            '@id': `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/#logo`,
            url: `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/logo.png`,
            contentUrl: `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/logo.png`,
            width: 512,
            height: 512,
            caption: 'WeCcelerate Logo'
        },
        image: {
            '@type': 'ImageObject',
            url: `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/og-image.jpg`,
            width: 1200,
            height: 630
        },
        // CRITICAL: Parent Organization - Authority Transfer from Leumit
        parentOrganization: {
            '@type': 'HealthcareOrganization',
            '@id': `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PARENT_ORGANIZATION"].url}/#organization`,
            name: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PARENT_ORGANIZATION"].nameEn,
            alternateName: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PARENT_ORGANIZATION"].name,
            description: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PARENT_ORGANIZATION"].description.en,
            url: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PARENT_ORGANIZATION"].url,
            logo: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PARENT_ORGANIZATION"].logo,
            areaServed: {
                '@type': 'Country',
                name: 'Israel',
                identifier: 'IL'
            }
        },
        // Founding & Contact
        foundingDate: '2020',
        foundingLocation: {
            '@type': 'Place',
            name: 'Tel Aviv, Israel'
        },
        email: 'info@weccelerate.co.il',
        telephone: '+972-3-XXX-XXXX',
        // Location
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Innovation Hub',
            addressLocality: 'Tel Aviv',
            addressRegion: 'Tel Aviv District',
            postalCode: '6100000',
            addressCountry: 'IL'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 32.0636,
            longitude: 34.7721
        },
        // Area Served (Global reach)
        areaServed: [
            {
                '@type': 'Country',
                name: 'Israel',
                identifier: 'IL'
            },
            {
                '@type': 'GeoCircle',
                geoMidpoint: {
                    '@type': 'GeoCoordinates',
                    latitude: 32.0636,
                    longitude: 34.7721
                },
                geoRadius: '50000',
                description: 'Global reach from Tel Aviv'
            }
        ],
        // Social Profiles
        sameAs: [
            'https://www.linkedin.com/company/weccelerate',
            'https://www.facebook.com/weccelerate',
            'https://twitter.com/weccelerate',
            'https://www.youtube.com/@weccelerate'
        ],
        // Contact Points
        contactPoint: [
            {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                telephone: '+972-3-XXX-XXXX',
                email: 'info@weccelerate.co.il',
                availableLanguage: [
                    'Hebrew',
                    'English'
                ],
                hoursAvailable: {
                    '@type': 'OpeningHoursSpecification',
                    dayOfWeek: [
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday'
                    ],
                    opens: '09:00',
                    closes: '18:00'
                }
            },
            {
                '@type': 'ContactPoint',
                contactType: 'sales',
                email: 'startups@weccelerate.co.il',
                availableLanguage: [
                    'Hebrew',
                    'English'
                ]
            }
        ],
        // Industry Classification
        naics: '541611',
        isicV4: '7020',
        // Knowledge Graph Signals
        knowsAbout: [
            'MedTech Startups',
            'Healthcare Innovation',
            'Digital Health',
            'MVP Development',
            'Startup Acceleration',
            'Medical Device Regulation',
            'FDA Approval Process',
            'Israeli Healthcare System',
            ...KEYWORDS.industry.english
        ],
        // Membership
        memberOf: [
            {
                '@type': 'Organization',
                name: 'Israel Innovation Authority'
            },
            {
                '@type': 'Organization',
                name: 'Start-Up Nation Central'
            }
        ]
    };
}
/**
 * Build Service Catalog Schema (hasOfferCatalog)
 */ function buildServicesSchema() {
    return {
        '@type': 'Service',
        '@id': `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/#services`,
        name: 'WeCcelerate Acceleration Program',
        description: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BRAND"].descriptions.medium.en,
        provider: {
            '@id': `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/#organization`
        },
        areaServed: {
            '@type': 'Country',
            name: 'Israel'
        },
        audience: {
            '@type': 'Audience',
            audienceType: 'Healthcare Entrepreneurs',
            geographicArea: {
                '@type': 'Country',
                name: 'Israel'
            }
        },
        serviceType: 'Startup Acceleration',
        category: 'Business Consulting',
        // Service Catalog
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'WeCcelerate Services',
            itemListElement: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SERVICES"].map((service, index)=>({
                    '@type': 'Offer',
                    '@id': `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/#service-${service.id}`,
                    itemOffered: {
                        '@type': 'Service',
                        name: service.name.en,
                        alternateName: service.name.he,
                        description: service.description.en,
                        category: service.category
                    },
                    priceSpecification: {
                        '@type': 'PriceSpecification',
                        price: service.price,
                        priceCurrency: 'ILS'
                    },
                    position: index + 1
                }))
        }
    };
}
/**
 * Build FAQ Schema (Voice Search & Chatbot Optimization)
 * This is CRITICAL for AI assistants to answer questions directly
 */ function buildFaqSchema(locale = 'he') {
    return {
        '@type': 'FAQPage',
        '@id': `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/#faq`,
        mainEntity: FAQ_DATA.map((faq, index)=>({
                '@type': 'Question',
                '@id': `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/#faq-${index + 1}`,
                name: faq.question[locale],
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer[locale],
                    author: {
                        '@id': `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/#organization`
                    }
                },
                position: index + 1
            }))
    };
}
/**
 * Build WebSite Schema (Sitelinks Search Box)
 */ function buildWebSiteSchema() {
    return {
        '@type': 'WebSite',
        '@id': `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/#website`,
        name: 'WeCcelerate',
        alternateName: 'וויסלרייט',
        description: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BRAND"].descriptions.short.en,
        url: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url,
        publisher: {
            '@id': `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/#organization`
        },
        inLanguage: [
            'he-IL',
            'en'
        ],
        // Sitelinks Search Box
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        }
    };
}
/**
 * Build WebPage Schema
 */ function buildWebPageSchema(path, pageTitle) {
    const pageUrl = `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}${path}`;
    return {
        '@type': 'WebPage',
        '@id': `${pageUrl}/#webpage`,
        url: pageUrl,
        name: pageTitle,
        description: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BRAND"].descriptions.medium.he,
        isPartOf: {
            '@id': `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/#website`
        },
        about: {
            '@id': `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/#organization`
        },
        inLanguage: 'he-IL',
        primaryImageOfPage: {
            '@id': `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/#logo`
        },
        datePublished: '2024-01-01T00:00:00+02:00',
        dateModified: new Date().toISOString()
    };
}
/**
 * Build BreadcrumbList Schema
 */ function buildBreadcrumbSchema(path, pageTitle) {
    const segments = path.split('/').filter(Boolean);
    const items = [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'בית',
            item: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url
        }
    ];
    let currentPath = '';
    segments.forEach((segment, index)=>{
        currentPath += `/${segment}`;
        items.push({
            '@type': 'ListItem',
            position: index + 2,
            name: index === segments.length - 1 ? pageTitle : segment,
            item: `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}${currentPath}`
        });
    });
    return {
        '@type': 'BreadcrumbList',
        '@id': `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}${path}/#breadcrumb`,
        itemListElement: items
    };
}
/**
 * Build LocalBusiness Schema (for Google My Business integration)
 */ function buildLocalBusinessSchema() {
    return {
        '@type': 'LocalBusiness',
        '@id': `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/#localbusiness`,
        name: 'WeCcelerate Innovation Hub',
        image: `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/og-image.jpg`,
        telephone: '+972-3-XXX-XXXX',
        email: 'info@weccelerate.co.il',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Innovation Hub',
            addressLocality: 'Tel Aviv',
            addressRegion: 'Tel Aviv District',
            postalCode: '6100000',
            addressCountry: 'IL'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 32.0636,
            longitude: 34.7721
        },
        url: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url,
        sameAs: [
            'https://www.linkedin.com/company/weccelerate',
            'https://www.facebook.com/weccelerate'
        ],
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday'
                ],
                opens: '09:00',
                closes: '18:00'
            },
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Friday',
                opens: '09:00',
                closes: '14:00'
            }
        ],
        priceRange: '₪₪₪',
        paymentAccepted: [
            'Credit Card',
            'Bank Transfer'
        ],
        currenciesAccepted: 'ILS',
        areaServed: {
            '@type': 'Country',
            name: 'Israel'
        }
    };
}
function GeoSchema({ path = '/', pageTitle = 'WeCcelerate - הפלטפורמה המובילה לסטארטאפים רפואיים', includeFaq = true, includeServices = true, locale = 'he' }) {
    // Build the complete graph
    const graphItems = [
        buildOrganizationSchema(),
        buildWebSiteSchema(),
        buildWebPageSchema(path, pageTitle),
        buildBreadcrumbSchema(path, pageTitle),
        buildLocalBusinessSchema()
    ];
    if (includeServices) {
        graphItems.push(buildServicesSchema());
    }
    if (includeFaq) {
        graphItems.push(buildFaqSchema(locale));
    }
    // Construct the final JSON-LD
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': graphItems
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
        type: "application/ld+json",
        dangerouslySetInnerHTML: {
            __html: JSON.stringify(jsonLd, null, 0)
        }
    }, void 0, false, {
        fileName: "[project]/components/seo/GeoSchema.tsx",
        lineNumber: 473,
        columnNumber: 5
    }, this);
}
function OrganizationSchema() {
    const jsonLd = {
        '@context': 'https://schema.org',
        ...buildOrganizationSchema()
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
        type: "application/ld+json",
        dangerouslySetInnerHTML: {
            __html: JSON.stringify(jsonLd)
        }
    }, void 0, false, {
        fileName: "[project]/components/seo/GeoSchema.tsx",
        lineNumber: 493,
        columnNumber: 5
    }, this);
}
function FaqPageSchema({ locale = 'he' }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        ...buildFaqSchema(locale)
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
        type: "application/ld+json",
        dangerouslySetInnerHTML: {
            __html: JSON.stringify(jsonLd)
        }
    }, void 0, false, {
        fileName: "[project]/components/seo/GeoSchema.tsx",
        lineNumber: 507,
        columnNumber: 5
    }, this);
}
function ServicesSchema() {
    const jsonLd = {
        '@context': 'https://schema.org',
        ...buildServicesSchema()
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
        type: "application/ld+json",
        dangerouslySetInnerHTML: {
            __html: JSON.stringify(jsonLd)
        }
    }, void 0, false, {
        fileName: "[project]/components/seo/GeoSchema.tsx",
        lineNumber: 521,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = GeoSchema;
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Root Layout
 * 
 * Main application layout with comprehensive SEO/GEO optimization.
 * Implements the "Golden SEO Strategy" for maximum visibility in
 * both traditional search engines and AI-powered generative engines.
 * 
 * @module app/layout
 */ __turbopack_context__.s([
    "default",
    ()=>RootLayout,
    "metadata",
    ()=>metadata,
    "viewport",
    ()=>viewport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_e4ad3ee5$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[next]/internal/font/google/inter_e4ad3ee5.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$heebo_d1381f28$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[next]/internal/font/google/heebo_d1381f28.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$seo$2f$GeoSchema$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/seo/GeoSchema.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/seo.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
const metadata = {
    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["constructMetadata"])({
        title: "הפלטפורמה המובילה לסטארטאפים רפואיים בישראל",
        description: `וויסלרייט (WeCcelerate) בשיתוף לאומית שירותי בריאות - הפלטפורמה המובילה בישראל להקמת סטארטאפים רפואיים וטכנולוגיים. ליווי יזמים משלב הרעיון, פיתוח MVP, גישה לדאטה רפואי וחיבור למשקיעים.`,
        keywords: [
            // Brand variations (English)
            "WeCcelerate",
            "We Accelerate",
            "Weccelerate",
            // Brand variations (Hebrew) - Critical for Hebrew SEO
            "וויסלרייט",
            "ויקלרייט",
            "ווי אקסלרייט",
            "וויסלרייט קידום עסקים",
            // Primary Hebrew keywords (User Intent)
            "הקמת סטארטאפ רפואי",
            "איך מגייסים כסף למיזם",
            "פיתוח MVP",
            "ליווי יזמים משלב הרעיון",
            "שותף תכנוני לאומית",
            "אקסלרטור בישראל",
            "האצת סטארטאפים",
            // Primary English keywords
            "MedTech startup Israel",
            "healthcare innovation accelerator",
            "startup accelerator Tel Aviv",
            "medical technology incubator",
            "Leumit innovation partner",
            // Secondary keywords
            "גישה לדאטה רפואי",
            "ייעוץ רגולטורי FDA",
            "משקיעים לסטארטאפ רפואי",
            "חממה טכנולוגית"
        ],
        path: "/",
        locale: "he",
        authors: [
            "WeCcelerate Team",
            "Leumit Health Services"
        ]
    }),
    // Manifest
    manifest: "/manifest.json",
    // Icons
    icons: {
        icon: [
            {
                url: "/favicon.ico",
                sizes: "any"
            },
            {
                url: "/icon.svg",
                type: "image/svg+xml"
            },
            {
                url: "/favicon-16x16.png",
                sizes: "16x16",
                type: "image/png"
            },
            {
                url: "/favicon-32x32.png",
                sizes: "32x32",
                type: "image/png"
            }
        ],
        apple: [
            {
                url: "/apple-touch-icon.png",
                sizes: "180x180",
                type: "image/png"
            }
        ],
        other: [
            {
                rel: "mask-icon",
                url: "/safari-pinned-tab.svg",
                color: "#1a365d"
            }
        ]
    },
    // Apple Web App
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "WeCcelerate"
    },
    // Format detection
    formatDetection: {
        telephone: true,
        date: true,
        address: true,
        email: true
    }
};
const viewport = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["viewport"];
function RootLayout({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("html", {
        lang: "he",
        dir: "rtl",
        className: `${__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_e4ad3ee5$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].variable} ${__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$heebo_d1381f28$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].variable}`,
        suppressHydrationWarning: true,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("head", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "preconnect",
                        href: "https://fonts.googleapis.com"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 144,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "preconnect",
                        href: "https://fonts.gstatic.com",
                        crossOrigin: "anonymous"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 145,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "preconnect",
                        href: "https://www.google-analytics.com"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "preconnect",
                        href: "https://www.googletagmanager.com"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 147,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "dns-prefetch",
                        href: "https://www.leumit.co.il"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 150,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "dns-prefetch",
                        href: "https://api.weccelerate.co.il"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 151,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "canonical",
                        href: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 154,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "alternate",
                        hrefLang: "he-IL",
                        href: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 157,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "alternate",
                        hrefLang: "en-US",
                        href: `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/en`
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 158,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "alternate",
                        hrefLang: "x-default",
                        href: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 159,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "alternate",
                        type: "application/rss+xml",
                        title: "WeCcelerate Blog RSS",
                        href: `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/feed.xml`
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 162,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "sitemap",
                        type: "application/xml",
                        href: `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/sitemap.xml`
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$seo$2f$GeoSchema$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["GeoSchema"], {
                        path: "/",
                        pageTitle: "WeCcelerate - הפלטפורמה המובילה לסטארטאפים רפואיים",
                        includeFaq: true
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 173,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "language",
                        content: "Hebrew"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 180,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        httpEquiv: "content-language",
                        content: "he-IL"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 181,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "geo.region",
                        content: "IL"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 184,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "geo.placename",
                        content: "Tel Aviv"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 185,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "geo.position",
                        content: "32.0636;34.7721"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 186,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "ICBM",
                        content: "32.0636, 34.7721"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 187,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "DC.title",
                        content: "WeCcelerate - Healthcare Innovation Platform"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 190,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "DC.creator",
                        content: "WeCcelerate Team"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 191,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "DC.subject",
                        content: "MedTech, Healthcare Innovation, Startups, Israel"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 192,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "DC.description",
                        content: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BRAND"].descriptions.medium.en
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 193,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "DC.publisher",
                        content: "WeCcelerate"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 194,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "DC.contributor",
                        content: "Leumit Health Services"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 195,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "DC.type",
                        content: "Service"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 196,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "DC.format",
                        content: "text/html"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 197,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "DC.identifier",
                        content: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 198,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "DC.language",
                        content: "he"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 199,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                        name: "DC.coverage",
                        content: "Israel"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 200,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("link", {
                        rel: "search",
                        type: "application/opensearchdescription+xml",
                        title: "WeCcelerate Search",
                        href: `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$seo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_CONFIG"].url}/opensearch.xml`
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 203,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/layout.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("body", {
                className: `font-heebo antialiased bg-white text-slate-900`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "#main-content",
                        className: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-royal-600 focus:text-white focus:rounded-lg",
                        children: "דלג לתוכן הראשי"
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 213,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "main-content",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/app/layout.tsx",
                        lineNumber: 221,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/layout.tsx",
                lineNumber: 211,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/layout.tsx",
        lineNumber: 136,
        columnNumber: 5
    }, this);
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-rsc] (ecmascript)").vendored['react-rsc'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__723e9391._.js.map