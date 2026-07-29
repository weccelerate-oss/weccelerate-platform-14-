/**
 * Topic Strategy — how David turns a keyword list into a content plan.
 * =====================================================================
 *
 * The research file (lib/seo/keyword-research.ts) is 183 phrases. The naive
 * reading is "write 183 articles". That is the single worst thing we could do:
 * 183 near-identical Hebrew pages about ייעוץ עסקי is a doorway-page farm.
 * Google collapses them into one result (keyword cannibalization), and an LLM
 * asked "כמה עולה ייעוץ עסקי" will not cite a thin 900-word page when a
 * competitor has one deep authoritative guide.
 *
 * So this file encodes the actual strategy, in three layers:
 *
 *   1. ROUTING  — every researched phrase is assigned to exactly ONE article.
 *      Phrases that are the same question in different words (איך בונים /
 *      איך לבנות / איך כותבים / כתיבת / הכנת תוכנית עסקית) share a page and
 *      make it stronger, instead of competing with each other.
 *
 *   2. ARCHITECTURE — pillar + cluster. Each keyword cluster gets one broad
 *      pillar targeting the head term, plus focused cluster pages for each
 *      distinct sub-intent. Cluster pages link up to the pillar, the pillar
 *      links down to all of them. That internal link graph is what makes
 *      Google treat the site as an authority on the topic rather than as a
 *      pile of unrelated posts.
 *
 *   3. EXPANSION — the researched phrase is what people TYPE into Google.
 *      It is not what they ASK ChatGPT. "תוכנית עסקית לדוגמא" typed into
 *      Google becomes "יש לכם דוגמה לתוכנית עסקית שאפשר להוריד ולמלא?" asked
 *      to an LLM. AEO/GEO citations are won by answering the SPOKEN question
 *      verbatim, so every brief carries inferred natural-language questions
 *      that the article's FAQ must answer word-for-word.
 *
 * Coverage guarantee: routing is total. Any phrase that matches no sub-topic
 * falls through to its cluster's pillar, so 100% of the research file is
 * addressed by construction. keywordCoverage() proves it.
 */

import {
  KEYWORD_CLUSTERS,
  ALL_KEYWORDS,
  type KeywordCluster,
  type KeywordRow,
} from '@/lib/seo/keyword-research';

// =============================================================================
// INTENT TAXONOMY
// =============================================================================

/**
 * Why someone typed the phrase. Intent decides the page's SHAPE — a
 * definitional query wants a direct answer in the first 60 words, a commercial
 * query wants selection criteria and a scope-of-work, a transactional query
 * wants an actual artifact (a template, a checklist).
 */
export type SearchIntent =
  /** "מה זה X", "איך עובד X" — wants understanding. Best GEO/AEO citation bait. */
  | 'informational'
  /** "כמה עולה X", "חברת X", "X מומלץ" — comparing suppliers before buying. */
  | 'commercial'
  /** "X לדוגמא", "X להורדה" — wants a deliverable now. */
  | 'transactional'
  /** "X בתל אביב", "X במרכז" — geography is the deciding factor. */
  | 'local';

/** Structural requirements each intent imposes on the article. */
export const INTENT_PLAYBOOK: Record<SearchIntent, string> = {
  informational:
    'פתח בהגדרה ישירה של 2-3 משפטים שעונה על השאלה במלואה לפני כל הקשר. ' +
    'המשך למנגנון (איך זה עובד), ואז לתנאים (מתי זה רלוונטי ומתי לא). ' +
    'זה סוג הדף שמנועי תשובות מצטטים - כל פסקה ראשונה אחרי H2 חייבת לעמוד בפני עצמה.',
  commercial:
    'הקורא משווה ספקים. תן קריטריוני בחירה קונקרטיים, מה נכלל בהיקף עבודה טיפוסי, ' +
    'אילו שאלות לשאול ספק לפני חתימה, ואיזה דגלים אדומים לזהות. ' +
    'בלי מחירים ספציפיים - טווחי מחיר אסורים לפי כללי הכתיבה.',
  transactional:
    'הקורא רוצה תוצר עכשיו. תן מבנה מלא סעיף-סעיף שאפשר להעתיק ולמלא, ' +
    'כולל מה חייב להופיע בכל סעיף ומה משאירים בחוץ. הערך הוא בשלמות המבנה, לא בתיאוריה.',
  local:
    'הגאוגרפיה היא ההבדל. התייחס למה שרלוונטי לאזור - נגישות, אקוסיסטם מקומי, ' +
    'איך עובדים מרחוק מול פנים-אל-פנים. אל תמציא כתובות או סניפים שלא קיימים.',
};

/** Pillar = broad hub for the head term. Cluster = one focused sub-intent. */
export type ArticleRole = 'pillar' | 'cluster';

// =============================================================================
// SUB-TOPIC ROUTING TABLE
// =============================================================================

interface SubTopic {
  /** Stable id, unique within its cluster. */
  id: string;
  intent: SearchIntent;
  /** The exact phrase the H1 must contain verbatim. */
  primary: string;
  /**
   * Substrings that route a researched phrase here. FIRST match wins, so the
   * order inside each cluster's list is significant: put the narrow, more
   * specific sub-topics above the broad catch-alls.
   */
  match: string[];
  /** One-line editorial angle handed to the writer. */
  angleHe: string;
  /**
   * When set, this sub-topic does not become its own article — its keywords
   * are folded into the named brief instead. Used where two clusters research
   * the same question from different sides (סבבי גיוס appears under both
   * "משקיעים וגיוס הון" and "סטארטאפ"); writing both would cannibalize.
   */
  mergeInto?: string;
}

