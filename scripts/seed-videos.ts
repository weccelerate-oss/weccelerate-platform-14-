/**
 * Seed all 34 WeCcelerate videos with SEO/GEO-optimized data.
 * Run: npx tsx scripts/seed-videos.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to generate a slug from title
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 80);
}

const videos = [
  // ===================== PODCAST =====================
  {
    title: 'פודקאסט #49: מה באמת קורה בראש של האנג׳ל בזמן הפיץ׳? — סיימון לגזיאל חושף',
    titleEn: 'Podcast #49: What Really Goes Through an Angel Investor\'s Mind During a Pitch?',
    slug: 'podcast-49-angel-investor-pitch-simon-legziel',
    description: 'סיימון לגזיאל, משקיע אנג׳ל (Angel Investor) מוביל בישראל, חושף בפרק מרתק של הפודקאסט של וויסלרייט מה באמת עובר לו בראש כשיזם עולה לפיץ׳. מה גורם למשקיע להגיד "כן" תוך 5 דקות? אילו טעויות קריטיות גורמות ל-"לא" מיידי?',
    descriptionEn: 'Simon Legziel, a leading Israeli angel investor, reveals what goes through his mind during a startup pitch. What makes him say yes in 5 minutes? What critical mistakes lead to immediate rejection?',
    youtubeUrl: 'https://www.youtube.com/watch?v=BBvzXDmrbCs',
    category: 'PODCAST' as const,
    tags: ['פודקאסט', 'angel investor', 'pitch', 'גיוס הון', 'seed', 'משקיע אנג׳ל', 'סטארטאפ ישראל'],
    speaker: 'סיימון לגזיאל',
    speakerTitle: 'משקיע אנג׳ל',
    isActive: true,
    isFeatured: true,
    publishAt: new Date('2024-12-01T10:00:00.000Z'),
  },
  {
    title: 'פודקאסט #48: מגוגל לסטארטאפ — איך עמית מוריוסף עזב את גוגל כדי לתרגם שפת סימנים',
    titleEn: 'Podcast #48: From Google to Startup — How Amit Moriyosef Left Google to Translate Sign Language with AI',
    slug: 'podcast-48-google-to-startup-amit-moriyosef',
    description: 'עמית מוריוסף, יזם שעזב קריירה מבטיחה בגוגל (Google), מספר בפודקאסט של וויסלרייט על הרגע שהחליט לפרוש מאחת מחברות הטכנולוגיה הגדולות בעולם כדי להקים סטארטאפ שמתרגם שפת סימנים באמצעות בינה מלאכותית (AI).',
    descriptionEn: 'Amit Moriyosef left a promising career at Google to build a startup translating sign language using AI. He shares the journey from big tech employee to independent entrepreneur.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dqtsh5hEH3A',
    category: 'PODCAST' as const,
    tags: ['פודקאסט', 'google', 'שפת סימנים', 'AI', 'בינה מלאכותית', 'יזמות חברתית', 'MVP'],
    speaker: 'עמית מוריוסף',
    speakerTitle: 'יזם, לשעבר גוגל',
    isActive: true,
    isFeatured: true,
    publishAt: new Date('2024-11-15T10:00:00.000Z'),
  },
  {
    title: 'פודקאסט #47: סטארטאפ פורץ דרך — לארה מלר על מציאות מדומה לילדים בבתי חולים',
    titleEn: 'Podcast #47: Breakthrough Startup — Lara Meller on VR for Children in Hospitals',
    slug: 'podcast-47-vr-children-hospitals-lara-meller',
    description: 'לארה מלר, מייסדת סטארטאפ HealthTech ישראלי, מספרת בפודקאסט של וויסלרייט על הפיתוח פורץ הדרך שלה: שימוש במציאות מדומה (VR / Virtual Reality) להקלת חרדה וכאב של ילדים בבתי חולים.',
    descriptionEn: 'Lara Meller, founder of an Israeli HealthTech startup, discusses her groundbreaking development of VR technology to reduce anxiety and pain in hospitalized children.',
    youtubeUrl: 'https://www.youtube.com/watch?v=648oRL5A_S8',
    category: 'PODCAST' as const,
    tags: ['פודקאסט', 'VR', 'מציאות מדומה', 'HealthTech', 'MedTech', 'בריאות דיגיטלית', 'בתי חולים'],
    speaker: 'לארה מלר',
    speakerTitle: 'מייסדת סטארטאפ VR רפואי',
    isActive: true,
    isFeatured: true,
    publishAt: new Date('2024-10-20T10:00:00.000Z'),
  },
  {
    title: 'פודקאסט #46: איך בונים יוניקורן? — יואל בר-אל, מייסד טראקס, חושף הכל',
    titleEn: 'Podcast #46: How to Build a Unicorn — Yoel Bar-El, Trax Co-Founder, Reveals All',
    slug: 'podcast-46-unicorn-yoel-bar-el-trax',
    description: 'יואל בר-אל, מייסד שותף של חברת Trax (טראקס) — חד-קרן ישראלי (Unicorn) בתחום ה-Computer Vision לריטייל — חולק בפרק נדיר את הסודות של בניית חברה בשווי מעל מיליארד דולר.',
    descriptionEn: 'Yoel Bar-El, co-founder of Trax — an Israeli unicorn in retail Computer Vision — shares secrets of building a billion-dollar company in a rare, exclusive episode.',
    youtubeUrl: 'https://www.youtube.com/watch?v=v4G2TwcAFuU',
    category: 'PODCAST' as const,
    tags: ['פודקאסט', 'unicorn', 'יוניקורן', 'Trax', 'computer vision', 'גיוס סבב A', 'סטארטאפ ישראלי'],
    speaker: 'יואל בר-אל',
    speakerTitle: 'מייסד שותף, Trax',
    isActive: true,
    isFeatured: true,
    publishAt: new Date('2024-09-10T10:00:00.000Z'),
  },
  {
    title: 'פודקאסט #45: מה משקיעים באמת חושבים? — יניב פלדמן, מייסד גיקטיים, חושף הכל',
    titleEn: 'Podcast #45: What Investors Really Think — Yaniv Feldman, Geektime Founder, Reveals All',
    slug: 'podcast-45-investors-yaniv-feldman-geektime',
    description: 'יניב פלדמן, מייסד אתר גיקטיים (Geektime) — הפלטפורמה המובילה בישראל לחדשנות וטכנולוגיה — חושף בפודקאסט של וויסלרייט מה משקיעי הון סיכון (VC) באמת חושבים כשהם בוחנים סטארטאפ.',
    descriptionEn: 'Yaniv Feldman, founder of Geektime — Israel\'s leading innovation platform — reveals what VCs really think when evaluating startups.',
    youtubeUrl: 'https://www.youtube.com/watch?v=e03D-WvGMbs',
    category: 'PODCAST' as const,
    tags: ['פודקאסט', 'גיקטיים', 'Geektime', 'VC', 'הון סיכון', 'משקיעים', 'pitch'],
    speaker: 'יניב פלדמן',
    speakerTitle: 'מייסד Geektime',
    isActive: true,
    isFeatured: true,
    publishAt: new Date('2024-08-01T10:00:00.000Z'),
  },
  {
    title: 'סלון של וויסלרייט: איך משקיע פרטי בוחר סטארטאפ? — סיימון לגזיאל',
    titleEn: 'WeCcelerate Salon: How Does a Private Investor Choose a Startup?',
    slug: 'salon-angel-investor-simon-legziel',
    description: 'בפרק מיוחד של "הסלון של וויסלרייט" — סדרת שיחות אינטימיות עם מובילי האקוסיסטם — סיימון לגזיאל, משקיע אנג׳ל ויועץ אסטרטגי, חושף את תהליך בחירת הסטארטאפים שלו.',
    descriptionEn: 'In a special episode of "WeCcelerate Salon", angel investor Simon Legziel reveals his startup selection process and due diligence approach.',
    youtubeUrl: 'https://www.youtube.com/watch?v=tdum2AkDwmg',
    category: 'PODCAST' as const,
    tags: ['פודקאסט', 'סלון של וויסלרייט', 'angel investor', 'due diligence', 'גיוס הון'],
    speaker: 'סיימון לגזיאל',
    speakerTitle: 'משקיע אנג׳ל',
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-07-15T10:00:00.000Z'),
  },

  // ===================== TESTIMONIALS =====================
  {
    title: 'מרעיון להשקעה תוך 4 חודשים — רותם לוי, מייסד Gesher, על הליווי העסקי ב-WeCcelerate',
    titleEn: 'From Idea to Investment in 4 Months — Rotem Levi, Founder of Gesher',
    slug: 'rotem-levi-gesher-investment-4-months',
    description: 'רותם לוי, מייסד סטארטאפ Gesher, מספר בראיון מעמיק איך הגיע למאיץ הסטארטאפים WeCcelerate אחרי מספר ניסיונות עצמאיים — ותוך 4 חודשים בלבד הצליח לסגור סבב השקעה ראשון.',
    descriptionEn: 'Rotem Levi, founder of Gesher, shares how he joined WeCcelerate and closed his first Seed investment round within just 4 months.',
    youtubeUrl: 'https://www.youtube.com/watch?v=npcROfJT5Hg',
    category: 'TESTIMONIAL' as const,
    tags: ['עדות', 'gesher', 'גיוס הון', 'seed', 'תוכנית עסקית', 'pitch deck', 'סטארטאפ ישראלי'],
    speaker: 'רותם לוי',
    speakerTitle: 'מייסד Gesher',
    isActive: true,
    isFeatured: true,
    publishAt: new Date('2024-01-15T10:00:00.000Z'),
  },
  {
    title: 'יזם מנוסה בוחר ב-WeCcelerate — גיא שחם, מייסד Grouping, על ליווי מקצה לקצה',
    titleEn: 'Serial Entrepreneur Chooses WeCcelerate — Guy Shaham, Founder of Grouping',
    slug: 'guy-shaham-grouping-serial-entrepreneur',
    description: 'גיא שחם, יזם סדרתי ומייסד Grouping, מסביר למה גם יזם מנוסה שהרים מספר סטארטאפים צריך שותף אסטרטגי כמו WeCcelerate.',
    descriptionEn: 'Guy Shaham, serial entrepreneur and founder of Grouping, explains why even experienced founders need a strategic partner like WeCcelerate.',
    youtubeUrl: 'https://www.youtube.com/watch?v=A0mXfsyHMXM',
    category: 'TESTIMONIAL' as const,
    tags: ['עדות', 'grouping', 'יזם סדרתי', 'ליווי עסקי', 'שותפות אסטרטגית'],
    speaker: 'גיא שחם',
    speakerTitle: 'יזם סדרתי, מייסד Grouping',
    isActive: true,
    isFeatured: true,
    publishAt: new Date('2024-02-10T10:00:00.000Z'),
  },
  {
    title: 'ממחקר שוק ועד ייצור בסין — אריאל סנה, מייסדת ARINE, על פיתוח מוצר פיזי',
    titleEn: 'From Market Research to Manufacturing in China — Ariel Sena, Founder of ARINE',
    slug: 'ariel-sena-arine-physical-product-development',
    description: 'אריאל סנה, מייסדת ARINE — בוקסר חדשני למניעת קרינת סלולר — מספרת איך WeCcelerate ליוותה אותה בכל שלבי פיתוח המוצר הפיזי.',
    descriptionEn: 'Ariel Sena, founder of ARINE, shares her comprehensive journey developing a physical product with WeCcelerate — from market research to manufacturing in China.',
    youtubeUrl: 'https://www.youtube.com/watch?v=hor3lGSiJms',
    category: 'TESTIMONIAL' as const,
    tags: ['עדות', 'arine', 'פיתוח מוצר פיזי', 'ייצור בסין', 'מחקר שוק', 'e-commerce'],
    speaker: 'אריאל סנה',
    speakerTitle: 'מייסדת ARINE',
    isActive: true,
    isFeatured: true,
    publishAt: new Date('2024-03-05T10:00:00.000Z'),
  },
  {
    title: 'שנתיים של ליווי מלא — אלעד גובס, מייסד BeChic, על בניית סטארטאפ אופנה',
    titleEn: 'Two Years of Full Support — Elad Govs, Founder of BeChic',
    slug: 'elad-govs-bechic-fashion-startup',
    description: 'אלעד גובס, מייסד פלטפורמת BeChic, חולק את חוויית שנתיים עם WeCcelerate: מרעיון לא מלוטש בתחום E-Commerce לתשתית עסקית מוצקה.',
    descriptionEn: 'Elad Govs, founder of fashion platform BeChic, shares his two-year journey with WeCcelerate startup accelerator.',
    youtubeUrl: 'https://www.youtube.com/watch?v=wcLDzITt72g',
    category: 'TESTIMONIAL' as const,
    tags: ['עדות', 'bechic', 'אופנה', 'e-commerce', 'תוכנית עסקית', 'גיוס הון'],
    speaker: 'אלעד גובס',
    speakerTitle: 'מייסד BeChic',
    isActive: true,
    isFeatured: true,
    publishAt: new Date('2024-04-20T10:00:00.000Z'),
  },
  {
    title: 'מרעיון ליצירה — דנה בירן (חלק 1): ״כל אחד יכול להיות אמן״',
    titleEn: 'From Idea to Creation — Dana Biren (Part 1): "Everyone Can Be an Artist"',
    slug: 'dana-biren-part-1-art-tech-startup',
    description: 'דנה בירן, יזמת בתחום האמנות והטכנולוגיה, מספרת על המסע שלה מרעיון יצירתי לסטארטאפ פעיל.',
    descriptionEn: 'Dana Biren, an art-tech entrepreneur, shares her journey from creative idea to active startup.',
    youtubeUrl: 'https://www.youtube.com/watch?v=43z0uzwqLPg',
    category: 'TESTIMONIAL' as const,
    tags: ['עדות', 'אמנות', 'יצירתיות', 'חדשנות', 'יזמות'],
    speaker: 'דנה בירן',
    speakerTitle: 'יזמת Art-Tech',
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-05-10T10:00:00.000Z'),
  },
  {
    title: 'דנה בירן (חלק 2): הערך המוסף של WeCcelerate — מליווי עסקי לשותפות אמיתית',
    titleEn: 'Dana Biren (Part 2): WeCcelerate\'s Value — From Business Support to True Partnership',
    slug: 'dana-biren-part-2-weccelerate-partnership',
    description: 'בחלק השני דנה בירן מספרת על הערך המוסף שקיבלה מ-WeCcelerate: ליווי עסקי מקצועי שהפך לשותפות אמיתית.',
    descriptionEn: 'In part 2, Dana Biren discusses the added value from WeCcelerate: professional business support that became a true partnership.',
    youtubeUrl: 'https://www.youtube.com/watch?v=QErM_2HRiOc',
    category: 'TESTIMONIAL' as const,
    tags: ['עדות', 'ליווי עסקי', 'שותפות', 'תוכנית עסקית', 'מודל הכנסות'],
    speaker: 'דנה בירן',
    speakerTitle: 'יזמת Art-Tech',
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-05-15T10:00:00.000Z'),
  },
  {
    title: 'מאירוע כואב של אמא נולדה יזמת שמשנה את פני הרפואה',
    titleEn: 'From a Mother\'s Painful Experience Emerged an Entrepreneur Changing Medicine',
    slug: 'medtech-founder-mother-medical-startup',
    description: 'סיפור מרגש של יזמת MedTech שהפכה חוויה אישית כואבת למיזם שמשנה חיים, בליווי WeCcelerate ומאיץ Leumit WeCcelerate.',
    descriptionEn: 'An inspiring story of a MedTech founder who turned personal pain into a life-changing venture, supported by WeCcelerate and Leumit WeCcelerate accelerator.',
    youtubeUrl: 'https://www.youtube.com/watch?v=LxYKaqiRdVU',
    category: 'TESTIMONIAL' as const,
    tags: ['עדות', 'MedTech', 'בריאות דיגיטלית', 'לאומית', 'רגולציה רפואית'],
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-06-01T10:00:00.000Z'),
  },

  // ===================== TV INTERVIEWS =====================
  {
    title: 'אלון פנחס בערוץ הכלכלה: האקזיטים של Wiz והדור החדש של ההייטק הישראלי',
    titleEn: 'Alon Pinchas on Economy Channel: Wiz Exits and the New Generation of Israeli Tech',
    slug: 'alon-pinchas-economy-channel-wiz-exits',
    description: 'אלון פנחס, מנכ"ל WeCcelerate, בראיון מעמיק לערוץ הכלכלה על האקזיטים של Wiz, המגמות החדשות בהייטק הישראלי ומה צפוי לאקוסיסטם הסטארטאפים.',
    descriptionEn: 'Alon Pinchas, WeCcelerate CEO, in an in-depth interview on the Economy Channel about Wiz exits and the future of the Israeli startup ecosystem.',
    youtubeUrl: 'https://www.youtube.com/watch?v=7m0gFDt4SXA',
    category: 'TV_INTERVIEW' as const,
    tags: ['ראיון טלוויזיה', 'ערוץ הכלכלה', 'Wiz', 'אקזיט', 'הייטק ישראלי', 'אלון פנחס'],
    speaker: 'אלון פנחס',
    speakerTitle: 'מנכ"ל WeCcelerate',
    isActive: true,
    isFeatured: true,
    publishAt: new Date('2024-06-15T10:00:00.000Z'),
  },
  {
    title: 'אברהם הינוך בערוץ הכלכלה: עתיד השיווק והטכנולוגיה בעולם הסטארטאפים',
    titleEn: 'Avraham Hinuch on Economy Channel: The Future of Marketing and Tech in Startups',
    slug: 'avraham-hinuch-economy-channel-marketing-tech',
    description: 'אברהם הינוך, סמנכ"ל שיווק ב-WeCcelerate, בראיון לערוץ הכלכלה על עתיד השיווק הדיגיטלי, הטכנולוגיות שמשנות את עולם השיווק לסטארטאפים.',
    descriptionEn: 'Avraham Hinuch, WeCcelerate VP Marketing, on the future of digital marketing and technologies transforming startup marketing.',
    youtubeUrl: 'https://www.youtube.com/watch?v=71i6P9u-n5c',
    category: 'TV_INTERVIEW' as const,
    tags: ['ראיון טלוויזיה', 'ערוץ הכלכלה', 'שיווק דיגיטלי', 'טכנולוגיה', 'אברהם הינוך'],
    speaker: 'אברהם הינוך',
    speakerTitle: 'סמנכ"ל שיווק, WeCcelerate',
    isActive: true,
    isFeatured: true,
    publishAt: new Date('2024-07-01T10:00:00.000Z'),
  },

  // ===================== INTERVIEWS =====================
  {
    title: 'מאחורי הקלעים: ליעוז, מנהל המחלקה האסטרטגית של WeCcelerate',
    titleEn: 'Behind the Scenes: Lioz, Head of Strategy at WeCcelerate',
    slug: 'behind-scenes-lioz-strategy-weccelerate',
    description: 'ראיון בלעדי מאחורי הקלעים עם ליעוז, מנהל המחלקה האסטרטגית של WeCcelerate, על איך נראה יום עבודה טיפוסי של צוות האסטרטגיה.',
    descriptionEn: 'Exclusive behind-the-scenes interview with Lioz, Head of Strategy at WeCcelerate, on how the strategy team works day-to-day.',
    youtubeUrl: 'https://www.youtube.com/watch?v=H6nbiQAUTxM',
    category: 'INTERVIEW' as const,
    tags: ['מאחורי הקלעים', 'אסטרטגיה', 'ייעוץ עסקי', 'תוכנית עסקית'],
    speaker: 'ליעוז',
    speakerTitle: 'מנהל אסטרטגיה, WeCcelerate',
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-07-20T10:00:00.000Z'),
  },

  // ===================== REELS =====================
  {
    title: 'הצוות של וויסלרייט — מה באמת גורם להם לקום כל בוקר ולהגיע לעבוד',
    titleEn: 'The WeCcelerate Team — What Really Motivates Them Every Morning',
    slug: 'weccelerate-team-culture-motivation',
    description: 'סרטון מיוחד שמציג את התרבות הארגונית של WeCcelerate מבפנים. עובדי החברה מספרים מה מניע אותם.',
    youtubeUrl: 'https://www.youtube.com/watch?v=llk-CjVwWTg',
    category: 'REELS' as const,
    tags: ['תרבות ארגונית', 'צוות', 'מאחורי הקלעים', 'ליווי יזמים'],
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-08-01T10:00:00.000Z'),
  },
  {
    title: 'האם ה-AI יחליף את הג׳וניורים? — אלון פנחס על עתיד שוק העבודה',
    titleEn: 'Will AI Replace Juniors? — Alon Pinchas on the Future of Work',
    slug: 'reel-ai-replace-juniors',
    description: 'אלון פנחס דן בשאלה הבוערת: האם הבינה המלאכותית תחליף את עובדי ה-Junior בהייטק?',
    youtubeUrl: 'https://www.youtube.com/watch?v=78mtd1OWSxk',
    category: 'REELS' as const,
    tags: ['AI', 'בינה מלאכותית', 'שוק עבודה', 'junior', 'הייטק'],
    speaker: 'אלון פנחס',
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-08-05T10:00:00.000Z'),
  },
  {
    title: 'האם ה-AI יחליף את הבן אדם או יסייע לו? — הדיון שכל יזם צריך לשמוע',
    titleEn: 'Will AI Replace Humans or Assist Them?',
    slug: 'reel-ai-replace-or-assist-humans',
    description: 'דיון מרתק על עתיד הבינה המלאכותית: האם AI יחליף בני אדם או ישמש ככלי עוצמתי שמגביר פרודוקטיביות?',
    youtubeUrl: 'https://www.youtube.com/watch?v=jBAnX0AFWps',
    category: 'REELS' as const,
    tags: ['AI', 'בינה מלאכותית', 'חדשנות', 'פרודוקטיביות', 'יזמות'],
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-08-10T10:00:00.000Z'),
  },
  {
    title: 'אלון פנחס חושף: איך AI ישנה את החיים של כל יזם',
    titleEn: 'Alon Pinchas Reveals: How AI Will Change Every Entrepreneur\'s Life',
    slug: 'reel-alon-pinchas-ai-entrepreneurs',
    description: 'מנכ"ל WeCcelerate חולק תובנות על איך בינה מלאכותית כבר משנה את עולם היזמות.',
    youtubeUrl: 'https://www.youtube.com/watch?v=jS-mWxf_U0o',
    category: 'REELS' as const,
    tags: ['AI', 'בינה מלאכותית', 'כלים ליזמים', 'אלון פנחס'],
    speaker: 'אלון פנחס',
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-08-15T10:00:00.000Z'),
  },
  {
    title: 'המפץ הגדול של ה-AI: $100,000 להרצת מודל אחד? העלויות שמשנות את המשחק',
    titleEn: 'The AI Big Bang: $100,000 to Run a Single Model?',
    slug: 'reel-ai-cost-100k-model',
    description: 'ניתוח העלויות האמיתיות של הרצת מודלי AI — ומה זה אומר ליזמים שבונים מוצרי AI.',
    youtubeUrl: 'https://www.youtube.com/watch?v=i3cSiXpk9-Q',
    category: 'REELS' as const,
    tags: ['AI', 'עלויות', 'מודלים', 'כלכלת AI', 'סטארטאפ AI'],
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-08-20T10:00:00.000Z'),
  },
  {
    title: 'די לתירוצים! ככה נראית הצלחה ביזמות — WeCcelerate',
    titleEn: 'No More Excuses! This Is What Success in Entrepreneurship Looks Like',
    slug: 'reel-no-excuses-success',
    description: 'קליפ מוטיבציוני קצר: די לתירוצים, ככה נראית הצלחה אמיתית ביזמות.',
    youtubeUrl: 'https://www.youtube.com/watch?v=_7ieRgy0iIA',
    category: 'REELS' as const,
    tags: ['מוטיבציה', 'יזמות', 'השראה', 'הצלחה'],
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-08-25T10:00:00.000Z'),
  },
  {
    title: '״עדיף כישלון מפואר מחלומות במגירה״ — על אומץ ביזמות',
    titleEn: '"Better a Spectacular Failure Than Dreams in a Drawer" — On Courage in Entrepreneurship',
    slug: 'reel-failure-vs-dreams',
    description: 'קליפ השראה על אחד העקרונות החשובים ביותר ביזמות: עדיף לנסות ולהיכשל מאשר לחלום ולא לעשות דבר.',
    youtubeUrl: 'https://www.youtube.com/watch?v=102m42abk88',
    category: 'REELS' as const,
    tags: ['מוטיבציה', 'כישלון', 'יזמות', 'חוסן', 'השראה'],
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-09-01T10:00:00.000Z'),
  },
  {
    title: 'האם אתם הופכים ללא רלוונטיים? — אזהרה ליזמים ועובדי הייטק',
    titleEn: 'Are You Becoming Irrelevant? — A Warning for Entrepreneurs and Tech Workers',
    slug: 'reel-becoming-irrelevant-warning',
    description: 'קליפ תכליתי: האם אתם מודעים לכך שאתם עלולים להפוך ללא רלוונטיים בשוק ההייטק?',
    youtubeUrl: 'https://www.youtube.com/watch?v=9AAPbsTQLfE',
    category: 'REELS' as const,
    tags: ['הייטק', 'רלוונטיות', 'למידה', 'טרנדים', 'AI'],
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-09-05T10:00:00.000Z'),
  },
  {
    title: 'יזמים צעירים מול יזמים מנוסים — מי באמת יותר "קשה" לעבודה?',
    titleEn: 'Young vs Experienced Entrepreneurs — Who Is Really Harder to Work With?',
    slug: 'reel-young-vs-experienced-entrepreneurs',
    description: 'דיון מעניין: האם עדיף לעבוד עם יזמים צעירים וחסרי ניסיון, או עם יזמים מנוסים?',
    youtubeUrl: 'https://www.youtube.com/watch?v=ej0lbF-FtM4',
    category: 'REELS' as const,
    tags: ['יזמות', 'יזמים צעירים', 'ניסיון', 'סטארטאפ'],
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-09-10T10:00:00.000Z'),
  },
  {
    title: 'סטארטאפ שרוצה לגדול? משימת גיוס תמידית — הסוד שלא מספרים לכם',
    titleEn: 'Startup Wants to Grow? Constant Fundraising Mission — The Secret Nobody Tells You',
    slug: 'reel-constant-fundraising-mission',
    description: 'תובנה קריטית: סטארטאפ שרוצה לגדול נמצא במשימת גיוס הון תמידית. לא מדובר באירוע חד-פעמי.',
    youtubeUrl: 'https://www.youtube.com/watch?v=ge-frFlgUgA',
    category: 'REELS' as const,
    tags: ['גיוס הון', 'סטארטאפ', 'pre-seed', 'seed', 'סבב A', 'fundraising'],
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-09-15T10:00:00.000Z'),
  },
  {
    title: 'המוצר הכי גאוני בעולם? לא מספיק כדי לסגור משקיע — ככה כן תצליחו',
    titleEn: 'The Most Brilliant Product? Not Enough to Close an Investor — Here\'s How to Succeed',
    slug: 'reel-product-not-enough-for-investor',
    description: 'תובנה חשובה: לפעמים המוצר הכי חדשני לא מספיק כדי לשכנע משקיע. מה כן נדרש?',
    youtubeUrl: 'https://www.youtube.com/watch?v=jDnCMySAMuc',
    category: 'REELS' as const,
    tags: ['משקיעים', 'גיוס הון', 'pitch', 'תוכנית עסקית', 'טיפים ליזמים'],
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-09-20T10:00:00.000Z'),
  },
  {
    title: 'הסוד של Wiz: למה יזמים ישראלים כבר לא ממהרים לאקזיט?',
    titleEn: 'The Wiz Secret: Why Israeli Entrepreneurs Are No Longer Rushing to Exit',
    slug: 'reel-wiz-secret-no-rush-exit',
    description: 'ניתוח מרתק על שינוי מגמה: בעקבות האקזיט ההיסטורי של Wiz, יותר יזמים מעדיפים לבנות חברות גדולות.',
    youtubeUrl: 'https://www.youtube.com/watch?v=KKtUFDbdhDE',
    category: 'REELS' as const,
    tags: ['Wiz', 'אקזיט', 'הייטק ישראלי', 'סטארטאפ', 'צמיחה'],
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-09-25T10:00:00.000Z'),
  },
  {
    title: 'איך מוכרים מוצר שהקהל עוד לא יודע שהוא צריך? — טיפים ליזמים',
    titleEn: 'How to Sell a Product the Market Doesn\'t Know It Needs Yet?',
    slug: 'reel-sell-unknown-product-tips',
    description: 'אחד האתגרים הגדולים ליזמים: איך ליצור ביקוש למוצר חדשני שהלקוחות עדיין לא מכירים?',
    youtubeUrl: 'https://www.youtube.com/watch?v=X870bM7CR2o',
    category: 'REELS' as const,
    tags: ['שיווק', 'go-to-market', 'מוצר חדשני', 'ביקוש', 'סטארטאפ'],
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-10-01T10:00:00.000Z'),
  },
  {
    title: 'העתיד כבר פה: המהלך של אמזון שמשגע את עולם הסטארטאפים',
    titleEn: 'The Future Is Here: Amazon\'s Move That\'s Shaking the Startup World',
    slug: 'reel-amazon-move-startups',
    description: 'ניתוח של מהלך אסטרטגי חדש של Amazon שמשנה את כללי המשחק בעולם הסטארטאפים.',
    youtubeUrl: 'https://www.youtube.com/watch?v=K-hQc-A9ehU',
    category: 'REELS' as const,
    tags: ['אמזון', 'Amazon', 'טרנדים', 'סטארטאפ', 'שוק גלובלי'],
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-10-05T10:00:00.000Z'),
  },
  {
    title: '״זה מהפך, לא עוד טרנד חולף״ — על השינוי הטכנולוגי שמשנה הכל',
    titleEn: '"This Is a Revolution, Not Another Passing Trend"',
    slug: 'reel-revolution-not-trend',
    description: 'WeCcelerate על המהפכה הטכנולוגית שלא ניתן להתעלם ממנה: זו לא עוד מגמה חולפת.',
    youtubeUrl: 'https://www.youtube.com/watch?v=QSsldqBFyc0',
    category: 'REELS' as const,
    tags: ['חדשנות', 'מהפכה טכנולוגית', 'יזמות', 'טרנדים'],
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-10-10T10:00:00.000Z'),
  },
  {
    title: 'יש לכם רעיון? אל תשמרו אותו לעצמכם — WeCcelerate',
    titleEn: 'Have an Idea? Don\'t Keep It to Yourself — WeCcelerate',
    slug: 'reel-dont-keep-idea-secret',
    description: 'טיפ קריטי ליזמים מתחילים: אחת הטעויות הנפוצות היא לשמור על הרעיון בסוד.',
    youtubeUrl: 'https://www.youtube.com/watch?v=SXRfd7EXnd4',
    category: 'REELS' as const,
    tags: ['טיפים ליזמים', 'רעיון', 'פידבק', 'יזמות', 'validation'],
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-10-15T10:00:00.000Z'),
  },
  {
    title: 'יזמים מול משקיע — הרגע שבו הכל מתברר',
    titleEn: 'Entrepreneurs vs Investor — The Moment of Truth',
    slug: 'reel-entrepreneurs-vs-investor-moment',
    description: 'צפו ברגעים האמיתיים של מפגש בין יזמים למשקיע — הדינמיקה, השאלות הקשות, רגעי המתח.',
    youtubeUrl: 'https://www.youtube.com/watch?v=YKCXvD5vKlE',
    category: 'REELS' as const,
    tags: ['pitch', 'משקיעים', 'גיוס הון', 'יזמים', 'פגישת pitch'],
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-10-20T10:00:00.000Z'),
  },
  {
    title: 'האם הקפה הוא הדלק שמניע אתכם? — מאחורי הקלעים ב-WeCcelerate',
    titleEn: 'Is Coffee the Fuel That Drives You? — Behind the Scenes at WeCcelerate',
    slug: 'reel-coffee-behind-scenes',
    description: 'קליפ קליל מאחורי הקלעים של וויסלרייט: על תרבות הקפה במשרדי WeCcelerate.',
    youtubeUrl: 'https://www.youtube.com/watch?v=IqW-Shk8nL8',
    category: 'REELS' as const,
    tags: ['מאחורי הקלעים', 'תרבות', 'WeCcelerate', 'משרד'],
    isActive: true,
    isFeatured: false,
    publishAt: new Date('2024-10-25T10:00:00.000Z'),
  },
];

async function main() {
  // Add REELS and PODCAST enum values if they don't exist
  console.log('Ensuring REELS and PODCAST enum values exist...');
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "VideoCategory" ADD VALUE IF NOT EXISTS 'REELS'`);
  } catch (e: any) {
    if (!e.message?.includes('already exists')) console.log('Note:', e.message);
  }
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "VideoCategory" ADD VALUE IF NOT EXISTS 'PODCAST'`);
  } catch (e: any) {
    if (!e.message?.includes('already exists')) console.log('Note:', e.message);
  }
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "VideoCategory" ADD VALUE IF NOT EXISTS 'TV_INTERVIEW'`);
  } catch (e: any) {
    if (!e.message?.includes('already exists')) console.log('Note:', e.message);
  }

  console.log('Clearing existing videos...');
  await prisma.video.deleteMany();

  console.log(`Inserting ${videos.length} SEO-optimized videos...`);
  for (const video of videos) {
    await prisma.video.create({ data: video });
  }

  const count = await prisma.video.count();
  console.log(`Done! ${count} videos in database.`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
