/**
 * SEO Configuration & Constants
 *
 * WeCcelerate - Venture Builder & Startup Accelerator Israel
 *
 * Semantic Core:
 * - PRIMARY: "Venture Builder Israel" / "Startup Accelerator"
 * - SECONDARY: "Medical Accelerator" / "Innovation Hub Tel Aviv"
 * - SUPERPOWER: MedTech arm with Leumit partnership (unique differentiator)
 *
 * @module lib/seo
 */

import type { Metadata, Viewport } from 'next';

// =============================================================================
// SITE CONFIGURATION
// =============================================================================

export const SITE_CONFIG = {
  name: 'WeCcelerate',
  url: 'https://weccelerate.co.il',

  // Default description — Venture Builder positioning
  defaultDescription: 'WeCcelerate — 360° wrap-around support from idea to successful global startup. Israel\'s leading Venture Builder, specializing in MedTech, AI, and IP strategy. Partnered with Leumit Health Care.',

  // Title template for all pages
  titleTemplate: '%s | WeCcelerate - Venture Builder & Startup Accelerator Israel',

  // Descriptions by length — 360° wrap-around support framing
  description: {
    short: {
      en: 'WeCcelerate — 360° wrap-around support from idea to successful global startup. Israel\'s leading Venture Builder, specializing in MedTech, AI, and IP strategy. Partnered with Leumit Health Care.',
      he: 'וויסלרייט — ליווי מעטפת 360° מרעיון לסטארט-אפ מצליח. ה-Venture Builder המוביל בישראל, המתמחה ב-MedTech, AI ואסטרטגיית IP. בשותפות עם לאומית שירותי בריאות.',
    },
    medium: {
      en: 'WeCcelerate provides 360° wrap-around support for startups — from idea to successful global venture. We help early-stage startups access enterprise-grade resources: business consulting, product development, marketing, investor matching, and an exclusive MedTech track with Leumit Health Care.',
      he: 'וויסלרייט מספקת ליווי מעטפת 360° לסטארטאפים — מרעיון לסטארט-אפ מצליח בכל העולם. עוזרים לסטארט-אפים בתחילת הדרך לקבל מעטפת של סטארט-אפ בשלב בוגר: ייעוץ עסקי, פיתוח מוצר, שיווק, חיבור למשקיעים ומסלול MedTech בלעדי עם לאומית.',
    },
    long: {
      en: 'WeCcelerate is Israel\'s premier Venture Builder and Startup Accelerator, operating from Tel Aviv and Jerusalem. We provide 360° wrap-around support — guiding entrepreneurs from idea to successful global startup. We help early-stage startups access enterprise-grade resources across MedTech, AI, and deep-tech sectors. Our strategic partnership with Leumit Health Care creates an exclusive Medical Accelerator track with access to anonymized medical data, clinical pilots, Helsinki Committee guidance, and regulatory support. From MVP development and CTO services to IP strategy, patent registration, investor preparation, and investor matching — WeCcelerate is the Innovation Hub where startups become ventures.',
      he: 'וויסלרייט הוא ה-Venture Builder ומאיץ הסטארטאפים המוביל בישראל, הפועל מתל אביב וירושלים. אנו מספקים ליווי מעטפת 360° — מרעיון לסטארט-אפ מצליח בכל העולם. עוזרים לסטארט-אפים בתחילת הדרך לקבל מעטפת של סטארט-אפ בשלב בוגר בתחומי MedTech, בינה מלאכותית וטכנולוגיה עמוקה. השותפות האסטרטגית שלנו עם לאומית שירותי בריאות יוצרת מסלול Medical Accelerator בלעדי עם גישה לדאטה רפואי אנונימי, פיילוטים קליניים, הכוונה לוועדת הלסינקי ותמיכה רגולטורית. מפיתוח MVP ושירותי CTO ועד אסטרטגיית IP, רישום פטנטים, הכנה למשקיעים וחיבור למשקיעים — וויסלרייט הוא מרכז החדשנות שבו סטארטאפים הופכים למיזמים.',
    },
  },
  
  subdomains: {
    main: 'https://weccelerate.co.il',
    leumit: 'https://leumit.weccelerate.co.il',
    biz: 'https://biz.weccelerate.co.il',
    portal: 'https://portal.weccelerate.co.il',
    api: 'https://api.weccelerate.co.il',
  },
  locale: 'he-IL',
  alternateLocales: ['en-US', 'en-GB'],
  themeColor: '#1a365d',
  backgroundColor: '#ffffff',
} as const;

