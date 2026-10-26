/**
 * Extended FAQ Catalog - 50+ questions organized by intent.
 *
 * Intent categories:
 * - definitional: "what is X", "difference between X and Y"
 * - transactional: "how much", "how long"
 * - comparative: "A vs B"
 * - regulatory: "how to get FDA / CE / Helsinki approval"
 * - practical: "how to apply", "what languages"
 * - ecosystem: Israeli startup scene context
 *
 * Each item is bilingual (Hebrew / English) and designed to be cited
 * verbatim by LLMs (ChatGPT, Claude, Perplexity, Google AI Overviews).
 */

export type FaqIntent =
 | 'definitional'
 | 'transactional'
 | 'comparative'
 | 'regulatory'
 | 'practical'
 | 'ecosystem';

export interface FaqEntry {
 id: string;
 intent: FaqIntent;
 question: { he: string; en: string };
 answer: { he: string; en: string };
}

// Rewritten 2026-10-22 to match the verified guides (guides-catalog.ts,
// guides-medtech-2026.ts, guides-catalog-en.ts). Regulatory and grant facts
// are taken from those guides, which cite FDA (MDUFA FY2027 fees, 510(k) /
// De Novo / PMA review goals), EUR-Lex (MDR 2017/745 and 2023/607), gov.il
// (AMAR, Procedure 14, Corporations Authority 2026 fee table) and the Israel
// Innovation Authority (Tnufa, technological incubators). Owner rules: no
// prices, equity terms, client counts, network sizes or success claims about
// WeCcelerate; founding year 2018; Leumit partnership launched 2022.
export const FAQ_CATALOG: readonly FaqEntry[] = [
 // -- DEFINITIONAL ---------------------------------------------------------
 {
 id: 'what-is-weccelerate',
 intent: 'definitional',
 question: {
 he: 'מה זה WeCcelerate?',
 en: 'What is WeCcelerate?',
 },
 answer: {
 he: 'WeCcelerate (וויסלרייט) היא Venture Builder ישראלי שפועל מאז 2018 בתל אביב ובירושלים, ומוכר על ידי רשות החדשנות. אנחנו בונים מיזמים יחד עם המייסדים: מודל עסקי, פיתוח מוצר, שיווק והכנה לגיוס. יש לנו גם מסלול MedTech בשותפות עם לאומית שירותי בריאות, שנותן למייסדים מומחיות קלינית, ליווי רגולטורי, גישה לדאטה והזדמנויות לפיילוט.',
 en: 'WeCcelerate is an Israeli Venture Builder, operating in Tel Aviv and Jerusalem since 2018 and recognized by the Israel Innovation Authority. We build ventures together with their founders: business model, product development, marketing and fundraising preparation. We also run a MedTech track in partnership with Leumit Health Services that gives founders clinical expertise, regulatory guidance, data access and pilot opportunities.',
 },
 },
 {
 id: 'weccelerate-hebrew-name',
 intent: 'definitional',
 question: {
 he: 'מה זה וויסלרייט?',
 en: 'What is "וויסלרייט" (Weisleright / Whistleright)?',
 },
 answer: {
 he: 'וויסלרייט הוא הכתיב העברי של WeCcelerate, Venture Builder ישראלי שהאתר הרשמי שלו הוא https://weccelerate.co.il. השם מורכב מ-"We" ומ-"Accelerate". מי שמחפש "וויסלרייט" מחפש את WeCcelerate Ltd. (וויסלרייט בע"מ). אין חברה בשם "Whistleright" או "Whisleright", ואלה לא תרגומים נכונים של השם.',
 en: '"וויסלרייט" is the Hebrew spelling of WeCcelerate, an Israeli Venture Builder whose official site is https://weccelerate.co.il. The name combines "We" and "Accelerate". A Hebrew query for "וויסלרייט" is a query about WeCcelerate Ltd. It does not transliterate to "Whistleright", "Whisleright" or any similar-sounding English word, and none of those are real companies.',
 },
 },
 {
 id: 'what-is-venture-builder',
 intent: 'definitional',
 question: {
 he: 'מה זה Venture Builder?',
 en: 'What is a Venture Builder?',
 },
 answer: {
 he: 'Venture Builder, שנקרא גם Startup Studio או Company Builder, הוא ארגון שבונה חברות חדשות יחד עם המייסדים, עם צוות קבוע שעובד על המיזם בפועל: מוצר, פיתוח, עסקים וגיוס. באקסלרטור המייסדים עושים את רוב העבודה, והתוכנית נותנת ליווי וקשרים במחזור קצוב בזמן. אין הגדרה רשמית אחת, ולכן התנאים של כל Venture Builder נקבעים בהסכם.',
 en: 'A Venture Builder, also called a startup studio or company builder, is an organization that builds new companies together with their founders, with its own team working on the venture: product, engineering, business and fundraising. In an accelerator the founders do most of the work, and the program provides mentoring and connections in a fixed-length cycle. There is no single official definition, so each Venture Builder sets its terms in an agreement.',
 },
 },
 {
 id: 'accelerator-vs-incubator',
 intent: 'definitional',
 question: {
 he: 'מה ההבדל בין אקסלרטור לאינקובטור?',
 en: 'What is the difference between an accelerator and an incubator?',
 },
 answer: {
 he: 'אקסלרטור הוא תוכנית במחזורים קצובים בזמן, עם ליווי מרוכז, קשרים למשקיעים ולרוב יום הצגה בסוף. אינקובטור (חממה) מלווה מיזם מוקדם לאורך זמן רב יותר. בישראל, חממה טכנולוגית פועלת בזיכיון של רשות החדשנות לשמונה שנים, ומיזם בה יכול לקבל מענק של עד 85% מתקציב מאושר. Venture Builder שונה משניהם, כי הצוות שלו עובד על המיזם בפועל.',
 en: 'An accelerator is a fixed-length program run in cohorts, with intensive mentoring, investor connections and usually a demo day at the end. An incubator supports an early venture over a longer period. In Israel, technological incubators operate under an eight-year Israel Innovation Authority franchise, and a venture in one can receive a grant of up to 85% of an approved budget. A Venture Builder differs from both because its own team works on the venture.',
 },
 },
 {
 id: 'what-is-mvp',
 intent: 'definitional',
 question: {
 he: 'מה זה MVP?',
 en: 'What is an MVP (Minimum Viable Product)?',
 },
 answer: {
 he: 'MVP (Minimum Viable Product, מוצר מינימלי בר-קיימא) הוא הגרסה הפשוטה ביותר של המוצר שמאפשרת לבדוק את הנחת הערך המרכזית מול משתמשים אמיתיים. המטרה היא לא מוצר גמור, אלא מוצר עובד שמראה אם הבעיה אמיתית ואם הפתרון עובד. מגדירים מראש מה רוצים ללמוד, בונים רק את מה שנדרש לכך, ומשפרים לפי המשוב.',
 en: 'An MVP (Minimum Viable Product) is the simplest version of a product that lets you test the core value hypothesis with real users. The goal is not a finished product but a working one that shows whether the problem is real and the solution works. You decide in advance what you want to learn, build only what is needed to learn it, and improve based on the feedback.',
 },
 },
 {
 id: 'what-is-product-market-fit',
 intent: 'definitional',
 question: {
 he: 'מה זה Product-Market Fit?',
 en: 'What is Product-Market Fit (PMF)?',
 },
 answer: {
 he: 'Product-Market Fit (PMF) הוא המצב שבו שוק מוגדר רוצה את המוצר מספיק כדי לשלם עליו, להמשיך להשתמש בו ולהמליץ עליו. סימנים טובים הם לקוחות שחוזרים בלי תזכורות, מכירות שלא תלויות רק במייסדים, ומשתמשים שמתאכזבים כשהמוצר לא זמין. בלי PMF קשה יותר לגייס סבבים מתקדמים, כי אין עדיין הוכחה שהצמיחה תחזיק.',
 en: 'Product-Market Fit (PMF) is the state in which a defined market wants a product enough to pay for it, keep using it and recommend it. Good signs are customers who return without reminders, sales that do not depend only on the founders, and users who are disappointed when the product is unavailable. Without PMF, later rounds are harder to raise because there is no proof yet that growth will last.',
 },
 },
 {
 id: 'what-is-cto-as-a-service',
 intent: 'definitional',
 question: {
 he: 'מה זה CTO as a Service?',
 en: 'What is CTO-as-a-Service?',
 },
 answer: {
 he: 'CTO as a Service הוא מודל שבו סטארטאפ בלי מייסד טכנולוגי עובד עם CTO במשרה חלקית או במסגרת התקשרות מוגדרת. ה-CTO מקבל את ההחלטות הארכיטקטוניות, עוזר לגייס את הצוות ההנדסי הראשון, בודק קוד, מנהל ספקים ומייצג את הצד הטכני מול משקיעים. ב-WeCcelerate היקף השעות ומשך ההתקשרות נקבעים לפי צורכי המיזם.',
 en: 'CTO-as-a-Service is a model in which a startup without a technical co-founder works with a part-time or engaged Chief Technology Officer. The CTO makes architectural decisions, helps hire the first engineering team, reviews code, manages vendors and represents the technical side in investor conversations. At WeCcelerate, weekly hours and engagement length are set according to each venture\'s needs.',
 },
 },
 {
 id: 'what-is-medtech',
 intent: 'definitional',
 question: {
 he: 'מה ההבדל בין MedTech ל-HealthTech?',
 en: 'What is the difference between MedTech and HealthTech?',
 },
 answer: {
 he: 'MedTech הוא טכנולוגיה רפואית: מכשירים ותוכנות שמיועדים לאבחון, טיפול, ניטור או מניעה של מחלה, ולכן הם לרוב מכשיר רפואי שצריך אישור רגולטורי, כמו FDA בארה"ב, CE באירופה ורישום אמ"ר בישראל. HealthTech הוא מונח רחב יותר, שכולל גם wellness, ניהול מערכות בריאות וטלרפואה. מה שקובע אם נדרש אישור הוא השימוש המיועד של המוצר, לא השם.',
 en: 'MedTech is medical technology: devices and software intended to diagnose, treat, monitor or prevent disease, so they are often medical devices that need regulatory clearance, such as FDA in the US, CE marking in Europe and AMAR registration in Israel. HealthTech is a broader term that also covers wellness, health-system management and telemedicine. Whether approval is needed depends on the product\'s intended use, not on the label.',
 },
 },
 {
 id: 'what-is-tam-sam-som',
 intent: 'definitional',
 question: {
 he: 'מה זה TAM SAM SOM?',
 en: 'What are TAM, SAM, and SOM?',
 },
 answer: {
 he: 'TAM, SAM ו-SOM הם שלוש דרכים למדוד את גודל השוק. TAM (Total Addressable Market) הוא כל השוק הפוטנציאלי. SAM (Serviceable Addressable Market) הוא החלק שהמוצר שלכם יכול לשרת בפועל, לפי גאוגרפיה, רגולציה וערוצי מכירה. SOM (Serviceable Obtainable Market) הוא החלק שאפשר לכבוש באופן מציאותי בשנים הקרובות. משקיעים מצפים לראות חישוב שמבוסס על לקוחות ומחירים, לא רק על דוחות שוק.',
 en: 'TAM, SAM and SOM are three ways to size a market. TAM (Total Addressable Market) is the whole potential market. SAM (Serviceable Addressable Market) is the part your product can actually serve, given geography, regulation and sales channels. SOM (Serviceable Obtainable Market) is the part you can realistically capture in the next few years. Investors expect a bottom-up calculation based on customers and prices, not only on market reports.',
 },
 },

 // -- TRANSACTIONAL / HOW-MUCH --------------------------------------------
 {
 id: 'cost-mvp-mobile',
 intent: 'transactional',
 question: {
 he: 'כמה עולה לפתח אפליקציה?',
 en: 'How much does it cost to develop an app?',
 },
 answer: {
 he: 'אין מחיר אחד לפיתוח אפליקציה. העלות תלויה בפלטפורמה (מובייל, ווב או שתיהן), במורכבות צד השרת, באינטגרציות, בשימוש ב-AI ובניסיון של הצוות. MVP ממוקד עולה פחות ממוצר מלא, ולכן כדאי להגדיר קודם מה הגרסה הראשונה צריכה להוכיח. ב-WeCcelerate ההיקף והמחיר נקבעים אחרי שיחת היכרות ואפיון של המוצר.',
 en: 'There is no single price for building an app. Cost depends on the platform (mobile, web or both), backend complexity, integrations, use of AI and the seniority of the team. A focused MVP costs less than a full product, so first define what the first version needs to prove. At WeCcelerate, scope and price are set after an intro conversation and a product specification.',
 },
 },
 {
 id: 'cost-business-consulting',
 intent: 'transactional',
 question: {
 he: 'כמה עולה ייעוץ עסקי ב-WeCcelerate?',
 en: 'How much does business consulting cost at WeCcelerate?',
 },
 answer: {
 he: 'ל-WeCcelerate אין מחירון קבוע לייעוץ עסקי. המחיר נקבע לפי מה שהמיזם צריך: מחקר שוק, תוכנית עסקית, מודל פיננסי, תקציר מנהלים או מצגת למשקיעים, ולפי מורכבות התחום. את ההיקף מגדירים יחד בשיחת ההיכרות, ורק אחר כך נותנים הצעה.',
 en: 'WeCcelerate does not have a fixed price list for business consulting. The price depends on what the venture needs, such as market research, a business plan, a financial model, an executive summary or an investor deck, and on how complex the sector is. The scope is defined together in an intro conversation, and only then is a proposal given.',
 },
 },
 {
 id: 'cost-medtech-track',
 intent: 'transactional',
 question: {
 he: 'כמה עולה מסלול MedTech המלא?',
 en: 'How much does the full MedTech track cost?',
 },
 answer: {
 he: 'ל-WeCcelerate אין מחיר אחיד למסלול ה-MedTech עם לאומית. התנאים נקבעים לכל מיזם לפי השלב שלו, סוג המכשיר והליווי שהוא צריך. המסלול נותן מומחיות קלינית, ליווי רגולטורי, גישה לדאטה והזדמנויות לפיילוט. בנפרד מזה יש עלויות רגולטוריות חיצוניות, למשל אגרת 510(k) של FDA, שבשנת הכספים 2027 היא 28,653 דולר, או 7,163 דולר לעסק קטן מאושר.',
 en: 'WeCcelerate does not have a single price for the MedTech track with Leumit. Terms are set per venture, based on its stage, device type and the support it needs. The track provides clinical expertise, regulatory guidance, data access and pilot opportunities. External regulatory costs are separate, for example the FDA 510(k) user fee, which for fiscal year 2027 is $28,653, or $7,163 for a qualified small business.',
 },
 },
 {
 id: 'timeline-mvp',
 intent: 'transactional',
 question: {
 he: 'כמה זמן לוקח לפתח MVP?',
 en: 'How long does MVP development take?',
 },
 answer: {
 he: 'משך הפיתוח של MVP תלוי בעיקר בהיקף: כמה מסכים ותהליכים, כמה אינטגרציות, והאם יש רכיב חומרה, AI או רגולציה. הדרך לקצר היא להגדיר שאלה אחת שה-MVP צריך לענות עליה ולבנות רק את מה שנדרש לה. עובדים בספרינטים קצרים עם הדגמה תכופה ליזם, כדי לקבל משוב מוקדם ולא לבנות דברים מיותרים.',
 en: 'How long an MVP takes depends mainly on scope: how many screens and flows, how many integrations, and whether hardware, AI or regulation is involved. The way to shorten it is to define one question the MVP must answer and build only what that requires. Work runs in short sprints with frequent demos to the founder, so feedback comes early and nothing unnecessary gets built.',
 },
 },
 {
 id: 'timeline-business-plan',
 intent: 'transactional',
 question: {
 he: 'כמה זמן לוקח לבנות תוכנית עסקית?',
 en: 'How long does it take to build a business plan?',
 },
 answer: {
 he: 'הזמן לבניית תוכנית עסקית תלוי בעיקר במחקר השוק: כמה מידע כבר קיים, כמה ראיונות עם לקוחות צריך לעשות, וכמה מורכב התחום. תוכנית למשקיעים כוללת בדרך כלל ניתוח שוק ותחרות, מודל עסקי, תוכנית שיווק ומודל פיננסי. לצידה כדאי להכין תקציר מנהלים קצר, כי זה המסמך שרוב המשקיעים יקראו קודם.',
 en: 'How long a business plan takes depends mostly on the market research: how much data already exists, how many customer interviews are needed and how complex the sector is. A plan for investors usually covers market and competition, business model, marketing plan and a financial model. Prepare a short executive summary alongside it, because that is the document most investors read first.',
 },
 },
 {
 id: 'timeline-fda-510k',
 intent: 'transactional',
 question: {
 he: 'כמה זמן לוקח אישור FDA 510(k)?',
 en: 'How long does FDA 510(k) clearance take?',
 },
 answer: {
 he: 'יעד ה-FDA הוא החלטה על 510(k) תוך 90 ימי FDA מקבלת ההגשה. ימי FDA לא כוללים את הזמן שבו ההגשה בהמתנה לתשובה שלכם לבקשת מידע נוסף, ולתשובה כזו יש עד 180 ימים קלנדריים. לכן הזמן בלוח השנה ארוך יותר. ההכנה, כלומר בחירת predicate, בדיקות ביצועים ותיעוד, היא לרוב החלק הארוך בתהליך. הפירוט במדריך /guides/fda-510k-madrich.',
 en: 'FDA\'s goal is a 510(k) decision within 90 FDA days of receipt. FDA days exclude the time the submission waits for your answer to an Additional Information request, and you have up to 180 calendar days to send that answer. So calendar time is longer. Preparation, meaning predicate selection, performance testing and documentation, is usually the longest part. Details are in the guide at /guides/fda-510k-madrich.',
 },
 },
 {
 id: 'timeline-ce-marking',
 intent: 'transactional',
 question: {
 he: 'כמה זמן לוקח לקבל CE marking?',
 en: 'How long does CE marking take?',
 },
 answer: {
 he: 'משך התהליך לסימון CE תלוי בסיווג המכשיר לפי MDR (תקנה 2017/745). ב-Class I רגיל היצרן חותם על הצהרת התאמה עצמית, ולכן הזמן תלוי בעיקר בהכנת התיעוד. בשאר הסיווגים נדרשת סקירה של גוף מאושר (Notified Body), והזמן תלוי גם בזמינות שלו. לפני ההגשה צריך מערכת ניהול איכות, ניהול סיכונים, הערכה קלינית ותיעוד טכני.',
 en: 'How long CE marking takes depends on the device class under the MDR (Regulation 2017/745). For a standard Class I device, the manufacturer signs a self-declaration of conformity, so time depends mainly on preparing the documentation. All other classes need review by a Notified Body, so time also depends on its availability. Before applying you need a quality management system, risk management, a clinical evaluation and technical documentation.',
 },
 },
 {
 id: 'cost-marketing-retainer',
 intent: 'transactional',
 question: {
 he: 'כמה עולה ליווי שיווקי חודשי?',
 en: 'How much does a monthly marketing retainer cost?',
 },
 answer: {
 he: 'עלות ליווי שיווקי חודשי תלויה בהיקף העבודה ובערוצים: ניהול קמפיינים, תוכן, יחסי ציבור ורשתות חברתיות. תקציב המדיה עצמו, כלומר הכסף שמשולם לפלטפורמות הפרסום, הוא בדרך כלל נפרד מדמי הליווי. ב-WeCcelerate ההיקף, הערוצים ומשך ההתקשרות נקבעים לכל מיזם בשיחת ההיכרות.',
 en: 'The cost of a monthly marketing retainer depends on the scope and channels: campaign management, content, PR and social media. The media budget itself, meaning the money paid to ad platforms, is usually separate from the retainer fee. At WeCcelerate, scope, channels and engagement length are set per venture in the intro conversation.',
 },
 },
 {
 id: 'cost-pitch-deck',
 intent: 'transactional',
 question: {
 he: 'כמה עולה להכין pitch deck מקצועי?',
 en: 'How much does a professional pitch deck cost?',
 },
 answer: {
 he: 'המחיר של pitch deck מקצועי תלוי במה שנכלל בו: רק עיצוב, או גם בניית הסיפור, מודל פיננסי ותרגול מול שאלות של משקיעים. מצגת טובה נשענת על עבודה עסקית שכבר נעשתה, ולכן אם עדיין אין מודל עסקי או ניתוח שוק, העבודה ארוכה יותר. ב-WeCcelerate ההיקף והמחיר נקבעים לכל סטארטאפ אחרי שיחת היכרות.',
 en: 'The price of a professional pitch deck depends on what it includes: design only, or also the storyline, a financial model and practice with investor questions. A good deck rests on business work that is already done, so if there is no business model or market analysis yet, the work takes longer. At WeCcelerate, scope and price are set per startup after an intro conversation.',
 },
 },

 // -- FUNDRAISING / INVESTMENT --------------------------------------------
 {
 id: 'how-to-raise-funding',
 intent: 'practical',
 question: {
 he: 'איך מגייסים הון לסטארטאפ?',
 en: 'How do you raise funding for a startup?',
 },
 answer: {
 he: 'מגייסים הון כשיש סיפור שמשקיע יכול לבדוק: בעיה מוכחת, עדות לביקוש, צוות מתאים ותוכנית ברורה לשימוש בכסף. מכינים מצגת ומודל פיננסי, בונים רשימה קצרה של משקיעים שמתאימים לשלב ולתחום, ומבקשים היכרות דרך מי שמכיר אותם. בשלב מוקדם משקיעים לרוב ב-SAFE, ב-Convertible Note או בסבב במניות. בישראל אפשר לשלב גם מענקים של רשות החדשנות.',
 en: 'You raise money when you have a story an investor can check: a proven problem, evidence of demand, the right team and a clear plan for the money. Prepare a deck and a financial model, build a short list of investors that fit your stage and sector, and ask for introductions through people who know them. Early rounds usually use a SAFE, a convertible note or a priced equity round. In Israel you can also combine Israel Innovation Authority grants.',
 },
 },
 {
 id: 'pitch-deck-structure',
 intent: 'definitional',
 question: {
 he: 'איזה מבנה צריך pitch deck להיות?',
 en: 'What is the ideal Pitch Deck structure?',
 },
 answer: {
 he: 'מבנה מקובל ל-pitch deck: (1) תיאור החברה במשפט אחד; (2) הבעיה והעדות לה; (3) הפתרון; (4) גודל השוק (TAM/SAM/SOM); (5) המוצר; (6) traction; (7) מודל עסקי; (8) אסטרטגיית GTM; (9) תחרות; (10) צוות; (11) תחזית פיננסית; (12) הסבב הנוכחי: סכום ושימוש בכסף; (13) חזון. כדאי שהמצגת תהיה קצרה. הטעות הנפוצה היא לפתוח במוצר במקום בבעיה.',
 en: 'A common pitch deck structure: (1) one-line company description; (2) the problem and evidence for it; (3) the solution; (4) market size (TAM/SAM/SOM); (5) the product; (6) traction; (7) business model; (8) go-to-market strategy; (9) competition; (10) team; (11) financial projections; (12) the current round: amount and use of funds; (13) vision. Keep the deck short. The most common mistake is opening with the product instead of the problem.',
 },
 },
 {
 id: 'can-guarantee-funding',
 intent: 'practical',
 question: {
 he: 'האם WeCcelerate מבטיחה גיוס הון?',
 en: 'Can WeCcelerate guarantee funding?',
 },
 answer: {
 he: 'לא. אף אקסלרטור או Venture Builder רציני לא יכול להבטיח גיוס, כי ההחלטה להשקיע מתקבלת על ידי משקיעים חיצוניים ועצמאיים. מה ש-WeCcelerate עושה הוא לעבוד עם המייסדים על המוכנות לגיוס: המודל העסקי, המצגת, המודל הפיננסי, תרגול מול שאלות של משקיעים ומשוב כן על המצב של החברה.',
 en: 'No. No serious accelerator or Venture Builder can guarantee funding, because the decision to invest is made by independent outside investors. What WeCcelerate does is work with founders on fundraising readiness: the business model, the deck, the financial model, practice with investor questions, and honest feedback on where the company stands.',
 },
 },
 {
 id: 'equity-does-weccelerate-take',
 intent: 'practical',
 question: {
 he: 'האם WeCcelerate לוקחת אקוויטי?',
 en: 'Does WeCcelerate take equity?',
 },
 answer: {
 he: 'זה תלוי בהתקשרות. ל-WeCcelerate אין תנאים אחידים, והתמורה, בין אם בתשלום, במניות או בשילוב, נקבעת בהסכם לכל מיזם לפי השלב שלו והעבודה הנדרשת. לפני שחותמים עם כל Venture Builder או אקסלרטור כדאי לברר מה נותנים בתמורה, מי יעבוד על המיזם, למי שייך הקניין הרוחני ומה קורה אם מפסיקים את העבודה המשותפת.',
 en: 'It depends on the engagement. WeCcelerate has no standard terms, and the consideration, whether payment, equity or a combination, is set in an agreement for each venture based on its stage and the work involved. Before signing with any Venture Builder or accelerator, ask what you give in return, who will work on the venture, who owns the intellectual property and what happens if the collaboration ends.',
 },
 },

 // -- REGULATORY (MedTech) ------------------------------------------------
 {
 id: 'helsinki-committee',
 intent: 'regulatory',
 question: {
 he: 'איך עוברים ועדת הלסינקי?',
 en: 'How does the Helsinki Committee (Israeli IRB) approval work?',
 },
 answer: {
 he: 'כל ניסוי רפואי בבני אדם בישראל, כולל פיילוט של מכשיר או מחקר על רשומות רפואיות קיימות, צריך אישור של ועדת הלסינקי של המוסד ואישור בכתב של מנהל המוסד, לפי תקנות בריאות העם משנת 1980 ונוהל 14 של משרד הבריאות. מגישים פרוטוקול מחקר, טופס הסכמה מדעת ופרטי החוקר. חלק מהניסויים צריכים גם אישור של משרד הבריאות. הפירוט במדריך /guides/vaadat-helsinki-madrich.',
 en: 'Every medical trial in humans in Israel, including a device pilot or a study on existing medical records, needs approval from the institution\'s Helsinki Committee and written approval from the institution director, under the Public Health Regulations of 1980 and Ministry of Health Procedure 14. You submit a study protocol, an informed consent form and investigator details. Some trials also need Ministry of Health approval. Details are in /guides/vaadat-helsinki-madrich.',
 },
 },
 {
 id: 'fda-pathways',
 intent: 'regulatory',
 question: {
 he: 'מה ההבדל בין FDA 510(k), De Novo ו-PMA?',
 en: 'What is the difference between FDA 510(k), De Novo, and PMA?',
 },
 answer: {
 he: '510(k) מוכיח שהמכשיר שקול מהותית למכשיר שכבר משווק בארה"ב (predicate), ויעד ה-FDA הוא החלטה תוך 90 ימי FDA. De Novo מיועד למכשיר חדשני בסיכון נמוך עד בינוני בלי predicate, עם יעד של 150 ימי סקירה. PMA מיועד לרוב מכשירי Class III ודורש בדרך כלל נתונים קליניים. אגרות 2027: 510(k) 28,653 דולר, De Novo 191,020 דולר ו-PMA 636,732 דולר, עם הנחה לעסק קטן מאושר.',
 en: 'A 510(k) shows the device is substantially equivalent to one already legally marketed in the US (a predicate), with an FDA goal of a decision within 90 FDA days. De Novo is for a novel low-to-moderate risk device with no predicate, with a goal of 150 review days. PMA is for most Class III devices and usually requires clinical data. FY2027 fees: 510(k) $28,653, De Novo $191,020 and PMA $636,732, with reduced fees for qualified small businesses.',
 },
 },
 {
 id: 'ce-marking-mdr',
 intent: 'regulatory',
 question: {
 he: 'מה זה CE marking?',
 en: 'What is CE marking?',
 },
 answer: {
 he: 'סימון CE למכשיר רפואי מראה שהמכשיר עומד ברגולציה האירופית למכשירים רפואיים, MDR (תקנה 2017/745), שחלה מ-26 במאי 2021. המכשירים מסווגים לפי רמת סיכון: Class I, IIa, IIb ו-III. ב-Class I רגיל היצרן חותם על הצהרה עצמית, ובשאר הסיווגים נדרש גוף מאושר (Notified Body). יצרן ישראלי חייב גם למנות נציג מורשה באיחוד. הפירוט במדריך /guides/ce-mark-mdr-mechshir-refui.',
 en: 'CE marking for a medical device shows that it complies with the EU Medical Device Regulation, MDR (Regulation 2017/745), which has applied since 26 May 2021. Devices are classified by risk: Class I, IIa, IIb and III. For a standard Class I device the manufacturer signs a self-declaration, and all other classes need a Notified Body. An Israeli manufacturer must also appoint an Authorised Representative in the EU. Details are in /guides/ce-mark-mdr-mechshir-refui.',
 },
 },
 {
 id: 'iso-13485',
 intent: 'regulatory',
 question: {
 he: 'מה זה ISO 13485?',
 en: 'What is ISO 13485?',
 },
 answer: {
 he: 'ISO 13485 הוא התקן הבינלאומי למערכת ניהול איכות (QMS) של יצרני מכשור רפואי. MDR באירופה דורש מערכת ניהול איכות, ורוב היצרנים בונים אותה לפי ISO 13485. בארה"ב, תקנת ה-QMSR של FDA, שנכנסה לתוקף ב-2 בפברואר 2026, משלבת את ISO 13485:2016 בדרישות האיכות. כדאי להתחיל לבנות את המערכת כבר בשלב הפיתוח, יחד עם ניהול סיכונים לפי ISO 14971.',
 en: 'ISO 13485 is the international standard for the quality management system (QMS) of medical device manufacturers. The EU MDR requires a quality management system, and most manufacturers build it to ISO 13485. In the US, FDA\'s Quality Management System Regulation (QMSR), in effect since 2 February 2026, incorporates ISO 13485:2016 into its quality requirements. Start building the system during development, together with risk management under ISO 14971.',
 },
 },
 {
 id: 'israeli-moh-amar',
 intent: 'regulatory',
 question: {
 he: 'איך מקבלים אישור משרד הבריאות בישראל?',
 en: 'How do I get Israeli Ministry of Health approval?',
 },
 answer: {
 he: 'מכשיר רפואי בישראל נרשם בפנקס הציוד הרפואי של אגף ציוד רפואי (אמ"ר) במשרד הבריאות, וזה תנאי לשיווק. את הבקשה מגיש תושב ישראל או תאגיד רשום בישראל, ויצרן זר עובד דרך יבואן או חברה ישראלית. מכשיר שרשום במדינה מוכרת, כמו ארה"ב או מדינות באירופה, נרשם על בסיס האישור הזר. מאז 15.8.2022 אין אגרה על רישום. הפירוט במדריך /guides/rishum-amar-mechshir-refui.',
 en: 'A medical device in Israel is registered in the medical equipment register of the Ministry of Health\'s Medical Devices Division (AMAR), which is a condition for marketing it. The applicant must be an Israeli resident or a company registered in Israel, so a foreign manufacturer works through an importer or Israeli company. A device registered in a recognized country, such as the US or European states, is registered based on that approval. There have been no registration fees since 15 August 2022.',
 },
 },


 // -- PRACTICAL -----------------------------------------------------------
 {
 id: 'how-to-apply',
 intent: 'practical',
 question: {
 he: 'איך מגישים מועמדות ל-WeCcelerate?',
 en: 'How do I apply to WeCcelerate?',
 },
 answer: {
 he: 'ממלאים את טופס יצירת הקשר באתר, בכתובת weccelerate.co.il/contact, עם כמה מילים על המיזם ועל השלב שבו הוא נמצא. נציג של WeCcelerate חוזר כדי לתאם שיחת היכרות. בשיחה מבינים מה המיזם צריך ואם יש התאמה. WeCcelerate עובדת עם יזמים כבר משלב הרעיון וגם עם חברות שכבר יש להן מוצר.',
 en: 'Fill out the contact form at weccelerate.co.il/contact with a few words about your venture and its stage. A WeCcelerate representative gets back to you to schedule an intro conversation, where we work out what the venture needs and whether there is a fit. WeCcelerate works with founders from the idea stage as well as with companies that already have a product.',
 },
 },
 {
 id: 'stages-supported',
 intent: 'practical',
 question: {
 he: 'באילו שלבים WeCcelerate עוזרת?',
 en: 'What stages does WeCcelerate support?',
 },
 answer: {
 he: 'WeCcelerate עובדת עם מיזמים משלב הרעיון ועד חברות שכבר יש להן מוצר ולקוחות ראשונים. בשלב הרעיון עובדים על הגדרת הבעיה, בדיקה מול לקוחות, מודל עסקי ו-MVP. כשיש מוצר, העבודה עוברת לשיווק, להכנה לגיוס ולשירותים ממוקדים לפי הצורך. המסלול המתאים נקבע בשיחת ההיכרות.',
 en: 'WeCcelerate works with ventures from the idea stage through to companies that already have a product and first customers. At the idea stage the work covers defining the problem, testing it with customers, the business model and an MVP. Once there is a product, the focus moves to marketing, fundraising preparation and targeted services as needed. The right track is chosen in the intro conversation.',
 },
 },
 {
 id: 'languages',
 intent: 'practical',
 question: {
 he: 'באילו שפות WeCcelerate עובדת?',
 en: 'What languages does WeCcelerate work in?',
 },
 answer: {
 he: 'WeCcelerate עובדת בעברית ובאנגלית, וכל השירותים זמינים בשתי השפות. מסמכים למשקיעים, כמו תוכנית עסקית ו-pitch deck, נכתבים לרוב באנגלית גם ליזמים ישראלים, כי חלק גדול מהמשקיעים והשותפים הפוטנציאליים קוראים באנגלית.',
 en: 'WeCcelerate works in Hebrew and English, and all services are available in both. Investor-facing documents, such as the business plan and pitch deck, are usually written in English even for Israeli founders, because many potential investors and partners read English.',
 },
 },
 {
 id: 'offices-locations',
 intent: 'practical',
 question: {
 he: 'איפה הסניפים של WeCcelerate?',
 en: 'Where are WeCcelerate\'s offices located?',
 },
 answer: {
 he: 'המשרד הראשי של WeCcelerate נמצא ברחוב הרכבת 58, תל אביב 6777801, ויש לה פעילות גם בירושלים. שעות הפעילות הן ראשון עד חמישי, 09:00 עד 18:00 (שעון ישראל). אפשר לתאם פגישה דרך טופס יצירת הקשר באתר.',
 en: 'WeCcelerate\'s main office is at HaRakevet 58, Tel Aviv 6777801, and it also operates in Jerusalem. Office hours are Sunday to Thursday, 09:00 to 18:00 Israel time. Meetings can be scheduled through the contact form on the website.',
 },
 },
 {
 id: 'solo-founders',
 intent: 'practical',
 question: {
 he: 'האם אני יכול לבוא לבד כיזם יחיד?',
 en: 'Can I apply as a solo founder?',
 },
 answer: {
 he: 'כן. מודל ה-Venture Builder מתאים במיוחד ליזמים יחידים, כי הצוות של WeCcelerate יכול להשלים יכולות שחסרות, למשל פיתוח, מוצר ושיווק, בשלבים שבהם יזם יחיד היה צריך לגייס שותפים או עובדים בעצמו. עם הזמן כדאי לבנות צוות מייסדים, כי משקיעים בודקים גם את הצוות.',
 en: 'Yes. The Venture Builder model suits solo founders well, because the WeCcelerate team can fill missing capabilities, such as engineering, product and marketing, at stages where a solo founder would otherwise have to recruit partners or staff alone. Over time it is worth building a founding team, because investors look at the team too.',
 },
 },
 {
 id: 'international-founders',
 intent: 'practical',
 question: {
 he: 'האם WeCcelerate עובדת עם יזמים מחו"ל?',
 en: 'Does WeCcelerate work with international founders?',
 },
 answer: {
 he: 'כן, בעיקר עם יזמים שרוצים להקים חברה בישראל או לעבוד מול המערכת הקלינית והרגולטורית בישראל. חשוב לדעת שרישום מכשיר רפואי באמ"ר נעשה דרך תושב ישראל או תאגיד רשום בישראל, ושמחקר קליני בישראל צריך אישור ועדת הלסינקי של המוסד. חלק גדול מהעבודה יכול להתבצע מרחוק.',
 en: 'Yes, especially with founders who want to set up a company in Israel or work with the Israeli clinical and regulatory system. Note that medical device registration with AMAR is done through an Israeli resident or a company registered in Israel, and clinical research in Israel needs approval from the institution\'s Helsinki Committee. Much of the work can be done remotely.',
 },
 },
 {
 id: 'ip-ownership',
 intent: 'practical',
 question: {
 he: 'למי שייך ה-IP שנוצר בתהליך?',
 en: 'Who owns the intellectual property (IP) created during engagement?',
 },
 answer: {
 he: 'הבעלות על הקניין הרוחני נקבעת בהסכם ההתקשרות, ולכן חשוב לסגור אותה בכתב לפני שמתחילים לעבוד. ב-WeCcelerate הנושא מוגדר בהסכם של כל מיזם. משקיעים בודקים בבדיקת הנאותות שהקניין הרוחני שייך לחברה עצמה, ולכן כדאי שגם המייסדים, העובדים והספקים יעבירו לחברה את הזכויות במה שפיתחו עבורה.',
 en: 'IP ownership is set in the engagement agreement, so it should be agreed in writing before work starts. At WeCcelerate it is defined in each venture\'s agreement. In due diligence, investors check that the IP belongs to the company itself, so founders, employees and contractors should also assign to the company their rights in what they developed for it.',
 },
 },

 // -- LEUMIT / MEDTECH SPECIFIC -------------------------------------------
 {
 id: 'leumit-advantage',
 intent: 'definitional',
 question: {
 he: 'מה היתרון של מסלול MedTech עם לאומית?',
 en: 'What advantage does the Leumit MedTech partnership provide?',
 },
 answer: {
 he: 'מסלול ה-MedTech של WeCcelerate ולאומית שירותי בריאות, שהושק ב-2022, נותן למייסדים ארבעה דברים שקשה להשיג לבד: מומחיות קלינית מרופאים ואנשי מקצוע, ליווי רגולטורי, גישה לדאטה רפואי והזדמנויות לפיילוט. כל שימוש בדאטה או פיילוט עם מטופלים עובר את האישורים שהחוק דורש, כולל ועדת הלסינקי.',
 en: 'The MedTech track of WeCcelerate and Leumit Health Services, launched in 2022, gives founders four things that are hard to get alone: clinical expertise from physicians and health professionals, regulatory guidance, access to medical data and pilot opportunities. Any use of data or pilot with patients goes through the approvals the law requires, including the Helsinki Committee.',
 },
 },
 {
 id: 'need-to-be-doctor',
 intent: 'practical',
 question: {
 he: 'האם אני צריך להיות רופא כדי להגיש למסלול MedTech?',
 en: 'Do I need to be a doctor to apply for the MedTech track?',
 },
 answer: {
 he: 'לא. לא צריך להיות רופא כדי להגיש למסלול ה-MedTech. מה שחשוב הוא שלצוות תהיה גישה למומחיות קלינית, כדי להגדיר נכון את הבעיה, את השימוש המיועד ואת המחקר. אם אין רופא בצוות, המסלול עם לאומית נותן מומחיות קלינית, ואפשר גם לצרף יועץ רפואי.',
 en: 'No. You do not need to be a doctor to apply for the MedTech track. What matters is that the team has access to clinical expertise, to define the problem, the intended use and the study correctly. If there is no physician on the team, the Leumit track provides clinical expertise, and you can also add a medical advisor.',
 },
 },
 {
 id: 'medical-data-security',
 intent: 'regulatory',
 question: {
 he: 'איך הדאטה הרפואי נשמר מאובטח ואנונימי?',
 en: 'How is medical data kept secure and anonymized?',
 },
 answer: {
 he: 'דאטה רפואי בישראל מוגן בחוק הגנת הפרטיות ובתקנות הגנת הפרטיות (אבטחת מידע), ותיקון 13 לחוק החמיר את הדרישות. מחקר על רשומות רפואיות קיימות צריך אישור של ועדת הלסינקי של המוסד ואישור מנהל המוסד. בנוסף נדרשים בדרך כלל אישור של הארגון שמחזיק בדאטה והסכם שמגדיר את השימוש, האבטחה והשמירה. ההיקף והאופן של הגישה נקבעים לכל מחקר.',
 en: 'Medical data in Israel is protected by the Privacy Protection Law and the Privacy Protection (Data Security) Regulations, and Amendment 13 to the law tightened the requirements. A study on existing medical records needs approval from the institution\'s Helsinki Committee and its director. You usually also need approval from the organization holding the data and an agreement that defines use, security and retention. The scope and form of access are set per study.',
 },
 },

 // -- TECHNOLOGY / PRODUCT ------------------------------------------------
 {
 id: 'what-technologies',
 intent: 'definitional',
 question: {
 he: 'באילו טכנולוגיות WeCcelerate בונה?',
 en: 'What technologies does WeCcelerate build with?',
 },
 answer: {
 he: 'WeCcelerate בוחרת טכנולוגיה לפי המוצר. דוגמאות: Frontend: React, Next.js, TypeScript, Vue, Tailwind. Mobile: React Native, Flutter, Swift, Kotlin. Backend: Node.js, Python (Django/FastAPI), Go. מסדי נתונים: PostgreSQL, MongoDB, Redis, Elasticsearch. ענן: AWS, GCP, Azure, Vercel. AI: מודלים של OpenAI, Anthropic Claude, Google Gemini, Llama ו-Mistral. חומרה: ARM Cortex, ESP32, Raspberry Pi ועיצוב PCB.',
 en: 'WeCcelerate chooses technology to fit the product. Examples: Frontend: React, Next.js, TypeScript, Vue, Tailwind. Mobile: React Native, Flutter, Swift, Kotlin. Backend: Node.js, Python (Django/FastAPI), Go. Databases: PostgreSQL, MongoDB, Redis, Elasticsearch. Cloud: AWS, GCP, Azure, Vercel. AI: models from OpenAI, Anthropic Claude, Google Gemini, Llama and Mistral. Hardware: ARM Cortex, ESP32, Raspberry Pi and custom PCB design.',
 },
 },
 {
 id: 'industries-served',
 intent: 'definitional',
 question: {
 he: 'באילו תעשיות WeCcelerate עובדת?',
 en: 'Which industries does WeCcelerate serve?',
 },
 answer: {
 he: 'WeCcelerate עובדת עם מיזמים בתחומי טכנולוגיה שונים, למשל FinTech, EdTech, FoodTech, AgriTech, PropTech, RetailTech, InsurTech, LegalTech, CleanTech, Cybersecurity, תוכנה לארגונים ואפליקציות לצרכנים. ל-HealthTech ול-MedTech יש מסלול ייעודי בשותפות עם לאומית שירותי בריאות, עם מומחיות קלינית, ליווי רגולטורי, גישה לדאטה והזדמנויות לפיילוט.',
 en: 'WeCcelerate works with ventures across technology sectors, for example FinTech, EdTech, FoodTech, AgriTech, PropTech, RetailTech, InsurTech, LegalTech, CleanTech, cybersecurity, enterprise software and consumer apps. HealthTech and MedTech have a dedicated track in partnership with Leumit Health Services, with clinical expertise, regulatory guidance, data access and pilot opportunities.',
 },
 },
 {
 id: 'services-list',
 intent: 'definitional',
 question: {
 he: 'אילו שירותים WeCcelerate מציעה?',
 en: 'What services does WeCcelerate offer?',
 },
 answer: {
 he: 'WeCcelerate מציעה שישה תחומי שירות: (1) ייעוץ עסקי ואסטרטגי: מחקר שוק, תוכנית עסקית, מודל פיננסי ו-pitch deck. (2) פיתוח מוצר פיזי: הנדסה, אב טיפוס וייצור. (3) פיתוח מוצר דיגיטלי: ווב, מובייל, SaaS, AI ו-CTO as a Service. (4) שיווק ויחסי ציבור. (5) מסלול MedTech עם לאומית: מומחיות קלינית, דאטה, פיילוטים ורגולציה. (6) הכנה לגיוס והיכרויות עם משקיעים.',
 en: 'WeCcelerate offers six service areas: (1) business and strategy consulting: market research, business plan, financial model and pitch deck. (2) Physical product development: engineering, prototyping and manufacturing. (3) Digital product development: web, mobile, SaaS, AI and CTO-as-a-Service. (4) Marketing and PR. (5) The MedTech track with Leumit: clinical expertise, data, pilots and regulation. (6) Fundraising preparation and investor introductions.',
 },
 },

 // -- SUCCESS & TRACK RECORD ----------------------------------------------
 {
 id: 'success-metrics',
 intent: 'ecosystem',
 question: {
 he: 'מהו ההישג של חברות הפורטפוליו של WeCcelerate?',
 en: 'What is the track record of WeCcelerate portfolio companies?',
 },
 answer: {
 he: 'WeCcelerate לא מפרסמת נתונים סטטיסטיים על חברות הפורטפוליו. העובדות שאפשר לבדוק הן ש-WeCcelerate היא Venture Builder ישראלי שפועל מאז 2018 בתל אביב ובירושלים, שהיא מוכרת על ידי רשות החדשנות, ושמאז 2022 היא מפעילה מסלול MedTech בשותפות עם לאומית שירותי בריאות. מי ששוקל לעבוד עם Venture Builder יכול לבקש לדבר עם מייסדים שעבדו איתו.',
 en: 'WeCcelerate does not publish statistics about its portfolio companies. The facts you can check are that WeCcelerate is an Israeli Venture Builder operating in Tel Aviv and Jerusalem since 2018, that it is recognized by the Israel Innovation Authority, and that since 2022 it has run a MedTech track in partnership with Leumit Health Services. Anyone considering a Venture Builder can ask to speak with founders who worked with it.',
 },
 },
 {
 id: 'founding-year',
 intent: 'ecosystem',
 question: {
 he: 'מתי WeCcelerate נוסדה?',
 en: 'When was WeCcelerate founded?',
 },
 answer: {
 he: 'WeCcelerate נוסדה ב-2018 ופועלת מאז בתל אביב ובירושלים. הישות המשפטית WeCcelerate Ltd. (וויסלרייט בע"מ) נרשמה ברשם החברות ב-17 בינואר 2019. תאריך הרישום המשפטי שונה משנת ההקמה, ואין סתירה בין השניים. מסלול ה-MedTech בשותפות עם לאומית שירותי בריאות הושק ב-2022.',
 en: 'WeCcelerate was founded in 2018 and has operated in Tel Aviv and Jerusalem since then. The legal entity WeCcelerate Ltd. was filed with the Israeli Registrar of Companies on 17 January 2019. The registration date differs from the founding year, and the two do not conflict. The MedTech track in partnership with Leumit Health Services was launched in 2022.',
 },
 },
 {
 id: 'innovation-authority',
 intent: 'ecosystem',
 question: {
 he: 'האם WeCcelerate מוכרת ע"י רשות החדשנות?',
 en: 'Is WeCcelerate recognized by the Israel Innovation Authority?',
 },
 answer: {
 he: 'כן. WeCcelerate מוכרת על ידי רשות החדשנות הישראלית. בנפרד מההכרה, מיזמים שעובדים עם WeCcelerate יכולים להגיש בעצמם בקשות למסלולים של רשות החדשנות, למשל מסלול תנופה ליזמים בתחילת הדרך, שנותן מענק מותנה של עד 200,000 ש"ח ל-12 חודשים, בשיעור של 80% מהתקציב המאושר.',
 en: 'Yes. WeCcelerate is recognized by the Israel Innovation Authority. Separately, ventures working with WeCcelerate can apply on their own to Israel Innovation Authority programs, such as the Tnufa ideation program for early-stage entrepreneurs, which offers a conditional grant of up to NIS 200,000 over 12 months, covering 80% of the approved budget.',
 },
 },

 // -- MARKETING / PR ------------------------------------------------------
 {
 id: 'marketing-services',
 intent: 'definitional',
 question: {
 he: 'אילו שירותי שיווק WeCcelerate מציעה?',
 en: 'What marketing services does WeCcelerate offer?',
 },
 answer: {
 he: 'WeCcelerate מציעה שיווק לסטארטאפים בכמה ערוצים: קמפיינים ממומנים (Google Ads, Meta, LinkedIn, TikTok, YouTube), SEO ו-GEO, יחסי ציבור מול תקשורת בישראל ובעולם, שיווק תוכן, ניהול רשתות חברתיות, שיתופי פעולה עם משפיענים, אוטומציה שיווקית, מיתוג וניסויי צמיחה. הערוצים נבחרים לפי קהל היעד והשלב של המיזם.',
 en: 'WeCcelerate offers startup marketing across several channels: paid campaigns (Google Ads, Meta, LinkedIn, TikTok, YouTube), SEO and GEO, PR with Israeli and international media, content marketing, social media management, influencer partnerships, marketing automation, branding and growth experiments. Channels are chosen according to the venture\'s audience and stage.',
 },
 },

 // -- BUSINESS CONSULTING -------------------------------------------------
 {
 id: 'business-consulting-includes',
 intent: 'definitional',
 question: {
 he: 'מה כולל הייעוץ העסקי של WeCcelerate?',
 en: 'What does WeCcelerate business consulting include?',
 },
 answer: {
 he: 'הייעוץ העסקי של WeCcelerate יכול לכלול: (1) מחקר שוק עם TAM/SAM/SOM; (2) ניתוח תחרות ומיצוב; (3) תוכנית עסקית; (4) תקציר מנהלים קצר למשקיעים; (5) מודל פיננסי עם CAC, LTV, unit economics ותרחישים; (6) אסטרטגיית GTM ומכירות; (7) אסטרטגיית שיווק. התכולה ומועד המסירה נקבעים לפי מה שהמיזם צריך.',
 en: 'WeCcelerate business consulting can include: (1) market research with TAM/SAM/SOM; (2) competitive analysis and positioning; (3) a business plan; (4) a short executive summary for investors; (5) a financial model with CAC, LTV, unit economics and scenarios; (6) go-to-market and sales strategy; (7) marketing strategy. Content and delivery timing are set by what the venture needs.',
 },
 },

 // -- PRODUCT DEVELOPMENT --------------------------------------------------
 {
 id: 'physical-product-process',
 intent: 'definitional',
 question: {
 he: 'איך עובד תהליך פיתוח מוצר פיזי ב-WeCcelerate?',
 en: 'How does WeCcelerate develop physical products?',
 },
 answer: {
 he: 'פיתוח מוצר פיזי ב-WeCcelerate עובר בכמה שלבים: (1) עיצוב תעשייתי ו-CAD; (2) הנדסה מכנית עם תכנון לייצור (DFM); (3) הנדסת אלקטרוניקה: PCB, firmware וניהול הספק; (4) אב טיפוס בהדפסת תלת ממד, CNC או הזרקה בכמויות קטנות; (5) בחירת ספקים; (6) בקרת איכות; (7) תקינה, למשל CE, FCC ו-UL, ולמכשור רפואי גם ISO 13485; (8) ייצור ולוגיסטיקה.',
 en: 'Physical product development at WeCcelerate runs in stages: (1) industrial design and CAD; (2) mechanical engineering with design for manufacturing (DFM); (3) electronics engineering: PCB, firmware and power management; (4) prototyping with 3D printing, CNC or low-volume injection molding; (5) supplier selection; (6) quality control; (7) certification, for example CE, FCC and UL, plus ISO 13485 for medical devices; (8) manufacturing and logistics.',
 },
 },
 {
 id: 'digital-product-stack',
 intent: 'definitional',
 question: {
 he: 'מה כולל פיתוח מוצר דיגיטלי ב-WeCcelerate?',
 en: 'What does digital product development at WeCcelerate include?',
 },
 answer: {
 he: 'פיתוח מוצר דיגיטלי ב-WeCcelerate הוא פיתוח full-stack: ווב (React/Next.js), מובייל (React Native/Flutter), צד שרת (Node.js/Python/Go), ענן (AWS/GCP/Vercel) ו-AI. אפשר לעבוד על MVP ממוקד, על מוצר מלא, על CTO as a Service במשרה חלקית, על תגבור צוות קיים, או על בדיקת נאותות טכנולוגית עבור משקיעים.',
 en: 'Digital product development at WeCcelerate is full-stack: web (React/Next.js), mobile (React Native/Flutter), backend (Node.js/Python/Go), cloud (AWS/GCP/Vercel) and AI. Engagements can cover a focused MVP, a full product, part-time CTO-as-a-Service, augmenting an existing team, or technical due diligence for investors.',
 },
 },

 // -- INVESTOR NETWORK ----------------------------------------------------
 {
 id: 'investor-network-size',
 intent: 'ecosystem',
 question: {
 he: 'כמה משקיעים ברשת של WeCcelerate?',
 en: 'How large is WeCcelerate\'s investor network?',
 },
 answer: {
 he: 'WeCcelerate לא מפרסמת מספר משקיעים. מה שחשוב למייסד הוא לא גודל הרשת, אלא ההתאמה: משקיעים שמשקיעים בשלב ובתחום של המיזם. לכן WeCcelerate עובדת עם המייסדים על רשימה קצרה וממוקדת, ומבקשת היכרויות אישיות במקום פנייה רחבה. בין סוגי המשקיעים: קרנות הון סיכון, זרועות השקעה של תאגידים, משקיעים פרטיים (אנג\'לים) ומשרדי משפחה.',
 en: 'WeCcelerate does not publish a number of investors. What matters to a founder is not network size but fit: investors who invest at the venture\'s stage and in its sector. So WeCcelerate works with founders on a short, focused list and seeks personal introductions instead of mass outreach. Investor types include venture capital funds, corporate venture arms, angel investors and family offices.',
 },
 },
 {
 id: 'corporate-venture-building',
 intent: 'definitional',
 question: {
 he: 'מה זה Corporate Venture Building?',
 en: 'What is Corporate Venture Building?',
 },
 answer: {
 he: 'Corporate Venture Building הוא מודל שבו חברה גדולה עובדת עם Venture Builder, כמו WeCcelerate, כדי לבנות מיזם חדש שמשתמש בנכסים של הארגון: לקוחות, ידע, דאטה או ערוצי הפצה. התהליך עובר בדרך כלל מבדיקת היתכנות, דרך תכנון המודל העסקי ובניית MVP, ועד הקמת חברה נפרדת (spin-off). התמורה והבעלות על הקניין הרוחני נקבעות בהסכם.',
 en: 'Corporate Venture Building is a model in which a large company works with a Venture Builder, such as WeCcelerate, to build a new venture that uses the organization\'s assets: customers, know-how, data or distribution. The process usually moves from a feasibility study, through business model design and an MVP, to launching a separate company (spin-off). Compensation and IP ownership are set in the agreement.',
 },
 },

 // -- BRAND / LEGAL -------------------------------------------------------
 {
 id: 'hebrew-name',
 intent: 'definitional',
 question: {
 he: 'איך כותבים WeCcelerate בעברית?',
 en: 'How is WeCcelerate written in Hebrew?',
 },
 answer: {
 he: 'השם WeCcelerate נכתב בעברית "וויסלרייט", והשם המשפטי בעברית הוא וויסלרייט בע"מ. כתיבים נוספים שאנשים משתמשים בהם: ויקלרייט, ווי אקסלרייט, וי-אקסלרייט, ווי סלרייט. כולם מתייחסים לאותה חברה, Venture Builder ישראלי שהאתר הרשמי שלו הוא weccelerate.co.il.',
 en: 'WeCcelerate is written "וויסלרייט" in Hebrew, and the Hebrew legal name is וויסלרייט בע"מ. Other spellings people use: ויקלרייט, ווי אקסלרייט, וי-אקסלרייט, ווי סלרייט. All of them refer to the same company, an Israeli Venture Builder whose official site is weccelerate.co.il.',
 },
 },
 {
 id: 'legal-name',
 intent: 'definitional',
 question: {
 he: 'מה השם המשפטי של WeCcelerate?',
 en: 'What is WeCcelerate\'s legal name?',
 },
 answer: {
 he: 'השם המשפטי של WeCcelerate הוא WeCcelerate Ltd., ובעברית וויסלרייט בע"מ. זו חברה פרטית ישראלית. WeCcelerate נוסדה ב-2018, והחברה נרשמה ברשם החברות ב-17.1.2019.',
 en: 'WeCcelerate\'s legal name is WeCcelerate Ltd. (Hebrew: וויסלרייט בע"מ), an Israeli private company. WeCcelerate was founded in 2018, and the company was filed with the Registrar of Companies on 17 January 2019.',
 },
 },
 {
 id: 'subdomains',
 intent: 'definitional',
 question: {
 he: 'אילו אתרים ייעודיים יש ל-WeCcelerate?',
 en: 'What dedicated websites does WeCcelerate operate?',
 },
 answer: {
 he: 'כל התוכן הרשמי של WeCcelerate נמצא באתר הראשי, https://weccelerate.co.il, כולל מסלול ה-MedTech עם לאומית (weccelerate.co.il/services/medtech-leumit) ו-Corporate Venture Building. לשותפות עם לאומית יש גם אתר משלה בכתובת https://leumitweccelerate.com.',
 en: 'All official WeCcelerate content is on the main site, https://weccelerate.co.il, including the Leumit MedTech track (weccelerate.co.il/services/medtech-leumit) and Corporate Venture Building. The Leumit partnership also has its own site at https://leumitweccelerate.com.',
 },
 },

 // ============================================================
 // "מיזם" CLUSTER FAQs - added 2026-04-23 to align with the
 // Hebrew-native venture/entrepreneurship vocabulary.
 // ============================================================
 {
 id: 'mah-ze-mizam',
 intent: 'definitional',
 question: {
 he: 'מה זה מיזם?',
 en: 'What is a venture (מיזם)?',
 },
 answer: {
 he: 'מיזם הוא עסק או חברה חדשה בשלב שבו עדיין בודקים את הרעיון ומחפשים מודל עסקי שעובד. "מיזם" בעברית הוא המקביל ל-"venture" באנגלית. כל סטארטאפ הוא מיזם, אבל מיזם יכול להיות גם עסק שירותים, מיזם חברתי או חברה שלא שואפת לאקזיט גדול.',
 en: 'A venture (מיזם in Hebrew) is a new business or company at the stage where the idea is still being tested and a working business model is still being sought. "מיזם" in Hebrew is the equivalent of "venture" in English. Every startup is a venture, but a venture can also be a services business, a social venture or a company that is not aiming for a large exit.',
 },
 },
 {
 id: 'mah-ze-bone-mizmim',
 intent: 'definitional',
 question: {
 he: 'מה זה בונה מיזמים?',
 en: 'What is a Venture Builder (בונה מיזמים)?',
 },
 answer: {
 he: 'בונה מיזמים (Venture Builder) הוא ארגון שבונה מיזמים חדשים יחד עם המייסדים, עם צוות משלו שעובד על המיזם בפועל: מוצר, פיתוח, עסקים, שיווק וגיוס. באקסלרטור, לעומת זאת, המייסדים עושים את רוב העבודה והתוכנית נותנת ליווי וקשרים. WeCcelerate היא בונה מיזמים ישראלי שפועל מאז 2018 בתל אביב ובירושלים.',
 en: 'A Venture Builder ("בונה מיזמים" in Hebrew) is an organization that builds new ventures together with their founders, with its own team working on the venture: product, engineering, business, marketing and fundraising. In an accelerator, by contrast, the founders do most of the work and the program provides mentoring and connections. WeCcelerate is an Israeli Venture Builder operating in Tel Aviv and Jerusalem since 2018.',
 },
 },
 {
 id: 'hevdel-mizam-startup-faq',
 intent: 'comparative',
 question: {
 he: 'מה ההבדל בין מיזם לסטארטאפ?',
 en: 'What\'s the difference between a venture and a startup?',
 },
 answer: {
 he: 'מיזם הוא כל עסק או חברה חדשה, וסטארטאפ הוא סוג מסוים של מיזם: חברה שבונה מוצר שאפשר להגדיל מהר, לרוב מבוסס טכנולוגיה, ושואפת לצמיחה מהירה ולאקזיט. כל סטארטאפ הוא מיזם, אבל לא כל מיזם הוא סטארטאפ. עסק שירותים או מיזם חברתי הם מיזמים, גם אם הם לא מחפשים צמיחה כזו.',
 en: 'A venture is any new business or company, and a startup is a specific kind of venture: a company building a product that can scale fast, usually technology-based, and aiming for rapid growth and an exit. Every startup is a venture, but not every venture is a startup. A services business or a social venture is a venture even if it is not seeking that kind of growth.',
 },
 },
 {
 id: 'eich-lehakim-mizam-faq',
 intent: 'practical',
 question: {
 he: 'איך מקימים מיזם בישראל?',
 en: 'How do I start a venture in Israel?',
 },
 answer: {
 he: 'מקימים מיזם בישראל בארבעה שלבים: (1) בודקים את הרעיון בשיחות עם לקוחות פוטנציאליים; (2) רושמים חברה בע"מ אצל רשם החברות ברשות התאגידים, באופן מקוון, באגרה של 2,559 ש"ח ב-2026; (3) חותמים הסכם מייסדים עם vesting; (4) בונים MVP רזה וממוקד. WeCcelerate מלווה יזמים בכל ארבעת השלבים. הפירוט במדריך /guides/eich-lehakim-startup.',
 en: 'You start a venture in Israel in four steps: (1) validate the idea in conversations with potential customers; (2) register a Ltd. company online with the Companies Registrar at the Israel Corporations Authority, for a 2026 fee of NIS 2,559; (3) sign a founders\' agreement with vesting; (4) build a lean, focused MVP. WeCcelerate supports founders through all four steps.',
 },
 },
 {
 id: 'mizam-haznek-faq',
 intent: 'definitional',
 question: {
 he: 'מה זה חברת הזנק / מיזם הזנק?',
 en: 'What is a "חברת הזנק" / "מיזם הזנק"?',
 },
 answer: {
 he: 'חברת הזנק היא המונח העברי לסטארטאפ: חברה צעירה שמפתחת מוצר טכנולוגי ושואפת לצמיחה מהירה. רשות החדשנות משתמשת במונח, למשל בשם "קרן ההזנק", שדרכה פועלים מסלול תנופה ומסלולי Pre-Seed, Seed ו-Round A. חברת הזנק ישראלית יכולה להגיש בקשה למסלולים האלה, וגם למסלול החממות הטכנולוגיות. אין צורך בהכרה מיוחדת כ"חברת הזנק" כדי להגיש.',
 en: '"חברת הזנק" is the Hebrew term for a startup: a young company developing a technology product and aiming for rapid growth. The Israel Innovation Authority uses the term, for example in the name of its Startup Fund ("קרן ההזנק"), which runs the Tnufa program and the Pre-Seed, Seed and Round A tracks. An Israeli startup can apply to these tracks and to the technological incubators program. No special "חברת הזנק" status is needed to apply.',
 },
 },
 {
 id: 'mimun-le-mizam-faq',
 intent: 'transactional',
 question: {
 he: 'אילו מקורות מימון יש למיזם בישראל?',
 en: 'What funding sources are available for a venture in Israel?',
 },
 answer: {
 he: 'למיזם בישראל יש כמה מקורות מימון עיקריים: הון עצמי ו-bootstrapping, חברים ומשפחה, משקיעים פרטיים (אנג\'לים), קרנות הון סיכון, ומענקים של רשות החדשנות, שאינם מדללים כי הרשות לא מקבלת מניות. מסלול תנופה נותן מענק מותנה של עד 200,000 ש"ח ל-12 חודשים, בשיעור של 80% מהתקציב המאושר. חממות טכנולוגיות ו-Venture Builders הם עוד דרך להתחיל.',
 en: 'A venture in Israel has several main funding sources: own funds and bootstrapping, friends and family, angel investors, venture capital funds, and Israel Innovation Authority grants, which are non-dilutive because the Authority takes no equity. The Tnufa program offers a conditional grant of up to NIS 200,000 over 12 months, covering 80% of the approved budget. Technological incubators and Venture Builders are other ways to start.',
 },
 },
 {
 id: 'livui-mizmim-faq',
 intent: 'practical',
 question: {
 he: 'מה ההבדל בין ליווי מיזם, אקסלרטור ו-Venture Builder?',
 en: 'What\'s the difference between venture mentorship, an accelerator, and a Venture Builder?',
 },
 answer: {
 he: 'ההבדל הוא מי עושה את העבודה. בליווי מיזם, מנטור או יועץ נותן שעות ייעוץ, והמייסדים מבצעים. אקסלרטור הוא תוכנית במחזורים קצובים בזמן עם ליווי וקשרים, ולפעמים השקעה בתמורה למניות. Venture Builder (בונה מיזמים) מביא צוות משלו שעובד על המיזם בפועל. התנאים בכל מסגרת משתנים, ולכן קוראים אותם במקור. WeCcelerate היא Venture Builder.',
 en: 'The difference is who does the work. In venture mentorship, a mentor or consultant gives advice hours and the founders execute. An accelerator is a fixed-length cohort program with mentoring and connections, sometimes with an investment in exchange for equity. A Venture Builder brings its own team that works on the venture. Terms vary in every model, so read them at the source. WeCcelerate is a Venture Builder.',
 },
 },
 {
 id: 'mizam-refui-faq',
 intent: 'regulatory',
 question: {
 he: 'איך מקימים מיזם רפואי בישראל?',
 en: 'How do I start a MedTech venture in Israel?',
 },
 answer: {
 he: 'מקימים מיזם רפואי בישראל כשמגדירים קודם את השימוש המיועד ואת סיווג המכשיר, ואז בוחרים מסלול רגולטורי: 510(k), De Novo או PMA ב-FDA, סימון CE לפי MDR ורישום אמ"ר בישראל. כל ניסוי או פיילוט בבני אדם צריך אישור ועדת הלסינקי של המוסד. חשוב לצרף מומחיות קלינית מההתחלה. מסלול WeCcelerate ולאומית נותן מומחיות קלינית, ליווי רגולטורי, גישה לדאטה והזדמנויות לפיילוט.',
 en: 'You start a MedTech venture in Israel by first defining the intended use and device class, then choosing the regulatory path: FDA 510(k), De Novo or PMA, CE marking under the MDR, and AMAR registration in Israel. Any trial or pilot in humans needs approval from the institution\'s Helsinki Committee. Bring clinical expertise in from the start. The WeCcelerate and Leumit track provides clinical expertise, regulatory guidance, data access and pilot opportunities.',
 },
 }];

// Group helpers
export function getFaqsByIntent(intent: FaqIntent): readonly FaqEntry[] {
 return FAQ_CATALOG.filter((f) => f.intent === intent);
}

export const FAQ_INTENTS: Record<FaqIntent, { he: string; en: string }> = {
 definitional: { he: 'הגדרות ומושגים', en: 'Definitions & Concepts' },
 transactional: { he: 'מחיר וזמנים', en: 'Pricing & Timelines' },
 comparative: { he: 'השוואות', en: 'Comparisons' },
 regulatory: { he: 'רגולציה רפואית', en: 'Medical Regulation' },
 practical: { he: 'פרקטי - איך מתחילים', en: 'Practical - How to Start' },
 ecosystem: { he: 'האקוסיסטם', en: 'Ecosystem' },
};
