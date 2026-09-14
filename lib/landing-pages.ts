/**
 * Paid-traffic landing pages (/lp/<slug>).
 *
 * One page per campaign theme: no navigation, the form above the fold,
 * proof, FAQ, second form. Copy follows the house rule — no numbers, no
 * timelines, no promises. Each page is tagged with the service it feeds so
 * the lead reaches Pipedrive with "שירות מבוקש" filled in.
 *
 * noindex: these exist for ads, the organic equivalents are /services/*.
 */

export interface LandingPage {
  slug: string;
  service: string;
  eyebrow: string;
  headline: string;
  sub: string;
  bullets: string[];
  formHeading: string;
  formSub: string;
  /** Pages whose FAQ (lib/services-faqs) we reuse. */
  faqKey: string;
  metaTitle: string;
}

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: 'startup',
    service: 'business-consulting',
    eyebrow: 'Venture Builder ישראלי',
    headline: 'יש לך רעיון לסטארטאפ?\nבואו נבדוק אותו יחד.',
    sub: 'צוות של יועצים עסקיים, מפתחים ואנשי שיווק שעובד איתך מהרעיון ועד המשקיעים. לא הרצאות, עבודה בפועל.',
    bullets: ['בדיקת היתכנות ומחקר שוק לפני שמשקיעים שקל', 'תוכנית עסקית ומצגת שמדברות בשפה של משקיעים', 'צוות אחד לאסטרטגיה, מוצר, שיווק וגיוס'],
    formHeading: 'שיחת היכרות חינם עם יועץ',
    formSub: 'ספרו לנו בקצרה על הרעיון. יועץ מהצוות יחזור אליכם לשיחה ראשונה, בלי התחייבות.',
    faqKey: 'business-consulting',
    metaTitle: 'יש לך רעיון לסטארטאפ? שיחת היכרות חינם | WeCcelerate',
  },
  {
    slug: 'business-consulting',
    service: 'business-consulting',
    eyebrow: 'ייעוץ עסקי לסטארטאפים',
    headline: 'תוכנית עסקית שמשקיעים\nבאמת קוראים.',
    sub: 'מחקר שוק, מודל פיננסי, תקציר מנהלים ומצגת. הכול נבנה על ידי צוות שמלווה מיזמים גם אחרי המסמך.',
    bullets: ['מחקר שוק וניתוח מתחרים שמבוסס על נתונים, לא על תחושות', 'מודל פיננסי שעונה על השאלות שמשקיעים שואלים', 'ליווי בפגישות עם משקיעים, לא רק מסמך'],
    formHeading: 'שיחת היכרות חינם על התוכנית שלכם',
    formSub: 'נבין באיזה שלב אתם ומה חסר, ונציע סדר פעולות.',
    faqKey: 'business-consulting',
    metaTitle: 'ייעוץ עסקי לסטארטאפים | שיחת היכרות חינם | WeCcelerate',
  },
  {
    slug: 'app-development',
    service: 'digital-product',
    eyebrow: 'פיתוח אפליקציות ומוצרים דיגיטליים',
    headline: 'מרעיון לאפליקציה עובדת,\nעם צוות שחושב כמו שותף.',
    sub: 'אפיון, עיצוב, פיתוח והשקה, עם ניהול מוצר שמתחיל מ-MVP ומרחיב לפי מה שהמשתמשים באמת צריכים.',
    bullets: ['MVP עם הפיצ׳רים החיוניים בלבד, כדי לבדוק את הרעיון מהר', 'עיצוב UX/UI ופיתוח לאייפון, אנדרואיד ו-web', 'CTO-as-a-Service למי שאין לו שותף טכנולוגי'],
    formHeading: 'שיחת היכרות חינם על המוצר שלכם',
    formSub: 'נשמע מה אתם רוצים לבנות ונציע איך להתחיל נכון.',
    faqKey: 'digital-product',
    metaTitle: 'פיתוח אפליקציה לסטארטאפ | שיחת היכרות חינם | WeCcelerate',
  },
  {
    slug: 'product-development',
    service: 'physical-product',
    eyebrow: 'פיתוח מוצר פיזי',
    headline: 'מהסקיצה לייצור,\nבלי להתפזר בין ספקים.',
    sub: 'עיצוב תעשייתי, אב-טיפוס, בדיקות, הסמכות וייצור. צוות אחד שמכיר את כל השלבים ואת היצרנים.',
    bullets: ['אב-טיפוס מהיר לבדיקת הרעיון לפני השקעה גדולה', 'ליווי ברגולציה ובהסמכות לפי סוג המוצר', 'בחירת יצרן, תיק ייצור ובקרת איכות'],
    formHeading: 'שיחת היכרות חינם על המוצר שלכם',
    formSub: 'ספרו לנו על המוצר ובאיזה שלב הוא, ונציע את הצעד הבא.',
    faqKey: 'physical-product',
    metaTitle: 'פיתוח מוצר פיזי ואב-טיפוס | שיחת היכרות חינם | WeCcelerate',
  },
  {
    slug: 'fundraising',
    service: 'investors',
    eyebrow: 'הכנה לגיוס משקיעים',
    headline: 'מתכוננים לגיוס?\nנעבור יחד על המצגת והמספרים.',
    sub: 'מצגת משקיעים, מודל פיננסי, הערכת שווי וחיבור למשקיעים שמתאימים לשלב שלכם. עם צוות שיושב איתכם גם בפגישות.',
    bullets: ['מצגת שמספרת את הסיפור בסדר שמשקיעים מצפים לו', 'מודל פיננסי והערכת שווי שעומדים בשאלות קשות', 'חיבור למשקיעים ולשותפים אסטרטגיים לפי התחום'],
    formHeading: 'שיחת היכרות חינם על הגיוס שלכם',
    formSub: 'נבין את השלב ואת היעד, ונגיד בכנות מה חסר לפני שפונים למשקיעים.',
    faqKey: 'business-consulting',
    metaTitle: 'גיוס משקיעים לסטארטאפ | שיחת היכרות חינם | WeCcelerate',
  },
  {
    slug: 'medtech',
    service: 'medtech-leumit',
    eyebrow: 'מסלול MedTech עם לאומית שירותי בריאות',
    headline: 'מיזם רפואי?\nיש לכם דלת למערכת הבריאות.',
    sub: 'חוות דעת של רופאים מומחים, סקירת שוק, ליווי רגולטורי, גישה לנתונים קליניים ואפשרות לפיילוט ברשת לאומית.',
    bullets: ['רופאים מומחים שבודקים את הצורך הקליני לפני שבונים', 'ליווי ברגולציה: משרד הבריאות, CE, ועדת הלסינקי', 'פיילוט קליני וחיבור למשקיעים שמתמחים בבריאות דיגיטלית'],
    formHeading: 'שיחת היכרות חינם על המיזם הרפואי שלכם',
    formSub: 'לא צריך להיות רופא. ספרו לנו על הפתרון, ונבדוק יחד את ההתאמה למסלול.',
    faqKey: 'medtech-leumit',
    metaTitle: 'מיזם רפואי? מסלול MedTech עם לאומית | WeCcelerate',
  },
  {
    slug: 'marketing',
    service: 'marketing',
    eyebrow: 'שיווק לסטארטאפים',
    headline: 'לקוחות ראשונים,\nבלי לשרוף את התקציב.',
    sub: 'מיתוג, אתר, קמפיינים ויח״צ, בנויים על מדידה: מתחילים קטן, מודדים, ומגדילים רק את מה שעובד.',
    bullets: ['תמהיל ערוצים לפי קהל היעד, לא לפי אופנה', 'קמפיינים ממומנים עם מדידה מהקליק עד הליד', 'יח״צ וחשיפה בתקשורת הטכנולוגית'],
    formHeading: 'שיחת היכרות חינם על השיווק שלכם',
    formSub: 'נבין מה המוצר, מי הקהל ומה התקציב, ונציע תמהיל ראשוני.',
    faqKey: 'marketing',
    metaTitle: 'שיווק לסטארטאפים | שיחת היכרות חינם | WeCcelerate',
  },
];

export function getLandingPage(slug: string): LandingPage | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug);
}