// =============================================================================
// BRAND ENTITY DEFINITIONS
// =============================================================================

export const BRAND = {
  name: 'WeCcelerate',
  legalName: 'WeCcelerate Ltd.',
  tagline: 'Venture Builder & Startup Accelerator Israel',
  taglineHe: 'Venture Builder ומאיץ סטארטאפים בישראל',
  
  // English brand identity
  english: {
    name: 'WeCcelerate',
    variations: [
      'WeCcelerate',
      'We Accelerate',
      'We-Ccelerate',
      'Weccelerate',
      'We-Accelerate',
    ],
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
      'ווי סלרייט',
    ],
  },
  
  // Legacy format for backward compatibility
  variations: {
    english: ['WeCcelerate', 'We Accelerate', 'We-Ccelerate', 'Weccelerate', 'We-Accelerate'],
    hebrew: ['וויסלרייט', 'ויקלרייט', 'ווי אקסלרייט', 'וויסלרייט קידום עסקים', 'וי-אקסלרייט', 'ווי סלרייט'],
  },
  
  // Core descriptions - General tech focus with MedTech advantage
  descriptions: {
    short: SITE_CONFIG.description.short,
    medium: SITE_CONFIG.description.medium,
    long: SITE_CONFIG.description.long,
  },
} as const;

// =============================================================================
// PARTNER ORGANIZATION (MedTech Superpower)
// =============================================================================

export const PARENT_ORGANIZATION = {
  name: 'לאומית שירותי בריאות',
  nameEn: 'Leumit Health Services',
  nameHe: 'לאומית שירותי בריאות',
  
  description: {
    en: 'One of Israel\'s four major health funds, providing comprehensive healthcare services to over 700,000 members. Strategic partner for WeCcelerate\'s MedTech acceleration track.',
    he: 'אחת מארבע קופות החולים הגדולות בישראל, המספקת שירותי בריאות מקיפים ליותר מ-700,000 מבוטחים. שותפה אסטרטגית למסלול האצת ה-MedTech של וויסלרייט.',
  },
  
  url: 'https://www.leumit.co.il',
  logo: 'https://www.leumit.co.il/images/logo.png',
  
  sameAs: [
    'https://www.facebook.com/LeumitHealth',
    'https://www.linkedin.com/company/leumit-health-services',
    'https://twitter.com/LeumitHealth',
  ],
  
  // What the partnership provides
  benefits: {
    en: [
      'Access to anonymized medical data',
      'Clinical pilot programs',
      'Medical expert consultations',
      'Regulatory pathway guidance',
      'Real-world validation environment',
    ],
    he: [
      'גישה לדאטה רפואי אנונימי',
      'תוכניות פיילוט קליניות',
      'ייעוץ ממומחים רפואיים',
      'הכוונה בנתיבי רגולציה',
      'סביבת תיקוף בעולם האמיתי',
    ],
  },
} as const;

// =============================================================================
// SEMANTIC CORE - Primary Target Keywords
// =============================================================================

export const SEMANTIC_CORE = [
  'Venture Builder Israel',
  'Startup Accelerator',
  'Medical Accelerator',
  'Innovation Hub Tel Aviv',
  'Weccelerate',
  'וויסלרייט',
] as const;

// =============================================================================
// KEYWORDS - Hybrid Strategy (Venture Builder + MedTech Superpower)
// =============================================================================

