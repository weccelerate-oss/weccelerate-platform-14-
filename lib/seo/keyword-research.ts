/**
 * Keyword corpus - WeCcelerate organic-growth research (מחקר ביטויים.xlsx).
 *
 * MECHANICAL TRANSCRIPTION. This file is DATA, not strategy: it is the verbatim
 * keyword list the owner researched, with monthly Israeli search volume per
 * phrase. Nothing here decides what gets written.
 *
 * The strategy layer - how these phrases become articles, which phrase is a
 * pillar vs a cluster page, and which questions get inferred beyond this list -
 * lives in lib/agents/topic-strategy.ts.
 *
 * Do NOT hand-edit phrases or volumes: they are the measurement baseline that
 * coverage reporting is scored against.
 */

/** One researched phrase and its monthly search volume in Israel. */
export interface KeywordRow {
  phrase: string;
  /** Monthly searches (Israel, Hebrew). From the owner's research export. */
  volume: number;
}

export interface KeywordCluster {
  /** Stable ASCII id - used in slugs, briefs, and coverage reports. */
  id: string;
  /** The cluster heading exactly as it appears in the research file. */
  labelHe: string;
  /** Maps to GuideCategory in lib/seo/guides-catalog.ts. */
  category: string;
  /** The WeCcelerate service page this cluster's articles should CTA into. */
  servicePath: string;
  /** The broadest commercial phrase in the cluster - the pillar page target. */
  head: string;
  keywords: KeywordRow[];
}

