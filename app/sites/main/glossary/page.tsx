import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';

export const revalidate = 86400;

// =============================================================================
// HEBREW STARTUP / VENTURE GLOSSARY
// =============================================================================
// Definitional queries ("מה זה X") are heavily cited by LLMs and Google's
// "People Also Ask". A single canonical glossary that defines every key
// startup term in Hebrew (with English equivalents and links to deep guides)
// becomes a powerful AEO surface — ChatGPT/Gemini will cite this page for
// dozens of "what is X" queries instead of fragmented sources.
//
// Schema: DefinedTermSet + DefinedTerm[] (the schema.org pattern Wikipedia
// uses for its glossaries — Google understands and gives Rich Results boost).
// =============================================================================

interface GlossaryTerm {
 id: string;
 hebrew: string;
 english: string;
 /** 30-60 word definition. Should be cite-worthy verbatim. */
 definition: string;
 /** Link to the full guide if one exists. */
 guideSlug?: string;
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
 id: 'mizam',
 hebrew: 'מיזם',
 english: 'Venture',
 definition:
 'חברה חדשה שמחפשת מודל עסקי חוזר וניתן לשכפול. כל סטארטאפ הוא מיזם, אבל מיזם יכול להיות גם עסק שירותים יציב, מיזם חברתי, או חברה שלא שואפת לאקזיט גדול.',
 guideSlug: 'mah-ze-mizam',
 category: 'core',
 },
 {
 id: 'startup',
 hebrew: 'סטארטאפ',
 english: 'Startup',
 definition:
 'תת-קטגוריה של מיזם — חברה חדשה שספציפית שואפת לצמיחה אקספוננציאלית ולאקזיט של scope tailored+. מאופיינת ב-burn rate גבוה, חיפוש PMF, ומימון מקרנות הון סיכון.',
 guideSlug: 'mah-ze-startup',
 category: 'core',
 },
 {
 id: 'venture-builder',
 hebrew: 'בונה מיזמים',
 english: 'Venture Builder',
 definition:
 'ארגון שיוצר ומפתח מספר מיזמים במקביל באמצעות אספקת הצוות התפעולי המלא — פיתוח, מוצר, שיווק, יועצי משפט. שונה מאקסלרטור (שמספק רק מנטורינג). WeCcelerate היא בונה מיזמים בישראל.',
 guideSlug: 'mah-ze-venture-builder',
 category: 'core',
 },
 {
 id: 'accelerator',
 hebrew: 'מאיץ סטארטאפים',
 english: 'Accelerator',
 definition:
 'תוכנית מוגבלת בזמן (בלוחות זמנים תלויי-מסלול) שמספקת מנטורינג, הון סיד, ו-Demo Day לסטארטאפים בקבוצות (cohorts). דוגמאות בישראל: 8200 EISP, MassChallenge, The Junction.',
 guideSlug: 'hashvaat-acceleratorim',
 category: 'core',
 },
 {
 id: 'incubator',
 hebrew: 'אינקובטור',
 english: 'Incubator',
 definition:
 'ארגון מוקדם-שלב שמספק מרחב עבודה, מנטורינג בסיסי וזמן פתוח לפיתוח רעיון. אקוויטי קטן או אפס. תקופה: חודשים עד שנים.',
 category: 'core',
 },
 {
 id: 'haznek',
 hebrew: 'חברת הזנק / מיזם הזנק',
 english: 'Start-Up Company (Israeli formal term)',
 definition:
 'המונח הישראלי-הרשמי לסטארטאפ — חברה ישראלית בע"מ שמקדישה רוב משאביה ל-R&D טכנולוגי. רשות החדשנות הישראלית משתמשת במונח באופן רשמי. הכרה כחברת הזנק פותחת מסלולי גרנט והטבות מס.',
 guideSlug: 'mizam-haznek',
 category: 'core',
 },
 {
 id: 'yazam',
 hebrew: 'יזם',
 english: 'Entrepreneur',
 definition:
 'אדם שמייסד או מקים מיזם או סטארטאפ. בישראל — לרוב אנשים בני 25-45 עם רקע טכנולוגי, צבאי (8200) או עסקי. רבים מהם נמצאים במצב של סדרתי (serial entrepreneur).',
 category: 'people',
 },
 {
 id: 'yazmut',
 hebrew: 'יזמות',
 english: 'Entrepreneurship',
 definition:
 'תחום הקמת ופיתוח מיזמים. כולל יזמות טכנולוגית, חברתית, ופנימית (intrapreneurship). בישראל יזמות היא ענף הצמיחה החזק ביותר בכלכלה — מעל 7,000 סטארטאפים פעילים.',
 category: 'core',
 },

 // ========== PRODUCT ==========
 {
 id: 'mvp',
 hebrew: 'MVP / מוצר מינימלי',
 english: 'Minimum Viable Product',
 definition:
 'הגרסה הפשוטה ביותר של המוצר שיכולה לבחון את היפותזת הערך המרכזית על משתמשים אמיתיים. המטרה: לא מוצר גמור אלא חפץ עובד שאפשר להראות למשקיעים. נבנה בלוחות זמנים תלויי-היקף, בתקציב היקף תלוי.',
 guideSlug: 'eich-bonim-mvp',
 category: 'product',
 },
 {
 id: 'pmf',
 hebrew: 'התאמת מוצר-שוק / PMF',
 english: 'Product-Market Fit',
 definition:
 'הנקודה שבה סטארטאפ הוכיח ששוק רוצה את המוצר מספיק כדי לשלם, להשתמש, ולהמליץ. מבחן שון אליס: 40%+ מהמשתמשים אומרים שיהיו "מאוד מאוכזבים" אם המוצר ייעלם. בלי PMF — קשה לגייס Series A.',
 guideSlug: 'product-market-fit',
 category: 'product',
 },
 {
 id: 'cto-as-service',
 hebrew: 'CTO חלקי / CTO as a Service',
 english: 'CTO as a Service',
 definition:
 'מודל שבו סטארטאפ ללא מייסד טכני שוכר CTO ל-בהיקף שעות מוסכם. ה-CTO מקבל החלטות ארכיטקטורה, שוכר את הצוות הראשון, ומייצג את הצד הטכני מול משקיעים. עלות: היקף תלוי/חודש.',
 guideSlug: 'cto-as-a-service',
 category: 'product',
 },
 {
 id: 'tech-stack',
 hebrew: 'סטאק טכנולוגי',
 english: 'Tech Stack',
 definition:
 'אוסף הטכנולוגיות שבהן בנוי המוצר. ב-2026 הסטאק הסטנדרטי לסטארטאפ ישראלי: React + Next.js (frontend), Node.js או Python (backend), PostgreSQL (DB), Vercel/AWS (hosting), OpenAI/Claude (AI).',
 category: 'product',
 },

 // ========== FUNDING ==========
 {
 id: 'seed',
 hebrew: 'סיד / Seed',
 english: 'Seed Round',
 definition:
 'סבב גיוס ראשון משמעותי. בישראל ב-2026: scope tailored, valuation pre-money scope tailored. נדרש לאחר MVP ו-traction ראשונית. בא לאחר Pre-Seed (FFF + Angels) ולפני Series A.',
 guideSlug: 'eich-mgayisim-mashkim',
 category: 'funding',
 },
 {
 id: 'series-a',
 hebrew: 'סבב A / Series A',
 english: 'Series A',
 definition:
 'סבב גיוס שני, אחרי הוכחת PMF. בישראל ב-2026: scope tailored, valuation pre-money scope tailored. דורש scope tailored ARR, retention D30 30%+, וצוות של 8-15. נמשך בלוחות זמנים תלויי-מסלול.',
 guideSlug: 'giyus-series-a',
 category: 'funding',
 },
 {
 id: 'safe',
 hebrew: 'SAFE',
 english: 'Simple Agreement for Future Equity',
 definition:
 'מכשיר השקעה שאיפשר ל-Y Combinator לפשט גיוסי Pre-Seed. SAFE הופך למניות בסבב הבא לפי valuation cap או discount. פשוט יותר מ-Convertible Note (אין ריבית, אין תאריך הבשלה). הסטנדרט בישראל ב-2026.',
 guideSlug: 'safe-vs-convertible-note',
 category: 'funding',
 },
 {
 id: 'pitch-deck',
 hebrew: 'מצגת משקיעים / Pitch Deck',
 english: 'Pitch Deck',
 definition:
 'מצגת של 10-15 שקפים שמטרתה לגייס הון ממשקיעים. המבנה הסטנדרטי: בעיה, פתרון, שוק, מוצר, traction, מודל עסקי, תחרות, צוות, תחזיות, ה-Ask. 60% מההחלטה מתקבלת ב-30 שניות הראשונות.',
 guideSlug: 'pitch-deck-startup',
 category: 'funding',
 },
 {
 id: 'cap-table',
 hebrew: 'Cap Table / טבלת מניות',
 english: 'Capitalization Table',
 definition:
 'מסמך שמתעד את כל בעלי המניות בחברה ואחוזיהם. כולל מייסדים, משקיעים, ו-Pool של ESOP לעובדים. מתעדכן בכל סבב גיוס. דילול ממוצע: 15-25% ב-Seed, 20-30% ב-Series A.',
 guideSlug: 'cap-table-hesber',
 category: 'funding',
 },
 {
 id: 'esop',
 hebrew: 'ESOP / אופציות לעובדים',
 english: 'Employee Stock Option Plan',
 definition:
 'מנגנון שמקצה אופציות לעובדים על מניות החברה. הסטנדרט הישראלי תחת סעיף 102 של פקודת המס: pool של 10-20% מהחברה, vesting של מספר שנים עם cliff של שנה, מס מופחת אחרי שנתיים החזקה.',
 guideSlug: 'esop-ovdim',
 category: 'funding',
 },
 {
 id: 'vesting',
 hebrew: 'Vesting / הבשלת מניות',
 english: 'Vesting',
 definition:
 'מנגנון שמחלק בעלות על מניות לאורך זמן. הסטנדרט: 4 שנות Vesting עם Cliff של שנה — אם המייסד עוזב לפני שנה, הוא מקבל 0%. אחרי שנה — 25%, ומשם 1/48 לכל חודש. חובה כמעט בכל סבב.',
 guideSlug: 'vesting-hesber',
 category: 'funding',
 },
 {
 id: 'term-sheet',
 hebrew: 'Term Sheet',
 english: 'Term Sheet',
 definition:
 'מסמך לא-מחייב שמסכם את התנאים העיקריים של עסקת השקעה. כולל: pre-money valuation, סכום, אחוז dilution, זכויות משקיע (Anti-dilution, Pro-rata), liquidation preference, ו-Vesting. דורש ליווי משפטי.',
 category: 'funding',
 },
 {
 id: 'exit',
 hebrew: 'אקזיט',
 english: 'Exit',
 definition:
 'מכירת החברה (M&A) או הנפקה ראשונית (IPO). בישראל אקזיט M&A — תלוי בתחום ובשלב. אקזיט מגה: scope tailoredB+. זמן ממוצע מ-Seed לאקזיט: מספר שנים. אנחנו עובדים עם סטארטאפים בכל שלבי הפיתוח.',
 guideSlug: 'exit-startup',
 category: 'funding',
 },
 {
 id: 'rashut-hachadshanut',
 hebrew: 'רשות החדשנות',
 english: 'Israel Innovation Authority',
 definition:
 'הגוף הממשלתי הישראלי לקידום חדשנות טכנולוגית. מציע גרנטים non-dilutive (מאות אלפי דולרים) דרך מסלולים: קרן המו"פ, חברה צעירה, חממה טכנולוגית, Innovation Box. הצלחה ממוצעת: 25-40% מהבקשות.',
 guideSlug: 'grants-rashut-hachadshanut',
 category: 'funding',
 },

 // ========== METRICS ==========
 {
 id: 'tam',
 hebrew: 'TAM / שוק יעד כולל',
 english: 'Total Addressable Market',
 definition:
 'סך השוק הפוטנציאלי הגלובלי למוצר. משמעותו: אם 100% מהשוק קונים, כמה הכנסות זה יוצר. משקיעים דורשים TAM של scope tailored+ כדי לשקול השקעה.',
 category: 'metrics',
 },
 {
 id: 'sam',
 hebrew: 'SAM / שוק נגיש',
 english: 'Serviceable Addressable Market',
 definition:
 'החלק מ-TAM שהמוצר יכול לתת לו מענה מבחינה גיאוגרפית, רגולטורית או טכנולוגית. בישראל לרוב 5-15% מ-TAM הגלובלי.',
 category: 'metrics',
 },
 {
 id: 'som',
 hebrew: 'SOM / שוק יעד מציאותי',
 english: 'Serviceable Obtainable Market',
 definition:
 'החלק מ-SAM שניתן לכבוש באופן מציאותי בטווח של מספר שנים. לרוב 1-5% מ-SAM. משקיעים מעריכים את SOM כסבירות הצמיחה הראשית.',
 category: 'metrics',
 },
 {
 id: 'cac',
 hebrew: 'CAC / עלות רכישת לקוח',
 english: 'Customer Acquisition Cost',
 definition:
 'סך העלות (שיווק + מכירות) לרכישת לקוח אחד. נוסחה: סך השקעה / מספר לקוחות חדשים. צריך להיות פחות מ-1/3 של LTV.',
 category: 'metrics',
 },
 {
 id: 'ltv',
 hebrew: 'LTV / ערך חיים של לקוח',
 english: 'Lifetime Value',
 definition:
 'סך ההכנסות שלקוח מייצר לאורך כל חיי הקשר עם החברה. נוסחה ב-SaaS: ARPU × Gross Margin × (1/Churn Rate). LTV/CAC חייב להיות לפחות 3.',
 category: 'metrics',
 },
 {
 id: 'arr',
 hebrew: 'ARR / הכנסה חוזרת שנתית',
 english: 'Annual Recurring Revenue',
 definition:
 'סך ההכנסות החוזרות (subscription) על פני שנה. במקום לחשב הכנסה חודש-לחודש (MRR × 12), ARR לוקח snapshot של הסכם הסכומים החתומים. מדד הסטנדרט ב-SaaS.',
 category: 'metrics',
 },
 {
 id: 'churn',
 hebrew: 'Churn / נטישה',
 english: 'Churn Rate',
 definition:
 'אחוז הלקוחות שמבטלים את ההסכם בתקופה נתונה. ב-B2B SaaS — annual churn טוב הוא <10%, מצוין הוא <5%. ב-B2C — חודשי churn של 5-10% מקובל.',
 category: 'metrics',
 },

 // ========== LEGAL ==========
 {
 id: 'heskem-meyasdim',
 hebrew: 'הסכם מייסדים',
 english: 'Founders Agreement',
 definition:
 'חוזה משפטי בין מייסדי הסטארטאפ. כולל: חלוקת אקוויטי, Vesting, תפקידים, החלטות, יציאת שותף (Bad Leaver), ו-IP ownership. חייב להיחתם ביום הראשון של המיזם.',
 guideSlug: 'heskem-meyasdim',
 category: 'legal',
 },
 {
 id: 'nda',
 hebrew: 'הסכם סודיות / NDA',
 english: 'Non-Disclosure Agreement',
 definition:
 'חוזה משפטי שמטיל חובת סודיות. בסטארטאפים — חותמים עם עובדים פוטנציאליים, נותני שירותים, ו-acquirers בתהליך אקזיט. **לא** חותמים עם משקיעי VC — הם דוחים בדרך כלל.',
 guideSlug: 'heskem-sodyut-nda',
 category: 'legal',
 },
 {
 id: 'delaware-flip',
 hebrew: 'Delaware Flip',
 english: 'Delaware Flip',
 definition:
 'תהליך הקמת הולדינג בארה"ב (Delaware C-Corp) שבעלת את החברה הישראלית. נדרש לרוב לפני Series A אם המשקיעים אמריקאים. עלות: scope tailored בעורכי דין. עדיף לדחות עד שצריך באמת.',
 guideSlug: 'delaware-flip',
 category: 'legal',
 },
 {
 id: 'sa-102',
 hebrew: 'סעיף 102',
 english: 'Section 102 (Israeli Tax Code)',
 definition:
 'סעיף בפקודת מס הכנסה הישראלית שמאפשר אופציות לעובדים תחת מס מופחת. תנאים: vesting, החזקה של שנתיים מהקצאה, ו-trustee. שיעור מס: 25% (במקום 50% רגיל). חובה לכל ESOP ישראלי.',
 category: 'legal',
 },

 // ========== MEDTECH ==========
 {
 id: 'helsinki',
 hebrew: 'ועדת הלסינקי',
 english: 'Helsinki Committee (Israeli IRB)',
 definition:
 'הוועדה האתית הישראלית לאישור מחקר רפואי עם בני אדם או מידע מזהה. שווה ערך ל-IRB האמריקאי. תהליך אישור: בלוחות זמנים תלויי-מסלול. נדרש לפני כל ניסוי קליני או גישה לדאטה רפואית.',
 guideSlug: 'vaadat-helsinki-madrich',
 category: 'medtech',
 },
 {
 id: 'fda-510k',
 hebrew: 'FDA 510(k)',
 english: 'FDA 510(k) Premarket Notification',
 definition:
 'מסלול האישור הנפוץ של ה-FDA למכשור רפואי. דורש הוכחת "substantial equivalence" ל-predicate device קיים. סקירה: בלוחות זמנים תלויי-מסלול. הכנה: בלוחות זמנים תלויי-מסלול. עלות: היקף תלוי כולל testing וייעוץ רגולטורי.',
 guideSlug: 'fda-510k-madrich',
 category: 'medtech',
 },
 {
 id: 'ce-marking',
 hebrew: 'סימון CE',
 english: 'CE Marking',
 definition:
 'הסימון הרגולטורי הנדרש למכירת מכשור רפואי באירופה. תחת MDR (Regulation 2017/745). דורש ISO 13485, ISO 14971, IEC 62304 (אם תוכנה), Notified Body, וניסוי קליני. תהליך: בלוחות זמנים תלויי-מסלול.',
 category: 'medtech',
 },
 {
 id: 'iso-13485',
 hebrew: 'ISO 13485',
 english: 'ISO 13485',
 definition:
 'תקן ניהול איכות בינלאומי ייחודי למכשור רפואי. נדרש ל-CE marking, מועדף ל-FDA. דורש מערכת QMS (Quality Management System) מלאה. הקמה: בלוחות זמנים תלויי-מסלול, עלות: היקף תלוי.',
 category: 'medtech',
 },
 {
 id: 'medtech',
 hebrew: 'MedTech / מיזם רפואי',
 english: 'MedTech',
 definition:
 'תחום הטכנולוגיה הרפואית — מכשור, תוכנה, או מוצרים לשימוש קליני. דורש רגולציה (FDA, CE, אמ"ר), תקופת פיתוח ארוכה (מספר שנים), והון משמעותי (היקף תלוי ל-FDA). ישראל מובילה גלובלית.',
 guideSlug: 'mizam-refui',
 category: 'medtech',
 },
 {
 id: 'dtx',
 hebrew: 'Digital Therapeutics / DTx',
 english: 'Digital Therapeutics',
 definition:
 'תרופה דיגיטלית — תוכנה רפואית מאושרת ע"י FDA כטיפול בפני עצמה (לא רק wellness). דוגמאות: Pear Therapeutics, Akili. דורשת ניסויים קליניים מלאים. תחום צומח אגרסיבית בארה"ב ובאירופה.',
 guideSlug: 'digital-therapeutics-israel',
 category: 'medtech',
 },

 // ========== PEOPLE ==========
 {
 id: 'co-founder',
 hebrew: 'שותף מייסד / Co-Founder',
 english: 'Co-Founder',
 definition:
 'אחד ממייסדי הסטארטאפ. ההרכב הסטנדרטי: 2-3 שותפי-מייסדים — CEO (עסקי), CTO (טכני), ולעיתים CPO/CMO. סולו-founder סובל מ-penalty של 20-30% ב-valuation בעיני משקיעים.',
 guideSlug: 'chipus-shutaf-meyased',
 category: 'people',
 },
 {
 id: 'ceo',
 hebrew: 'מנכ"ל / CEO',
 english: 'Chief Executive Officer',
 definition:
 'הראש הרשמי של החברה. אחראי על אסטרטגיה, ניהול הון, ויצירת חזון. בסטארטאפ ראשוני — ה-CEO גם sales-leader, fundraiser, ו-recruiter. עם הצמיחה — מאצל סמכויות.',
 category: 'people',
 },
 {
 id: 'cto',
 hebrew: 'סמנכ"ל טכנולוגיות / CTO',
 english: 'Chief Technology Officer',
 definition:
 'הראש הטכני של החברה. אחראי על ארכיטקטורה, בחירת stack, גיוס מהנדסים, וייצוג טכני מול משקיעים. בסטארטאפ ראשוני יש לעיתים CTO חלקי (CTO as a Service) במקום משרה מלאה.',
 category: 'people',
 },
 {
 id: 'angel',
 hebrew: 'אנג\'ל / Angel Investor',
 english: 'Angel Investor',
 definition:
 'משקיע פרטי אמיד שמשקיע מכספו האישי בסטארטאפים מוקדמים — לרוב Pre-Seed או Seed. השקעה ממוצעת: scope tailoredK. בישראל פעילים מאות אנג\'לים, רבים מהם יזמים שעשו אקזיט.',
 category: 'people',
 },
 {
 id: 'vc',
 hebrew: 'הון סיכון / VC',
 english: 'Venture Capital',
 definition:
 'קרנות מקצועיות שמשקיעות בסטארטאפים בתמורה לאקוויטי. ישראל יש מעל 100 קרנות פעילות. דוגמאות: TLV Partners, Pitango, Vertex, JVP, Ibex. סבבים: Seed (scope tailored), Series A (scope tailored), Series B (scope tailored).',
 category: 'people',
 },
 {
 id: 'lp',
 hebrew: 'LP / משקיע מוגבל',
 english: 'Limited Partner',
 definition:
 'משקיע בקרן הון סיכון. LPs טיפוסיים: קרנות פנסיה, קרנות ביטוח, family offices, sovereign wealth funds. הם המקור האמיתי של ההון שמגיע לסטארטאפים — דרך ה-VCs.',
 category: 'people',
 },

 // ========== ECOSYSTEM ==========
 {
 id: 'leumit',
 hebrew: 'לאומית שירותי בריאות',
 english: 'Leumit Health Services',
 definition:
 'אחת מארבע קופות החולים הציבוריות בישראל. אוכלוסיית מבוטחים נרחבת, פעילות קלינית רחבת היקף. שותפה אסטרטגית בלעדית של WeCcelerate למסלול MedTech — מאפשרת גישה לדאטה אנונימית ופיילוטים קליניים.',
 category: 'medtech',
 },
 {
 id: 'snc',
 hebrew: 'Start-Up Nation Central',
 english: 'Start-Up Nation Central',
 definition:
 'ארגון ללא מטרות רווח שמקדם את האקוסיסטם הישראלי בארץ ובחו"ל. מפעיל פלטפורמת Finder עם דאטה על 7,000+ סטארטאפים ישראלים. WeCcelerate חברה רשומה.',
 category: 'core',
 },
 {
 id: 'iati',
 hebrew: 'IATI',
 english: 'Israel Advanced Technology Industries',
 definition:
 'התאחדות תעשיות ההייטק הישראלית. מייצגת מאות חברות הייטק בעבודה מול הממשלה ובמטרה לקדם את הענף. WeCcelerate חברה רשומה.',
 category: 'core',
 },
];