export const KEYWORDS = {
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
      'Digital Transformation',
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
      'פיתוח פולסטאק',
    ],
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
      'Go-to-Market Strategy',
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
      'אסטרטגיית כניסה לשוק',
    ],
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
      'Custom AI Solutions',
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
      'MVP בינה מלאכותית',
    ],
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
      'Healthcare Startup Accelerator',
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
      'מיזמים רפואיים',
    ],
  },
  
  // Regulatory keywords
  regulatory: {
    english: [
      'CE Marking',
      'Regulatory Approval Process',
      'Medical Device Regulation',
      'Israeli MOH Approval',
      'Regulatory Consulting',
      'MDR Compliance',
      'ISO 13485',
      'HIPAA Compliance',
      'Medical Device Certification',
      'Regulatory Pathway',
      'Clinical Validation',
    ],
    hebrew: [
      'סימון CE',
      'תהליך רגולטורי',
      'רגולציה מכשור רפואי',
      'אישור משרד הבריאות',
      'ייעוץ רגולטורי',
      'עמידה ב-MDR',
      'ISO רפואי',
      'תיקוף קליני',
      'הסמכת מכשור רפואי',
      'נתיב רגולטורי',
    ],
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
      'Consumer Apps',
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
      'אפליקציות צרכניות',
    ],
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
      'האצת סטארטאפים',
    ],
    en: [
      'Startup Accelerator Israel',
      'App Development',
      'MVP Development',
      'Tech Incubator',
      'Product Development',
      'AI Solutions',
      'Startup Acceleration',
    ],
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
      'מסלול MedTech עם לאומית',
    ],
    en: [
      'Mobile App Development Israel',
      'Web Application Development',
      'Investor Fundraising',
      'Business Mentoring',
      'SaaS Development',
      'IoT Solutions',
      'MedTech Track with Leumit',
    ],
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
      'מה ההבדל בין אקסלרטור לחממה',
    ],
    en: [
      'How to start a startup',
      'How much does app development cost',
      'How to build an MVP',
      'What is WeCcelerate',
      'How to raise funding',
      'How to develop a tech product',
      'Difference between accelerator and incubator',
    ],
  },
} as const;

// Alias for backward compatibility
export const USER_INTENT_KEYWORDS = KEYWORDS;

// =============================================================================
// SERVICES CATALOG - Full Tech Stack + MedTech Track
// =============================================================================