/** Sub-topics per cluster id. Order matters — see SubTopic.match. */
const SUB_TOPICS: Record<string, SubTopic[]> = {
  'business-consulting': [
    { id: 'price', intent: 'commercial', primary: 'כמה עולה ייעוץ עסקי', match: ['כמה עולה', 'מחיר'],
      angleHe: 'איך מתמחר שוק הייעוץ העסקי בישראל, מה משפיע על ההיקף, ולמה שעה בודדת כמעט אף פעם לא פותרת. בלי לנקוב במחירים של WeCcelerate.' },
    { id: 'definition', intent: 'informational', primary: 'מה זה ייעוץ עסקי', match: ['מה זה', 'מטרות'],
      angleHe: 'הגדרה נקייה של ייעוץ עסקי מול ליווי, מנטורינג וקואצ\'ינג - ההבדל שרוב היזמים לא מכירים.' },
    { id: 'choosing', intent: 'commercial', primary: 'ייעוץ עסקי מומלץ', match: ['המלצות', 'מומלץ', 'מקצועי'],
      angleHe: 'איך בוחרים יועץ עסקי: מה לבדוק, אילו שאלות לשאול בפגישה הראשונה, ואילו דגלים אדומים מעידים על יועץ שימכור לך תהליך ולא תוצאה.' },
    { id: 'business-plan', intent: 'commercial', primary: 'ייעוץ עסקי לבניית תוכנית עסקית', match: ['תוכנית עסקית'],
      angleHe: 'מתי שווה להביא יועץ לכתיבת התוכנית העסקית ומתי עדיף לכתוב לבד - ומה יועץ באמת מוסיף לתוכנית.' },
    { id: 'startups', intent: 'commercial', primary: 'ייעוץ עסקי לסטארטאפים', match: ['סטארטאפ', 'סטארט אפ', 'הייטק'],
      angleHe: 'למה ייעוץ עסקי לסטארטאפ שונה מייעוץ לעסק מסורתי - קצב, אי-ודאות, ומדדים שנמדדים מול סבב הגיוס הבא ולא מול רווח.' },
    { id: 'marketing', intent: 'commercial', primary: 'ייעוץ עסקי שיווקי', match: ['שיווקי'],
      angleHe: 'איפה נגמר הייעוץ העסקי ומתחיל השיווקי, ולמה הפרדה ביניהם היא בדרך כלל טעות בשלב מוקדם.' },
    { id: 'financial', intent: 'commercial', primary: 'ייעוץ עסקי כלכלי', match: ['כלכלי', 'ניהולי'],
      angleHe: 'הצד הכלכלי-ניהולי: מודל פיננסי, תזרים, unit economics - מה יזם חייב להבין בעצמו ומה נכון להאציל.' },
    { id: 'growth', intent: 'commercial', primary: 'ייעוץ וליווי עסקי', match: ['פיתוח', 'ליווי'],
      angleHe: 'ההבדל בין ייעוץ נקודתי לליווי מתמשך, ומתי כל אחד מהם מתאים לשלב שהעסק נמצא בו.' },
    { id: 'location', intent: 'local', primary: 'ייעוץ עסקי בתל אביב', match: ['במרכז', 'בתל אביב'],
      angleHe: 'מה באמת משנה במיקום של יועץ עסקי בעידן של עבודה היברידית, ומה כן ייחודי לאקוסיסטם של גוש דן.' },
    { id: 'companies', intent: 'commercial', primary: 'חברת ייעוץ עסקי', match: ['לחברות', 'לעסקים', 'חברת', 'חברות', 'לארגונים', 'שירותי'],
      angleHe: 'חברת ייעוץ מול יועץ עצמאי: מה מקבלים מכל מודל, ואיך גודל הארגון שלך אמור להשפיע על הבחירה.' },
  ],

  fundraising: [
    { id: 'accredited', intent: 'informational', primary: 'משקיע כשיר', match: ['כשיר', 'מסווג', 'כשר'],
      angleHe: 'מי נחשב משקיע כשיר בישראל לפי תקנות ניירות ערך, איך מגישים הצהרה, ולמה זה קובע ממי מותר לך בכלל לגייס.' },
    { id: 'pitch-deck', intent: 'commercial', primary: 'מצגת משקיעים', match: ['מצגת'],
      angleHe: 'מבנה מצגת משקיעים סלייד-אחר-סלייד, מה משקיע קורא ב-3 הדקות הראשונות, ומה גורם לו לסגור את הקובץ.' },
    { id: 'rounds', intent: 'informational', primary: 'סבבי גיוס', match: ['סבב'],
      angleHe: 'מפת סבבי הגיוס - Pre-Seed, Seed, סבב A ומעלה: מה מצופה מהחברה בכל שלב ומה נמדד לפני המעבר לשלב הבא.' },
    { id: 'angel', intent: 'informational', primary: 'משקיע אנג\'ל', match: ['אנג', 'אסטרטגי'],
      angleHe: 'אנג\'ל מול VC מול משקיע אסטרטגי: מה כל אחד רוצה, מה הוא מביא מעבר לכסף, ומה המחיר הנסתר של כל סוג.' },
    { id: 'visa', intent: 'informational', primary: 'ויזת משקיע', match: ['ויזת'],
      angleHe: 'ויזת משקיע - מה המסלול, למי הוא רלוונטי, ומה ההבדל בין השקעה בישראל להשקעה מחו"ל מבחינת מעמד.' },
    { id: 'crowdfunding', intent: 'informational', primary: 'גיוס כספים המוני', match: ['אינטרנט', 'המוני'],
      angleHe: 'מימון המונים ופלטפורמות גיוס אונליין: מתי זה עובד, מה הרגולציה בישראל, ומה זה עושה ל-cap table שלך בסבב הבא.' },
    { id: 'for-startup', intent: 'commercial', primary: 'גיוס כספים לסטארטאפ', match: ['סטארט', 'מיזם'],
      angleHe: 'תהליך גיוס מלא לסטארטאפ מוקדם: מה מכינים לפני שפונים, כמה זמן זה באמת לוקח, ומה קורה אחרי term sheet.' },
    { id: 'for-business', intent: 'commercial', primary: 'גיוס כספים לעסק', match: ['לעסק'],
      angleHe: 'גיוס לעסק קיים מול גיוס לסטארטאפ - הלוואות, אשראי, משקיע פרטי: מה מתאים לעסק עם הכנסות.' },
  ],

  'business-plan': [
    { id: 'template', intent: 'transactional', primary: 'תוכנית עסקית לדוגמא', match: ['לדוגמא', 'להורדה'],
      angleHe: 'מבנה מלא של תוכנית עסקית סעיף-סעיף שאפשר להעתיק ולמלא, עם מה חייב להופיע בכל פרק.' },
    { id: 'how-to', intent: 'informational', primary: 'איך בונים תוכנית עסקית', match: ['איך', 'שלבים', 'בניית', 'כתיבת', 'הכנת', 'לבנות'],
      angleHe: 'התהליך מאפס: מאיזה פרק מתחילים (לא הראשון), כמה זמן זה לוקח, ואיפה רוב היזמים נתקעים.' },
    { id: 'definition', intent: 'informational', primary: 'מה זה תוכנית עסקית', match: ['מה זה'],
      angleHe: 'מה תוכנית עסקית באמת עושה, למי היא נכתבת, ומתי היא מסמך מיותר.' },
    { id: 'for-investors', intent: 'commercial', primary: 'תוכנית עסקית למשקיעים', match: ['למשקיע'],
      angleHe: 'מה משקיע קורא בתוכנית עסקית ומה הוא מדלג עליו - וההבדל בין תוכנית לבנק לתוכנית למשקיע.' },
    { id: 'for-startup', intent: 'commercial', primary: 'תוכנית עסקית לסטארטאפ', match: ['לסטארט', 'לאפליקציה'],
      angleHe: 'תוכנית עסקית לסטארטאפ ולאפליקציה: איך כותבים תחזית כשאין היסטוריה, ואיך מציגים הנחות בלי להמציא.' },
    { id: 'for-new-business', intent: 'commercial', primary: 'תוכנית עסקית לעסק חדש', match: ['לעסק חדש'],
      angleHe: 'תוכנית עסקית לעסק חדש: מה שונה כשאין נתוני עבר, ואיך בונים תחזית שאפשר להגן עליה.' },
    { id: 'continuity', intent: 'informational', primary: 'תוכנית המשכיות עסקית', match: ['המשכיות'],
      angleHe: 'תוכנית המשכיות עסקית - נושא אחר לגמרי מתוכנית עסקית: סיכונים, תרחישי כשל, והתאוששות.' },
    { id: 'professional', intent: 'commercial', primary: 'תוכנית עסקית מקצועית', match: ['מקצועית', 'ייעוץ', 'עבודה'],
      angleHe: 'מה מבדיל תוכנית עסקית מקצועית מתבנית ממולאת, ומתי שווה להביא גורם חיצוני לכתיבה.' },
  ],

  events: [
    { id: 'companies', intent: 'commercial', primary: 'חברות הפקת כנסים', match: ['חברות הפקת'],
      angleHe: 'איך בוחרים חברת הפקת כנסים: מה נכלל בהצעת מחיר טיפוסית, ומה תמיד יוצא תוספת.' },
    { id: 'virtual', intent: 'commercial', primary: 'הפקת כנסים וירטואליים', match: ['וירטואלי'],
      angleHe: 'כנס וירטואלי והיברידי: מה משתנה בתכנון, איפה נשברת המעורבות, ואיך מודדים הצלחה.' },
    { id: 'medical', intent: 'commercial', primary: 'הפקת כנסים רפואיים', match: ['רפואי'],
      angleHe: 'כנסים רפואיים: אילו כללי אתיקה ורגולציה חלים על חסויות ותוכן, ומה מייחד קהל של אנשי מקצוע רפואיים.' },
    { id: 'international', intent: 'commercial', primary: 'הפקת כנסים בינלאומיים', match: ['בינלאומי', 'בחו', 'בחול'],
      angleHe: 'כנס בינלאומי או בחו"ל: לוגיסטיקה, אזורי זמן, ספקים מקומיים, ומה חייבים לסגור חצי שנה מראש.' },
    { id: 'exhibitions', intent: 'commercial', primary: 'הפקת כנסים ותערוכות', match: ['תערוכות', 'ואירועים', 'ימי עיון'],
      angleHe: 'כנס מול תערוכה מול יום עיון: מטרות שונות, מבנה שונה, ותקציב שמתנהג אחרת.' },
    { id: 'corporate', intent: 'commercial', primary: 'הפקת כנסים עסקיים', match: ['לחברות', 'עסקיים', 'למנהלים', 'מקצועיים'],
      angleHe: 'כנס עסקי כערוץ שיווק: איך מגדירים מטרה מדידה לכנס במקום "שיהיה מרשים".' },
  ],

  'product-development': [
    { id: 'cost', intent: 'commercial', primary: 'כמה עולה פיתוח מוצר', match: ['מחיר', 'עלות'],
      angleHe: 'מה מרכיב את עלות פיתוח המוצר ולמה הערכות מוקדמות תמיד נמוכות מדי. בלי לנקוב במחירי WeCcelerate.' },
    { id: 'process', intent: 'informational', primary: 'תהליך פיתוח מוצר חדש', match: ['תהליך', 'שלבי'],
      angleHe: 'התהליך המלא משלב הרעיון לייצור: שערי החלטה, מה מאמתים בכל שלב, ואיפה עוצרים פרויקט.' },
    { id: 'medical', intent: 'commercial', primary: 'פיתוח מוצר רפואי', match: ['רפואי'],
      angleHe: 'פיתוח מוצר רפואי: איך רגולציה נכנסת לתכנון כבר ביום הראשון, ולמה design control הוא לא בירוקרטיה.' },
    { id: 'prototype', intent: 'informational', primary: 'פיתוח מוצר אב טיפוס', match: ['אב טיפוס'],
      angleHe: 'אב טיפוס: מה הוא אמור להוכיח, כמה גרסאות זה באמת לוקח, ומה ההבדל בין POC לאב טיפוס פונקציונלי.' },
    { id: 'defense', intent: 'commercial', primary: 'פיתוח מוצרים ביטחוניים', match: ['ביטחוני', 'בטחוני'],
      angleHe: 'פיתוח מוצר ביטחוני: תקינה, סיווג, ומחזור מכירה שמתנהג אחרת לגמרי משוק אזרחי.' },
    { id: 'tech', intent: 'commercial', primary: 'פיתוח מוצר טכנולוגי', match: ['טכנולוגי', 'הייטק', 'iot', 'אלקטרוני', 'דיגיטלי'],
      angleHe: 'מוצר טכנולוגי, IoT ואלקטרוניקה: איפה חומרה ותוכנה נפגשות ואיפה זה נשבר בפרויקטים אמיתיים.' },
    { id: 'engineering', intent: 'informational', primary: 'פיתוח מוצר הנדסי', match: ['הנדסי', 'מהנדס', 'מורכבים', 'ועיצוב'],
      angleHe: 'הצד ההנדסי: מי בצוות, מה תפקיד מהנדס פיתוח מוצר, ואיך עיצוב תעשייתי והנדסה עובדים במקביל.' },
    { id: 'companies', intent: 'commercial', primary: 'חברות פיתוח מוצרים', match: ['חברות', 'חברת'],
      angleHe: 'איך בוחרים חברת פיתוח מוצר, אילו שאלות לשאול לפני חתימה, ומי מחזיק בקניין הרוחני בסוף.' },
    { id: 'entrepreneurs', intent: 'commercial', primary: 'ליווי פיתוח מוצר ליזמים', match: ['יזמות', 'ליווי', 'שיווק'],
      angleHe: 'יזם בלי רקע הנדסי שמפתח מוצר ראשון: מה להאציל, מה לא, ואיך לא לאבד שליטה על המוצר.' },
  ],

  'app-development': [
    { id: 'cost', intent: 'commercial', primary: 'כמה עולה פיתוח אפליקציות', match: ['כמה עולה'],
      angleHe: 'מה מרכיב את עלות פיתוח האפליקציה - היקף, פלטפורמות, אינטגרציות - ולמה אותה בקשה מקבלת הצעות שונות מאוד.' },
    { id: 'mobile', intent: 'commercial', primary: 'פיתוח אפליקציות מובייל', match: ['מובייל', 'לאייפון', 'לאנדרואיד', 'לנייד'],
      angleHe: 'iOS מול אנדרואיד מול cross-platform: איך בוחרים, ומה זה עושה ללוח הזמנים ולתחזוקה.' },
    { id: 'web', intent: 'commercial', primary: 'פיתוח אפליקציות web', match: ['web', 'ווב', 'api'],
      angleHe: 'אפליקציית web מול אפליקציה נייטיב, ואיך ארכיטקטורת API נכונה חוסכת כתיבה מחדש בעוד שנה.' },
    { id: 'ai', intent: 'commercial', primary: 'פיתוח אפליקציות AI', match: ['ai'],
      angleHe: 'שילוב AI באפליקציה: מה באמת דורש מודל, מה אפשר לפתור בלי, ומה זה עושה לעלות ההפעלה.' },
    { id: 'business', intent: 'commercial', primary: 'פיתוח אפליקציות לעסקים', match: ['לעסקים'],
      angleHe: 'אפליקציה לעסק קיים: מתי היא מייצרת ערך אמיתי ומתי היא פרויקט יוקרה.' },
    { id: 'companies', intent: 'commercial', primary: 'חברת פיתוח אפליקציות', match: ['חברת', 'חברות'],
      angleHe: 'איך בוחרים חברת פיתוח אפליקציות בישראל: מה לבדוק בתיק עבודות, איך נראה חוזה תקין, ומי מחזיק בקוד.' },
  ],

  startup: [
    { id: 'rounds', intent: 'informational', primary: 'סבבי גיוס', match: ['סבבי גיוס'], mergeInto: 'fundraising--rounds',
      angleHe: '' },
    { id: 'legal', intent: 'informational', primary: 'הסכם מייסדים לסטארטאפ', match: ['הסכם', 'הסכמי', 'עורך דין'],
      angleHe: 'הסכם מייסדים, הסכם שותפות והסכמי השקעה: מה חייב להיכנס, מה קורה כשמייסד עוזב, ולמה vesting הוא לא חוסר אמון.' },
    { id: 'finance', intent: 'commercial', primary: 'ניהול כספים בסטארטאפ', match: ['כספים', 'cfo', 'מימון'],
      angleHe: 'ניהול פיננסי בסטארטאפ מוקדם: runway, burn rate, ומתי צריך CFO במיקור חוץ ומתי מנהל חשבונות מספיק.' },
    { id: 'valuation', intent: 'informational', primary: 'הערכת שווי סטארטאפ', match: ['הערכת שווי', 'יוניקורן'],
      angleHe: 'איך נקבע שווי של סטארטאפ בלי הכנסות, מה זה pre-money מול post-money, ולמה שווי גבוה מדי מזיק לסבב הבא.' },
    { id: 'stealth', intent: 'informational', primary: 'סטארטאפ stealth', match: ['stealth'],
      angleHe: 'מצב stealth: מה זה באמת אומר, מתי סודיות עוזרת ומתי היא פשוט מונעת ממך משוב.' },
    { id: 'founding', intent: 'informational', primary: 'איך מקימים חברת סטארטאפ', match: ['הקמת', 'איך להקים', 'איך להתחיל'],
      angleHe: 'הצעדים הראשונים להקמת סטארטאפ בישראל: רישום חברה, מבנה בעלות, ומה לא למהר לעשות.' },
    { id: 'definition', intent: 'informational', primary: 'מה זה סטארטאפ', match: ['מה זה'],
      angleHe: 'מה מבדיל סטארטאפ מעסק קטן - זה לא הטכנולוגיה אלא מודל הצמיחה ואי-הוודאות.' },
    { id: 'marketing', intent: 'commercial', primary: 'שיווק לסטארטאפ בשלב מוקדם', match: ['בניית אתרים', 'סרטונים', 'סרט תדמית', 'קידום'],
      angleHe: 'נוכחות דיגיטלית לסטארטאפ לפני מוצר: אתר, סרט תדמית, תוכן - מה באמת נדרש בשלב הזה ומה יכול לחכות.' },
    { id: 'medical', intent: 'commercial', primary: 'סטארטאפ רפואי', match: ['רפואי'],
      angleHe: 'סטארטאפ רפואי בישראל: מסלול הוכחה קלינית, רגולציה, וגישה לשדה הרפואי - התחום שבו WeCcelerate הכי חזקה.' },
  ],

  'market-research': [
    { id: 'competitors', intent: 'informational', primary: 'מחקר שוק וניתוח מתחרים', match: ['מתחרים'],
      angleHe: 'ניתוח מתחרים מעשי: איך ממפים מתחרים ישירים ועקיפים, ומה עושים עם הממצא כשהשוק כבר צפוף.' },
    { id: 'how-to', intent: 'informational', primary: 'איך עושים מחקר שוק', match: ['איך'],
      angleHe: 'מחקר שוק בפועל ליזם בלי תקציב: ראיונות, נתונים פתוחים, ולמה שאלון אונליין הוא בדרך כלל הכלי הכי חלש.' },
    { id: 'definition', intent: 'informational', primary: 'מה זה מחקר שוק', match: ['מה זה'],
      angleHe: 'מה מחקר שוק אמור לענות עליו, ומה ההבדל בין מחקר שוק לאימות רעיון.' },
    { id: 'for-startup', intent: 'commercial', primary: 'מחקר שוק לסטארטאפ', match: ['לסטארטאפ'],
      angleHe: 'מחקר שוק לסטארטאפ: איך מעריכים TAM/SAM/SOM בלי להמציא, וכיצד משקיע קורא את המספרים האלה.' },
    { id: 'trends', intent: 'informational', primary: 'ניתוח מגמות שוק', match: ['מגמות', 'ניתוח שוק'],
      angleHe: 'ניתוח מגמות: איך מבדילים בין טרנד לגל חולף, ואילו מקורות באמת שווים מעקב.' },
    { id: 'companies', intent: 'commercial', primary: 'חברות מחקר שוק', match: ['חברות', 'חברת', 'שירותי'],
      angleHe: 'מתי שווה לשכור חברת מחקר שוק ומתי זה בזבוז בשלב מוקדם - ומה לבקש בתוצר.' },
  ],
};