const CATEGORIES: Record<GlossaryTerm['category'], { he: string; description: string }> = {
 core: { he: 'יסודות', description: 'מושגי הליבה של עולם המיזמים והסטארטאפים' },
 funding: { he: 'גיוס הון', description: 'מונחי גיוס: סבבים, מכשירי השקעה, valuation' },
 product: { he: 'מוצר וטכנולוגיה', description: 'MVP, PMF, סטאק טכנולוגי' },
 metrics: { he: 'מדדים', description: 'TAM, SAM, SOM, CAC, LTV, ARR' },
 legal: { he: 'משפט', description: 'הסכמים, אופציות, סעיפי מס' },
 medtech: { he: 'MedTech', description: 'רגולציה רפואית, FDA, CE, ועדת הלסינקי' },
 people: { he: 'אנשים', description: 'תפקידים: CEO, CTO, מייסדים, משקיעים' },
};

export const metadata: Metadata = constructMetadata({
 title: 'מילון יזמות וסטארטאפים — מונחים מרכזיים בעברית 2026',
 description: `מילון מקיף של ${TERMS.length} מונחים יזמיים וסטארטאפיים בעברית. הגדרות מדויקות עם תרגום אנגלי, מסלולים מקצועיים והקשרים לעולם הישראלי. מבונה מיזמים בישראל.`,
 keywords: [
 'מילון יזמות',
 'מונחי סטארטאפ',
 'מונחי מיזם',
 'מילון venture',
 'מילון startup עברית',
 'מה זה MVP',
 'מה זה SAFE',
 'מה זה PMF',
 'מה זה CAC',
 'מה זה Vesting',
 'מה זה ועדת הלסינקי',
 'מה זה FDA 510k',
 'מה זה Venture Builder',
 'מה זה בונה מיזמים',
 'יזמות מילון',
 ],
 path: '/glossary',
 locale: 'he',
});