export const SERVICES = [
  // Core Tech Services
  {
    id: 'full-stack-development',
    name: {
      en: 'Full-Stack Development',
      he: 'פיתוח פולסטאק',
    },
    description: {
      en: 'End-to-end development for web and mobile applications. From concept to deployment, we build scalable, production-ready solutions.',
      he: 'פיתוח מקצה לקצה לאפליקציות ווב ומובייל. מהרעיון ועד להשקה, אנו בונים פתרונות סקיילבליים ומוכנים לפרודקשן.',
    },
    url: '/services/development',
    priceRange: '₪₪₪',
    price: '50000',
    category: 'Software Development',
    duration: '3-6 months',
    icon: 'code',
  },
  {
    id: 'mvp-development',
    name: {
      en: 'MVP Development',
      he: 'פיתוח MVP',
    },
    description: {
      en: 'Rapid prototyping and minimum viable product development. Validate your idea quickly with a working product that attracts investors.',
      he: 'פיתוח אב-טיפוס ומוצר מינימלי בר-קיימא. תקפו את הרעיון שלכם במהירות עם מוצר עובד שמושך משקיעים.',
    },
    url: '/services/mvp',
    priceRange: '₪₪₪',
    price: '35000',
    category: 'Product Development',
    duration: '6-12 weeks',
    icon: 'rocket',
  },
  {
    id: 'ai-integration',
    name: {
      en: 'AI Integration',
      he: 'הטמעת בינה מלאכותית',
    },
    description: {
      en: 'Integrate cutting-edge AI capabilities into your business. From ChatGPT and LLMs to custom machine learning models.',
      he: 'הטמעת יכולות בינה מלאכותית מתקדמות בעסק שלכם. מ-ChatGPT ו-LLMs ועד מודלים מותאמים אישית.',
    },
    url: '/services/ai',
    priceRange: '₪₪₪₪',
    price: '75000',
    category: 'AI & Machine Learning',
    duration: '2-4 months',
    icon: 'brain',
  },
  {
    id: 'mobile-apps',
    name: {
      en: 'Mobile App Development',
      he: 'פיתוח אפליקציות מובייל',
    },
    description: {
      en: 'Native and cross-platform mobile applications for iOS and Android. Beautiful, performant apps that users love.',
      he: 'אפליקציות מובייל נייטיב וקרוס-פלטפורם ל-iOS ו-Android. אפליקציות יפות ומהירות שמשתמשים אוהבים.',
    },
    url: '/services/mobile',
    priceRange: '₪₪₪₪',
    price: '60000',
    category: 'Mobile Development',
    duration: '3-5 months',
    icon: 'smartphone',
  },
  {
    id: 'startup-acceleration',
    name: {
      en: 'Startup Acceleration Program',
      he: 'תוכנית האצת סטארטאפים',
    },
    description: {
      en: 'Comprehensive acceleration program including mentorship, resources, investor connections, and workspace. Turn your idea into a fundable company.',
      he: 'תוכנית האצה מקיפה הכוללת מנטורינג, משאבים, חיבור למשקיעים ומרחב עבודה. הפכו את הרעיון לחברה שניתן להשקיע בה.',
    },
    url: '/services/acceleration',
    priceRange: '₪₪₪',
    price: '0',
    category: 'Business Acceleration',
    duration: '6-12 months',
    icon: 'trending-up',
  },
  {
    id: 'investor-connections',
    name: {
      en: 'Investor Relations & Fundraising',
      he: 'קשרי משקיעים וגיוס הון',
    },
    description: {
      en: 'Direct introductions to VCs, angel investors, and strategic partners. Pitch preparation and investor deck creation included.',
      he: 'היכרות ישירה עם קרנות הון סיכון, משקיעי אנג\'ל ושותפים אסטרטגיים. כולל הכנה לפיץ\' ובניית מצגת משקיעים.',
    },
    url: '/services/investors',
    priceRange: 'Success-based',
    price: '0',
    category: 'Business Development',
    duration: 'Ongoing',
    icon: 'handshake',
  },
  
  // MedTech Track (Leumit Partnership) - The Superpower
  {
    id: 'medtech-track',
    name: {
      en: 'MedTech Track (Leumit Partnership)',
      he: 'מסלול MedTech (בשיתוף לאומית)',
    },
    description: {
      en: 'Exclusive healthcare innovation track with Leumit Health Services. Access to medical data, clinical pilots, physician consultations, and regulatory guidance.',
      he: 'מסלול חדשנות רפואית בלעדי עם לאומית שירותי בריאות. גישה לדאטה רפואי, פיילוטים קליניים, התייעצות עם רופאים והכוונה רגולטורית.',
    },
    url: '/services/medtech',
    priceRange: '₪₪₪₪₪',
    price: '100000',
    category: 'Healthcare Innovation',
    duration: '12-18 months',
    icon: 'heart-pulse',
    featured: true,
    partnership: 'Leumit Health Services',
  },
  {
    id: 'medical-data-access',
    name: {
      en: 'Medical Data Access',
      he: 'גישה לדאטה רפואי',
    },
    description: {
      en: 'Secure access to anonymized medical data from Leumit for research, AI training, and clinical validation. IRB-approved processes.',
      he: 'גישה מאובטחת לדאטה רפואי אנונימי מלאומית למחקר, אימון AI ותיקוף קליני. תהליכים מאושרי ועדת הלסינקי.',
    },
    url: '/services/data',
    priceRange: 'Contact us',
    price: '0',
    category: 'Healthcare Data',
    duration: 'Project-based',
    icon: 'database',
    partnership: 'Leumit Health Services',
  },
  {
    id: 'regulatory-consulting',
    name: {
      en: 'Regulatory Consulting',
      he: 'ייעוץ רגולטורי',
    },
    description: {
      en: 'Expert guidance through CE and Israeli MOH regulatory pathways for medical devices and digital health products.',
      he: 'הכוונה מקצועית בנתיבי הרגולציה של CE ומשרד הבריאות למכשור רפואי ומוצרי בריאות דיגיטליים.',
    },
    url: '/services/regulatory',
    priceRange: '₪₪₪₪',
    price: '45000',
    category: 'Regulatory Affairs',
    duration: 'Ongoing',
    icon: 'shield-check',
  },
] as const;