export const KEYWORD_CLUSTERS: KeywordCluster[] = [
  {
    id: 'business-consulting',
    labelHe: 'ייעוץ עסקי',
    category: 'startup-basics',
    servicePath: '/services/business-consulting',
    head: 'ייעוץ עסקי',
    keywords: [
      { phrase: 'ייעוץ עסקי', volume: 1300 },
      { phrase: 'ייעוץ וליווי עסקי', volume: 250 },
      { phrase: 'ייעוץ עסקי לחברות', volume: 250 },
      { phrase: 'חברת ייעוץ עסקי', volume: 200 },
      { phrase: 'ייעוץ עסקי לעסקים', volume: 200 },
      { phrase: 'ייעוץ עסקי לסטארטאפים', volume: 200 },
      { phrase: 'כמה עולה ייעוץ עסקי', volume: 150 },
      { phrase: 'ייעוץ ופיתוח עסקי', volume: 150 },
      { phrase: 'ייעוץ עסקי שיווקי', volume: 150 },
      { phrase: 'חברות ייעוץ עסקי', volume: 150 },
      { phrase: 'ייעוץ עסקי במרכז', volume: 100 },
      { phrase: 'ייעוץ עסקי בתל אביב', volume: 90 },
      { phrase: 'ייעוץ שיווקי עסקי', volume: 90 },
      { phrase: 'ייעוץ עסקי לחברות הייטק', volume: 80 },
      { phrase: 'ייעוץ עסקי לחברות גדולות', volume: 80 },
      { phrase: 'שירותי ייעוץ עסקי', volume: 70 },
      { phrase: 'ייעוץ עסקי ושיווקי', volume: 70 },
      { phrase: 'ייעוץ עסקי הייטק', volume: 60 },
      { phrase: 'ייעוץ עסקי מחיר', volume: 60 },
      { phrase: 'ייעוץ עסקי לסטארט אפ', volume: 50 },
      { phrase: 'ייעוץ עסקי המלצות', volume: 50 },
      { phrase: 'ייעוץ עסקי ניהולי', volume: 50 },
      { phrase: 'ייעוץ עסקי לארגונים', volume: 50 },
      { phrase: 'ייעוץ כלכלי עסקי', volume: 50 },
      { phrase: 'מחיר שעת ייעוץ עסקי', volume: 50 },
      { phrase: 'ייעוץ עסקי כלכלי', volume: 50 },
      { phrase: 'מטרות ייעוץ עסקי', volume: 40 },
      { phrase: 'מה זה ייעוץ עסקי', volume: 40 },
      { phrase: 'ייעוץ עסקי תוכנית עסקית', volume: 40 },
      { phrase: 'ייעוץ עסקי מקצועי', volume: 40 },
      { phrase: 'ייעוץ עסקי מומלץ', volume: 40 },
      { phrase: 'פיתוח ייעוץ עסקי', volume: 40 },
      { phrase: 'ייעוץ פיתוח עסקי', volume: 40 },
    ],
  },
  {
    id: 'fundraising',
    labelHe: 'משקיעים וגיוס הון',
    category: 'fundraising',
    servicePath: '/services/business-consulting',
    head: 'גיוס כספים',
    keywords: [
      { phrase: 'משקיע', volume: 1100 },
      { phrase: 'משקיע כשיר', volume: 900 },
      { phrase: 'גיוס כספים', volume: 300 },
      { phrase: 'מצגת משקיעים', volume: 200 },
      { phrase: 'גיוס כספים דרך האינטרנט', volume: 150 },
      { phrase: 'סבבי גיוס', volume: 100 },
      { phrase: 'גיוס כספים באינטרנט', volume: 100 },
      { phrase: 'גיוס כספים לסטארט אפ', volume: 100 },
      { phrase: 'מה זה משקיע כשיר', volume: 100 },
      { phrase: 'משקיע מסווג', volume: 100 },
      { phrase: 'סבבי גיוס סטארטאפ', volume: 90 },
      { phrase: 'גיוס כספים למיזם', volume: 80 },
      { phrase: 'ויזת משקיע', volume: 60 },
      { phrase: 'משקיע אנג\'ל', volume: 50 },
      { phrase: 'גיוס כספים המוני', volume: 50 },
      { phrase: 'משקיע לעסק', volume: 40 },
      { phrase: 'סבב גיוס סטארט אפ', volume: 30 },
      { phrase: 'משקיע כשר', volume: 30 },
      { phrase: 'הצהרת משקיע כשיר', volume: 30 },
      { phrase: 'אישור משקיע כשיר', volume: 30 },
      { phrase: 'מצגת לגיוס משקיעים', volume: 30 },
      { phrase: 'סבב גיוס', volume: 20 },
      { phrase: 'גיוס כספים לעסק', volume: 20 },
      { phrase: 'גיוס כספים לעסקים', volume: 20 },
      { phrase: 'גיוס משקיע', volume: 10 },
      { phrase: 'משקיע אסטרטגי', volume: 10 },
      { phrase: 'משקיע אנגל', volume: 10 },
      { phrase: 'מה זה משקיע אנג\'ל', volume: 10 },
      { phrase: 'מצגת משקיעים סטארטאפ', volume: 10 },
      { phrase: 'סבב גיוס a', volume: 40 },
    ],
  },
  {
    id: 'business-plan',
    labelHe: 'תוכנית עסקית',
    category: 'startup-basics',
    servicePath: '/services/business-consulting',
    head: 'תוכנית עסקית',
    keywords: [
      { phrase: 'תוכנית עסקית', volume: 700 },
      { phrase: 'תוכנית עסקית לדוגמא', volume: 300 },
      { phrase: 'בניית תוכנית עסקית', volume: 250 },
      { phrase: 'כתיבת תוכנית עסקית', volume: 150 },
      { phrase: 'תוכנית עסקית לעסק חדש', volume: 100 },
      { phrase: 'תוכנית עסקית לסטארט אפ', volume: 100 },
      { phrase: 'הכנת תוכנית עסקית', volume: 80 },
      { phrase: 'תוכנית המשכיות עסקית', volume: 70 },
      { phrase: 'תוכנית עסקית לאפליקציה', volume: 60 },
      { phrase: 'איך בונים תוכנית עסקית', volume: 50 },
      { phrase: 'תוכנית עסקית להורדה', volume: 50 },
      { phrase: 'איך לבנות תוכנית עסקית', volume: 50 },
      { phrase: 'ייעוץ עסקי תוכנית עסקית', volume: 40 },
      { phrase: 'איך כותבים תוכנית עסקית', volume: 30 },
      { phrase: 'שלבים בבניית תוכנית עסקית', volume: 20 },
      { phrase: 'תוכנית עסקית מקצועית', volume: 10 },
      { phrase: 'תוכנית עסקית למשקיע', volume: 10 },
      { phrase: 'תוכנית עבודה עסקית', volume: 10 },
      { phrase: 'איך לכתוב תוכנית עסקית', volume: 10 },
      { phrase: 'איך עושים תוכנית עסקית', volume: 10 },
      { phrase: 'איך מכינים תוכנית עסקית', volume: 10 },
      { phrase: 'מה זה תוכנית עסקית', volume: 10 },
      { phrase: 'תוכנית עסקית למשקיעים', volume: 10 },
    ],
  },
  {
    id: 'events',
    labelHe: 'הפקת כנסים',
    category: 'startup-basics',
    servicePath: '/services/marketing',
    head: 'הפקת כנסים',
    keywords: [
      { phrase: 'הפקת כנסים', volume: 150 },
      { phrase: 'הפקת כנסים וירטואליים', volume: 100 },
      { phrase: 'הפקת כנסים ואירועים', volume: 100 },
      { phrase: 'הפקת כנסים עסקיים', volume: 90 },
      { phrase: 'הפקת כנסים רפואיים', volume: 80 },
      { phrase: 'הפקת כנסים בינלאומיים', volume: 80 },
      { phrase: 'הפקת כנסים מקצועיים', volume: 70 },
      { phrase: 'הפקת כנסים לחברות', volume: 70 },
      { phrase: 'חברות הפקת כנסים', volume: 60 },
      { phrase: 'הפקת כנסים ותערוכות', volume: 50 },
      { phrase: 'הפקת כנסים לחברות הייטק', volume: 40 },
      { phrase: 'הפקת כנסים בחו"ל', volume: 20 },
      { phrase: 'הפקת כנסים בחול', volume: 20 },
      { phrase: 'הפקת כנסים וימי עיון', volume: 10 },
      { phrase: 'הפקת כנסים למנהלים', volume: 10 },
    ],
  },
  {
    id: 'product-development',
    labelHe: 'פיתוח מוצרים',
    category: 'product-development',
    servicePath: '/services/physical-product',
    head: 'פיתוח מוצרים',
    keywords: [
      { phrase: 'פיתוח מוצרים', volume: 200 },
      { phrase: 'פיתוח מוצר', volume: 200 },
      { phrase: 'פיתוח מוצרים חדשים', volume: 150 },
      { phrase: 'תהליך פיתוח מוצר חדש', volume: 150 },
      { phrase: 'פיתוח מוצר טכנולוגי', volume: 150 },
      { phrase: 'פיתוח מוצר רפואי', volume: 150 },
      { phrase: 'פיתוח מוצרים רפואיים', volume: 100 },
      { phrase: 'חברות פיתוח מוצרים', volume: 100 },
      { phrase: 'פיתוח מוצר אב טיפוס', volume: 100 },
      { phrase: 'תהליך פיתוח מוצר', volume: 100 },
      { phrase: 'חברת פיתוח מוצר', volume: 100 },
      { phrase: 'פיתוח מוצר חדש', volume: 90 },
      { phrase: 'שלבי פיתוח מוצר', volume: 70 },
      { phrase: 'חברות פיתוח מוצרים רפואיים', volume: 60 },
      { phrase: 'פיתוח מוצר הנדסי', volume: 60 },
      { phrase: 'יזמות פיתוח מוצר', volume: 60 },
      { phrase: 'פיתוח מוצר הייטק', volume: 50 },
      { phrase: 'iot פיתוח מוצר', volume: 50 },
      { phrase: 'חברות פיתוח מוצר', volume: 40 },
      { phrase: 'פיתוח מוצרים מורכבים', volume: 30 },
      { phrase: 'פיתוח מוצרים ביטחוניים', volume: 30 },
      { phrase: 'מהנדס פיתוח מוצר', volume: 30 },
      { phrase: 'פיתוח מוצר מחיר', volume: 30 },
      { phrase: 'ליווי פיתוח מוצר', volume: 20 },
      { phrase: 'עלות פיתוח מוצר', volume: 20 },
      { phrase: 'פיתוח מוצרים שיווק', volume: 20 },
      { phrase: 'פיתוח מוצרים בטחוניים', volume: 10 },
      { phrase: 'פיתוח ועיצוב מוצרים', volume: 10 },
      { phrase: 'פיתוח מוצרים ליזמות', volume: 10 },
      { phrase: 'פיתוח מוצרים אלקטרוניים', volume: 10 },
      { phrase: 'פיתוח מוצרים דיגיטליים', volume: 10 },
    ],
  },
  {
    id: 'app-development',
    labelHe: 'פיתוח אפליקציות',
    category: 'product-development',
    servicePath: '/services/digital-product',
    head: 'פיתוח אפליקציות',
    keywords: [
      { phrase: 'פיתוח אפליקציות', volume: 400 },
      { phrase: 'חברת פיתוח אפליקציות', volume: 200 },
      { phrase: 'פיתוח אפליקציות מובייל', volume: 200 },
      { phrase: 'פיתוח אפליקציות web', volume: 150 },
      { phrase: 'פיתוח אפליקציות לאייפון', volume: 150 },
      { phrase: 'פיתוח אפליקציות לאנדרואיד', volume: 100 },
      { phrase: 'פיתוח אפליקציות ווב', volume: 100 },
      { phrase: 'פיתוח אפליקציות לעסקים', volume: 70 },
      { phrase: 'חברות פיתוח אפליקציות', volume: 50 },
      { phrase: 'כמה עולה פיתוח אפליקציות', volume: 40 },
      { phrase: 'פיתוח אפליקציות ai', volume: 40 },
      { phrase: 'חברות פיתוח אפליקציות בישראל', volume: 30 },
      { phrase: 'פיתוח אפליקציות לנייד', volume: 30 },
      { phrase: 'פיתוח אפליקציות api', volume: 20 },
    ],
  },
  {
    id: 'startup',
    labelHe: 'סטארטאפ',
    category: 'startup-basics',
    servicePath: '/services/business-consulting',
    head: 'סטארטאפ',
    keywords: [
      { phrase: 'סבבי גיוס סטארטאפ', volume: 90 },
      { phrase: 'סטארטאפ stealth', volume: 60 },
      { phrase: 'מימון סטארטאפ', volume: 50 },
      { phrase: 'הערכת שווי סטארטאפ', volume: 50 },
      { phrase: 'מנהל כספים לחברות סטארטאפ', volume: 40 },
      { phrase: 'eon סטארטאפ', volume: 40 },
      { phrase: 'סטארטאפ ישראלי', volume: 30 },
      { phrase: 'ניהול כספים סטארטאפ', volume: 30 },
      { phrase: 'הקמת חברת סטארטאפ', volume: 30 },
      { phrase: 'cfo לחברות סטארטאפ', volume: 30 },
      { phrase: 'בניית אתרים לחברות סטארטאפ', volume: 20 },
      { phrase: 'הסכם מייסדים סטארטאפ', volume: 20 },
      { phrase: 'הפקת סרטונים לחברות סטארטאפ', volume: 20 },
      { phrase: 'הסכם שותפות סטארטאפ', volume: 20 },
      { phrase: 'עורך דין סטארטאפ', volume: 20 },
      { phrase: 'מה זה סטארטאפ', volume: 20 },
      { phrase: 'הסכמי השקעה סטארטאפ', volume: 20 },
      { phrase: 'ניהול כספים לחברות סטארטאפ', volume: 20 },
      { phrase: 'יוניקורן סטארטאפ', volume: 10 },
      { phrase: 'סטארטאפ רפואי', volume: 10 },
      { phrase: 'איך להקים סטארטאפ', volume: 10 },
      { phrase: 'חברות סטארטאפ', volume: 10 },
      { phrase: 'סרט תדמית סטארטאפ', volume: 10 },
      { phrase: 'איך להתחיל סטארטאפ', volume: 10 },
      { phrase: 'קידום חברת סטארטאפ', volume: 10 },
    ],
  },
  {
    id: 'market-research',
    labelHe: 'מחקר שוק',
    category: 'startup-basics',
    servicePath: '/services/business-consulting',
    head: 'מחקר שוק',
    keywords: [
      { phrase: 'מחקר שוק', volume: 250 },
      { phrase: 'מחקר שוק ומתחרים', volume: 60 },
      { phrase: 'איך עושים מחקר שוק', volume: 50 },
      { phrase: 'ניתוח שוק', volume: 30 },
      { phrase: 'איך לעשות מחקר שוק', volume: 30 },
      { phrase: 'מה זה מחקר שוק', volume: 20 },
      { phrase: 'חברות מחקר שוק', volume: 20 },
      { phrase: 'ניתוח מגמות שוק', volume: 20 },
      { phrase: 'מחקר שוק לסטארטאפ', volume: 10 },
      { phrase: 'חברת מחקר שוק', volume: 10 },
      { phrase: 'שירותי מחקר שוק', volume: 10 },
      { phrase: 'ניתוח מתחרים ומחקר שוק', volume: 10 },
    ],
  },
];

/** Every researched phrase, flattened, with its owning cluster. */
export const ALL_KEYWORDS: Array<KeywordRow & { clusterId: string }> =
  KEYWORD_CLUSTERS.flatMap((c) => c.keywords.map((k) => ({ ...k, clusterId: c.id })));

/** Total addressable monthly search volume across the whole research file. */
export const TOTAL_RESEARCH_VOLUME = ALL_KEYWORDS.reduce((sum, k) => sum + k.volume, 0);

export function getCluster(id: string): KeywordCluster | undefined {
  return KEYWORD_CLUSTERS.find((c) => c.id === id);
}
