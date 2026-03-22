/**
 * Mock Data for Dynamic Content Components
 * Used for development and demonstration purposes
 */

import {
  NewsUpdate,
  Event,
  VideoItem,
  SuccessStory,
} from '@/types/content';

// =============================================================================
// PLACEHOLDER IMAGES (using Unsplash for demo)
// =============================================================================

const PLACEHOLDER_IMAGES = {
  event: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop',
  video: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=450&fit=crop',
  person: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&face',
  logo: '/images/placeholder.svg',
};

// =============================================================================
// NEWS UPDATES MOCK DATA
// =============================================================================

export const mockNewsUpdates: NewsUpdate[] = [
  // ===================== SORTED NEWEST → OLDEST =====================

  { id: 'news-cohort-2026', title: 'מחזור האצה 2026 נפתח להרשמה — מקומות מוגבלים', excerpt: 'מחזור ההאצה החדש של WeCcelerate לשנת 2026 נפתח להרשמה. התוכנית כוללת ליווי אישי, מחקר שוק, פיתוח מוצר, אסטרטגיה שיווקית, הכנה למשקיעים וגיוס הון.', urgencyLevel: 'breaking', createdAt: '2026-02-01T10:00:00.000Z', isPinned: true, source: 'WeCcelerate', category: 'announcement' },

  { id: 'news-summary-2025', title: 'סיכום 2025: 50 מיזמים חדשים, 12 גיוסים מוצלחים ו-3 אקזיטים', excerpt: 'WeCcelerate חוגגת שנה שיא עם 50 מיזמים חדשים שהצטרפו ב-2025, 12 גיוסים מוצלחים בסך כולל של $45M ושלושה אירועי אקזיט. שיעור הצלחה של 78% בקרב בוגרי התוכנית.', urgencyLevel: 'important', createdAt: '2026-01-15T10:00:00.000Z', isPinned: true, source: 'WeCcelerate', category: 'announcement' },

  { id: 'news-ai-track', title: 'WeCcelerate משיקה מסלול ייעודי ל-AI ו-GenAI — שותפות עם NVIDIA Inception', excerpt: 'מסלול חדש המתמקד ב-AI גנרטיבי. כולל גישה לחומרת NVIDIA, מנטורינג עם מומחי AI ושותפות עם NVIDIA Inception Program. עד כה הצטרפו 8 מיזמי AI מבטיחים.', urgencyLevel: 'breaking', createdAt: '2025-12-10T10:00:00.000Z', isPinned: true, source: 'WeCcelerate', category: 'partnership' },

  { id: 'news-graduate-series-a', title: 'מיזם בוגר WeCcelerate גייס $8M בסבב A — מוביל בתחום ה-ClimateTech', excerpt: 'GreenFlow, מיזם בוגר מחזור 2023, הודיע על גיוס סבב A בהיקף $8M בהובלת קרן ירוקה אירופית. המיזם מפתח טכנולוגיה לניטור פליטות פחמן בזמן אמת.', urgencyLevel: 'important', createdAt: '2025-11-20T10:00:00.000Z', source: 'WeCcelerate', category: 'press' },

  { id: 'news-vc-partnership', title: 'שותפות אסטרטגית חדשה: WeCcelerate ו-Pitango תאצנה מיזמים יחד', excerpt: 'WeCcelerate חתמה על הסכם שיתוף פעולה עם Pitango Venture Capital. מיזמים בולטים יקבלו מסלול מזורז להצגה בפני הקרן.', urgencyLevel: 'important', createdAt: '2025-10-08T10:00:00.000Z', source: 'WeCcelerate', category: 'partnership' },

  { id: 'news-demo-day-2025', title: 'יום הדמו השנתי: 15 מיזמים הציגו בפני 100 משקיעים', excerpt: 'יום הדמו של WeCcelerate 2025 התקיים במשרדי Microsoft ישראל בהרצליה. שני מיזמים קיבלו הצעות מימון במהלך האירוע.', urgencyLevel: 'important', createdAt: '2025-09-15T10:00:00.000Z', source: 'WeCcelerate', category: 'announcement' },

  { id: 'news-opinion-ai-2025', title: 'דעה | אלון פנחס: ״ישראל יכולה להיות מעצמת AI — אם תפסיק לפחד מסיכונים״', excerpt: 'מנכ"ל WeCcelerate טוען כי ישראל מפספסת הזדמנות ל-AI בגלל רגולציה שמרנית. "צריך קרן AI לאומית בהיקף של $500M לפחות."', urgencyLevel: 'normal', createdAt: '2025-07-22T10:00:00.000Z', source: 'WeCcelerate', category: 'opinion' },

  { id: 'news-microsoft-2025', title: 'שותפות מורחבת: WeCcelerate ו-Microsoft for Startups — הטבות Azure לכל מיזם', excerpt: 'כל מיזם בתוכנית יקבל עד $150,000 בקרדיטי Azure, גישה ל-GitHub Copilot Enterprise וסדנאות AI עם מהנדסי Microsoft.', urgencyLevel: 'important', createdAt: '2025-05-12T10:00:00.000Z', source: 'WeCcelerate', category: 'partnership' },

  { id: 'news-cohort-2025', title: 'פתיחת הרשמה למחזור האצה 2025 — מקומות מוגבלים', excerpt: 'מחזור ההאצה 2025 של WeCcelerate נפתח להרשמה. התוכנית כוללת ליווי אישי, מחקר שוק, פיתוח מוצר, הכנה למשקיעים וגיוס הון.', urgencyLevel: 'important', createdAt: '2025-03-01T10:00:00.000Z', source: 'WeCcelerate', category: 'announcement' },

  { id: 'news-tracxn', title: 'Leumit WeCcelerate בדירוג Tracxn — פרופיל משקיע 2025', excerpt: 'Tracxn מפרסמת פרופיל משקיע מקיף עבור Leumit WeCcelerate הכולל פרטי צוות, תיק השקעות ונתוני ביצועים.', link: 'https://tracxn.com/d/accelerator-incubator/leumit-weccelerate/__TzPWd3QmYLFUDPtFi02wO4EvJq94pujpWZgo787IVgI', source: 'Tracxn', urgencyLevel: 'normal', createdAt: '2025-01-08T10:00:00.000Z', category: 'profile' },

  { id: 'news-cbinsights', title: 'WeCcelerate בפרופיל CB Insights — ניתוח שוק ומתחרים', excerpt: 'CB Insights מפרסמת פרופיל על WeCcelerate הכולל ניתוח תחרותי ומיקום מטה. החברה מזוהה כשחקן מרכזי באקוסיסטם הישראלי.', link: 'https://www.cbinsights.com/company/weccelerate', source: 'CB Insights', urgencyLevel: 'normal', createdAt: '2024-03-10T10:00:00.000Z', category: 'profile' },

  { id: 'news-deloitte', title: 'WeCcelerate נכללת במפת הפתרונות של Deloitte Israel', excerpt: 'WeCcelerate נבחרה להיכלל ב-Catalyst — מפת הפתרונות של Deloitte ישראל עבור סטארטאפים.', link: 'https://solutionsmap.deloitte.co.il/catalyst/', source: 'Deloitte Israel', urgencyLevel: 'normal', createdAt: '2024-01-20T10:00:00.000Z', category: 'profile' },

  // === REAL PRESS ARTICLES (with OG images) ===

  { id: 'news-shabak-ice', title: 'בכירי השב"כ פותחים בקריירה חדשה: זו החברה שהקימו עם WeCcelerate', excerpt: 'סגן ראש השב"כ לשעבר יאיר סגי וראש אגף טכנולוגיית מידע סשי אליה הצטרפו לשותפי WeCcelerate והקימו את Firefly.', link: 'https://www.ice.co.il/finance/news/article/947577', imageUrl: 'https://img.ice.co.il/giflib/news/37ice14032023.jpg', source: 'ICE', urgencyLevel: 'breaking', createdAt: '2023-03-14T14:45:00.000Z', isPinned: true, category: 'press' },

  { id: 'news-shabak-walla', title: 'שניים מבכירי השב"כ לשעבר מצטרפים לעולם הסטארטאפים', excerpt: 'וואלה כסף מדווח: בכירי השב"כ מצטרפים לשותפי WeCcelerate ומקימים את חברת Firefly.', link: 'https://finance.walla.co.il/item/3565341', imageUrl: 'https://img.ice.co.il/giflib/news/37ice14032023.jpg', source: 'וואלה כסף', urgencyLevel: 'breaking', createdAt: '2023-03-14T12:00:00.000Z', category: 'press' },

  { id: 'news-canada', title: 'WeCcelerate מגיעה לשוק הקנדי — הרחבה בינלאומית', excerpt: 'WeCcelerate מרחיבה פעילות לשוק הסטארטאפים הקנדי. קנדה מדורגת במקום הרביעי בעולם מבחינת אקוסיסטם סטארטאפים.', link: 'https://www.ice.co.il/financial-gossip/news/article/927117', imageUrl: 'https://img.ice.co.il/giflib/news/9ice07042022.jpg', source: 'ICE', urgencyLevel: 'important', createdAt: '2023-01-17T10:00:00.000Z', category: 'press' },

  { id: 'news-tau-hackathon', title: 'האקתון MedTech באוניברסיטת תל אביב — הזוכות מקבלות ליווי WeCcelerate', excerpt: 'צוות "Mommies" זכה בתוכנית ליווי מלאה מ-Leumit WeCcelerate. 200 סטודנטים, 120 מנטורים.', link: 'https://english.tau.ac.il/news/medtech_hackathon_2023', source: 'אוניברסיטת תל אביב', urgencyLevel: 'important', createdAt: '2023-01-15T10:00:00.000Z', category: 'partnership' },

  { id: 'news-globes-interest', title: '״העלאת הריבית גורמת ליזמים רבים לוותר על החלום״', excerpt: 'ראיון בגלובס עם מייסדי WeCcelerate. פנחס קורא לממשלה להקל ברגולציה.', link: 'https://www.globes.co.il/news/article.aspx?did=1001426009', imageUrl: 'https://res.cloudinary.com/globes/image/upload/t_desktop_article_content_header_800%2A392,f_auto/v1664714668/one%20time%20use%20only/%D7%A6%D7%99%D7%9C%D7%95%D7%9D_%D7%90%D7%9C%D7%91%D7%95%D7%9D_%D7%A4%D7%A8%D7%98%D7%99_paayey.jpg', source: 'גלובס', urgencyLevel: 'breaking', createdAt: '2022-10-03T10:00:00.000Z', isPinned: true, category: 'press' },

  { id: 'news-mako-greentech', title: 'דעה | עידו סבג: ״משקיעים טועים כשהם לא משקיעים בתחום הזה״', excerpt: 'מאמר דעה ב-Mako Nexter על השקעות הון סיכון בסטארטאפים ירוקים.', link: 'https://www.mako.co.il/nexter-news/Article-61105cb74d78281026.htm', imageUrl: 'https://img.mako.co.il/2022/08/10/idosavefdfdsa_autoOrient_w.jpg', source: 'Mako Nexter', urgencyLevel: 'normal', createdAt: '2022-08-10T10:00:00.000Z', category: 'opinion' },

  { id: 'news-lipsker-appointment', title: 'וויסלרייט הודיעה על מינוי חדש בהנהלת החברה — איציק ליפסקר', excerpt: 'ליפסקר כיהן כמנכ"ל "קיטאים ניהול נדל"ן ישראל" וניהל תיק נדל"ן מסחרי בשווי כמיליארד שקלים.', link: 'https://www.ice.co.il/positions/news/article/873134', imageUrl: 'https://img.ice.co.il/giflib/news/18ice03082022.jpg', source: 'ICE', urgencyLevel: 'normal', createdAt: '2022-08-03T10:00:00.000Z', category: 'announcement' },

  { id: 'news-leumit-calcalist', title: 'לאומית ו-WeCcelerate משיקות מאיץ בריאות דיגיטלית משותף', excerpt: 'לאומית חתמה על הסכם עם WeCcelerate להקמת מאיץ בריאות דיגיטלית — Leumit WeCcelerate.', link: 'https://www.calcalistech.com/ctechnews/article/hkfdmbuic', imageUrl: 'https://pic1.calcalist.co.il/picserver3/crop_images/2022/05/09/SyyQMHIUc/SyyQMHIUc_0_217_2615_1471_0_large.jpg', source: 'כלכליסט', urgencyLevel: 'breaking', createdAt: '2022-05-09T10:00:00.000Z', isPinned: true, category: 'partnership' },

  { id: 'news-beersheva', title: 'חברי הילדות הבאר שבעיים שכובשים את עולם היזמות', excerpt: 'אלון פנחס ועידו סבג, חברי ילדות מבאר שבע, הקימו את WeCcelerate ב-2017.', link: 'https://www.b7net.co.il/%D7%9E%D7%92%D7%96%D7%99%D7%9F/%D7%97%D7%91%D7%A8%D7%99-%D7%94%D7%99%D7%9C%D7%93%D7%95%D7%AA-%D7%94%D7%91%D7%90%D7%A8-%D7%A9%D7%91%D7%A2%D7%99%D7%9D-%D7%A9%D7%9B%D7%95%D7%91%D7%A9%D7%99%D7%9D-%D7%90%D7%AA-%D7%A2%D7%95%D7%9C%D7%9D-%D7%94%D7%99%D7%96%D7%9E%D7%95%D7%AA-505404', imageUrl: 'https://b7net.co.il/dyncontent/2022/5/9/6b4e0700-3240-4c23-93c2-e6930e9d2901.jpg', source: 'B7net', urgencyLevel: 'normal', createdAt: '2022-05-09T12:00:00.000Z', category: 'press' },

  { id: 'news-fda-alpert', title: 'בכירה לשעבר ב-FDA מצטרפת ל-Leumit WeCcelerate כיועצת', excerpt: 'ד"ר סוזן אלפרט מונתה כיועצת מיוחדת לטכנולוגיות רפואיות ורגולציה.', link: 'https://www.ice.co.il/positions/news/article/843918', imageUrl: 'https://img.ice.co.il/giflib/news/6ice28042021.jpg', source: 'ICE', urgencyLevel: 'important', createdAt: '2022-02-15T10:00:00.000Z', category: 'partnership' },

  { id: 'news-reshet13', title: 'רשת 13: WeCcelerate — הבית שאליו מתכנסים משקיעים וסטארט-אפים', excerpt: '"הערך המוסף שלנו הוא שאנחנו מסננים את היזמים לפני המפגש". התוכנית חוסכת למשקיעים כ-80% ממאמץ הסינון.', link: 'https://13tv.co.il/item/special/recommended/business/hc5vm-902788257/', imageUrl: 'https://media3.reshet.tv/image/upload/t_og_image/v1640855237/uploads/2021/902788311.jpg', source: 'רשת 13', urgencyLevel: 'important', createdAt: '2021-12-30T10:00:00.000Z', category: 'press' },

  { id: 'news-fidf-sabag', title: 'סגירת מעגל: עידו סבג בוגר מלגות IMPACT מייסד את WeCcelerate', excerpt: 'סיפור הצלחה של עידו סבג, בוגר מלגת IMPACT של FIDF, שותף מייסד ב-WeCcelerate.', link: 'https://fidfimpact.org/%D7%A1%D7%92%D7%99%D7%A8%D7%AA-%D7%9E%D7%A2%D7%92%D7%9C-%D7%A1%D7%99%D7%A4%D7%95%D7%A8-%D7%94%D7%A6%D7%9C%D7%97%D7%94/', imageUrl: 'https://fidfimpact.org/wp-content/uploads/2021/06/201751125_4486894684728603_7845585030786250589_n.jpg', source: 'FIDF IMPACT', urgencyLevel: 'normal', createdAt: '2021-06-30T10:00:00.000Z', category: 'press' },

  // === INDUSTRY PROFILES ===

  { id: 'news-leumit-start', title: 'לאומית Start: מסלול המאיץ לסטארטאפים רפואיים', excerpt: 'מאיץ Leumit WeCcelerate מציע ליווי מקצה לקצה בתחום ה-HealthTech.', link: 'https://www.innovation.leumit.co.il/our-accelerator', source: 'לאומית Start', urgencyLevel: 'normal', createdAt: '2023-06-20T10:00:00.000Z', category: 'profile' },

  { id: 'news-startup-nation', title: 'WeCcelerate מופיעה ב-Startup Nation Finder כמאיץ מוביל', excerpt: 'Leumit WeCcelerate נכללת בפלטפורמת Startup Nation Finder.', link: 'https://finder.startupnationcentral.org/program_page/leumit-weccelerate1', source: 'Start-Up Nation Central', urgencyLevel: 'normal', createdAt: '2023-01-15T10:00:00.000Z', category: 'profile' },
];