// =============================================================================
// FAQ CONTENT - Broader Focus
// =============================================================================

export const FAQ_ITEMS = [
  // General Questions
  {
    question: {
      he: 'מה זה וויסלרייט?',
      en: 'What is WeCcelerate?',
    },
    answer: {
      he: 'וויסלרייט (WeCcelerate) היא פלטפורמת האצת סטארטאפים ופיתוח מוצרים טכנולוגיים מובילה בישראל. אנו מסייעים ליזמים בכל תחומי הטכנולוגיה - מאפליקציות ובינה מלאכותית ועד IoT ומוצרים פיזיים. יתרון ייחודי שלנו הוא מסלול MedTech בלעדי בשיתוף לאומית שירותי בריאות.',
      en: 'WeCcelerate is Israel\'s leading startup acceleration and tech product development platform. We support entrepreneurs across all tech sectors - from apps and AI to IoT and physical products. Our unique advantage is an exclusive MedTech track in partnership with Leumit Health Services.',
    },
  },
  {
    question: {
      he: 'איך מקימים סטארטאפ?',
      en: 'How do you start a startup?',
    },
    answer: {
      he: 'הקמת סטארטאפ מתחילה בזיהוי בעיה אמיתית ופיתוח פתרון. דרך WeCcelerate תקבלו ליווי מקיף: עזרה בגיבוש הרעיון, בניית MVP, חיבור למשקיעים ומנטורינג מיזמים מנוסים. התהליך כולל אפיון מוצר, פיתוח, בדיקות שוק וגיוס הון.',
      en: 'Starting a startup begins with identifying a real problem and developing a solution. Through WeCcelerate you\'ll receive comprehensive support: help refining your idea, MVP development, investor connections, and mentoring from experienced entrepreneurs. The process includes product definition, development, market testing, and fundraising.',
    },
  },
  {
    question: {
      he: 'כמה עולה לפתח אפליקציה?',
      en: 'How much does it cost to develop an app?',
    },
    answer: {
      he: 'עלות פיתוח אפליקציה תלויה במורכבות ובפיצ\'רים. MVP בסיסי יכול לעלות 35,000-50,000 ש"ח, אפליקציה מלאה 60,000-150,000 ש"ח, ופרויקטים מורכבים יותר. ב-WeCcelerate אנו מציעים הערכת עלויות חינמית ומסלולי תשלום גמישים.',
      en: 'App development costs depend on complexity and features. A basic MVP can cost $10,000-15,000, a full app $15,000-40,000, and complex projects more. At WeCcelerate we offer free cost estimates and flexible payment plans.',
    },
  },
  {
    question: {
      he: 'מה היתרון של מסלול MedTech עם לאומית?',
      en: 'What is the advantage of the MedTech track with Leumit?',
    },
    answer: {
      he: 'מסלול ה-MedTech בשיתוף לאומית מספק יתרונות בלעדיים: גישה לדאטה רפואי אנונימי של מאות אלפי מבוטחים, אפשרות לפיילוטים קליניים במרפאות, התייעצות עם רופאים ומומחים, הכוונה רגולטורית (CE, משרד הבריאות) ואמינות מוגברת מול משקיעים.',
      en: 'The MedTech track with Leumit provides exclusive advantages: access to anonymized medical data from hundreds of thousands of patients, clinical pilot opportunities in clinics, consultation with physicians and experts, regulatory guidance (CE, Ministry of Health), and enhanced credibility with investors.',
    },
  },
  {
    question: {
      he: 'איך מגייסים כסף לסטארטאפ?',
      en: 'How do you raise funding for a startup?',
    },
    answer: {
      he: 'גיוס הון מתחיל בהכנת מצגת משקיעים (Pitch Deck) מקצועית והוכחת התאמת מוצר-שוק. WeCcelerate מחברת אתכם ישירות לקרנות הון סיכון, משקיעי אנג\'ל ושותפים אסטרטגיים. אנו מלווים בהכנה לפגישות, משא ומתן ועד לסגירת העסקה.',
      en: 'Fundraising starts with preparing a professional investor presentation (Pitch Deck) and proving product-market fit. WeCcelerate connects you directly to venture capital funds, angel investors, and strategic partners. We guide you through meeting preparation, negotiation, and deal closing.',
    },
  },
  {
    question: {
      he: 'באילו תחומים אתם עובדים?',
      en: 'What industries do you work in?',
    },
    answer: {
      he: 'אנו עובדים בכל תחומי הטכנולוגיה: בינה מלאכותית, אפליקציות מובייל, SaaS, IoT, פינטק, אדטק, פודטק, ריטיילטק, סייבר ועוד. בנוסף, יש לנו מסלול MedTech ייחודי למיזמים בתחום הבריאות בשיתוף לאומית.',
      en: 'We work across all tech sectors: AI, mobile apps, SaaS, IoT, FinTech, EdTech, FoodTech, RetailTech, Cybersecurity, and more. Additionally, we have a unique MedTech track for healthcare ventures in partnership with Leumit.',
    },
  },
  {
    question: {
      he: 'מה ההבדל בין אקסלרטור לאינקובטור?',
      en: 'What is the difference between an accelerator and an incubator?',
    },
    answer: {
      he: 'אינקובטור מתמקד בשלבים המוקדמים ביותר ומספק זמן ומרחב לפיתוח הרעיון. אקסלרטור כמו WeCcelerate מיועד לסטארטאפים עם רעיון מגובש או מוצר ראשוני ומאיץ את הצמיחה באמצעות מנטורינג אינטנסיבי, משאבים, פיתוח וחיבור למשקיעים בתקופה קצרה.',
      en: 'An incubator focuses on the earliest stages and provides time and space to develop the idea. An accelerator like WeCcelerate is designed for startups with a defined concept or initial product and accelerates growth through intensive mentoring, resources, development, and investor connections in a short period.',
    },
  },
  {
    question: {
      he: 'כמה זמן לוקח לפתח MVP?',
      en: 'How long does it take to develop an MVP?',
    },
    answer: {
      he: 'פיתוח MVP אופייני לוקח 6-12 שבועות, תלוי במורכבות. ב-WeCcelerate אנו משתמשים במתודולוגיות Agile ו-Lean Startup כדי לספק מוצר עובד במהירות, לקבל משוב מהשוק ולשפר באופן מתמיד.',
      en: 'A typical MVP development takes 6-12 weeks, depending on complexity. At WeCcelerate we use Agile and Lean Startup methodologies to deliver a working product quickly, get market feedback, and continuously improve.',
    },
  },
  {
    question: {
      he: 'מה כולל הייעוץ העסקי של WeCcelerate?',
      en: 'What does WeCcelerate business consulting include?',
    },
    answer: {
      he: 'הייעוץ העסקי כולל מחקר שוק וניתוח תחרות, בניית תוכנית שיווקית, תוכנית פיננסית מפורטת, תקציר מנהלים מקצועי ותוכנית עסקית מלאה. כל מסמך מותאם לסטנדרטים שמשקיעים מצפים לראות.',
      en: 'Business consulting includes market research and competitive analysis, marketing plan, detailed financial plan, executive summary, and full business plan. Every document is tailored to investor-grade standards.',
    },
  },
  {
    question: {
      he: 'איך WeCcelerate עוזרת בשיווק ויח"צ?',
      en: 'How does WeCcelerate help with marketing and PR?',
    },
    answer: {
      he: 'WeCcelerate מספקת מעטפת שיווקית מלאה: אסטרטגיית שיווק, ניהול קמפיינים בגוגל ובמדיה חברתית, יחסי ציבור מול כלי תקשורת ישראליים ובינלאומיים, בניית מותג ועיצוב חומרי שיווק.',
      en: 'WeCcelerate provides a full marketing suite: marketing strategy, Google & social media campaign management, PR with Israeli and international media, brand building, and marketing materials design.',
    },
  },
  {
    question: {
      he: 'איך להגיש מועמדות ל-WeCcelerate?',
      en: 'How to apply to WeCcelerate?',
    },
    answer: {
      he: 'הגשת מועמדות פשוטה — מלאו את טופס יצירת קשר באתר weccelerate.co.il/contact ונציג יחזור אליכם תוך 48 שעות לתיאום פגישת הכרות ראשונית (ללא עלות). אנו מלווים יזמים בכל שלב — מרעיון גולמי ועד חברות בצמיחה.',
      en: 'Applying is simple — fill out the contact form at weccelerate.co.il/contact and a representative will get back to you within 48 hours to schedule a free introductory meeting. We support entrepreneurs at every stage — from raw idea to growth-stage companies.',
    },
  },
] as const;

