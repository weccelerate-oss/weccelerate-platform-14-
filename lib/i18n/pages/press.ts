// press page translations — populated by i18n migration.
//
// Static chrome (hero, breadcrumb, CTA, empty state) lives under `press.*`.
// Per-mention titles/excerpts are keyed by the stable PressMention `id`
// (`press.item.<id>.title` / `.excerpt`) so PressContent can resolve the
// displayed Hebrew fields through t() while dates/URLs/outlet names stay as
// data in lib/seo/press-catalog.ts.
export const pressHe: Record<string, string> = {
  // Breadcrumb
  'press.breadcrumb.home': 'בית',
  'press.breadcrumb.current': 'בתקשורת',

  // Hero
  'press.hero.eyebrow': 'In the press · WeCcelerate',
  'press.hero.titleSuffix': 'בתקשורת',
  'press.hero.lead':
    'WeCcelerate היא Venture Builder ומאיץ סטארטאפים בישראל, מוכרת על ידי רשות החדשנות הישראלית ובעלת שותפות אסטרטגית עם לאומית שירותי בריאות. חברה ב-Start-Up Nation Central וב-IATI. בעמוד זה אזכורים, שותפויות ופרסומים רשמיים.',

  // Empty state
  'press.empty':
    'עמוד זה יעודכן בקרוב עם אזכורים נוספים בתקשורת הישראלית והבינלאומית.',

  // CTA
  'press.cta.eyebrow': 'Press inquiries',
  'press.cta.title': 'פניות לתקשורת',
  'press.cta.text': 'עיתונאים, כותבי תוכן, מארחי פודקאסטים — נשמח לספק מידע ולעזור.',

  // Category labels (rendered as section headings)
  'press.category.profile': 'כתבות עומק',
  'press.category.interview': 'ראיונות',
  'press.category.opinion': 'דעה ומאמרים',
  'press.category.announcement': 'הודעות ושותפויות',
  'press.category.mention': 'אזכורים',
  'press.category.podcast': 'פודקאסטים',
  'press.category.video': 'וידאו וטלוויזיה',
  'press.category.award': 'הכרה ופרסים',

  // Per-mention titles
  'press.item.leumit-partnership.title':
    'שותפות אסטרטגית בלעדית עם לאומית שירותי בריאות למסלול MedTech',
  'press.item.iia-recognition.title':
    'הכרה של רשות החדשנות הישראלית כחברת מו"פ',
  'press.item.snc-member.title': 'חברות ב-Start-Up Nation Central',
  'press.item.iati-member.title':
    'חברות ב-IATI — Israel Advanced Technology Industries',
  'press.item.globes-2022-leumit-partnership.title':
    '"העלאת הריבית האגרסיבית גורמת ליזמים רבים לוותר על החלום"',
  'press.item.calcalist-tag-page.title': 'WeCcelerate — דף תגית כלכליסט',
  'press.item.calcalist-2025-hinoch-data-budget.title':
    'תקציב הדאטה הלאומי: התחלה מבורכת אך האתגרים עוד לפנינו',
  'press.item.geektime-2025-cto-innovation-authority.title':
    'רשות החדשנות תשקיע מיליונים בתוכנית חממות חדשה. אז מה רע?',
  'press.item.geektime-2024-reservist-calculator.title':
    '3 הייטקיסטים השיקו מחשבון מענקים לאנשי מילואים',

  // Per-mention excerpts
  'press.item.leumit-partnership.excerpt':
    'שותפות בלעדית עם לאומית שירותי בריאות למסלול MedTech: גישה לדאטה רפואי אנונימי של מאגר נתונים קליני בשותפות לאומית, פיילוטים קליניים במרפאות, ותמיכה רגולטורית.',
  'press.item.iia-recognition.excerpt':
    'WeCcelerate מוכרת על ידי רשות החדשנות הישראלית כחברת מחקר ופיתוח.',
  'press.item.snc-member.excerpt':
    'WeCcelerate is a member of the Start-Up Nation Central ecosystem platform.',
  'press.item.globes-2022-leumit-partnership.excerpt':
    'ראיון המציין את שותפות Leumit-WeCcelerate כחברה משותפת עם לאומית שירותי בריאות למסלול יוזמות בריאות דיגיטלית.',
  'press.item.calcalist-tag-page.excerpt':
    'דף תגית ייעודי ב-Calcalist המאגד כתבות, מאמרים, חדשות ועדכונים על WeCcelerate.',
  'press.item.calcalist-2025-hinoch-data-budget.excerpt':
    'טור דעה מאת אברהם הינוך, סמנכ"ל השיווק בחברת WeCcelerate, על תקציב הדאטה הלאומי ואתגרי תשתיות המידע.',
  'press.item.geektime-2025-cto-innovation-authority.excerpt':
    'טור דעה מאת מנהל הטכנולוגיות (CTO) בחברת WeCcelerate על תוכנית החממות החדשה של רשות החדשנות.',
  'press.item.geektime-2024-reservist-calculator.excerpt':
    'כתבה על השקת מחשבון המענקים לאנשי מילואים על ידי שלושה הייטקיסטים, תוך אזכור של WeCcelerate כאחת החברות המעורבות.',
};

