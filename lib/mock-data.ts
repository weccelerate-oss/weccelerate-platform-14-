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
  // ===================== REAL ARTICLES & PRESS =====================
  {
    id: 'news-leumit',
    title: 'לאומית שירותי בריאות ו-WeCcelerate משיקות מאיץ בריאות דיגיטלית משותף',
    excerpt: 'לאומית חתמה על הסכם שיתוף פעולה עם WeCcelerate להקמת מאיץ בתחום הבריאות הדיגיטלית — Leumit WeCcelerate — המלווה יזמים מתחילים משלב הרעיון ועד למוצר עובד. לאומית מספקת מומחיות קלינית, גישה למאגרי מידע אנונימיים, ותמיכה רגולטורית. WeCcelerate מספקת ליווי עסקי, תכנון פיננסי, הגנת קניין רוחני וגיוס משקיעים.',
    link: 'https://www.calcalistech.com/ctechnews/article/hkfdmbuic',
    urgencyLevel: 'breaking',
    createdAt: '2022-05-09T10:00:00.000Z',
    isPinned: true,
  },
  {
    id: 'news-reshet13',
    title: 'WeCcelerate: הבית שאליו מתכנסים משקיעים וחברות סטארט אפ',
    excerpt: 'כתבה ברשת 13 על WeCcelerate — מאיץ הסטארטאפים שמגשר בין יזמים למשקיעים. החברה פועלת עם שלושה שותפים: אברהם הינוך, אלון פנחס ועידו סבג, כל אחד מביא מומחיות ייחודית במחקר, שיווק, פיננסים, פיתוח עסקי וטכנולוגיה. התוכנית חוסכת למשקיעים כ-80% ממאמץ הסינון.',
    link: 'https://13tv.co.il/item/special/recommended/business/hc5vm-902788257/',
    urgencyLevel: 'important',
    createdAt: '2021-12-30T10:00:00.000Z',
    isPinned: true,
  },
  {
    id: 'news-shabak',
    title: 'שניים מבכירי השב"כ לשעבר הצטרפו לשותפי WeCcelerate והקימו את Firefly',
    excerpt: 'סגן ראש השב"כ לשעבר יאיר סגי (רולי) וראש אגף טכנולוגיית מידע לשעבר סשי אליה הצטרפו לשותפי מאיץ הסטארטאפים WeCcelerate והקימו את Firefly — מיזם טכנולוגי חדש בתחום הסייבר.',
    link: 'https://finance.walla.co.il/item/3565341',
    urgencyLevel: 'breaking',
    createdAt: '2023-03-14T08:42:00.000Z',
    isPinned: true,
  },
  {
    id: 'news-beersheva',
    title: 'חברי הילדות הבאר שבעים שכובשים את עולם היזמות',
    excerpt: 'אלון פנחס ועידו סבג, שהכירו כילדים בשכונה ד\' בבאר שבע, הקימו יחד את WeCcelerate ב-2017. המאיץ מלווה יזמים משלב הרעיון דרך גיוסי Seed ו-Pre-Seed ולאחרונה גם סבבי A. השניים מחויבים לפיתוח אקוסיסטם החדשנות בנגב ומלווים יזמים צעירים מהדרום.',
    link: 'https://www.b7net.co.il/%D7%9E%D7%92%D7%96%D7%99%D7%9F/%D7%97%D7%91%D7%A8%D7%99-%D7%94%D7%99%D7%9C%D7%93%D7%95%D7%AA-%D7%94%D7%91%D7%90%D7%A8-%D7%A9%D7%91%D7%A2%D7%99%D7%9D-%D7%A9%D7%9B%D7%95%D7%91%D7%A9%D7%99%D7%9D-%D7%90%D7%AA-%D7%A2%D7%95%D7%9C%D7%9D-%D7%94%D7%99%D7%96%D7%9E%D7%95%D7%AA-505404',
    urgencyLevel: 'important',
    createdAt: '2022-05-09T12:00:00.000Z',
  },
  {
    id: 'news-canada',
    title: 'WeCcelerate פותחת סניף בקנדה — חיזוק קשרים עם קרנות קנדיות',
    excerpt: 'WeCcelerate הרחיבה את פעילותה לקנדה במטרה לחזק קשרים ולתמוך במיזמים ישראליים דרך קרנות השקעה ושיתופי פעולה קנדיים.',
    urgencyLevel: 'urgent',
    createdAt: '2023-09-15T10:00:00.000Z',
  },
  {
    id: 'news-cohort-2025',
    title: '🎉 פתיחת הרשמה למחזור האצה 2025 — מקומות מוגבלים',
    excerpt: 'מחזור ההאצה החדש של WeCcelerate נפתח להרשמה. התוכנית כוללת ליווי אישי, מחקר שוק, פיתוח מוצר, אסטרטגיה שיווקית, הכנה למשקיעים וגיוס הון. הצטרפו לתוכנית המובילה בישראל.',
    urgencyLevel: 'urgent',
    createdAt: new Date().toISOString(),
    isPinned: true,
  },
  {
    id: 'news-deloitte',
    title: 'WeCcelerate נכללת במפת הפתרונות של Deloitte Israel לסטארטאפים',
    excerpt: 'מאיץ הסטארטאפים WeCcelerate נבחר להיכלל ב-Catalyst — מפת הפתרונות של Deloitte ישראל עבור סטארטאפים, כאחד השחקנים המובילים באקוסיסטם הישראלי.',
    link: 'https://solutionsmap.deloitte.co.il/catalyst/',
    urgencyLevel: 'normal',
    createdAt: '2024-01-20T10:00:00.000Z',
  },
  {
    id: 'news-partnership-model',
    title: 'המודל הייחודי של WeCcelerate: שותפות ולא ספק שירות',
    excerpt: 'WeCcelerate מגדירה את היחסים עם הסטארטאפים המובילים בישראל כשותפות ולא כלקוח. תפקיד החברה לתת מענה כולל ולהוביל את הרעיונות עם הפוטנציאל הגבוה ביותר להצלחה.',
    urgencyLevel: 'normal',
    createdAt: '2024-06-10T10:00:00.000Z',
  },
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
  {
    id: 'video-1',
    title: 'ראיון עם מייסד TechVenture: המסע מרעיון להצלחה',
    description: 'ראיון מעמיק עם יוסי לוי, מייסד TechVenture, על האתגרים וההצלחות בדרך לגיוס $15M.',
    category: 'interview',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    provider: 'youtube',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=450&fit=crop',
    duration: 1845, // 30:45
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    views: 12500,
    speaker: 'יוסי לוי',
    isFeatured: true,
    tags: ['interview', 'success-story', 'fundraising'],
  },
  {
    id: 'video-2',
    title: 'סיכום Demo Day 2024',
    description: 'צפו בהיילייטס מאירוע ה-Demo Day האחרון שלנו עם 12 סטארטאפים מבטיחים.',
    category: 'summary',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    provider: 'youtube',
    thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=450&fit=crop',
    duration: 720, // 12:00
    publishedAt: new Date(Date.now() - 604800000).toISOString(),
    views: 8700,
    isFeatured: true,
    tags: ['demo-day', 'startups', 'highlights'],
  },
  {
    id: 'video-3',
    title: 'וובינר: אסטרטגיות צמיחה ב-2025',
    description: 'הקלטה מלאה של הוובינר על אסטרטגיות צמיחה לעסקים בשנה הקרובה.',
    category: 'webinar',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    provider: 'youtube',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop',
    duration: 3600, // 1:00:00
    publishedAt: new Date(Date.now() - 1209600000).toISOString(),
    views: 15200,
    speaker: 'דניאל כהן',
    tags: ['webinar', 'growth', 'strategy'],
  },
  {
    id: 'video-4',
    title: 'איך לבנות פיץ׳ מנצח - טיפים מהשטח',
    description: 'המדריך המלא לבניית מצגת משקיעים שתגרום להם לרצות לשמוע עוד.',
    category: 'tutorial',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    provider: 'youtube',
    thumbnail: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800&h=450&fit=crop',
    duration: 1200, // 20:00
    publishedAt: new Date(Date.now() - 2592000000).toISOString(),
    views: 23400,
    speaker: 'מיכל לוי',
    tags: ['tutorial', 'pitch', 'fundraising'],
  },
  {
    id: 'video-5',
    title: 'עדות לקוח: GreenTech Solutions',
    description: 'שמעו מרון גולן, CEO של GreenTech, על החוויה בתוכנית ההאצה.',
    category: 'testimonial',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    provider: 'youtube',
    thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=450&fit=crop',
    duration: 480, // 8:00
    publishedAt: new Date(Date.now() - 3456000000).toISOString(),
    views: 5600,
    speaker: 'רון גולן',
    tags: ['testimonial', 'success-story'],
  },
  {
    id: 'video-6',
    title: 'הייליטס: כנס היזמות 2024',
    description: 'רגעי השיא מכנס היזמות השנתי עם מעל 800 משתתפים.',
    category: 'highlight',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    provider: 'youtube',
    thumbnail: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=450&fit=crop',
    duration: 300, // 5:00
    publishedAt: new Date(Date.now() - 864000000).toISOString(),
    views: 9800,
    tags: ['highlights', 'conference', 'community'],
  },
];

