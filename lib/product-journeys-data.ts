// =============================================================================
// PRODUCT JOURNEYS — one real product walked stage by stage through the
// service's own pipeline. These replace the generic AI-render process panels.
//
// Every stage image is a real photograph of the real product or venture.
// Stages with no photograph carry no image on purpose — they render as a
// designed card rather than being illustrated with stock art.
// =============================================================================

export interface JourneyStage {
  /** Short label for the stepper */
  label: string;
  labelEn: string;
  title: string;
  titleEn: string;
  /** What WeCcelerate actually did for THIS product at THIS stage */
  text: string;
  textEn: string;
  /** Local path, or an external URL (rendered with a plain img) */
  image?: string;
  /** 'contain' for product cutouts on a white tile; defaults to 'cover' */
  fit?: 'cover' | 'contain';
  videoId?: string;
  metric?: string;
  metricLabel?: string;
  metricLabelEn?: string;
}

export interface ProductJourney {
  services: string[];
  /** Matching entry in caseStudies */
  caseId: string;
  name: string;
  tagline: string;
  taglineEn: string;
  stages: JourneyStage[];
}

export const productJourneys: ProductJourney[] = [
  {
    services: ['physical-product'],
    caseId: 'bubl',
    name: 'BUBL',
    tagline: 'אבקת הפלא לשירותים — מרעיון על נייר ועד מדף באמזון',
    taglineEn: 'From an idea on paper to a shelf on Amazon',
    stages: [
      {
        label: 'רעיון',
        labelEn: 'Idea',
        title: 'רעיון ותכנון המוצר',
        titleEn: 'Idea and product planning',
        text: 'התחלנו מהשאלה אם בכלל אפשר: אבקה שבמגע עם מים יוצרת שכבת קצף קשיחה. הגדרנו את קהל היעד, את חומרי הגלם ואת הקונספט שאפשר לייצר בעלות סבירה.',
        textEn:
          'We started from whether it was even possible: a powder that forms a firm foam layer on contact with water. We defined the audience, the raw materials, and a concept that could actually be manufactured at a sane cost.',
        image: '/images/cases/bubl-pack.png',
        fit: 'contain',
      },
      {
        label: 'פיתוח',
        labelEn: 'Development',
        title: 'פיתוח ובדיקות מעבדה',
        titleEn: 'Development and lab testing',
        text: 'הפיתוח והפיילוט בוצעו בישראל, ובדיקות ההיתכנות הכימית נעשו מול המעבדה של המפעל. כאן נסגרו הפורמולה, הריח ומשך העמידות של הקצף.',
        textEn:
          'Development and the pilot ran in Israel, with chemical feasibility testing against the factory lab. This is where the formula, the scent and the foam staying power were locked.',
        image: '/images/cases/success2a.jpg',
      },
      {
        label: 'ייצור',
        labelEn: 'Manufacturing',
        title: 'הקמת פס ייצור בסין',
        titleEn: 'Setting up a production line in China',
        text: 'איתרנו את המפעל וליווינו את הקמת פס הייצור ואת בקרת האיכות. זה ההבדל בין מוצר שעובד במעבדה לבין מוצר שאפשר לייצר בכמויות ובמחיר שמשאיר רווח.',
        textEn:
          'We sourced the factory and oversaw the production line and quality control — the difference between a product that works in a lab and one you can make at volume, at a price that leaves a margin.',
        image: '/images/cases/success2b.jpg',
      },
      {
        label: 'שוק',
        labelEn: 'Market',
        title: 'חדירה לשוק האמריקאי',
        titleEn: 'Entering the US market',
        text: 'השקה בישראל ובארה״ב, מכירה באמזון וליווי בכתיבת פטנטים. מעל 150,000 יחידות נמכרו, והמוצר סוקר ב-ynet.',
        textEn:
          'Launch in Israel and the US, selling on Amazon, plus patent-writing support. Over 150,000 units sold, with coverage on ynet.',
        videoId: 'HJwI2ppyanY',
        metric: '150K+',
        metricLabel: 'יחידות שנמכרו',
        metricLabelEn: 'Units sold',
      },
    ],
  },
  {
    services: ['digital-product'],
    caseId: 'paytag',
    name: 'PayTag',
    tagline: 'עמדת תשלום עצמאית — מרעיון ועד לרנואר ואדידס',
    taglineEn: 'A self-checkout station — from idea to Renuar and Adidas',
    stages: [
      {
        label: 'אפיון',
        labelEn: 'Spec',
        title: 'רעיון, תוכנית עסקית ואפיון',
        titleEn: 'Idea, business plan and spec',
        text: 'הצטרפנו בשלב הרעיון. בנינו תוכנית עסקית מסודרת ואפיון שהגדיר בדיוק מה נבנה — עמדה פיזית ואפליקציה שעובדות יחד — לפני שנכתבה שורת קוד אחת.',
        textEn:
          'We joined at the idea stage, building a proper business plan and a spec that defined exactly what would be built — a physical station and an app working together — before a line of code was written.',
        image: '/images/cases/paytag-station.jpg',
      },
      {
        label: 'פטנט',
        labelEn: 'Patent',
        title: 'כתיבת פטנטים',
        titleEn: 'Patent writing',
        text: 'ליווינו את כתיבת הפטנטים על המוצר. במוצר שמשלב חומרה, NFC ואפליקציה — ההגנה על הקניין הרוחני היא מה שהופך אותו לנכס שאפשר לגייס עליו.',
        textEn:
          'We supported the patent writing. In a product combining hardware, NFC and an app, the IP protection is what turns it into an asset you can raise on.',
        image: '/images/cases/success3a.png',
      },
      {
        label: 'פיתוח',
        labelEn: 'Build',
        title: 'פיתוח האפליקציה והמוצר',
        titleEn: 'App and product development',
        text: 'פיתוח האפליקציה והתאמת פיתוח המוצר, לצד גיוסי כספים. התוצאה: לקוח סורק את הבגד, משלם בטלפון ומסיים לבד — בלי תור לקופה.',
        textEn:
          'App development and product adaptation alongside fundraising. The result: a shopper scans the garment, pays on their phone and finishes on their own — no queue at the register.',
        videoId: 'odJV5IFjQiY',
      },
      {
        label: 'פריסה',
        labelEn: 'Rollout',
        title: 'פריסה ברשתות מובילות',
        titleEn: 'Rollout at leading chains',
        text: 'המערכות פרוסות היום בסניפים של רנואר ואדידס. mako כתבו על החברה, וציינו במפורש את הליווי שלנו משלב הרעיון ועד הפיילוט.',
        textEn:
          'The stations are deployed today in Renuar and Adidas branches. mako covered the company and explicitly named our support from idea through pilot.',
        image: '/images/cases/success3b.png',
      },
    ],
  },
  {
    services: ['business-consulting'],
    caseId: 'knotix',
    name: 'KNOTIX',
    tagline: 'גגון מתקפל לרכב — מתוכנית עסקית ועד אקזיט',
    taglineEn: 'A folding roof rack — from a business plan to an exit',
    stages: [
      {
        label: 'תוכנית',
        labelEn: 'Plan',
        title: 'תוכנית עסקית מקיפה',
        titleEn: 'A full business plan',
        text: 'ליווינו את היזמים משלב הרעיון הראשוני. תוכנית עסקית מקיפה — שוק, תמחור, מודל ייצור ואבני דרך — היא מה שהפך רעיון לגגון למשהו שאפשר להציג ולגייס עליו.',
        textEn:
          'We joined at the initial idea. A full business plan — market, pricing, manufacturing model and milestones — is what turned a roof-rack idea into something you can pitch and raise on.',
        image: '/images/cases/knotix-hero.jpg',
        fit: 'contain',
      },
      {
        label: 'מוצר',
        labelEn: 'Product',
        title: 'פיתוח המוצר',
        titleEn: 'Product development',
        text: 'גגון מתקפל שמתאים לכל רכב בעל 4 דלתות ונסגר בשניות. מוצר שצריך לעמוד בהבטחה שלו מול מצלמה — כי קמפיין גיוס המונים הוא הדגמה חיה.',
        textEn:
          'A folding rack that fits any 4-door car and closes in seconds. A product that has to hold up on camera — a crowdfunding campaign is a live demo.',
        image: '/images/cases/success1b.png',
      },
      {
        label: 'גיוס',
        labelEn: 'Raise',
        title: 'שני קמפיינים של גיוס המונים',
        titleEn: 'Two crowdfunding campaigns',
        text: 'הצלחה בשתי פלטפורמות במקביל: $93,536 באינדיגוגו מ-258 תומכים, ו-$88,125 בקיקסטארטר מ-245 תומכים — $181,661 בסך הכול, וזה רק חלק מהסכומים שגויסו.',
        textEn:
          'Success on both platforms at once: $93,536 on Indiegogo from 258 backers and $88,125 on Kickstarter from 245 backers — $181,661 in total, and that is only part of what was raised.',
        image: '/images/cases/success1a.png',
        metric: '$181,661',
        metricLabel: 'גויס בקמפיינים',
        metricLabelEn: 'Raised in campaigns',
      },
      {
        label: 'אקזיט',
        labelEn: 'Exit',
        title: 'אקזיט במיליוני דולרים',
        titleEn: 'A multi-million dollar exit',
        text: 'החברה נמכרה לחברה גדולה ומוכרת בתחום הרכב. זו הנקודה שאליה תוכנית עסקית טובה אמורה להוביל — לא למסמך יפה, אלא לקונה.',
        textEn:
          'The company was acquired by a large, well-known automotive company. That is where a good business plan is supposed to lead — not to a pretty document, but to a buyer.',
        videoId: 'PTAJmcPl0Tw',
      },
    ],
  },
  {
    services: ['marketing'],
    caseId: 'bubl',
    name: 'BUBL',
    tagline: 'איך מוצר ניקיון הגיע לכותרות של ynet ו-mako',
    taglineEn: 'How a cleaning product made the ynet and mako headlines',
    stages: [
      {
        label: 'סיפור',
        labelEn: 'Story',
        title: 'למצוא את הזווית',
        titleEn: 'Finding the angle',
        text: 'אבקת ניקוי היא לא סיפור. "סוף לבושה בשירותים הציבוריים" הוא סיפור. העבודה הראשונה בשיווק היא לנסח את המוצר במונחים של הבעיה האנושית שהוא פותר.',
        textEn:
          'A cleaning powder is not a story. "No more embarrassment in public restrooms" is a story. The first job in marketing is to frame the product in terms of the human problem it solves.',
        image: '/images/cases/bubl-bag.png',
        fit: 'contain',
      },
      {
        label: 'הדגמה',
        labelEn: 'Demo',
        title: 'תוכן שמראה במקום להסביר',
        titleEn: 'Content that shows instead of explaining',
        text: 'המוצר הזה מוכר את עצמו בשלוש שניות של וידאו. בנינו את חומרי השיווק סביב ההדגמה החזותית — מה קורה לאסלה לפני ואחרי.',
        textEn:
          'This product sells itself in three seconds of video. We built the marketing assets around the visual demo — what the bowl looks like before and after.',
        videoId: 'HJwI2ppyanY',
      },
      {
        label: 'יח״צ',
        labelEn: 'PR',
        title: 'סיקור בתקשורת הארצית',
        titleEn: 'National media coverage',
        text: 'ynet פרסמו כתבה תחת הכותרת "המצאה ישראלית חדשה: סוף לבושה בשירותים הציבוריים", ו-mako סיקרו גם הם. סיקור מערכתי נותן למוצר חדש אמינות שפרסום בתשלום לא קונה.',
        textEn:
          'ynet ran a feature titled "A new Israeli invention: no more embarrassment in public restrooms", and mako covered it too. Editorial coverage buys a new product credibility that paid media cannot.',
        image:
          'https://ynet-pic1.yit.co.il/cdn-cgi/image/f=auto,w=740,q=75/picserver6/crop_images/2025/01/21/SyEJ0Thhvke/SyEJ0Thhvke_33_105_1843_1037_0_x-large.jpg',
      },
      {
        label: 'מכירות',
        labelEn: 'Sales',
        title: 'מהכותרות למדף',
        titleEn: 'From headlines to the shelf',
        text: 'הסיקור תורגם למכירות בפועל — בישראל, ובשוק האמריקאי דרך אמזון. מעל 150,000 יחידות נמכרו.',
        textEn:
          'The coverage translated into actual sales — in Israel and, through Amazon, in the US. Over 150,000 units sold.',
        image: '/images/cases/success2b.jpg',
        metric: '150K+',
        metricLabel: 'יחידות שנמכרו',
        metricLabelEn: 'Units sold',
      },
    ],
  },
];

export function getProductJourney(serviceId: string): ProductJourney | undefined {
  return productJourneys.find((j) => j.services.includes(serviceId));
}