export const pressEn: Record<string, string> = {
  // Breadcrumb
  'press.breadcrumb.home': 'Home',
  'press.breadcrumb.current': 'In the Press',

  // Hero
  'press.hero.eyebrow': 'In the press · WeCcelerate',
  'press.hero.titleSuffix': 'in the Press',
  'press.hero.lead':
    'WeCcelerate is a Venture Builder and startup accelerator in Israel, recognized by the Israel Innovation Authority and holding a strategic partnership with Leumit Health Services. A member of Start-Up Nation Central and IATI. This page collects mentions, partnerships, and official publications.',

  // Empty state
  'press.empty':
    'This page will be updated soon with additional coverage in the Israeli and international media.',

  // CTA
  'press.cta.eyebrow': 'Press inquiries',
  'press.cta.title': 'Press Inquiries',
  'press.cta.text':
    'Journalists, content writers, podcast hosts — we are happy to provide information and help.',

  // Category labels (rendered as section headings)
  'press.category.profile': 'Feature Articles',
  'press.category.interview': 'Interviews',
  'press.category.opinion': 'Opinion & Bylines',
  'press.category.announcement': 'Announcements & Partnerships',
  'press.category.mention': 'Mentions',
  'press.category.podcast': 'Podcasts',
  'press.category.video': 'Video & TV',
  'press.category.award': 'Recognition & Awards',

  // Per-mention titles
  'press.item.leumit-partnership.title':
    'Exclusive strategic partnership with Leumit Health Services for the MedTech track',
  'press.item.iia-recognition.title':
    'Recognized by the Israel Innovation Authority as an R&D company',
  'press.item.snc-member.title': 'Member of Start-Up Nation Central',
  'press.item.iati-member.title':
    'Member of IATI — Israel Advanced Technology Industries',
  'press.item.globes-2022-leumit-partnership.title':
    '"The aggressive interest-rate hikes are pushing many entrepreneurs to give up on the dream"',
  'press.item.calcalist-tag-page.title': 'WeCcelerate — Calcalist tag page',
  'press.item.calcalist-2025-hinoch-data-budget.title':
    'The national data budget: a welcome start, but the challenges still lie ahead',
  'press.item.geektime-2025-cto-innovation-authority.title':
    'The Innovation Authority will invest millions in a new incubator program. So what is wrong with that?',
  'press.item.geektime-2024-reservist-calculator.title':
    'Three tech professionals launched a grants calculator for reservists',

  // Per-mention excerpts
  'press.item.leumit-partnership.excerpt':
    'An exclusive partnership with Leumit Health Services for the MedTech track: access to anonymized medical data from a clinical database in partnership with Leumit, clinical pilots in clinics, and regulatory support.',
  'press.item.iia-recognition.excerpt':
    'WeCcelerate is recognized by the Israel Innovation Authority as a research and development company.',
  'press.item.snc-member.excerpt':
    'WeCcelerate is a member of the Start-Up Nation Central ecosystem platform.',
  'press.item.globes-2022-leumit-partnership.excerpt':
    'An interview noting the Leumit-WeCcelerate partnership as a joint venture with Leumit Health Services for a digital-health initiatives track.',
  'press.item.calcalist-tag-page.excerpt':
    'A dedicated Calcalist tag page aggregating articles, features, news, and updates about WeCcelerate.',
  'press.item.calcalist-2025-hinoch-data-budget.excerpt':
    'An opinion column by Avraham Hinoch, VP of Marketing at WeCcelerate, on the national data budget and the challenges of information infrastructure.',
  'press.item.geektime-2025-cto-innovation-authority.excerpt':
    'An opinion column by the CTO of WeCcelerate on the Innovation Authority’s new incubator program.',
  'press.item.geektime-2024-reservist-calculator.excerpt':
    'An article on the launch of the grants calculator for reservists by three tech professionals, mentioning WeCcelerate as one of the companies involved.',
};
