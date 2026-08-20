// =============================================================================
// CASE STUDIES — Real ventures we accompanied, shown inside service pages
// Source of truth for the copy: overview.wecc-ltd.com + factories.wecc-ltd.com
// =============================================================================

export interface CaseMetric {
  value: string;
  label: string;
  labelEn: string;
}

export interface CaseLink {
  label: string;
  labelEn: string;
  href: string;
  /** press = news article, site = product website, campaign = crowdfunding */
  kind: 'press' | 'site' | 'campaign';
}

export interface CaseStudy {
  id: string;
  /** Service page ids this case is shown on */
  services: string[];
  /** Brand / venture name */
  name: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  /** What WeCcelerate actually did — "הדרך להצלחה" */
  process: string;
  processEn: string;
  /** Headline result badge */
  highlight?: string;
  highlightEn?: string;
  metrics?: CaseMetric[];
  /** YouTube video id */
  videoId?: string;
  images?: string[];
  links?: CaseLink[];
}

export interface PressItem {
  services: string[];
  title: string;
  titleEn: string;
  source: string;
  sourceColor: string;
  image: string;
  url: string;
}

// ---------------------------------------------------------------------------
// CASE STUDIES
// ---------------------------------------------------------------------------

export const caseStudies: CaseStudy[] = [
  {
    id: 'knotix',
    services: ['physical-product', 'business-consulting', 'investors', 'investor-preparation'],
    name: 'KNOTIX',
    title: 'גגון מתקפל אוניברסלי לרכב',
    titleEn: 'Universal folding roof rack',
    description:
      'גגון חדשני ומתקפל שמתאים לכל סוגי הרכבים, מושלם לספורט, טיולים והרפתקאות.',
    descriptionEn:
      'A folding roof rack that fits any vehicle — built for sports, travel and adventure.',
    process:
      'ליווינו את היזמים משלב הרעיון הראשוני, דרך בניית תוכנית עסקית מקיפה ופיתוח המוצר, ועד להצלחה מרשימה בשתי פלטפורמות גיוס המונים מובילות.',
    processEn:
      'We accompanied the founders from the initial idea, through a full business plan and product development, to a standout result on two leading crowdfunding platforms.',
    highlight: 'אקזיט במיליוני דולרים — החברה נמכרה לחברה גדולה בתחום הרכב',
    highlightEn: 'A multi-million dollar exit — acquired by a major automotive company',
    metrics: [
      { value: '$93,536', label: 'Indiegogo · 258 תומכים', labelEn: 'Indiegogo · 258 backers' },
      { value: '$88,125', label: 'Kickstarter · 245 תומכים', labelEn: 'Kickstarter · 245 backers' },
      { value: '$181,661', label: 'סה״כ גיוס בקמפיינים', labelEn: 'Total raised in campaigns' },
    ],
    videoId: 'PTAJmcPl0Tw',
    images: [
      '/images/cases/success1b.png',
      '/images/cases/knotix-hero.jpg',
      '/images/cases/success1a.png',
    ],
    links: [
      {
        label: 'Kickstarter',
        labelEn: 'Kickstarter',
        href: 'https://www.kickstarter.com/projects/gilad91/knotix-the-universal-adventure-roof-rack',
        kind: 'campaign',
      },
      {
        label: 'Indiegogo',
        labelEn: 'Indiegogo',
        href: 'https://www.indiegogo.com/projects/knotix-the-universal-adventure-roof-rack',
        kind: 'campaign',
      },
      {
        label: 'אתר המוצר',
        labelEn: 'Product site',
        href: 'https://comingsoon.co/products/knotix/',
        kind: 'site',
      },
    ],
  },
  {
    id: 'bubl',
    services: ['physical-product', 'marketing'],
    name: 'BUBL',
    title: 'אבקת הפלא לשירותים',
    titleEn: 'The wonder powder for the bathroom',
    description:
      'מוצר חדשני בתחום הניקיון וההיגיינה הביתית, המבוסס על אבקה היוצרת במגע עם מים שכבת קצף קשיחה ורב-תכליתית. הקצף מבטל השפרצות מים, מנטרל ריחות רעים, מחטא את דפנות האסלה ומותיר ריח נעים לאורך זמן.',
    descriptionEn:
      'A home-hygiene innovation: a powder that forms a firm multi-purpose foam layer on contact with water — stopping splashes, neutralising odours and disinfecting the bowl.',
    process:
      'ליווי החל משלב הרעיון, תכנון וחשיבה על המוצר, פיתוח בישראל וביצוע פיילוט, הקמת פס ייצור בסין, חדירה לשוק בארה״ב ומכירה באמזון, וליווי בכתיבת פטנטים.',
    processEn:
      'From the idea and product planning, through development and a pilot in Israel, setting up a production line in China, entering the US market and selling on Amazon, plus patent-writing support.',
    highlight: 'השקה מוצלחת בשווקים בינלאומיים',
    highlightEn: 'A successful launch in international markets',
    metrics: [
      { value: '150K+', label: 'יחידות שנמכרו', labelEn: 'Units sold' },
      { value: 'Amazon', label: 'מכירה בשוק האמריקאי', labelEn: 'Selling in the US market' },
    ],
    videoId: 'HJwI2ppyanY',
    images: [
      '/images/cases/bubl-pack.png',
      '/images/cases/success2a.jpg',
      '/images/cases/success2b.jpg',
      '/images/cases/bubl-bag.png',
    ],
    links: [
      {
        label: 'כתבה ב-ynet',
        labelEn: 'ynet feature',
        href: 'https://www.ynet.co.il/economy/article/rkcqz63dkg',
        kind: 'press',
      },
      { label: 'אתר ישראל', labelEn: 'Israel site', href: 'https://ububl.co.il/', kind: 'site' },
      { label: 'אתר ארה״ב', labelEn: 'US site', href: 'https://ububl.com/', kind: 'site' },
    ],
  },
  {
    id: 'paytag',
    services: ['physical-product', 'digital-product', 'business-consulting'],
    name: 'PayTag',
    title: 'עמדת תשלום עצמאית לחנויות אופנה',
    titleEn: 'Self-checkout station for fashion stores',
    description:
      'מערכת תשלום חכמה ועצמאית המאפשרת ללקוחות לשלם עבור רכישות בחנויות אופנה בצורה מהירה ונוחה, ללא צורך בתור לקופה. המערכת משלבת טכנולוגיית NFC מתקדמת עם אפליקציה ידידותית למשתמש.',
    descriptionEn:
      'A smart self-service payment system that lets shoppers pay in fashion stores without queueing at the register — advanced NFC hardware paired with a friendly mobile app.',
    process:
      'ליווינו את PayTag משלב הרעיון: בניית תוכנית עסקית, עזרה בכתיבת פטנט, פיתוח האפליקציה והתאמת פיתוח המוצר, גיוסי כספים ועוד. ניתן לראות את המערכות פרוסות בחלק מהסניפים.',
    processEn:
      'We joined PayTag at the idea stage: business plan, patent-writing support, app development and product adaptation, fundraising and more. The stations are deployed in stores today.',
    highlight: 'פריסה אצל רשתות מובילות — רנואר, אדידס ועוד',
    highlightEn: 'Deployed at leading chains — Renuar, Adidas and more',
    videoId: 'odJV5IFjQiY',
    images: [
      '/images/cases/paytag-station.jpg',
      '/images/cases/success3a.png',
      '/images/cases/success3b.png',
    ],
    links: [
      {
        label: 'כתבה ב-mako',
        labelEn: 'mako feature',
        href: 'https://www.mako.co.il/nexter-news/Article-9da4c9b80da5681027.htm',
        kind: 'press',
      },
      {
        label: 'כתבה ב-CTech',
        labelEn: 'CTech feature',
        href: 'https://www.calcalistech.com/ctechnews/article/5i583v2fg',
        kind: 'press',
      },
      {
        label: 'אתר המוצר',
        labelEn: 'Product site',
        href: 'https://www.smplct.co.il/projects/branding/paytag/',
        kind: 'site',
      },
    ],
  },
  {
    id: 'medtech-founder',
    services: ['medtech-leumit', 'business-consulting', 'investor-preparation', 'investors'],
    name: 'סימביוזיס',
    title: 'הרופאה-יזמית שסדקה את תקרת הזכוכית',
    titleEn: 'The physician-founder who broke the glass ceiling',
    description:
      'מיזם רפואי בהובלת יזמיות, שנדרש להיערכות רגולטורית מול ה-FDA ולחומרים עסקיים ברמה בינלאומית לקראת סבבי גיוס.',
    descriptionEn:
      'A physician-led medical venture that needed FDA-grade regulatory groundwork and investor-ready business materials ahead of its funding rounds.',
    process:
      'ליווי בהעמקת התוכנית העסקית מהסבב הראשון ($400K), ייעוץ רגולטורי עם ד״ר סוזן אלפרט מה-FDA והערכת שווי. בזכות החומרים העסקיים היזמיות סיימו סבב גיוס של 1M$ והכניסו מנכ״ל שבתפקידו הקודם ניהל חברה בנאסד״ק — עד לגיוסים של מעל 5M$ והכנה לשוק הבינלאומי.',
    processEn:
      'Deepening the business plan from the first ($400K) round, regulatory consulting with Dr. Susan Alpert (ex-FDA) and a valuation. On the strength of those materials the founders closed a $1M round and brought in a CEO who previously ran a Nasdaq-listed company — reaching over $5M raised and preparation for international markets.',
    highlight: 'מעל 5M$ גיוסים והכנה לשוק הבינלאומי',
    highlightEn: 'Over $5M raised and readiness for international markets',
    metrics: [
      { value: '$400K', label: 'סבב ראשון', labelEn: 'First round' },
      { value: '$1M', label: 'סבב נוסף', labelEn: 'Follow-on round' },
      { value: '$5M+', label: 'סה״כ גיוסים', labelEn: 'Total raised' },
    ],
    images: [
      '/images/cases/medtech-1.jpg',
      '/images/cases/medtech-2.jpg',
      '/images/cases/medtech-3.jpg',
    ],
    links: [
      {
        label: 'כתבה ב-Calcalist360',
        labelEn: 'Calcalist360 feature',
        href: 'https://calcalist360.webflow.io/articles/shira-burg',
        kind: 'press',
      },
    ],
  },
  {
    id: 'gigs-app',
    services: ['digital-product', 'marketing'],
    name: 'Job2day',
    title: 'המורה שהקים מרקטפלייס לעבודות מזדמנות',
    titleEn: 'The teacher who built a marketplace for gig work',
    description:
      'יעקב וייס היה מחנך בתלמוד תורה שחיפש השלמת הכנסה, וזיהה פער: מעסיקים במסעדנות ובמלונאות זקוקים לעובדי תגבור כל הזמן, חברות כוח אדם עולות 90-100 ₪ לשעה ולא מספקות עובד בודד או פתרון למשק בית. Job2day היא פלטפורמת מרקטפלייס שמחברת ישירות בין השניים.',
    descriptionEn:
      'Yaakov Weiss was a teacher looking for extra income when he spotted the gap: restaurants and hotels constantly need surge staff, while staffing agencies cost ₪90-100 an hour and will not supply a single worker or serve a household. Job2day is a marketplace connecting the two directly.',
    process:
      'משלב הרעיון: בניית חומרים עסקיים, פיתוח האפליקציה, גיוס כספים, גיוס מנכ״לית, יחסי ציבור, שיווק בפועל וסגירת חוזים גדולים.',
    processEn:
      'From the idea onward: business materials, app development, fundraising, recruiting a CEO, PR, hands-on marketing and closing major contracts.',
    highlight: 'חוזים עם מלונות פתאל, קפה אילנס ופיצה האט נתב״ג',
    highlightEn: 'Contracts with Fattal Hotels, Ilan’s Coffee and Pizza Hut (Ben Gurion Airport)',
    images: [
      '/images/cases/job2day-2.jpg',
      '/images/cases/job2day-4.jpg',
      '/images/cases/job2day-3.jpg',
      '/images/cases/job2day-founder.jpg',
    ],
    links: [
      {
        label: 'כתבה ב-mako',
        labelEn: 'mako feature',
        href: 'https://www.mako.co.il/nexter-news/Article-a9c18474cb62e91026.htm',
        kind: 'press',
      },
    ],
  },
  {
    id: 'signmt',
    services: ['business-consulting', 'digital-product', 'investors', 'investor-preparation'],
    name: 'Sign.mt',
    title: 'פתרונות שפת סימנים מבוססי AI — עד לאקזיט',
    titleEn: 'AI sign-language solutions — through to exit',
    description:
      'מיזם טכנולוגי בתחום הנגישות, שפיתח פתרונות תרגום לשפת סימנים מבוססי בינה מלאכותית ונרכש על ידי Nagish.',
    descriptionEn:
      'An accessibility-tech venture building AI-based sign-language translation, acquired by Nagish.',
    process:
      'ליווי המיזם במודל עסקי ותוכנית עסקית, חיבור למשקיעים וחיבור דיזיין-פרטנר (אל על) לביצוע פיילוט בשלבים מתקדמים — עד לאקזיט ורכישה ע״י Nagish.',
    processEn:
      'Business model and business plan, investor introductions and a design partner (El Al) for an advanced-stage pilot — through to the exit and acquisition by Nagish.',
    highlight: 'אקזיט — נרכשה על ידי Nagish',
    highlightEn: 'Exit — acquired by Nagish',
    images: [
      'https://pic1.calcalist.co.il/picserver3/crop_images/2025/10/27/BkeyoICn0xg/BkeyoICn0xg_0_0_1152_640_0_large.jpg',
    ],
    links: [
      {
        label: 'כתבה ב-CTech',
        labelEn: 'CTech feature',
        href: 'https://www.calcalistech.com/ctechnews/article/ulk1mr595',
        kind: 'press',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// PRESS — "יזמים בכותרות"
// ---------------------------------------------------------------------------

export const pressItems: PressItem[] = [
  {
    services: ['marketing', 'digital-product', 'business-consulting'],
    title: 'פייטאג רוצה לשנות את הדרך שבה אנחנו קונים בחנות',
    titleEn: 'PayTag wants to change the way we shop in stores',
    source: 'CTech',
    sourceColor: '#e8434e',
    image:
      'https://pic1.calcalist.co.il/picserver3/crop_images/2026/01/12/SkCdB2zBWl/SkCdB2zBWl_0_361_942_530_0_large.jpg',
    url: 'https://www.calcalistech.com/ctechnews/article/5i583v2fg',
  },
  {
    services: ['marketing', 'digital-product'],
    title: 'היזם שרוצה לפתור את מצוקת העובדים',
    titleEn: 'The founder taking on the staffing shortage',
    source: 'mako',
    sourceColor: '#ff3b3b',
    image: 'https://img.mako.co.il/2026/05/14/YAKOV_autoOrient_i.jpg',
    url: 'https://www.mako.co.il/nexter-news/Article-a9c18474cb62e91026.htm',
  },
  {
    services: ['marketing', 'business-consulting', 'investors'],
    title: 'Nagish רכשה את Sign.mt לקידום פתרונות שפת סימנים מבוססי AI',
    titleEn: 'Nagish acquires Sign.mt to advance AI sign-language solutions',
    source: 'CTech',
    sourceColor: '#e8434e',
    image:
      'https://pic1.calcalist.co.il/picserver3/crop_images/2025/10/27/BkeyoICn0xg/BkeyoICn0xg_0_0_1152_640_0_large.jpg',
    url: 'https://www.calcalistech.com/ctechnews/article/ulk1mr595',
  },
  {
    services: ['marketing', 'medtech-leumit', 'investor-preparation'],
    title: 'הרופאה-יזמית שסדקה את תקרת הזכוכית',
    titleEn: 'The physician-founder who broke the glass ceiling',
    source: 'Calcalist360',
    sourceColor: '#c5a059',
    image:
      'https://cdn.prod.website-files.com/623e41e1f88efb16cda26216/6408562da0d6de4156d594f2_OL7A4832_1-01.jpg',
    url: 'https://calcalist360.webflow.io/articles/shira-burg',
  },
  {
    services: ['marketing', 'medtech-leumit', 'investor-preparation'],
    title: 'הדור הבא של המסתמים',
    titleEn: 'The next generation of heart valves',
    source: 'TheMarker',
    sourceColor: '#00a0e3',
    image:
      'https://img.haarets.co.il/bs/00000194-1c50-dc42-afbc-3cf7356f0000/48/be/ee90c3e44792b7d75fa459bb5fa0/59847390.JPG?&width=740',
    url: 'https://www.themarker.com/labels/innovation/2025-01-02/ty-article-labels/00000194-1c50-dc42-afbc-3cf736280000',
  },
  {
    services: ['marketing', 'physical-product'],
    title: 'המצאה ישראלית חדשה: סוף לבושה בשירותים הציבוריים',
    titleEn: 'A new Israeli invention: no more embarrassment in public restrooms',
    source: 'ynet',
    sourceColor: '#cf0a2c',
    image:
      'https://ynet-pic1.yit.co.il/cdn-cgi/image/f=auto,w=740,q=75/picserver6/crop_images/2025/01/21/SyEJ0Thhvke/SyEJ0Thhvke_33_105_1843_1037_0_x-large.jpg',
    url: 'https://www.ynet.co.il/economy/article/rkcqz63dkg',
  },
  {
    services: ['marketing', 'physical-product'],
    title: 'המוצר שימנע ממך את כל הפאדיחות בשירותים',
    titleEn: 'The product that saves you every restroom embarrassment',
    source: 'mako',
    sourceColor: '#ff3b3b',
    image: 'https://img.mako.co.il/2022/07/18/loren_autoOrient_g.jpg',
    url: 'https://www.mako.co.il/women-magazine/diva/Article-afba16efb111281026.htm',
  },
  {
    services: ['marketing', 'digital-product'],
    title: 'הסטארטאפ שרוצה להפסיק את התורים בחנויות הבגדים',
    titleEn: 'The startup that wants to end the queues in clothing stores',
    source: 'mako',
    sourceColor: '#ff3b3b',
    image:
      'https://img.mako.co.il/2023/02/16/039f69a3-5547-48f5-9d9b-4d6fbc106751_autoOrient_i.jpg',
    url: 'https://www.mako.co.il/nexter-news/Article-9da4c9b80da5681027.htm',
  },
];

// ---------------------------------------------------------------------------
// LOOKUPS
// ---------------------------------------------------------------------------

export function getCaseStudies(serviceId: string): CaseStudy[] {
  return caseStudies.filter((c) => c.services.includes(serviceId));
}

export function getPressItems(serviceId: string): PressItem[] {
  return pressItems.filter((p) => p.services.includes(serviceId));
}