/** Editorial angle for each cluster's pillar page. */
const PILLAR_ANGLE: Record<string, string> = {
  'business-consulting':
    'המדריך המרכזי לייעוץ עסקי בישראל - מה זה כולל, למי זה מתאים, איך בוחרים, ומתי זה השקעה נכונה. דף האם שכל שאר מדריכי הייעוץ מקושרים אליו.',
  fundraising:
    'המדריך המרכזי לגיוס הון בישראל - מסלולי מימון, סוגי משקיעים, מה מכינים לפני שפונים, ואיך נראה התהליך מקצה לקצה.',
  'business-plan':
    'המדריך המרכזי לתוכנית עסקית - מה זה, למי כותבים, מבנה מלא, וכמה זמן זה לוקח באמת.',
  events:
    'המדריך המרכזי להפקת כנסים - סוגי אירועים, שלבי תכנון, תקציב, ואיך מודדים הצלחה של כנס.',
  'product-development':
    'המדריך המרכזי לפיתוח מוצרים - מרעיון לייצור, שלבי התהליך, מי בצוות, ואיפה פרויקטים נכשלים.',
  'app-development':
    'המדריך המרכזי לפיתוח אפליקציות בישראל - פלטפורמות, תהליך, בחירת ספק, ותחזוקה אחרי ההשקה.',
  startup:
    'המדריך המרכזי לסטארטאפ בישראל - מרעיון לחברה: מבנה משפטי, צוות, מימון ומוצר ראשון.',
  'market-research':
    'המדריך המרכזי למחקר שוק - למה זה קובע את כל מה שבא אחריו, ואיך עושים את זה נכון בלי תקציב מחקר.',
};

