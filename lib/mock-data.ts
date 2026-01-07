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
  {
    id: 'news-1',
    title: '🚀 WeCcelerate מכריזה על שותפות אסטרטגית עם קרן ההשקעות הבינלאומית',
    link: '/news/strategic-partnership',
    urgencyLevel: 'breaking',
    createdAt: new Date().toISOString(),
    isPinned: true,
  },
  {
    id: 'news-2',
    title: 'הרשמה פתוחה: תוכנית האצה לסטארטאפים 2025 - מקומות אחרונים!',
    link: '/programs/acceleration-2025',
    urgencyLevel: 'urgent',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'news-3',
    title: 'סיכום אירוע: כנס היזמות השנתי - מעל 500 משתתפים',
    link: '/events/annual-summit-recap',
    urgencyLevel: 'important',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'news-4',
    title: 'חברת פורטפוליו TechVenture גייסה $15M בסבב A',
    link: '/success-stories/techventure',
    urgencyLevel: 'normal',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'news-5',
    title: 'וובינר חינמי: איך לבנות מודל עסקי מנצח - יום ה׳ הקרוב',
    link: '/webinars/business-model',
    urgencyLevel: 'important',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'news-6',
    title: 'WeCcelerate בדירוג 10 מאיצים העסקיים המובילים בישראל',
    urgencyLevel: 'normal',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
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
  {
    id: 'story-1',
    companyName: 'TechVenture',
    logoUrl: '/images/placeholder.svg',
    quote: 'WeCcelerate לא רק עזרו לנו לגייס $15M, הם שינו את הדרך שבה אנחנו חושבים על העסק. המנטורים והרשת שקיבלנו היו קריטיים להצלחה שלנו.',
    projectLink: '/success-stories/techventure',
    personName: 'יוסי לוי',
    personRole: 'מייסד ו-CEO',
    personImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&facepad=2',
    industry: 'Enterprise SaaS',
    metrics: [
      { label: 'גיוס הון', value: '$15M' },
      { label: 'צמיחה שנתית', value: '340%' },
      { label: 'לקוחות', value: '150+' },
    ],
    isFeatured: true,
    collaborationDate: '2023',
  },
  {
    id: 'story-2',
    companyName: 'GreenTech Solutions',
    logoUrl: '/images/placeholder.svg',
    quote: 'התוכנית של WeCcelerate פתחה לנו דלתות שלא ידענו שקיימות. תוך שנה הכפלנו את ההכנסות וחתמנו על חוזה עם לקוח אנקור.',
    projectLink: '/success-stories/greentech',
    personName: 'רון גולן',
    personRole: 'CEO',
    personImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&facepad=2',
    industry: 'CleanTech',
    metrics: [
      { label: 'הכנסות', value: 'x2' },
      { label: 'עובדים', value: '25→60' },
      { label: 'שווקים', value: '3 מדינות' },
    ],
    isFeatured: true,
    collaborationDate: '2022',
  },
  {
    id: 'story-3',
    companyName: 'HealthFlow',
    logoUrl: '/images/placeholder.svg',
    quote: 'הליווי הצמוד והקשרים של WeCcelerate עזרו לנו להיכנס לשוק הבריאות הדיגיטלית בצורה חלקה וממוקדת.',
    projectLink: '/success-stories/healthflow',
    personName: 'ד״ר שרה כהן',
    personRole: 'Co-Founder & CTO',
    personImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&facepad=2',
    industry: 'HealthTech',
    metrics: [
      { label: 'משתמשים', value: '50K+' },
      { label: 'שותפויות', value: '12 בתי חולים' },
    ],
    collaborationDate: '2023',
  },
  {
    id: 'story-4',
    companyName: 'RetailAI',
    logoUrl: '/images/placeholder.svg',
    quote: 'בזכות WeCcelerate הצלחנו למצוא את המפעל המושלם בסין ולהשיק את המוצר שלנו ב-6 חודשים במקום שנתיים.',
    projectLink: '/success-stories/retailai',
    personName: 'אבי מזרחי',
    personRole: 'Founder',
    personImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&facepad=2',
    industry: 'Retail Technology',
    metrics: [
      { label: 'זמן להשקה', value: '-70%' },
      { label: 'חיסכון בעלויות', value: '45%' },
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