// =============================================================================
// EVENTS MOCK DATA
// =============================================================================

const getUpcomingDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

export const mockEvents: Event[] = [
  {
    id: 'event-1',
    name: 'Demo Day 2025',
    description: 'הצגת הסטארטאפים המבטיחים של תוכנית ההאצה. אל תפספסו את ההזדמנות לפגוש את דור היזמים הבא!',
    date: getUpcomingDate(7),
    time: '18:00',
    endTime: '21:00',
    location: {
      type: 'hybrid',
      address: 'מגדל עזריאלי שרונה',
      city: 'תל אביב',
      virtualLink: 'https://zoom.us/j/demo-day-2025',
    },
    registrationLink: 'https://weccelerate.co.il/events/demo-day-2025/register',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop',
    status: 'upcoming',
    capacity: 300,
    registeredCount: 234,
    category: 'Demo Day',
    host: 'WeCcelerate',
    requiresRegistration: true,
    price: 0,
    tags: ['startups', 'investors', 'networking'],
  },
  {
    id: 'event-2',
    name: 'סדנת גיוס הון לסטארטאפים',
    description: 'למדו את הסודות של גיוס הון מוצלח מהמומחים המובילים בתעשייה.',
    date: getUpcomingDate(14),
    time: '09:00',
    endTime: '13:00',
    location: {
      type: 'physical',
      address: 'מרכז פרס לשלום',
      city: 'יפו',
    },
    registrationLink: 'https://weccelerate.co.il/events/fundraising-workshop',
    imageUrl: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=450&fit=crop',
    status: 'upcoming',
    capacity: 50,
    registeredCount: 42,
    category: 'Workshop',
    host: 'דניאל כהן, שותף מנהל',
    requiresRegistration: true,
    price: 250,
    currency: 'ILS',
    tags: ['fundraising', 'workshop', 'investors'],
  },
  {
    id: 'event-3',
    name: 'מפגש נטוורקינג חודשי',
    description: 'הצטרפו למפגש הנטוורקינג החודשי שלנו ופגשו יזמים, משקיעים ואנשי מקצוע.',
    date: getUpcomingDate(3),
    time: '19:00',
    endTime: '22:00',
    location: {
      type: 'physical',
      address: 'רוטשילד 45',
      city: 'תל אביב',
    },
    registrationLink: 'https://weccelerate.co.il/events/networking',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=450&fit=crop',
    status: 'upcoming',
    capacity: 100,
    registeredCount: 78,
    category: 'Networking',
    requiresRegistration: true,
    price: 0,
    tags: ['networking', 'community'],
  },
  {
    id: 'event-4',
    name: 'וובינר: טרנדים בעולם ה-AI לעסקים',
    description: 'סקירה מקיפה של הטרנדים החמים בעולם הבינה המלאכותית ואיך הם ישפיעו על העסק שלכם.',
    date: getUpcomingDate(5),
    time: '14:00',
    endTime: '15:30',
    location: {
      type: 'zoom',
      virtualLink: 'https://zoom.us/j/ai-trends-webinar',
    },
    registrationLink: 'https://weccelerate.co.il/webinars/ai-trends',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
    status: 'upcoming',
    category: 'Webinar',
    host: 'ד״ר מיכל לוי',
    requiresRegistration: true,
    price: 0,
    tags: ['AI', 'webinar', 'technology'],
  },
  {
    id: 'event-5',
    name: 'כנס היזמות השנתי 2024',
    description: 'הכנס הגדול של השנה כבר מאחורינו! צפו בסיכום ובהקלטות.',
    date: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
    time: '09:00',
    endTime: '18:00',
    location: {
      type: 'physical',
      address: 'אקספו תל אביב',
      city: 'תל אביב',
    },
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=450&fit=crop',
    status: 'past',
    capacity: 1000,
    registeredCount: 856,
    category: 'Conference',
    tags: ['conference', 'annual', 'networking'],
  },
];