// =============================================================================
// QUESTION EXPANSION — from typed keyword to spoken question
// =============================================================================

/**
 * The AEO/GEO engine. A researched phrase is a Google TYPING pattern; an LLM
 * gets asked the same need as a full spoken sentence. These templates convert
 * one into the other so the article's FAQ answers the spoken form verbatim —
 * which is what actually gets extracted as an answer.
 *
 * These are the DETERMINISTIC baseline: every brief gets them for free with no
 * API call. keyword-campaign.ts layers an LLM pass on top that infers
 * questions no template could predict (see expandQuestionsWithLlm).
 */
const QUESTION_TEMPLATES: Record<SearchIntent, string[]> = {
  informational: [
    'מה זה {kw} בדיוק?',
    'איך {kw} עובד בפועל?',
    'מתי יזם צריך {kw}?',
    'מה הטעות הנפוצה ביותר סביב {kw}?',
    'כמה זמן לוקח {kw}?',
  ],
  commercial: [
    'כמה עולה {kw} בישראל?',
    'איך בוחרים ספק ל{kw}?',
    'מה כולל שירות {kw}?',
    'למי מתאים {kw} ולמי פחות?',
    'מה חשוב לבדוק לפני שסוגרים על {kw}?',
  ],
  transactional: [
    'איפה אפשר לקבל {kw}?',
    'מה חייב להופיע ב{kw}?',
    'האם אפשר להשתמש ב{kw} כתבנית מוכנה?',
    'כמה זמן לוקח להכין {kw}?',
  ],
  local: [
    'איפה מקבלים {kw}?',
    'האם המיקום באמת משנה כשבוחרים {kw}?',
    'מה מיוחד בשוק המקומי בהקשר של {kw}?',
  ],
};