function buildGlossarySchema() {
 return {
 '@context': 'https://schema.org',
 '@graph': [
 {
 '@type': 'DefinedTermSet',
 '@id': `${SITE_CONFIG.url}/glossary#termset`,
 name: 'מילון יזמות וסטארטאפים — WeCcelerate',
 description:
 'מילון מקיף של מונחי יזמות, גיוס הון, MVP, MedTech, ורגולציה — בעברית עם תרגום אנגלי.',
 url: `${SITE_CONFIG.url}/glossary`,
 inLanguage: 'he-IL',
 publisher: { '@id': `${SITE_CONFIG.url}/#organization` },
 hasDefinedTerm: TERMS.map((t) => ({
 '@type': 'DefinedTerm',
 '@id': `${SITE_CONFIG.url}/glossary#${t.id}`,
 name: t.hebrew,
 alternateName: t.english,
 description: t.definition,
 termCode: t.id,
 inDefinedTermSet: { '@id': `${SITE_CONFIG.url}/glossary#termset` },
...(t.guideSlug && {
 url: `${SITE_CONFIG.url}/guides/${t.guideSlug}`,
 }),
 })),
 },
 {
 '@type': 'BreadcrumbList',
 '@id': `${SITE_CONFIG.url}/glossary#breadcrumb`,
 itemListElement: [
 { '@type': 'ListItem', position: 1, name: 'בית', item: SITE_CONFIG.url },
 { '@type': 'ListItem', position: 2, name: 'מילון יזמות', item: `${SITE_CONFIG.url}/glossary` },
 ],
 },
 ],
 };
}