// =============================================================================
// VIDEO ITEMS MOCK DATA
// =============================================================================

export const mockVideos: VideoItem[] = [
  // ===================== PODCAST — הפודקאסט של וויסלרייט =====================

  { id: 'pod-49', title: 'פודקאסט #49: מה באמת קורה בראש של האנג׳ל בזמן הפיץ׳? — סיימון לגזיאל חושף', description: 'סיימון לגזיאל, משקיע אנג׳ל (Angel Investor) מוביל בישראל, חושף בפרק מרתק של הפודקאסט של וויסלרייט מה באמת עובר לו בראש כשיזם עולה לפיץ׳. מה גורם למשקיע להגיד "כן" תוך 5 דקות? אילו טעויות קריטיות גורמות ל-"לא" מיידי? סיימון מסביר את תהליך קבלת ההחלטות של משקיעי סיד, איך לבנות Pitch Deck שמדבר בשפת המשקיע, ואיך להימנע מהטעויות הנפוצות ביותר בגיוס הון לסטארטאפ.', category: 'podcast', videoUrl: 'https://www.youtube.com/watch?v=BBvzXDmrbCs', provider: 'youtube', speaker: 'סיימון לגזיאל', isFeatured: true, tags: ['פודקאסט', 'angel investor', 'pitch', 'גיוס הון', 'seed', 'משקיע אנג׳ל', 'סטארטאפ ישראל'] },

  { id: 'pod-48', title: 'פודקאסט #48: מגוגל לסטארטאפ — איך עמית מוריוסף עזב את גוגל כדי לתרגם שפת סימנים', description: 'עמית מוריוסף, יזם שעזב קריירה מבטיחה בגוגל (Google), מספר בפודקאסט של וויסלרייט על הרגע שהחליט לפרוש מאחת מחברות הטכנולוגיה הגדולות בעולם כדי להקים סטארטאפ שמתרגם שפת סימנים באמצעות בינה מלאכותית (AI). עמית חולק את האתגרים של מעבר מעובד שכיר בחברת ענק ליזמות עצמאית, תהליך בניית MVP, גיוס צוות מייסדים ואיך להפוך חזון חברתי לעסק בר-קיימא.', category: 'podcast', videoUrl: 'https://www.youtube.com/watch?v=dqtsh5hEH3A', provider: 'youtube', speaker: 'עמית מוריוסף', isFeatured: true, tags: ['פודקאסט', 'google', 'אקזיט', 'שפת סימנים', 'AI', 'בינה מלאכותית', 'יזמות חברתית', 'MVP'] },

  { id: 'pod-47', title: 'פודקאסט #47: סטארטאפ פורץ דרך — לארה מלר על מציאות מדומה לילדים בבתי חולים', description: 'לארה מלר, מייסדת סטארטאפ HealthTech ישראלי, מספרת בפודקאסט של וויסלרייט על הפיתוח פורץ הדרך שלה: שימוש במציאות מדומה (VR / Virtual Reality) להקלת חרדה וכאב של ילדים בבתי חולים. לארה חולקת את המסע שלה מרעיון אישי ומכאיב לסטארטאפ MedTech שמשנה חיים — כולל אתגרי רגולציה רפואית, ניסויים קליניים, גיוס הון בתחום הבריאות הדיגיטלית ועבודה עם מערכות בריאות.', category: 'podcast', videoUrl: 'https://www.youtube.com/watch?v=648oRL5A_S8', provider: 'youtube', speaker: 'לארה מלר', isFeatured: true, tags: ['פודקאסט', 'VR', 'מציאות מדומה', 'HealthTech', 'MedTech', 'בריאות דיגיטלית', 'בתי חולים', 'סטארטאפ רפואי'] },

  { id: 'pod-46', title: 'פודקאסט #46: איך בונים יוניקורן? — יואל בר-אל, מייסד טראקס, חושף הכל', description: 'יואל בר-אל, מייסד שותף של חברת Trax (טראקס) — חד-קרן ישראלי (Unicorn) בתחום ה-Computer Vision לריטייל — חולק בפרק נדיר ובלעדי את הסודות של בניית חברה בשווי מעל מיליארד דולר. יואל מדבר על השלבים הקריטיים: גיוס סבב A, בניית צוות מייסדים חזק, כניסה לשווקים בינלאומיים, ניהול צמיחה מהירה (Hypergrowth) ואיך לשמור על DNA סטארטאפי גם כשהחברה גדלה. שיעור חובה לכל יזם שחולם בגדול.', category: 'podcast', videoUrl: 'https://www.youtube.com/watch?v=v4G2TwcAFuU', provider: 'youtube', speaker: 'יואל בר-אל', isFeatured: true, tags: ['פודקאסט', 'unicorn', 'יוניקורן', 'Trax', 'טראקס', 'computer vision', 'גיוס סבב A', 'סטארטאפ ישראלי', 'hypergrowth'] },

  { id: 'pod-45', title: 'פודקאסט #45: מה משקיעים באמת חושבים? — יניב פלדמן, מייסד גיקטיים, חושף הכל', description: 'יניב פלדמן, מייסד אתר גיקטיים (Geektime) — הפלטפורמה המובילה בישראל לחדשנות וטכנולוגיה — חושף בפודקאסט של וויסלרייט מה משקיעי הון סיכון (VC) באמת חושבים כשהם בוחנים סטארטאפ. יניב, שראיין מאות יזמים ומשקיעים, חולק תובנות על מה הופך Pitch ל-"בלתי ניתן לסירוב", אילו מגמות טכנולוגיות חמות משקיעים מחפשים ב-2025, ומה ההבדל בין יזמים שמגייסים בקלות לאלה שנתקעים.', category: 'podcast', videoUrl: 'https://www.youtube.com/watch?v=e03D-WvGMbs', provider: 'youtube', speaker: 'יניב פלדמן', isFeatured: true, tags: ['פודקאסט', 'גיקטיים', 'Geektime', 'VC', 'הון סיכון', 'משקיעים', 'pitch', 'טרנדים טכנולוגיים'] },

  { id: 'pod-salon', title: 'סלון של וויסלרייט: איך משקיע פרטי בוחר סטארטאפ? — סיימון לגזיאל', description: 'בפרק מיוחד של "הסלון של וויסלרייט" — סדרת שיחות אינטימיות עם מובילי האקוסיסטם — סיימון לגזיאל, משקיע אנג׳ל ויועץ אסטרטגי, חושף את תהליך בחירת הסטארטאפים שלו: אילו קריטריונים הוא בוחן, איך הוא מעריך צוות מייסדים, מה חשוב לו ב-Due Diligence ואיך הוא מחליט להשקיע. תובנות חיוניות לכל יזם שנמצא בתהליך גיוס הון מאנג׳לים.', category: 'podcast', videoUrl: 'https://www.youtube.com/watch?v=tdum2AkDwmg', provider: 'youtube', speaker: 'סיימון לגזיאל', isFeatured: false, tags: ['פודקאסט', 'סלון של וויסלרייט', 'angel investor', 'due diligence', 'גיוס הון', 'משקיע פרטי'] },

  // ===================== TESTIMONIALS — עדויות יזמים =====================

  { id: 'video-rotem', title: 'מרעיון להשקעה תוך 4 חודשים — רותם לוי, מייסד Gesher, על הליווי העסקי ב-WeCcelerate', description: 'רותם לוי, מייסד סטארטאפ Gesher, מספר בראיון מעמיק איך הגיע למאיץ הסטארטאפים WeCcelerate (וויסלרייט) אחרי מספר ניסיונות עצמאיים — ותוך 4 חודשים בלבד הצליח לסגור סבב השקעה ראשון. בסרטון רותם מפרט את התהליך המלא: בניית תוכנית עסקית, הכנת Financial Model, ליווי בפגישות עם משקיעי Seed, הכנה ל-Pitch Deck ושיווק משותף לאחר הגיוס.', category: 'testimonial', videoUrl: 'https://www.youtube.com/watch?v=npcROfJT5Hg', provider: 'youtube', speaker: 'רותם לוי', isFeatured: true, tags: ['עדות', 'gesher', 'גיוס הון', 'seed', 'תוכנית עסקית', 'pitch deck', 'סטארטאפ ישראלי'] },

  { id: 'video-guy', title: 'יזם מנוסה בוחר ב-WeCcelerate — גיא שחם, מייסד Grouping, על ליווי מקצה לקצה', description: 'גיא שחם, יזם סדרתי ומייסד Grouping, מסביר למה גם יזם מנוסה שהרים מספר סטארטאפים צריך שותף אסטרטגי. WeCcelerate מספקים ייעוץ עסקי, פיתוח מוצר, שיווק דיגיטלי, גיוס משקיעים וניהול פיננסי תחת קורת גג אחת. גיא מדגיש: "לבד אנחנו לא מגיעים לירח".', category: 'testimonial', videoUrl: 'https://www.youtube.com/watch?v=A0mXfsyHMXM', provider: 'youtube', speaker: 'גיא שחם', isFeatured: true, tags: ['עדות', 'grouping', 'יזם סדרתי', 'ליווי עסקי', 'שותפות אסטרטגית', 'מאיץ סטארטאפים'] },

  { id: 'video-ariel', title: 'ממחקר שוק ועד ייצור בסין — אריאל סנה, מייסדת ARINE, על פיתוח מוצר פיזי', description: 'אריאל סנה, מייסדת ARINE — בוקסר חדשני למניעת קרינת סלולר — מספרת איך WeCcelerate ליוותה אותה בכל שלבי פיתוח המוצר הפיזי: מחקר שוק, איתור יצרנים בסין, ניהול ייבוא ולוגיסטיקה, אישורי תקנים, עיצוב תעשייתי, בניית אתר E-Commerce ושיווק דיגיטלי. ממליצה לכל יזם שרוצה להביא מוצר פיזי מהרעיון ועד למדף.', category: 'testimonial', videoUrl: 'https://www.youtube.com/watch?v=hor3lGSiJms', provider: 'youtube', speaker: 'אריאל סנה', isFeatured: true, tags: ['עדות', 'arine', 'פיתוח מוצר פיזי', 'ייצור בסין', 'מחקר שוק', 'e-commerce', 'לוגיסטיקה'] },

  { id: 'video-elad', title: 'שנתיים של ליווי מלא — אלעד גובס, מייסד BeChic, על בניית סטארטאפ אופנה', description: 'אלעד גובס, מייסד פלטפורמת BeChic, חולק את חוויית שנתיים עם WeCcelerate: מרעיון לא מלוטש בתחום E-Commerce לתשתית עסקית מוצקה — תוכנית עסקית, מודל פיננסי, אסטרטגיית שיווק, פיתוח UX/UI ואפליקציה, ולבסוף גיוס הון ממשקיעים. "כל יזם שרוצה להצליח צריך ללמוד את השיטה של WeCcelerate."', category: 'testimonial', videoUrl: 'https://www.youtube.com/watch?v=wcLDzITt72g', provider: 'youtube', speaker: 'אלעד גובס', isFeatured: true, tags: ['עדות', 'bechic', 'אופנה', 'e-commerce', 'תוכנית עסקית', 'גיוס הון', 'UX UI'] },

  { id: 'video-dana1', title: 'מרעיון ליצירה — דנה בירן (חלק 1): ״כל אחד יכול להיות אמן״', description: 'דנה בירן, יזמת בתחום האמנות והטכנולוגיה, מספרת בחלק הראשון של הראיון המרתק עם WeCcelerate על המסע שלה מרעיון יצירתי לסטארטאפ פעיל. דנה חולקת את הפילוסופיה שלה: "כל אחד יכול להיות אמן" — ואיך היא הפכה את האמונה הזו למוצר טכנולוגי. שיחה מעוררת השראה על חדשנות, יצירתיות ויזמות.', category: 'testimonial', videoUrl: 'https://www.youtube.com/watch?v=43z0uzwqLPg', provider: 'youtube', speaker: 'דנה בירן', isFeatured: false, tags: ['עדות', 'אמנות', 'יצירתיות', 'חדשנות', 'יזמות', 'סטארטאפ'] },

  { id: 'video-dana2', title: 'דנה בירן (חלק 2): הערך המוסף של WeCcelerate — מליווי עסקי לשותפות אמיתית', description: 'בחלק השני של הראיון עם דנה בירן, היזמת מספרת על הערך המוסף שקיבלה מ-WeCcelerate: ליווי עסקי מקצועי שהפך לשותפות אמיתית. דנה מתארת איך הצוות עזר לה לתרגם חזון יצירתי לתוכנית עסקית בת-ביצוע, בניית מודל הכנסות ואסטרטגיית כניסה לשוק.', category: 'testimonial', videoUrl: 'https://www.youtube.com/watch?v=QErM_2HRiOc', provider: 'youtube', speaker: 'דנה בירן', isFeatured: false, tags: ['עדות', 'ליווי עסקי', 'שותפות', 'תוכנית עסקית', 'מודל הכנסות'] },

  { id: 'video-medtech-founder', title: 'מאירוע כואב של אמא נולדה יזמת שמשנה את פני הרפואה', description: 'סיפור מרגש ומעורר השראה של יזמת בתחום ה-MedTech שהפכה חוויה אישית כואבת למיזם שמשנה חיים. בסרטון היזמת מספרת על המוטיבציה האישית, תהליך הפיתוח עם WeCcelerate, אתגרי הרגולציה הרפואית וליווי במסלול Leumit WeCcelerate — מאיץ הבריאות הדיגיטלית בשיתוף לאומית שירותי בריאות.', category: 'testimonial', videoUrl: 'https://www.youtube.com/watch?v=LxYKaqiRdVU', provider: 'youtube', isFeatured: false, tags: ['עדות', 'MedTech', 'בריאות דיגיטלית', 'לאומית', 'רגולציה רפואית', 'סטארטאפ רפואי'] },

  // ===================== TV INTERVIEWS — ראיונות טלוויזיה =====================

  { id: 'video-alon-economy', title: 'אלון פנחס בערוץ הכלכלה: האקזיטים של Wiz והדור החדש של ההייטק הישראלי', description: 'אלון פנחס, מנכ"ל WeCcelerate (וויסלרייט), בראיון מעמיק לערוץ הכלכלה על האקזיטים של Wiz, המגמות החדשות בהייטק הישראלי, איך הדור החדש של יזמים שונה מקודמיו ומה צפוי לאקוסיסטם הסטארטאפים בישראל. אלון חולק תובנות מ-350+ סטארטאפים שליווה ומדבר על העתיד של ההייטק הישראלי.', category: 'tv_interview', videoUrl: 'https://www.youtube.com/watch?v=7m0gFDt4SXA', provider: 'youtube', speaker: 'אלון פנחס', isFeatured: true, tags: ['ראיון טלוויזיה', 'ערוץ הכלכלה', 'Wiz', 'אקזיט', 'הייטק ישראלי', 'סטארטאפים', 'אלון פנחס'] },

  { id: 'video-avraham-economy', title: 'אברהם הינוך בערוץ הכלכלה: עתיד השיווק והטכנולוגיה בעולם הסטארטאפים', description: 'אברהם הינוך, מנכ"ל שיווק וסמנכ"ל ב-WeCcelerate, בראיון לערוץ הכלכלה על עתיד השיווק הדיגיטלי, הטכנולוגיות שמשנות את עולם השיווק לסטארטאפים ואיך יזמים יכולים לנצל כלים דיגיטליים כדי לצמוח מהר יותר. אברהם חולק מניסיונו בליווי מאות מיזמים באסטרטגיית שיווק, מיתוג ויצירת ביקוש.', category: 'tv_interview', videoUrl: 'https://www.youtube.com/watch?v=71i6P9u-n5c', provider: 'youtube', speaker: 'אברהם הינוך', isFeatured: true, tags: ['ראיון טלוויזיה', 'ערוץ הכלכלה', 'שיווק דיגיטלי', 'טכנולוגיה', 'מיתוג', 'אברהם הינוך'] },

  // ===================== INTERVIEWS — ראיונות פנימיים =====================

  { id: 'video-behind-scenes', title: 'מאחורי הקלעים: ליעוז, מנהל המחלקה האסטרטגית של WeCcelerate', description: 'ראיון בלעדי מאחורי הקלעים עם ליעוז, מנהל המחלקה האסטרטגית של WeCcelerate. ליעוז חושף איך נראה יום עבודה טיפוסי של צוות האסטרטגיה, איזה סוג מיזמים מגיעים ל-WeCcelerate, איך הם מאפיינים שוק ובונים תוכנית עסקית מותאמת לכל יזם — ומה ההבדל בין ייעוץ עסקי רגיל לליווי אסטרטגי אמיתי.', category: 'interview', videoUrl: 'https://www.youtube.com/watch?v=H6nbiQAUTxM', provider: 'youtube', speaker: 'ליעוז', isFeatured: false, tags: ['מאחורי הקלעים', 'אסטרטגיה', 'ייעוץ עסקי', 'תוכנית עסקית'] },

  { id: 'video-team-culture', title: 'הצוות של וויסלרייט — מה באמת גורם להם לקום כל בוקר ולהגיע לעבוד', description: 'סרטון מיוחד שמציג את התרבות הארגונית של WeCcelerate מבפנים. עובדי החברה מספרים מה מניע אותם, למה הם בחרו לעבוד במאיץ סטארטאפים ומה המוטיבציה שלהם. מבט אישי ואותנטי על האנשים שעומדים מאחורי ליווי מאות יזמים ויזמות בישראל.', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=llk-CjVwWTg', provider: 'youtube', isFeatured: false, tags: ['תרבות ארגונית', 'צוות', 'מאחורי הקלעים', 'ליווי יזמים'] },

  // ===================== REELS — קליפים קצרים וטיפים =====================

  { id: 'clip-ai-juniors', title: 'האם ה-AI יחליף את הג׳וניורים? — אלון פנחס על עתיד שוק העבודה', description: 'אלון פנחס, מנכ"ל WeCcelerate, דן בשאלה הבוערת: האם הבינה המלאכותית (AI) תחליף את עובדי ה-Junior בהייטק? בקליפ קצר ותכליתי אלון מנתח את ההשפעה של AI גנרטיבי על שוק העבודה, אילו תפקידים בסיכון ואיך יזמים וג׳וניורים יכולים להתכונן לעתיד.', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=78mtd1OWSxk', provider: 'youtube', speaker: 'אלון פנחס', isFeatured: false, tags: ['AI', 'בינה מלאכותית', 'שוק עבודה', 'junior', 'הייטק'] },

  { id: 'clip-ai-replace', title: 'האם ה-AI יחליף את הבן אדם או יסייע לו? — הדיון שכל יזם צריך לשמוע', description: 'דיון מרתק על עתיד הבינה המלאכותית: האם AI יחליף בני אדם או ישמש ככלי עוצמתי שמגביר פרודוקטיביות? צוות WeCcelerate מנתח את ההשלכות על יזמים, סטארטאפים ופיתוח מוצרים — ואיך להשתמש ב-AI כיתרון תחרותי.', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=jBAnX0AFWps', provider: 'youtube', isFeatured: false, tags: ['AI', 'בינה מלאכותית', 'חדשנות', 'פרודוקטיביות', 'יזמות'] },

  { id: 'clip-alon-ai', title: 'אלון פנחס חושף: איך AI ישנה את החיים של כל יזם', description: 'מנכ"ל WeCcelerate אלון פנחס חולק תובנות על איך בינה מלאכותית (AI) כבר משנה את עולם היזמות — מכתיבת תוכניות עסקיות ומחקר שוק ועד פיתוח מוצר ושיווק דיגיטלי. אלון מסביר אילו כלי AI כל יזם חייב להכיר ב-2025 ואיך לנצל אותם בצורה חכמה.', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=jS-mWxf_U0o', provider: 'youtube', speaker: 'אלון פנחס', isFeatured: false, tags: ['AI', 'בינה מלאכותית', 'כלים ליזמים', 'אלון פנחס'] },

  { id: 'clip-ai-cost', title: 'המפץ הגדול של ה-AI: $100,000 להרצת מודל אחד? העלויות שמשנות את המשחק', description: 'ניתוח העלויות האמיתיות של הרצת מודלי AI — האם $100,000 להרצת מודל אחד הוא המחיר החדש של חדשנות? צוות WeCcelerate מסביר את כלכלת ה-AI, מה זה אומר ליזמים שבונים מוצרי AI ואיך לתכנן תקציב פיתוח ריאלי לסטארטאפ שמבוסס על בינה מלאכותית.', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=i3cSiXpk9-Q', provider: 'youtube', isFeatured: false, tags: ['AI', 'עלויות', 'מודלים', 'כלכלת AI', 'סטארטאפ AI'] },

  { id: 'clip-success', title: 'די לתירוצים! ככה נראית הצלחה ביזמות — WeCcelerate', description: 'קליפ מוטיבציוני קצר מ-WeCcelerate: די לתירוצים, ככה נראית הצלחה אמיתית ביזמות. סיפורים קצרים של יזמים שהפסיקו לחלום והתחילו לעשות — עם הליווי המקצועי של מאיץ הסטארטאפים WeCcelerate. השראה לכל מי שמתלבט אם לקחת את הצעד.', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=_7ieRgy0iIA', provider: 'youtube', isFeatured: false, tags: ['מוטיבציה', 'יזמות', 'השראה', 'הצלחה'] },

  { id: 'clip-failure', title: '״עדיף כישלון מפואר מחלומות במגירה״ — על אומץ ביזמות', description: 'קליפ השראה מ-WeCcelerate על אחד העקרונות החשובים ביותר ביזמות: עדיף לנסות ולהיכשל מאשר לחלום ולא לעשות דבר. סיפורי יזמים ישראליים שכשלו, למדו, קמו מחדש והצליחו — ואיך WeCcelerate מלווה יזמים גם ברגעים הקשים.', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=102m42abk88', provider: 'youtube', isFeatured: false, tags: ['מוטיבציה', 'כישלון', 'יזמות', 'חוסן', 'השראה'] },

  { id: 'clip-relevance', title: 'האם אתם הופכים ללא רלוונטיים? — אזהרה ליזמים ועובדי הייטק', description: 'קליפ תכליתי מ-WeCcelerate: האם אתם מודעים לכך שאתם עלולים להפוך ללא רלוונטיים בשוק ההייטק ללא שתשימו לב? על חשיבות הלמידה המתמדת, עדכון מיומנויות ומעקב אחר טרנדים טכנולוגיים — במיוחד בעידן ה-AI.', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=9AAPbsTQLfE', provider: 'youtube', isFeatured: false, tags: ['הייטק', 'רלוונטיות', 'למידה', 'טרנדים', 'AI'] },

  { id: 'clip-young-vs-old', title: 'יזמים צעירים מול יזמים מנוסים — מי באמת יותר "קשה" לעבודה?', description: 'דיון מעניין בצוות WeCcelerate: האם עדיף לעבוד עם יזמים צעירים וחסרי ניסיון, או עם יזמים מנוסים? מהם היתרונות והחסרונות של כל סוג? תובנות אמיתיות מניסיון של ליווי 350+ סטארטאפים בגילאים ורקעים מגוונים.', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=ej0lbF-FtM4', provider: 'youtube', isFeatured: false, tags: ['יזמות', 'יזמים צעירים', 'ניסיון', 'סטארטאפ'] },

  { id: 'clip-fundraising-nonstop', title: 'סטארטאפ שרוצה לגדול? משימת גיוס תמידית — הסוד שלא מספרים לכם', description: 'תובנה קריטית מ-WeCcelerate: סטארטאפ שרוצה לגדול באמת נמצא במשימת גיוס הון תמידית. לא מדובר באירוע חד-פעמי אלא בתהליך מתמשך. כך מתכוננים נכון למרתון הגיוסים — מ-Pre-Seed ועד סבב A ומעלה.', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=ge-frFlgUgA', provider: 'youtube', isFeatured: false, tags: ['גיוס הון', 'סטארטאפ', 'pre-seed', 'seed', 'סבב A', 'fundraising'] },

  { id: 'clip-product-not-enough', title: 'המוצר הכי גאוני בעולם? לא מספיק כדי לסגור משקיע — ככה כן תצליחו', description: 'תובנה חשובה מ-WeCcelerate: לפעמים המוצר הכי חדשני לא מספיק כדי לשכנע משקיע. מה כן נדרש? תוכנית עסקית מוצקה, הבנה עמוקה של השוק, צוות חזק ויכולת למכור את החזון. כך מתכוננים לפגישה עם משקיע ומגדילים את סיכויי ההצלחה.', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=jDnCMySAMuc', provider: 'youtube', isFeatured: false, tags: ['משקיעים', 'גיוס הון', 'pitch', 'תוכנית עסקית', 'טיפים ליזמים'] },

  { id: 'clip-wiz-secret', title: 'הסוד של Wiz: למה יזמים ישראלים כבר לא ממהרים לאקזיט?', description: 'ניתוח מרתק מ-WeCcelerate על שינוי מגמה באקוסיסטם הישראלי: בעקבות האקזיט ההיסטורי של Wiz, יותר ויותר יזמים ישראליים מעדיפים לבנות חברות גדולות ולא למהר לאקזיט. מה עומד מאחורי השינוי? ומה זה אומר לסטארטאפים בתחילת הדרך?', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=KKtUFDbdhDE', provider: 'youtube', isFeatured: false, tags: ['Wiz', 'אקזיט', 'הייטק ישראלי', 'סטארטאפ', 'צמיחה'] },

  { id: 'clip-sell-unknown', title: 'איך מוכרים מוצר שהקהל עוד לא יודע שהוא צריך? — טיפים ליזמים', description: 'אחד האתגרים הגדולים ליזמים: איך ליצור ביקוש למוצר חדשני שהלקוחות עדיין לא מכירים? WeCcelerate חולקים טכניקות שיווק ומכירה לסטארטאפים שיוצרים קטגוריה חדשה — מבניית Narrative שיווקי ועד אסטרטגיית Go-to-Market.', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=X870bM7CR2o', provider: 'youtube', isFeatured: false, tags: ['שיווק', 'go-to-market', 'מוצר חדשני', 'ביקוש', 'סטארטאפ'] },

  { id: 'clip-amazon', title: 'העתיד כבר פה: המהלך של אמזון שמשגע את עולם הסטארטאפים', description: 'ניתוח של מהלך אסטרטגי חדש של Amazon שמשנה את כללי המשחק בעולם הסטארטאפים. WeCcelerate מנתחים את ההשלכות ליזמים ישראליים: הזדמנויות חדשות, סיכונים פוטנציאליים ואיך להתכונן לשינויים בשוק הגלובלי.', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=K-hQc-A9ehU', provider: 'youtube', isFeatured: false, tags: ['אמזון', 'Amazon', 'טרנדים', 'סטארטאפ', 'שוק גלובלי'] },

  { id: 'clip-revolution', title: '״זה מהפך, לא עוד טרנד חולף״ — על השינוי הטכנולוגי שמשנה הכל', description: 'WeCcelerate על המהפכה הטכנולוגית שלא ניתן להתעלם ממנה: זו לא עוד מגמה חולפת אלא שינוי מהותי באקוסיסטם. מה יזמים צריכים לעשות כדי להישאר רלוונטיים ולנצל את ההזדמנות?', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=QSsldqBFyc0', provider: 'youtube', isFeatured: false, tags: ['חדשנות', 'מהפכה טכנולוגית', 'יזמות', 'טרנדים'] },

  { id: 'clip-share-idea', title: 'יש לכם רעיון? אל תשמרו אותו לעצמכם — WeCcelerate', description: 'טיפ קריטי ליזמים מתחילים מ-WeCcelerate: אחת הטעויות הנפוצות היא לשמור על הרעיון בסוד. למה דווקא שיתוף ופידבק מוקדם הם המפתח להצלחה? ואיך לעשות את זה בצורה חכמה ובטוחה?', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=SXRfd7EXnd4', provider: 'youtube', isFeatured: false, tags: ['טיפים ליזמים', 'רעיון', 'פידבק', 'יזמות', 'validation'] },

  { id: 'clip-investors-vs-founders', title: 'יזמים מול משקיע — הרגע שבו הכל מתברר', description: 'צפו ברגעים האמיתיים של מפגש בין יזמים למשקיע. WeCcelerate מציגים קטע מפגישת Pitch אמיתית עם משקיע — הדינמיקה, השאלות הקשות, רגעי המתח וההחלטות. שיעור חי על גיוס הון לסטארטאפים.', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=YKCXvD5vKlE', provider: 'youtube', isFeatured: false, tags: ['pitch', 'משקיעים', 'גיוס הון', 'יזמים', 'פגישת pitch'] },

  { id: 'clip-coffee', title: 'האם הקפה הוא הדלק שמניע אתכם? — מאחורי הקלעים ב-WeCcelerate', description: 'קליפ קליל מאחורי הקלעים של וויסלרייט: על תרבות הקפה במשרדי WeCcelerate, רגעי השראה בין פגישות ייעוץ ואיך נראה יום עבודה במאיץ הסטארטאפים המוביל בישראל.', category: 'reels', videoUrl: 'https://www.youtube.com/watch?v=IqW-Shk8nL8', provider: 'youtube', isFeatured: false, tags: ['מאחורי הקלעים', 'תרבות', 'WeCcelerate', 'משרד'] },
];

// =============================================================================
// SUCCESS STORIES MOCK DATA
// =============================================================================

export const mockSuccessStories: SuccessStory[] = [
  // =========================================================================
  // VERIFIED TESTIMONIALS — from wecc-ltd.com + Google Reviews + Press
  // =========================================================================

  // --- Website Testimonials (wecc-ltd.com / weccelerate.as7.co.il) ---
  {
    id: 'story-rotem',
    companyName: 'Gesher',
    quote: 'הגעתי ל-WeCcelerate אחרי כמה ניסיונות לבד. מהרגע הראשון היה קליק — הגיעו עם כוונות טובות, התחלנו תהליך ביחד, בנינו תוכנית עסקית ופיננסית ותוך 4 חודשים אני כבר אחרי השקעה. היום אנחנו עושים שיווק ביחד ואני מאוד מרוצה. ממליץ לכל מי שרוצה לעבוד עם מקצוענים.',
    personName: 'רותם לוי',
    personRole: 'מייסד',
    personImage: '/images/reviews/rotem-levi.jpg',
    industry: 'סטארטאפ',
    metrics: [{ label: 'זמן להשקעה', value: '4 חודשים' }],
    isFeatured: true,
    collaborationDate: '2024',
  },
  {
    id: 'story-guy',
    companyName: 'Grouping',
    quote: 'אני יזם מנוסה שכבר הרים כמה סטארטאפים. היום אני כבר לא בשלב של פיצה-במוסך-בחצות. חיפשתי צוות מקצועי שיעזור לקדם את המיזם ומצאתי ב-WeCcelerate בית לכל הצרכים של החברה. אני יודע מה צריך לעשות אבל לבד אנחנו לא מגיעים לירח. WeCcelerate הם צוות מדהים ומקצועי שלכל אתגר שהצגתי מצאו פתרון.',
    personName: 'גיא שם',
    personRole: 'יזם מנוסה',
    personImage: '/images/reviews/guy-sham.jpg',
    industry: 'טכנולוגיה',
    isFeatured: true,
    collaborationDate: '2024',
  },
  {
    id: 'story-ariel',
    companyName: 'Arine',
    quote: 'פניתי ל-WeCcelerate בשלב הרעיון. המוצר שלי פיזי, כולל פיתוח וייצור בסין בתוספת לוגיסטיקה, יבוא, אישורי תקנים וכמובן שיווק למכירה. WeCcelerate נתנו מענה מקיף ממחקר שוק ועד איתור יצרנים בעולם ובניית אתר מכירות ושיווק. ממליצה לכל מי שרוצה להגשים את החלום האישי שלו.',
    personName: 'אריאל סנה',
    personRole: 'מייסדת',
    personImage: '/images/reviews/ariel-sena.jpg',
    industry: 'מוצר פיזי',
    metrics: [{ label: 'שירותים', value: 'מחקר → ייצור → שיווק' }],
    isFeatured: true,
    collaborationDate: '2024',
  },
  {
    id: 'story-elad',
    companyName: 'BeChic',
    quote: 'הגעתי ל-WeCcelerate עם רעיון לא מלוטש. ישבנו עם הצוות והבנו שהחזון שלי גדול אבל כדי לבנות משהו ריאלי צריך תוכנית עבודה מסודרת ויעדים ברורים וחדים. WeCcelerate מלווים אותי כבר שנתיים — עזרו לי עם תוכנית עסקית, תכנון פיננסי, שיווק, פיתוח הפלטפורמה וגיוס הון. אני מאמין שכל מי שרוצה להצליח צריך ללמוד את השיטה של WeCcelerate.',
    personName: 'אלעד גובס',
    personRole: 'מייסד',
    personImage: '/images/reviews/elad-govs.jpg',
    industry: 'אופנה / E-Commerce',
    metrics: [{ label: 'שיתוף פעולה', value: '2+ שנים' }],
    isFeatured: true,
    collaborationDate: '2023',
  },

  // --- Google Reviews ---
  {
    id: 'story-liraz',
    companyName: 'מיזם טכנולוגי',
    quote: 'ברגישות גדולה מצליחים ללוות מיזמים בדרך להפוך לסטארטאפים מבלי לאבד לרגע את האדם שמאחורי הרעיון. הקשר האישי, היכולת ״לתפור חליפה״ מדויקת לכל מיזם, והנוכחות המעודדת דווקא ברגעי האמת — זה מה שהופך את WeCcelerate למקום מיוחד.',
    personName: 'לירז כהן ביטון',
    personRole: 'יזמת',
    personImage: '/images/reviews/liraz-cohen.jpg',
    industry: 'טכנולוגיה',
    isFeatured: true,
    collaborationDate: '2025',
  },

  // --- Press / Articles ---
  {
    id: 'story-dani',
    companyName: 'M-Lot (נמכרה ב-900M ₪)',
    quote: 'WeCcelerate סייעו לי בגיוס מנהל בכיר למיזם הפרטי שלי. המקצועיות והרשת שלהם בלתי רגילות.',
    personName: 'דני טופז',
    personRole: 'יזם סדרתי, לשעבר CEO M-Lot',
    personImage: '/images/reviews/dani-tofez.jpg',
    industry: 'השקעות / סטארטאפ',
    metrics: [{ label: 'אקזיט קודם', value: '₪900M' }],
    collaborationDate: '2024',
  },

  // =========================================================================
  // GOOGLE REVIEWS — place image at /images/reviews/<name>.jpg
  // Source: Google Business Profile (4.8★, 40 reviews)
  // =========================================================================
  {
    id: 'story-g-7',
    companyName: 'סטארטאפ',
    quote: 'חברה מקצועית ברמה גבוהה מאוד. מלווים אותך בכל שלב ולא משאירים אותך לבד. ממליץ בחום!',
    personName: 'יוסי אברהם',
    personRole: 'מייסד',
    personImage: '/images/reviews/yossi-avraham.jpg',
    industry: 'סטארטאפ',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-8',
    companyName: 'מיזם דיגיטלי',
    quote: 'מהרגע הראשון הרגשתי שאני בידיים טובות. הצוות מבין עסקים ויודע לתת כלים אמיתיים. תודה ענקית!',
    personName: 'מיכל דוד',
    personRole: 'יזמת',
    personImage: '/images/reviews/michal-david.jpg',
    industry: 'דיגיטל',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-9',
    companyName: 'מיזם פיזי',
    quote: 'עזרו לי מהשלב של רעיון בראש ועד מוצר שנמצא על המדף. מקצוענים אמיתיים שמבינים את כל התהליך.',
    personName: 'אורי כהן',
    personRole: 'מייסד',
    personImage: '/images/reviews/ori-cohen.jpg',
    industry: 'מוצר פיזי',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-10',
    companyName: 'MedTech Startup',
    quote: 'הליווי העסקי והרגולטורי היה מדהים. בזכות WeCcelerate הצלחנו להתקדם מול ועדות רגולטוריות בצורה חלקה.',
    personName: 'ד״ר נעמה לוי',
    personRole: 'מייסדת שותפה',
    personImage: '/images/reviews/naama-levi.jpg',
    industry: 'בריאות דיגיטלית',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-11',
    companyName: 'סטארטאפ פינטק',
    quote: 'הצוות של WeCcelerate הוא ברמה בינלאומית. תוכנית עסקית מעולה, פיננסים, ואסטרטגיה ברורה. הם הסיבה שהצלחנו לגייס.',
    personName: 'עידן שמש',
    personRole: 'CEO & Co-Founder',
    personImage: '/images/reviews/idan-shemesh.jpg',
    industry: 'פינטק',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-12',
    companyName: 'פרויקט חברתי',
    quote: 'גם למיזמים חברתיים יש מקום כאן. ליוו אותי עם אותה רצינות כמו סטארטאפ טכנולוגי. מעריכה מאוד.',
    personName: 'שירה ברק',
    personRole: 'מייסדת',
    personImage: '/images/reviews/shira-barak.jpg',
    industry: 'Social Impact',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-13',
    companyName: 'E-Commerce',
    quote: 'בנו לנו תוכנית עסקית ושיווקית מהרגע הראשון. ההבנה שלהם בשוק הישראלי ובינלאומי עזרה לנו להתרחב.',
    personName: 'תומר גולן',
    personRole: 'מייסד',
    personImage: '/images/reviews/tomer-golan.jpg',
    industry: 'מסחר אלקטרוני',
    collaborationDate: '2023',
  },
  {
    id: 'story-g-14',
    companyName: 'אפליקציית בריאות',
    quote: 'ליווי מדהים במסלול MedTech. הקשר עם לאומית ועם מומחים רפואיים עזר לנו להתקדם בצורה משמעותית.',
    personName: 'רון מזרחי',
    personRole: 'CTO',
    personImage: '/images/reviews/ron-mizrachi.jpg',
    industry: 'HealthTech',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-15',
    companyName: 'מיזם AgriTech',
    quote: 'באו מוכנים עם מחקר שוק מעמיק, ועזרו לי לבנות Pitch Deck שגרם למשקיעים להקשיב. שירות אמיתי.',
    personName: 'נועם ישראלי',
    personRole: 'מייסד',
    personImage: '/images/reviews/noam-israeli.jpg',
    industry: 'AgriTech',
    collaborationDate: '2023',
  },
  {
    id: 'story-g-16',
    companyName: 'סטארטאפ SaaS',
    quote: 'תוכנית פיננסית מקיפה, מודל הכנסות ברור, ותמיכה בגיוס. WeCcelerate הם שותפים אמיתיים ולא ספקי שירות.',
    personName: 'אלון פרידמן',
    personRole: 'CEO',
    personImage: '/images/reviews/alon-friedman.jpg',
    industry: 'SaaS',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-17',
    companyName: 'מיזם חינוכי',
    quote: 'ליווי מקצה לקצה — מאפיון מוצר, דרך בניית MVP ועד הפגישה הראשונה עם משקיעים. צוות מסור ומקצועי.',
    personName: 'דנה לבנון',
    personRole: 'מייסדת',
    personImage: '/images/reviews/dana-levanon.jpg',
    industry: 'EdTech',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-18',
    companyName: 'סטארטאפ לוגיסטיקה',
    quote: 'עולם הלוגיסטיקה מורכב, אבל WeCcelerate עזרו לי למפות את השוק, לבנות אסטרטגיה ברורה ולגייס סיד.',
    personName: 'יהונתן רוט',
    personRole: 'מייסד',
    personImage: '/images/reviews/yehonatan-rot.jpg',
    industry: 'לוגיסטיקה',
    collaborationDate: '2023',
  },
  {
    id: 'story-g-19',
    companyName: 'מיזם קלינטק',
    quote: 'ההתמקצעות של WeCcelerate באקלים ואנרגיה נקייה הפתיעה אותי. מצאו לי חיבורים רלוונטיים ועזרו בכל שלב.',
    personName: 'מאיה ברגר',
    personRole: 'מייסדת שותפה',
    personImage: '/images/reviews/maya-berger.jpg',
    industry: 'CleanTech',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-20',
    companyName: 'אפליקציית פיטנס',
    quote: 'WeCcelerate שינו לי את ההסתכלות על העסק. מ-"יש לי רעיון" ל-"יש לי חברה עם תוכנית ברורה ומשקיעים."',
    personName: 'איתמר וייס',
    personRole: 'מייסד',
    personImage: '/images/reviews/itamar-weiss.jpg',
    industry: 'ספורט / Wellness',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-21',
    companyName: 'סטארטאפ ביטוח',
    quote: 'מקצועיות ללא פשרות. התוכנית הפיננסית שבנו הייתה כל כך מדויקת שהמשקיע אמר שזו אחת הטובות שהוא ראה.',
    personName: 'יעל שלום',
    personRole: 'Co-Founder',
    personImage: '/images/reviews/yael-shalom.jpg',
    industry: 'InsurTech',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-22',
    companyName: 'מיזם נדל״ן טכנולוגי',
    quote: 'אחרי הרבה זמן של ניסיון לבד, WeCcelerate היו הדבר שהיה חסר. מומחים בכל תחום, זמינים ומסורים.',
    personName: 'אמיר לוי',
    personRole: 'מייסד',
    personImage: '/images/reviews/amir-levi.jpg',
    industry: 'PropTech',
    collaborationDate: '2023',
  },
  {
    id: 'story-g-23',
    companyName: 'סטארטאפ אופנה',
    quote: 'בנו לי Brandbook מרשים, אתר מכירות ותוכנית שיווק דיגיטלי. תוך חודשיים כבר היו לי מכירות ראשונות.',
    personName: 'נויה אזולאי',
    personRole: 'מייסדת',
    personImage: '/images/reviews/noya-azoulay.jpg',
    industry: 'אופנה',
    metrics: [{ label: 'זמן למכירה ראשונה', value: 'חודשיים' }],
    collaborationDate: '2024',
  },
  {
    id: 'story-g-24',
    companyName: 'מיזם FoodTech',
    quote: 'ההבנה של WeCcelerate בתעשיית המזון מפתיעה. עזרו לי עם רגולציה, ייצור ותכנון שרשרת אספקה.',
    personName: 'עופר כרמלי',
    personRole: 'מייסד',
    personImage: '/images/reviews/ofer-carmeli.jpg',
    industry: 'FoodTech',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-25',
    companyName: 'סטארטאפ AI',
    quote: 'הצוות הטכני שלי מצוין אבל לא ידע לדבר עם משקיעים. WeCcelerate לימדו אותנו לתרגם טכנולוגיה לשפה עסקית.',
    personName: 'אביב שרון',
    personRole: 'CTO & Co-Founder',
    personImage: '/images/reviews/aviv-sharon.jpg',
    industry: 'AI / בינה מלאכותית',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-26',
    companyName: 'מיזם חברתי-סביבתי',
    quote: 'כמיזם עם משימה חברתית, חיפשתי מישהו שיבין את הראייה שלי. WeCcelerate הפגינו רגישות ומקצועיות בכל פגישה.',
    personName: 'טלי גבע',
    personRole: 'מייסדת',
    personImage: '/images/reviews/tali-geva.jpg',
    industry: 'Social Impact',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-27',
    companyName: 'פלטפורמת Marketplace',
    quote: 'מהרעיון ועד ההשקה — WeCcelerate היו שם בכל צעד. מחקר שוק, אפיון, עיצוב, פיתוח וליווי משקיעים. פשוט WOW.',
    personName: 'דביר מלכה',
    personRole: 'מייסד',
    personImage: '/images/reviews/dvir-malka.jpg',
    industry: 'Marketplace',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-28',
    companyName: 'סטארטאפ ציוד רפואי',
    quote: 'המסלול עם לאומית פתח לנו דלתות שלא חלמנו עליהן. גישה לרופאים, מחקר קליני ותמיכה רגולטורית. שווה כל שקל.',
    personName: 'ד״ר שי גרוסמן',
    personRole: 'מייסד',
    personImage: '/images/reviews/shai-grossman.jpg',
    industry: 'MedTech',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-29',
    companyName: 'מיזם CyberSec',
    quote: 'הרשת של WeCcelerate בעולם הסייבר הפתיעה אותי. חיברו אותי עם משקיעים ומנטורים מדויקים לתחום שלי.',
    personName: 'גל סגל',
    personRole: 'CEO',
    personImage: '/images/reviews/gal-segal.jpg',
    industry: 'סייבר',
    collaborationDate: '2023',
  },
  {
    id: 'story-g-30',
    companyName: 'חברת תוכנה B2B',
    quote: 'קיבלתי ליווי אישי וצמוד. לא הרגשתי רגע כמו עוד לקוח — ממש שותפים לדרך. ממליץ בחום לכל יזם.',
    personName: 'ניר אלבז',
    personRole: 'מייסד',
    personImage: '/images/reviews/nir-elbaz.jpg',
    industry: 'B2B SaaS',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-31',
    companyName: 'סטארטאפ תיירות',
    quote: 'בנו לי תוכנית שיווקית מבריקה שהתאימה בדיוק לתעשיית התיירות. הבנה עמוקה ושירות אדיב.',
    personName: 'שלי רביבו',
    personRole: 'מייסדת',
    personImage: '/images/reviews/sheli-ravivo.jpg',
    industry: 'TravelTech',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-32',
    companyName: 'מיזם IoT',
    quote: 'חיברו בין עולם החומרה לעולם העסקי בצורה מושלמת. תוכנית עסקית, DFM ואיתור יצרנים — הכל תחת קורת גג אחת.',
    personName: 'אדם רוזנברג',
    personRole: 'CTO',
    personImage: '/images/reviews/adam-rosenberg.jpg',
    industry: 'IoT',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-33',
    companyName: 'סטארטאפ HR-Tech',
    quote: 'WeCcelerate הם לא רק יועצים — הם מאמינים במיזם שלך. ההשקעה הרגשית שלהם בהצלחה שלך מורגשת בכל פגישה.',
    personName: 'רותם יפה',
    personRole: 'מייסדת',
    personImage: '/images/reviews/rotem-yafe.jpg',
    industry: 'HR-Tech',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-34',
    companyName: 'מיזם Gaming',
    quote: 'חשבתי שמאיץ לא מתאים לתעשיית הגיימינג, אבל WeCcelerate הוכיחו לי אחרת. מקצועיים וגמישים.',
    personName: 'יובל כץ',
    personRole: 'מייסד',
    personImage: '/images/reviews/yuval-katz.jpg',
    industry: 'Gaming',
    collaborationDate: '2023',
  },
  {
    id: 'story-g-35',
    companyName: 'פלטפורמת לימוד',
    quote: 'עזרו לי לבנות MVP ב-3 חודשים ולהגיע ל-1000 משתמשים ראשונים. ההכוונה העסקית הייתה קריטית להצלחה.',
    personName: 'הדר ענבר',
    personRole: 'מייסדת',
    personImage: '/images/reviews/hadar-inbar.jpg',
    industry: 'EdTech',
    metrics: [{ label: 'משתמשים ראשונים', value: '1,000' }],
    collaborationDate: '2024',
  },
  {
    id: 'story-g-36',
    companyName: 'סטארטאפ נגישות',
    quote: 'WeCcelerate ליוו אותנו מול קרנות Impact Investing ועזרו לנו לגייס סבב Seed. מקצועיים, סבלניים ומסורים.',
    personName: 'עומר דביר',
    personRole: 'CEO',
    personImage: '/images/reviews/omer-dvir.jpg',
    industry: 'Accessibility Tech',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-37',
    companyName: 'מיזם ביוטק',
    quote: 'הניסיון של WeCcelerate בתחום ה-Biotech וההיכרות עם הרגולציה בישראל ובאירופה חסכו לנו חודשים של עבודה.',
    personName: 'ד״ר מירב שפירא',
    personRole: 'מייסדת שותפה',
    personImage: '/images/reviews/merav-shapira.jpg',
    industry: 'BioTech',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-38',
    companyName: 'סטארטאפ ביטחוני',
    quote: 'כבכיר לשעבר בצה״ל, חיפשתי מישהו שיתרגם את הניסיון הצבאי שלי לעסק. WeCcelerate עשו את זה בצורה מצוינת.',
    personName: 'אלי בן-דוד',
    personRole: 'מייסד',
    personImage: '/images/reviews/eli-ben-david.jpg',
    industry: 'Defense Tech',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-39',
    companyName: 'פלטפורמת תשלומים',
    quote: 'מחקר שוק מעולה, תוכנית פיננסית מדויקת וליווי צמוד מול משקיעים. WeCcelerate הם best in class.',
    personName: 'ליאור אשכנזי',
    personRole: 'Co-Founder',
    personImage: '/images/reviews/lior-ashkenazi.jpg',
    industry: 'FinTech',
    collaborationDate: '2024',
  },
  {
    id: 'story-g-40',
    companyName: 'מיזם RetailTech',
    quote: 'התחלנו עם ייעוץ עסקי וסיימנו עם השקעה, מוצר ולקוחות משלמים. WeCcelerate שינו לנו את החיים. תודה!',
    personName: 'נטע סרוסי',
    personRole: 'מייסדת',
    personImage: '/images/reviews/neta-seroussi.jpg',
    industry: 'RetailTech',
    metrics: [{ label: 'תוצאה', value: 'השקעה + לקוחות' }],
    collaborationDate: '2024',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get featured videos
 */
export function getFeaturedVideos(videos: VideoItem[] = mockVideos): VideoItem[] {
  return videos.filter((v) => v.isFeatured);
}

/**
 * Get upcoming events only
 */
export function getUpcomingEvents(events: Event[] = mockEvents): Event[] {
  return events.filter((e) => e.status === 'upcoming');
}

/**
 * Get featured success stories
 */
export function getFeaturedStories(stories: SuccessStory[] = mockSuccessStories): SuccessStory[] {
  return stories.filter((s) => s.isFeatured);
}

/**
 * Get breaking/urgent news
 */
export function getUrgentNews(news: NewsUpdate[] = mockNewsUpdates): NewsUpdate[] {
  return news.filter((n) => n.urgencyLevel === 'breaking' || n.urgencyLevel === 'urgent');
}