/** Questions every brief carries — these are the shapes LLMs answer most. */
const UNIVERSAL_QUESTIONS = [
  'מי צריך {kw} ומי יכול לוותר?',
  'מה השלב הראשון שיזם צריך לעשות בנושא {kw}?',
];

/**
 * Reduce a researched phrase to the bare NOUN it is about, so templates read
 * as Hebrew instead of as nested questions.
 *
 * Many researched phrases are already questions ("איך בונים תוכנית עסקית") or
 * carry a verb ("כתיבת תוכנית עסקית", "כמה עולה ייעוץ עסקי"). Substituting
 * those into "מה זה {kw} בדיוק?" produces "מה זה איך בונים תוכנית עסקית
 * בדיוק?" — broken Hebrew that would ship straight into the FAQ. Stripping the
 * interrogative/verbal prefix first yields "תוכנית עסקית", which slots into
 * every template cleanly.
 *
 * NOTE: no \b anchors here. JavaScript's \b is defined over [A-Za-z0-9_], so it
 * never matches at a Hebrew-letter boundary and silently disables the pattern.
 * We anchor on whitespace instead.
 */
export function topicOf(phrase: string): string {
  const PREFIXES = [
    'איך בונים', 'איך לבנות', 'איך כותבים', 'איך לכתוב', 'איך עושים',
    'איך מכינים', 'איך לעשות', 'איך להקים', 'איך להתחיל', 'איך בוחרים', 'איך',
    'מה זה', 'מהו', 'מהי', 'מה', 'כמה עולה', 'כמה', 'מתי', 'למה', 'למי', 'מי',
    'האם', 'איפה', 'בניית', 'כתיבת', 'הכנת', 'שלבים בבניית', 'תהליך', 'שלבי',
  ];
  let out = phrase.trim();
  // Longest-first so 'איך בונים' wins over the bare 'איך'.
  for (const p of [...PREFIXES].sort((a, b) => b.length - a.length)) {
    if (out.startsWith(p + ' ')) {
      out = out.slice(p.length + 1).trim();
      break;
    }
  }
  return out || phrase.trim();
}

