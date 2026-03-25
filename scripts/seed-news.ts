/**
 * Seed real WeCcelerate news articles into the database.
 * Run: npx tsx scripts/seed-news.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Initialize Prisma 7 with adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const realArticles = [
  // --- Breaking / Pinned ---
  {
    title: 'פתיחת הרשמה למחזור האצה 2025 — מקומות מוגבלים',
    excerpt:
      'מחזור ההאצה החדש של WeCcelerate נפתח להרשמה. התוכנית כוללת ליווי אישי, מחקר שוק, פיתוח מוצר, אסטרטגיה שיווקית, הכנה למשקיעים וגיוס הון. הצטרפו לתוכנית המובילה בישראל.',
    link: null,
    urgencyLevel: 'URGENT' as const,
    isPinned: true,
    isActive: true,
    publishAt: new Date('2025-01-15T10:00:00.000Z'),
  },
  {
    title: 'בכירי השב"כ לשעבר מצטרפים ל-WeCcelerate ומקימים את Firefly',
    excerpt:
      'סגן ראש השב"כ לשעבר יאיר סגי (רולי) וראש אגף טכנולוגיית מידע סשי אליה הצטרפו לשותפי WeCcelerate — אלון פנחס, אברהם הינוך ועידו סבג — והקימו את Firefly. החברה תפעל לזיהוי, חיזוק וליווי סטארטאפים וחיבורם לרשתות משקיעים בישראל ובעולם.',
    link: 'https://www.ice.co.il/finance/news/article/947577',
    urgencyLevel: 'BREAKING' as const,
    isPinned: true,
    isActive: true,
    publishAt: new Date('2023-03-14T14:45:00.000Z'),
  },
  {
    title: 'לאומית שירותי בריאות ו-WeCcelerate משיקות מאיץ בריאות דיגיטלית משותף',
    excerpt:
      'לאומית חתמה על הסכם עם WeCcelerate להקמת מאיץ בריאות דיגיטלית — Leumit WeCcelerate. לפי מנכ"ל WeCcelerate אלון פנחס: "המודל העסקי שלנו משולב עם ייעוץ קליני וגישה למאגרי מידע אנונימיים". מנכ"ל לאומית Start יזהר לאופר הדגיש: "נציע ליווי עסקי, קליני ורגולטורי מקיף".',
    link: 'https://www.calcalistech.com/ctechnews/article/hkfdmbuic',
    urgencyLevel: 'BREAKING' as const,
    isPinned: true,
    isActive: true,
    publishAt: new Date('2022-05-09T10:00:00.000Z'),
  },

  // --- Important ---
  {
    title: '״העלאת הריבית האגרסיבית גורמת ליזמים רבים לוותר על החלום״',
    excerpt:
      'ראיון בגלובס עם מייסדי WeCcelerate — אלון פנחס, אברהם הינוך ועידו סבג — שליוו כ-350 סטארטאפים. המייסדים מדברים על השפעת העלאות הריבית על יזמים, עלויות מימון גבוהות ואתגרי הגיוסים בשוק הנוכחי. פנחס קורא לממשלה להקל ברגולציה ולהציע תמריצי מס.',
    link: 'https://www.globes.co.il/news/article.aspx?did=1001426009',
    urgencyLevel: 'IMPORTANT' as const,
    isPinned: true,
    isActive: true,
    publishAt: new Date('2022-10-03T10:00:00.000Z'),
  },
  {
    title: 'רשת 13: WeCcelerate — הבית שאליו מתכנסים משקיעים וחברות סטארט אפ',
    excerpt:
      'כתבה ברשת 13 על WeCcelerate — מאיץ הסטארטאפים שמגשר בין יזמים למשקיעים. לפי מנכ"ל אלון פנחס: "הדבר הראשון שמשקיע בוחן הוא את צוות המיזם. הערך המוסף שלנו הוא שאנחנו מבצעים הכנה מוקדמת למשקיע ומסננים את היזמים לפני המפגש". התוכנית חוסכת למשקיעים כ-80% ממאמץ הסינון.',
    link: 'https://13tv.co.il/item/special/recommended/business/hc5vm-902788257/',
    urgencyLevel: 'IMPORTANT' as const,
    isPinned: false,
    isActive: true,
    publishAt: new Date('2021-12-30T10:00:00.000Z'),
  },
  {
    title: 'חברי הילדות מבאר שבע שכובשים את עולם היזמות',
    excerpt:
      'אלון פנחס (31, כלכלן, לשעבר רואה חשבון באינטל) ועידו סבג (30, מהנדס מכונות), חברי ילדות משכונה ד׳ בבאר שבע, הקימו את WeCcelerate ב-2017 יחד עם אברהם הינוך. המאיץ מלווה יזמים משלב הרעיון דרך גיוסי Seed, Pre-Seed ולאחרונה גם סבבי A. השלושה מחויבים לאקוסיסטם החדשנות בנגב.',
    link: 'https://www.b7net.co.il/%D7%9E%D7%92%D7%96%D7%99%D7%9F/%D7%97%D7%91%D7%A8%D7%99-%D7%94%D7%99%D7%9C%D7%93%D7%95%D7%AA-%D7%94%D7%91%D7%90%D7%A8-%D7%A9%D7%91%D7%A2%D7%99%D7%9D-%D7%A9%D7%9B%D7%95%D7%91%D7%A9%D7%99%D7%9D-%D7%90%D7%AA-%D7%A2%D7%95%D7%9C%D7%9D-%D7%94%D7%99%D7%96%D7%9E%D7%95%D7%AA-505404',
    urgencyLevel: 'IMPORTANT' as const,
    isPinned: false,
    isActive: true,
    publishAt: new Date('2022-05-09T12:00:00.000Z'),
  },

  // --- Urgent ---
  {
    title: 'WeCcelerate מרחיבה פעילות לקנדה — חיזוק קשרים עם קרנות בינלאומיות',
    excerpt:
      'WeCcelerate הרחיבה את פעילותה לקנדה כחלק מאסטרטגיית התפתחות בינלאומית. ההרחבה נועדה לחזק קשרים עם קרנות השקעה קנדיות ולתמוך במיזמים ישראליים בחדירה לשווקי צפון אמריקה.',
    link: null,
    urgencyLevel: 'URGENT' as const,
    isPinned: false,
    isActive: true,
    publishAt: new Date('2023-09-15T10:00:00.000Z'),
  },
  {
    title: 'לאומית Start: פרטים על מסלול המאיץ לסטארטאפים רפואיים',
    excerpt:
      'מאיץ Leumit WeCcelerate — חלק ממיזם לאומית Start — מציע ליזמים מתחילים ליווי מקצה לקצה בתחום ה-HealthTech. הפרוגרמה כוללת חוות דעת מרופאים מומחים, ליווי רגולטורי מלא, סקירות שוק והנגשת נכסי הקופה במחיר מונגש.',
    link: 'https://www.innovation.leumit.co.il/our-accelerator',
    urgencyLevel: 'URGENT' as const,
    isPinned: false,
    isActive: true,
    publishAt: new Date('2023-06-20T10:00:00.000Z'),
  },

  // --- Normal ---
  {
    title: 'WeCcelerate חוצה את רף 350 סטארטאפים שליוותה',
    excerpt:
      'מאיץ הסטארטאפים WeCcelerate חצה את אבן הדרך של 350 חברות סטארטאפ שליווה מאז הקמתו. מנכ"ל החברה אלון פנחס: "ליווינו חברות במסע הארוך שלהן מהשלבים הראשוניים ועד לחברה רווחית ומתפקדת".',
    link: null,
    urgencyLevel: 'NORMAL' as const,
    isPinned: false,
    isActive: true,
    publishAt: new Date('2022-10-03T12:00:00.000Z'),
  },
  {
    title: 'WeCcelerate מופיעה ב-Startup Nation Finder כמאיץ מוביל',
    excerpt:
      'Leumit WeCcelerate נכללת בפלטפורמת Startup Nation Finder של Start-Up Nation Central — הגוף המוביל בישראל למיפוי אקוסיסטם החדשנות. הפרופיל מפרט את שירותי המאיץ בתחום הבריאות הדיגיטלית.',
    link: 'https://finder.startupnationcentral.org/program_page/leumit-weccelerate1',
    urgencyLevel: 'NORMAL' as const,
    isPinned: false,
    isActive: true,
    publishAt: new Date('2023-01-15T10:00:00.000Z'),
  },
  {
    title: 'WeCcelerate נכללת במפת הפתרונות של Deloitte Israel',
    excerpt:
      'מאיץ הסטארטאפים WeCcelerate נבחר להיכלל ב-Catalyst — מפת הפתרונות של Deloitte ישראל עבור סטארטאפים, כאחד השחקנים המובילים באקוסיסטם הישראלי.',
    link: 'https://solutionsmap.deloitte.co.il/catalyst/',
    urgencyLevel: 'NORMAL' as const,
    isPinned: false,
    isActive: true,
    publishAt: new Date('2024-01-20T10:00:00.000Z'),
  },
  {
    title: 'WeCcelerate בפרופיל CB Insights — ניתוח שוק ומתחרים',
    excerpt:
      'CB Insights — פלטפורמת מודיעין עסקי גלובלית — מפרסמת פרופיל על WeCcelerate הכולל ניתוח תחרותי, נתוני עובדים ומיקום מטה. החברה מזוהה כשחקן מרכזי בשוק ייעוץ הסטארטאפים הישראלי.',
    link: 'https://www.cbinsights.com/company/weccelerate',
    urgencyLevel: 'NORMAL' as const,
    isPinned: false,
    isActive: true,
    publishAt: new Date('2024-03-10T10:00:00.000Z'),
  },
  {
    title: 'המודל הייחודי של WeCcelerate: שותפות ולא ספק שירות',
    excerpt:
      'WeCcelerate מגדירה את עצמה כשותפה של הסטארטאפים ולא כספקית שירות. תפקיד החברה לתת מענה כולל ליזמים — ממחקר שוק ובדיקת היתכנות, דרך תוכנית עסקית, היבטי קניין רוחני, הקמת חברה ושלד ניהולי, ועד גיוס משקיעים.',
    link: null,
    urgencyLevel: 'NORMAL' as const,
    isPinned: false,
    isActive: true,
    publishAt: new Date('2024-06-10T10:00:00.000Z'),
  },
  {
    title: 'Leumit WeCcelerate בדירוג Tracxn — פרופיל משקיע 2025',
    excerpt:
      'Tracxn, פלטפורמת מודיעין סטארטאפים, מפרסמת פרופיל משקיע מקיף עבור Leumit WeCcelerate הכולל פרטי צוות, תיק השקעות ונתוני ביצועים של מאיץ הבריאות הדיגיטלית.',
    link: 'https://tracxn.com/d/accelerator-incubator/leumit-weccelerate/__TzPWd3QmYLFUDPtFi02wO4EvJq94pujpWZgo787IVgI',
    urgencyLevel: 'NORMAL' as const,
    isPinned: false,
    isActive: true,
    publishAt: new Date('2025-01-08T10:00:00.000Z'),
  },
];

async function main() {
  console.log('Clearing existing news updates...');
  await prisma.newsUpdate.deleteMany();

  console.log(`Inserting ${realArticles.length} real articles...`);
  for (const article of realArticles) {
    await prisma.newsUpdate.create({ data: article });
  }

  const count = await prisma.newsUpdate.count();
  console.log(`Done! ${count} news articles in database.`);
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