export default function GlossaryPage() {
 const grouped = (Object.keys(CATEGORIES) as GlossaryTerm['category'][]).map((cat) => ({
 category: cat,
 label: CATEGORIES[cat],
 items: TERMS.filter((t) => t.category === cat).sort((a, b) =>
 a.hebrew.localeCompare(b.hebrew, 'he'),
 ),
 }));

 return (
 <>
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{ __html: JSON.stringify(buildGlossarySchema()) }}
 />

 <main className="min-h-screen bg-white" id="main-content">
 <div className="mx-auto max-w-5xl px-4 py-12 md:py-16" dir="rtl">
 <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
 <Link href="/" className="hover:text-slate-900">בית</Link>
 <span className="mx-2">›</span>
 <span aria-current="page" className="text-slate-900">מילון יזמות</span>
 </nav>

 <header className="mb-10">
 <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-5xl">
 מילון יזמות וסטארטאפים
 </h1>
 <p data-speakable className="max-w-3xl text-lg leading-relaxed text-slate-700">
 מילון מקיף של {TERMS.length} מונחים מרכזיים בעולם היזמות והסטארטאפים בישראל.
 כל מונח מוגדר בעברית עם תרגום לאנגלית והקשר לעולם הישראלי. WeCcelerate, בונה מיזמים בישראל, ריכזה את המונחים הקריטיים שכל יזם ישראלי צריך להכיר —
 מ-MVP ועד אקזיט, מ-SAFE עד ועדת הלסינקי.
 </p>
 </header>

 <nav aria-label="קטגוריות" className="mb-12 rounded-xl border border-slate-200 bg-slate-50 p-5">
 <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
 קטגוריות
 </h2>
 <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
 {grouped.map(({ category, label, items }) => (
 <li key={category}>
 <a
 href={`#${category}`}
 className="flex items-center justify-between rounded-lg px-3 py-2 text-slate-700 transition hover:bg-white hover:text-blue-700"
 >
 <span>{label.he}</span>
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
 {label.he}
 </h2>
 <p className="mb-6 text-sm text-slate-600">{label.description}</p>

 <dl className="space-y-5">
 {items.map((term) => (
 <div
 key={term.id}
 id={term.id}
 className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5"
 >
 <dt className="mb-2 flex flex-wrap items-baseline gap-2">
 <span className="text-xl font-bold text-slate-900">{term.hebrew}</span>
 <span className="text-sm text-slate-500">· {term.english}</span>
 </dt>
 <dd className="leading-relaxed text-slate-700">{term.definition}</dd>
 {term.guideSlug && (
 <Link
 href={`/guides/${term.guideSlug}`}
 className="mt-3 inline-block text-sm font-medium text-blue-700 hover:underline"
 >
 המדריך המלא ←
 </Link>
 )}
 </div>
 ))}
 </dl>
 </section>
 ))}
 </div>

 <section className="mt-16 rounded-2xl bg-slate-900 p-8 text-center text-white">
 <h2 className="mb-3 text-2xl font-bold">חסר מונח?</h2>
 <p className="mb-6 text-slate-300">
 נשמח להוסיף — שלחו הצעה ל-info@weccelerate.co.il.
 </p>
 <Link
 href="/contact"
 className="inline-block rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
 >
 יצירת קשר →
 </Link>
 </section>
 </div>
 </main>
 </>
 );
}