// =============================================================================
// SUCCESS STORIES MOCK DATA
// =============================================================================

export const mockSuccessStories: SuccessStory[] = [
  // =========================================================================
  // VERIFIED TESTIMONIALS — from weccelerate.as7.co.il + Google Reviews
  // =========================================================================
  {
    id: 'story-rotem',
    companyName: 'Gesher',
    quote: 'הגיעו עם כוונות טובות מהרגע הראשון. התחלנו תהליך ביחד, בנינו תוכנית עסקית ופיננסית ותוך 4 חודשים אני כבר אחרי השקעה. ממליץ לכל יזם שרוצה לעבוד עם מקצוענים.',
    personName: 'רותם לוי',
    personRole: 'מייסד',
    industry: 'סטארטאפ',
    metrics: [
      { label: 'זמן להשקעה', value: '4 חודשים' },
    ],
    isFeatured: true,
    collaborationDate: '2024',
  },
  {
    id: 'story-guy',
    companyName: 'Grouping',
    quote: 'מצאתי צוות מקצועי שעוזר לקדם את המיזם. אני יודע מה צריך לעשות אבל לבד אנחנו לא מגיעים לירח. WeCcelerate הם צוות מדהים ומקצועי שלכל אתגר שהצגתי מצאו פתרון.',
    personName: 'גיא שם',
    personRole: 'מייסד',
    industry: 'טכנולוגיה',
    isFeatured: true,
    collaborationDate: '2024',
  },
  {
    id: 'story-ariel',
    companyName: 'Arine',
    quote: 'WeCcelerate נתנו מענה מקיף ממחקר שוק ועד איתור יצרנים ובניית אתר מכירות ושיווק. ממליצה לכל מי שרוצה להגשים את החלום האישי שלו.',
    personName: 'אריאל סנה',
    personRole: 'מייסדת',
    industry: 'מוצר פיזי',
    metrics: [
      { label: 'שירותים', value: 'מחקר → ייצור → שיווק' },
    ],
    isFeatured: true,
    collaborationDate: '2024',
  },
  {
    id: 'story-elad',
    companyName: 'BeChic',
    quote: 'עזרו לי עם תוכנית עסקית, תכנון פיננסי, שיווק, פיתוח הפלטפורמה וגיוס הון. אני מאמין שכל מי שרוצה להצליח צריך ללמוד את השיטה של WeCcelerate.',
    personName: 'אלעד גובס',
    personRole: 'מייסד',
    industry: 'אופנה / E-Commerce',
    metrics: [
      { label: 'שיתוף פעולה', value: '2+ שנים' },
    ],
    isFeatured: true,
    collaborationDate: '2023',
  },
  {
    id: 'story-liraz',
    companyName: 'מיזם טכנולוגי',
    quote: 'ברגישות גדולה מצליחים ללוות מיזמים בדרך להפוך לסטארטאפים מבלי לאבד לרגע את האדם שמאחורי הרעיון. הקשר האישי, היכולת ״לתפור חליפה״ מדויקת לכל מיזם, והנוכחות המעודדת דווקא ברגעי האמת — זה מה שהופך את WeCcelerate למקום מיוחד.',
    personName: 'לירז כהן ביטון',
    personRole: 'יזמת',
    industry: 'טכנולוגיה',
    isFeatured: true,
    collaborationDate: '2025',
  },
  {
    id: 'story-dani',
    companyName: 'M-Lot (נמכרה ב-900M ₪)',
    quote: 'WeCcelerate סייעו לי בגיוס מנהל בכיר למיזם הפרטי שלי. המקצועיות והרשת שלהם בלתי רגילות.',
    personName: 'דני טופז',
    personRole: 'יזם סדרתי, לשעבר CEO M-Lot',
    industry: 'השקעות / סטארטאפ',
    metrics: [
      { label: 'אקזיט קודם', value: '₪900M' },
    ],
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