function buildQuestions(primary: string, intent: SearchIntent, secondaries: string[]): string[] {
  const out: string[] = [];
  const push = (q: string) => {
    const clean = q.trim();
    if (clean && !out.includes(clean)) out.push(clean);
  };

  // A phrase that is ALREADY a natural question is itself the best FAQ entry —
  // it is literally what someone types. Lead with it verbatim.
  const isQuestionForm = /^(איך|מה|מתי|למה|כמה|מי|האם|איפה|מהו|מהי)\s/.test(primary.trim());
  if (isQuestionForm) push(`${primary.trim()}?`);

  const topic = topicOf(primary);
  for (const t of QUESTION_TEMPLATES[intent]) push(t.replace('{kw}', topic));
  for (const t of UNIVERSAL_QUESTIONS) push(t.replace('{kw}', topic));

  // The two highest-volume secondaries contribute their own phrasing, so the
  // FAQ covers sibling long-tails and not just five rewrites of the head.
  for (const s of secondaries.slice(0, 2)) {
    if (/^(איך|מה|מתי|למה|כמה|מי|האם|איפה|מהו|מהי)\s/.test(s.trim())) {
      push(`${s.trim()}?`);
    } else {
      push(QUESTION_TEMPLATES[intent][0].replace('{kw}', topicOf(s)));
    }
  }

  return out.slice(0, 9);
}

// =============================================================================
// CONTENT PLAN
// =============================================================================

export interface ArticleBrief {
  /** Stable id: `${clusterId}--${subTopicId}` or `${clusterId}--pillar`. */
  id: string;
  clusterId: string;
  clusterLabelHe: string;
  role: ArticleRole;
  intent: SearchIntent;
  category: string;
  servicePath: string;
  /** The phrase the H1 must contain verbatim. */
  primaryKeyword: string;
  /** Researched phrases routed to this article — must appear naturally in body/H2s. */
  secondaryKeywords: string[];
  /** Natural-language questions the FAQ must answer verbatim (AEO/GEO). */
  targetQuestions: string[];
  angleHe: string;
  /** Structural instruction derived from the intent. */
  playbookHe: string;
  /** Summed monthly search volume of every phrase routed here. */
  volume: number;
  /** 50-100. Maps onto ContentGap.severity so the existing writer can rank it. */
  priority: number;
  /** Brief ids this article should internally link to (pillar <-> clusters). */
  linkTo: string[];
}