// Alias for backward compatibility
export const FAQ_DATA = FAQ_ITEMS;

// =============================================================================
// SOCIAL MEDIA & CONTACT
// =============================================================================

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/weccelerate',
  linkedin: 'https://www.linkedin.com/company/weccelerate',
  youtube: 'https://www.youtube.com/@WeCcelerate.Ltd1',
  twitter: 'https://twitter.com/WeCcelerate',
  instagram: 'https://www.instagram.com/weccelerate',
  github: 'https://github.com/weccelerate',
  tiktok: 'https://www.tiktok.com/@weccelerate',
} as const;

export const CONTACT = {
  email: 'info@weccelerate.co.il',
  phone: '+972-55-564-7538',
  phoneDisplay: '055-564-7538',
  whatsapp: '+972555647538',
  whatsappLink: 'https://wa.me/972555647538',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=%D7%A8%D7%97%D7%95%D7%91+%D7%94%D7%A8%D7%9B%D7%91%D7%AA+58+%D7%AA%D7%9C+%D7%90%D7%91%D7%99%D7%91',
  wazeUrl: 'https://waze.com/ul?q=%D7%A8%D7%97%D7%95%D7%91+%D7%94%D7%A8%D7%9B%D7%91%D7%AA+58+%D7%AA%D7%9C+%D7%90%D7%91%D7%99%D7%91',
  locations: {
    telAviv: {
      street: 'HaRakevet 58',
      streetHe: 'רחוב הרכבת 58',
      city: 'Tel Aviv',
      cityHe: 'תל אביב',
      country: 'Israel',
      countryHe: 'ישראל',
      postalCode: '6777801',
      full: 'HaRakevet 58, Tel Aviv, Israel',
      fullHe: 'רחוב הרכבת 58, תל אביב, ישראל',
    },
    jerusalem: {
      street: 'Jerusalem Branch',
      streetHe: 'סניף ירושלים',
      city: 'Jerusalem',
      cityHe: 'ירושלים',
      country: 'Israel',
      countryHe: 'ישראל',
      postalCode: '',
      full: 'Jerusalem Branch, Jerusalem, Israel',
      fullHe: 'סניף ירושלים, ירושלים, ישראל',
    },
  },
  // Legacy alias — points to Tel Aviv (primary office)
  address: {
    street: 'HaRakevet 58',
    streetHe: 'רחוב הרכבת 58',
    city: 'Tel Aviv',
    cityHe: 'תל אביב',
    country: 'Israel',
    countryHe: 'ישראל',
    postalCode: '6777801',
    full: 'HaRakevet 58, Tel Aviv, Israel',
    fullHe: 'רחוב הרכבת 58, תל אביב, ישראל',
  },
  hours: {
    weekdays: '09:00-18:00',
    friday: 'Closed',
    saturday: 'Closed',
  },
} as const;