/** Route one phrase to a sub-topic id, or null to fall through to the pillar. */
function routeKeyword(clusterId: string, phrase: string): string | null {
  const subs = SUB_TOPICS[clusterId] ?? [];
  for (const sub of subs) {
    const hit = sub.match.some((m) => phrase.toLowerCase().includes(m.toLowerCase()));
    if (hit) return sub.mergeInto ?? `${clusterId}--${sub.id}`;
  }
  return null;
}

/**
 * Priority 50-100. The floor is 50 on purpose: ContentGap.severity < 50 is
 * filtered out by the writer's gap picker, so every planned article must sit
 * above it. Volume dominates (log-scaled so a 1300-volume head doesn't drown
 * out an entire cluster), with a pillar bonus because pillars anchor the
 * internal link graph and must exist before the pages that link to them.
 */
function scorePriority(volume: number, role: ArticleRole, intent: SearchIntent): number {
  const volumeScore = Math.min(1, Math.log10(Math.max(volume, 1) + 1) / Math.log10(2000));
  const intentWeight: Record<SearchIntent, number> = {
    commercial: 1,
    transactional: 0.95,
    informational: 0.92,
    local: 0.85,
  };
  const roleBonus = role === 'pillar' ? 0.12 : 0;
  const raw = volumeScore * intentWeight[intent] + roleBonus;
  return Math.round(50 + Math.min(1, raw) * 50);
}

/**
 * Build the full content plan: every researched phrase routed to exactly one
 * article, pillars and clusters cross-linked, ordered by priority.
 *
 * Deterministic and side-effect free — safe to call from a route, a script, or
 * a test. Nothing here touches the DB or an API.
 */
export function buildContentPlan(): ArticleBrief[] {
  const byBriefId = new Map<string, { cluster: KeywordCluster; sub?: SubTopic; rows: KeywordRow[] }>();

  for (const cluster of KEYWORD_CLUSTERS) {
    const pillarId = `${cluster.id}--pillar`;
    byBriefId.set(pillarId, { cluster, rows: [] });

    for (const row of cluster.keywords) {
      const targetId = routeKeyword(cluster.id, row.phrase) ?? pillarId;
      let entry = byBriefId.get(targetId);
      if (!entry) {
        // Resolve which cluster/sub-topic the id belongs to. This also handles
        // mergeInto targets that live in a DIFFERENT cluster than the phrase.
        const [ownerClusterId, subId] = targetId.split('--');
        const ownerCluster = KEYWORD_CLUSTERS.find((c) => c.id === ownerClusterId) ?? cluster;
        const sub = (SUB_TOPICS[ownerClusterId] ?? []).find((s) => s.id === subId);
        entry = { cluster: ownerCluster, sub, rows: [] };
        byBriefId.set(targetId, entry);
      }
      entry.rows.push(row);
    }
  }

  const briefs: ArticleBrief[] = [];
  for (const [id, entry] of byBriefId) {
    if (entry.rows.length === 0) continue; // sub-topic nothing routed to — no article

    const { cluster, sub, rows } = entry;
    const role: ArticleRole = sub ? 'cluster' : 'pillar';
    const intent: SearchIntent = sub?.intent ?? 'commercial';
    const primaryKeyword = sub?.primary ?? cluster.head;
    const volume = rows.reduce((s, r) => s + r.volume, 0);

    const secondaryKeywords = rows
      .slice()
      .sort((a, b) => b.volume - a.volume)
      .map((r) => r.phrase)
      .filter((p) => p !== primaryKeyword);

    briefs.push({
      id,
      clusterId: cluster.id,
      clusterLabelHe: cluster.labelHe,
      role,
      intent,
      category: cluster.category,
      servicePath: cluster.servicePath,
      primaryKeyword,
      secondaryKeywords,
      targetQuestions: buildQuestions(primaryKeyword, intent, secondaryKeywords),
      angleHe: sub?.angleHe || PILLAR_ANGLE[cluster.id] || '',
      playbookHe: INTENT_PLAYBOOK[intent],
      volume,
      priority: scorePriority(volume, role, intent),
      linkTo: [],
    });
  }

  // Wire the internal link graph: pillar <-> its cluster pages.
  for (const brief of briefs) {
    const pillarId = `${brief.clusterId}--pillar`;
    if (brief.role === 'pillar') {
      brief.linkTo = briefs.filter((b) => b.clusterId === brief.clusterId && b.id !== brief.id).map((b) => b.id);
    } else {
      const siblings = briefs
        .filter((b) => b.clusterId === brief.clusterId && b.id !== brief.id && b.role === 'cluster')
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 3)
        .map((b) => b.id);
      brief.linkTo = briefs.some((b) => b.id === pillarId) ? [pillarId, ...siblings] : siblings;
    }
  }

  // Pillars first within equal priority — they must exist before the cluster
  // pages that link up to them, or the link graph points at 404s.
  return briefs.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (a.role !== b.role) return a.role === 'pillar' ? -1 : 1;
    return b.volume - a.volume;
  });
}

/** Look up a brief by id from a freshly built plan. */
export function getBrief(id: string): ArticleBrief | undefined {
  return buildContentPlan().find((b) => b.id === id);
}