// =============================================================================
// METADATA CONSTRUCTOR HELPER
// =============================================================================

interface MetadataOptions {
  title: string;
  description?: string;
  keywords?: string[];
  path?: string;
  image?: string;
  noIndex?: boolean;
  locale?: 'he' | 'en';
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

/**
 * Constructs comprehensive metadata for any page.
 */
export function constructMetadata(options: MetadataOptions): Metadata {
  const {
    title,
    description,
    keywords = [],
    path = '',
    image = '/images/og-default.jpg',
    noIndex = false,
    locale = 'he',
    type = 'website',
    publishedTime,
    modifiedTime,
    authors = ['WeCcelerate Team'],
  } = options;

  const fullTitle = `${title} | WeCcelerate - Venture Builder & Startup Accelerator Israel`;

  const fullDescription = description || SITE_CONFIG.defaultDescription;

  const allKeywords = [
    ...SEMANTIC_CORE,
    ...BRAND.english.variations,
    ...BRAND.hebrew.variations,
    ...KEYWORDS.primary.he,
    ...KEYWORDS.primary.en,
    ...keywords,
  ];

  const url = `${SITE_CONFIG.url}${path}`;

  return {
    title: {
      default: fullTitle,
      template: '%s | WeCcelerate - Venture Builder & Startup Accelerator Israel',
    },
    description: fullDescription,
    keywords: allKeywords,
    authors: authors.map((name) => ({ name })),
    creator: 'WeCcelerate',
    publisher: 'WeCcelerate',
    
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },

    openGraph: {
      type,
      title: fullTitle,
      description: fullDescription,
      url,
      siteName: 'WeCcelerate',
      locale: locale === 'he' ? 'he_IL' : 'en_US',
      alternateLocale: locale === 'he' ? ['en_US'] : ['he_IL'],
      images: [
        {
          url: image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`,
          width: 581,
          height: 312,
          alt: `${title} - WeCcelerate`,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      site: '@WeCcelerate',
      creator: '@WeCcelerate',
      images: [image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`],
    },

    alternates: {
      canonical: url,
      languages: {
        'he-IL': url,
        'en-US': `${SITE_CONFIG.url}/en${path}`,
      },
    },

    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
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
      'format-detection': 'telephone=no',
    },
  };
}

/**
 * Standard viewport configuration
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: SITE_CONFIG.themeColor },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get a random brand name variation for SEO diversity
 */
export function getRandomBrandVariation(language: 'english' | 'hebrew'): string {
  const variations = language === 'english' ? BRAND.english.variations : BRAND.hebrew.variations;
  return variations[Math.floor(Math.random() * variations.length)];
}

/**
 * Get brand variation by index (for deterministic selection per page)
 */
export function getBrandVariationByIndex(
  language: 'english' | 'hebrew',
  index: number
): string {
  const variations = language === 'english' ? BRAND.english.variations : BRAND.hebrew.variations;
  return variations[index % variations.length];
}

/**
 * Generate page-specific description with brand variation
 */
export function generatePageDescription(
  pageContext: string,
  locale: 'he' | 'en' = 'he',
  variationIndex?: number
): string {
  const brandVariation = variationIndex !== undefined
    ? getBrandVariationByIndex(locale === 'he' ? 'hebrew' : 'english', variationIndex)
    : getRandomBrandVariation(locale === 'he' ? 'hebrew' : 'english');

  if (locale === 'he') {
    return `${pageContext} | ${brandVariation} - ${SITE_CONFIG.description.short.he}`;
  }
  
  return `${pageContext} | ${brandVariation} - ${SITE_CONFIG.description.short.en}`;
}

/**
 * Get all SEO keywords as a flat array
 */
export function getAllKeywords(locale: 'en' | 'he' = 'en'): string[] {
  const languageKey = locale === 'en' ? 'english' : 'hebrew';
  return [
    ...KEYWORDS.tech[languageKey],
    ...KEYWORDS.startup[languageKey],
    ...KEYWORDS.ai[languageKey],
    ...KEYWORDS.medtech[languageKey],
    ...KEYWORDS.industry[languageKey],
  ];
}

/**
 * Get MedTech-specific keywords (for Leumit subdomain)
 */
export function getMedTechKeywords(locale: 'en' | 'he' = 'en'): string[] {
  const languageKey = locale === 'en' ? 'english' : 'hebrew';
  return [
    ...KEYWORDS.medtech[languageKey],
    ...KEYWORDS.regulatory[languageKey],
  ];
}

/**
 * Check if a service is part of MedTech track
 */
export function isMedTechService(serviceId: string): boolean {
  const medtechServices = ['medtech-track', 'medical-data-access', 'regulatory-consulting'];
  return medtechServices.includes(serviceId);
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default {
  SITE_CONFIG,
  SEMANTIC_CORE,
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
  isMedTechService,
};