// =============================================================================
// COVERAGE — proof that nothing in the research file was dropped
// =============================================================================

export interface CoverageReport {
  totalKeywords: number;
  routedKeywords: number;
  orphanKeywords: string[];
  totalVolume: number;
  briefs: number;
  pillars: number;
  clusters: number;
  byCluster: Array<{ clusterId: string; labelHe: string; keywords: number; briefs: number; volume: number }>;
}

export function keywordCoverage(): CoverageReport {
  const plan = buildContentPlan();
  const routed = new Set(plan.flatMap((b) => [b.primaryKeyword, ...b.secondaryKeywords]));
  const orphans = ALL_KEYWORDS.filter((k) => !routed.has(k.phrase)).map((k) => k.phrase);

  return {
    totalKeywords: ALL_KEYWORDS.length,
    routedKeywords: ALL_KEYWORDS.length - orphans.length,
    orphanKeywords: orphans,
    totalVolume: ALL_KEYWORDS.reduce((s, k) => s + k.volume, 0),
    briefs: plan.length,
    pillars: plan.filter((b) => b.role === 'pillar').length,
    clusters: plan.filter((b) => b.role === 'cluster').length,
    byCluster: KEYWORD_CLUSTERS.map((c) => ({
      clusterId: c.id,
      labelHe: c.labelHe,
      keywords: c.keywords.length,
      briefs: plan.filter((b) => b.clusterId === c.id).length,
      volume: c.keywords.reduce((s, k) => s + k.volume, 0),
    })),
  };
}

// =============================================================================
// THE DOCTRINE — injected into David's prompts
// =============================================================================

/**
 * The reasoning David must apply, in his own working language. This is the
 * part that makes him GENERALIZE instead of transcribe: it tells him the
 * research file is a sample of demand, not the whole of it, and that his job
 * is to infer the surrounding questions a real founder would ask.
 *
 * Injected into the plan and section prompts by content-writer.ts whenever the
 * job carries a keyword brief.
 */
export const DAVID_TOPIC_DOCTRINE_HE = `
## איך אני חושב על מאמר שנכתב מתוך מחקר ביטויים

### 1. ביטוי הוא לא נושא - הוא ראיה לצורך
כשמישהו מקליד "כמה עולה ייעוץ עסקי" הוא לא רוצה מספר. הוא רוצה לדעת אם הוא
עומד להיות מרומה. המאמר צריך לענות על הצורך שמאחורי הביטוי, לא על הביטוי עצמו.
ביטוי שמופיע בקובץ המחקר הוא הוכחה שהצורך קיים ונמדד - זו הסיבה שהוא בבריף.

### 2. ביטויים אחים מחזקים דף אחד, לא מפצלים לשלושה
"איך בונים תוכנית עסקית", "איך לבנות תוכנית עסקית" ו"כתיבת תוכנית עסקית" הן
אותה שאלה. שלושה דפים דקים על אותה שאלה מתחרים זה בזה ואף אחד מהם לא מנצח.
כל הביטויים המשניים בבריף אמורים להופיע בטבעיות בגוף המאמר - חלקם ככותרות
משנה, חלקם כניסוח בתוך פסקה. בלי דחיסה מלאכותית.

### 3. גוגל מקבל הקלדה, LLM מקבל שאלה מדוברת
הביטוי "תוכנית עסקית לדוגמא" מוקלד בגוגל. אותו אדם ישאל את ChatGPT
"יש לכם דוגמה לתוכנית עסקית שאפשר להוריד ולמלא?". שתי הצורות חייבות להופיע
בדף: הביטוי המדויק ב-H1 ובכותרות, והשאלה המדוברת כלשונה בסקציית השאלות הנפוצות.
זה מה שמנוע תשובות שולף.

### 4. השאלות בבריף הן רצפה, לא תקרה
רשימת השאלות שקיבלתי נבנתה אוטומטית מתבניות. אני חייב להוסיף עליה שאלות
שאף תבנית לא יכלה לנחש - כאלה שיזם ישראלי אמיתי באמת שואל בשלב הזה. למשל:
"מה קורה אם המשקיע רוצה יותר מ-50%?", "אפשר להגיש את זה לרשות החדשנות?",
"מי הבעלים של הקוד אם נפרדים מהספק?". שאלה טובה היא כזו שהתשובה עליה
מסוכנת אם היא שגויה - שם נמצא הערך.

### 5. משפט הציטוט קודם להקשר
כל סקציה נפתחת במשפט שעומד בפני עצמו: הגדרה, כלל, או עובדה מהתחום.
מנוע תשובות חותך את המשפט הזה ומצטט אותו בלי שאר הפסקה. אם המשפט הראשון
הוא "בעולם העסקי של היום" - לא ייחתך שום דבר וזה מבוזבז.

### 6. ספציפיות ישראלית היא היתרון התחרותי
תשובה גנרית על "מה זה משקיע כשיר" קיימת באלף אתרים באנגלית. תשובה שמזכירה
את תקנות ניירות ערך הישראליות, רשות החדשנות, ועדת הלסינקי, או מבנה חברה בע"מ
בישראל - היא מה ש-LLM יבחר לצטט כששואלים אותו בעברית. תמיד לעגן בהקשר הישראלי.

### 7. מה שאסור לי להמציא נשאר אסור
הדוקטרינה הזו לא מבטלת שום כלל כתיבה. אין מחירים של WeCcelerate, אין נתונים
מומצאים, אין שמות מתחרים, אין הבטחות תוצאה. ביטוי מסחרי כמו "כמה עולה X"
נענה בהסבר מה מרכיב את העלות בשוק - לא בנקיבת מחיר שלנו.
`;
