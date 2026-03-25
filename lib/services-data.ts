// =============================================================================
// SERVICE DATA — Shared between ServiceEcosystem (client) and /services/[id] (server)
// =============================================================================

export interface ServiceSection {
  title: string;
  text: string;
  image?: string;
}

export interface Service {
  id: string;
  title: string;
  shortDescription: string;
  isPremium: boolean;
  imageSrc: string;
  fullContent: {
    intro: string;
    sections: ServiceSection[];
  };
}

// ---------------------------------------------------------------------------
// HEBREW
// ---------------------------------------------------------------------------

export const servicesHe: Service[] = [
  {
    id: 'business-consulting',
    title: 'ייעוץ עסקי ואסטרטגי',
    shortDescription:
      'תדעו בדיוק לאן אתם הולכים — עם תוכנית עסקית חדה, מודל פיננסי שמשכנע משקיעים, ומצגת שגורמת להם להוציא צ׳ק.',
    isPremium: false,
    imageSrc: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    fullContent: {
      intro: 'תפסיקו לנחש ותתחילו לדעת. תוכנית ברורה שמביאה ביטחון, משקיעים וצמיחה.',
      sections: [
        {
          title: 'מחקר שוק וסקרי צרכנים',
          text: 'תקבלו תמונה מדויקת של השוק — מי המתחרים, מה הלקוחות באמת רוצים ואיפה ההזדמנות שלכם. ניתוח שנותן לכם יתרון תחרותי ברור.',
        },
        {
          title: 'תוכנית שיווקית',
          text: 'תגיעו ללקוחות הנכונים בזמן הנכון. מפת דרכים שמראה בדיוק איך להשיג את היעדים ולהפוך תקציב שיווק לתוצאות.',
        },
        {
          title: 'תוכנית פיננסית',
          text: 'תבינו בדיוק כמה כסף צריך, מתי תגיעו לרווחיות ומה ה-ROI שמשקיעים רוצים לראות. מספרים שפותחים דלתות.',
        },
        {
          title: 'מצגת משקיעים (Pitch Deck)',
          text: 'תעשו רושם ב-10 דקות. מצגת שמספרת את הסיפור שלכם בצורה שגורמת למשקיעים לרצות להיות חלק מההצלחה.',
        },
        {
          title: 'תקציר מנהלים (One Pager)',
          text: 'עמוד אחד שפותח דלתות. המסמך שמשקיעים קוראים ראשון ומחליטים אם להמשיך — שלכם יגרום להם לרצות עוד.',
        },
        {
          title: 'הכנה למשקיעים וליווי בתהליך השקעה',
          text: 'תיכנסו לפגישות עם ביטחון מלא. תרגול Pitch, הכנה לשאלות קשות וחיבור ישיר למשקיעים שמתאימים בדיוק למיזם שלכם.',
        },
        {
          title: 'תוכנית עסקית',
          text: 'המסמך שגורם למשקיעים לחתום. תוכנית מפורטת שמראה שאתם יודעים מה אתם עושים — תמחור, צוות, חדירה לשוק ואבני דרך ברורות.',
        },
      ],
    },
  },
  {
    id: 'physical-product',
    title: 'פיתוח מוצר פיזי',
    shortDescription:
      'תהפכו רעיון למוצר אמיתי שעומד על המדף. שתי דרכים להגיע לשם — פיתוח מ-0 או קיצור דרך חכם דרך מפעלים בעולם.',
    isPremium: false,
    imageSrc: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
    fullContent: {
      intro: 'חברה מוכרת כחברת מו"פ ע"י רשות החדשנות. שתי שיטות פיתוח שמביאות את המוצר שלכם לשוק — מהר, נכון ובתקציב.',
      sections: [
        {
          title: 'שיטה מסורתית — פיתוח מ-0',
          text: 'שליטה מלאה על כל פרט. מהרעיון דרך תכנון הנדסי ועיצוב תעשייתי, עד מוצר מוגמר שמוכן לייצור המוני.',
        },
        {
          title: 'שיטה מקצרת — איתור מפעלים וספקים בעולם',
          text: 'תחסכו חודשים ומאות אלפי שקלים. מפעלים וספקים מוכחים בעולם שמייצרים לפי הדרישות שלכם — מהר ובעלות נמוכה משמעותית.',
        },
        {
          title: 'תכנון הנדסי ועיצוב',
          text: 'תקבלו שרטוטים מקצועיים והדמיות 3D שמראים בדיוק איך המוצר ייראה — מוכן להצגה למשקיעים ולייצור.',
        },
        {
          title: 'בניית אב טיפוס (Prototyping)',
          text: 'תחזיקו את המוצר ביד לפני שמשקיעים שקל אחד בייצור. אב-טיפוס שמוכיח היתכנות ומרשים משקיעים.',
        },
        {
          title: 'ייצור המוני',
          text: 'תגיעו למדפים. תיק מוצר מלא, פסי ייצור מתוכננים ומוצר מוכן למכירה בכמויות.',
        },
      ],
    },
  },
  {
    id: 'digital-product',
    title: 'פיתוח מוצר דיגיטלי',
    shortDescription:
      'תשיקו אפליקציה או מערכת שמשתמשים אוהבים. מעיצוב שמנצח, דרך קוד יציב, ועד הורדות בחנויות.',
    isPremium: false,
    imageSrc: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
    fullContent: {
      intro: 'מרעיון למוצר דיגיטלי חי — עם משתמשים אמיתיים והכנסות.',
      sections: [
        {
          title: 'Design & UX/UI',
          text: 'תקבלו מותג שנראה כמו חברה בוגרת מיום ראשון. לוגו, ספר מותג וחווית משתמש שגורמים ללקוחות להישאר.',
        },
        {
          title: 'אפיון טכני',
          text: 'תחסכו עשרות אלפי שקלים בטעויות פיתוח. מסמך אפיון מדויק שמגדיר בדיוק מה נבנה, בכמה זמן ובאיזה תקציב.',
        },
        {
          title: 'פיתוח (Development)',
          text: 'תקבלו מוצר שעובד — לא רק נראה טוב. צוות פיתוח מקצועי, ניהול פרויקט צמוד ובדיקות QA שמבטיחות איכות.',
        },
        {
          title: 'Go-to-Market',
          text: 'תגיעו לחנויות ותתחילו לצבור משתמשים. השקה ב-App Store ו-Google Play, פיילוט עם משתמשים אמיתיים ופידבק שמזין את הגרסה הבאה.',
        },
      ],
    },
  },
  {
    id: 'marketing',
    title: 'שיווק, פרסום ויח"צ',
    shortDescription:
      'תמלאו את המשפך בלידים ותבנו מותג שאנשים מדברים עליו. קמפיינים שמביאים תוצאות, יח"צ שבונה אמינות ונוכחות דיגיטלית שמוכרת.',
    isPremium: false,
    imageSrc: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    fullContent: {
      intro: 'תפסיקו לזרוק כסף על שיווק ותתחילו לראות תוצאות. מאסטרטגיה ועד ביצוע בשטח.',
      sections: [
        {
          title: 'פרסום דיגיטלי',
          text: 'תגיעו בדיוק לקהל שישלם. קמפיינים ממוקדים ב-Facebook, Instagram, Google, LinkedIn ו-TikTok שמביאים לידים איכותיים ומכירות.',
        },
        {
          title: 'יחסי ציבור (יח"צ)',
          text: 'תופיעו בכותרות ותבנו אמינות מיידית. חשיפה תקשורתית שגורמת ללקוחות ומשקיעים לסמוך עליכם עוד לפני הפגישה הראשונה.',
        },
        {
          title: 'שיווק ברשתות חברתיות',
          text: 'תבנו קהילה שמדברת עליכם. תוכן שמעורר עניין, עיצוב שעוצר גלילה וקהילה שהופכת לשגרירי מותג.',
        },
        {
          title: 'אסטרטגיית שיווק',
          text: 'תדעו בדיוק על מה להוציא כל שקל. תוכנית שיווקית ברורה עם קהלי יעד מדויקים, מסרים שעובדים ו-KPIs שאפשר למדוד.',
        },
      ],
    },
  },
  {
    id: 'medtech-leumit',
    title: 'מסלול MedTech (לאומית)',
    shortDescription:
      'תקצרו שנים של ניסוי וטעייה ברגולציה רפואית. גישה ישירה לרופאים מומחים, ליווי רגולטורי מלא ותמיכת לאומית — במחיר מונגש.',
    isPremium: true,
    imageSrc: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
    fullContent: {
      intro: 'תקבלו את המעטפת של חברה בוגרת כשאתם עדיין בתחילת הדרך. גישה לנכסי לאומית במחיר מונגש שחוסך לכם זמן, כסף וטעויות יקרות.',
      sections: [
        {
          title: 'ליווי מקצה לקצה',
          text: 'תתקדמו מרעיון למוצר עובד בלי לבזבז זמן על ניסוי וטעייה. ליווי מקצועי שחוסך חודשים של עבודה ומוביל ישר לתוצאות.',
        },
        {
          title: 'חוות דעת מרופאים מומחים',
          text: 'תדעו כבר בשלב מוקדם אם המיזם רלוונטי קלינית — לפני שמשקיעים מאות אלפים. גישה ישירה לרופאים מומחים שנותנים חוות דעת מקצועית.',
        },
        {
          title: 'ליווי רגולטורי מלא',
          text: 'תעברו את הרגולציה בלי כאב ראש. ליווי מלא מול CE ומשרד הבריאות שהופך תהליך מורכב לפשוט וברור.',
        },
      ],
    },
  },
  {
    id: 'investors',
    title: 'למשקיעים',
    shortDescription:
      'תמצאו את ההשקעה הבאה שלכם — בלי לבזבז זמן על סינון. מיזמים שעברו תהליך אקסלרציה מלא, מוכנים להשקעה ומותאמים בדיוק לתחומי העניין שלכם.',
    isPremium: false,
    imageSrc: '/images/investors-hero.png',
    fullContent: {
      intro: 'חוסכים לכם כ-80% מפעולת הסינון. מיזמים שעברו אקסלרציה מלאה, מוכנים להשקעה ומותאמים לתחומים שלכם.',
      sections: [
        {
          title: 'סינון חכם שחוסך זמן',
          text: 'תפסיקו לבזבז שעות על מיזמים לא מתאימים. אנחנו מבצעים עבורכם את כל תהליך הסינון ומציגים רק מיזמים איכותיים שעברו אקסלרציה מלאה — מותאמים בדיוק לתחומי העניין והחוזקות שלכם.',
          image: '/images/investors-smart-screening.png',
        },
        {
          title: 'מילוי שאלון והתאמה אישית',
          text: 'תקבלו רשימת מיזמים שנבחרו בדיוק עבורכם. שאלון קצר שעוזר לנו להבין מה מעניין אתכם, מה התקציב ומה התחום — ואנחנו מתאימים את המיזם הספציפי מתוך המאגר הייחודי שלנו.',
          image: '/images/investors-questionnaire.png',
        },
        {
          title: 'פגישת יזם-משקיע',
          text: 'תפגשו יזמים שמוכנים ומקצועיים. אנחנו מארגנים פגישה אישית בינכם לבין היזם — הכנה מלאה, ירידה לפרטים וחיבור אנושי. מהניסיון שלנו, משקיעים שמים את הכסף על היזם לפני המיזם.',
          image: '/images/investors-meeting.png',
        },
        {
          title: 'סגירת חוזה השקעה',
          text: 'תסגרו עסקה עם ראש שקט. אנחנו מובילים את תהליך החוזה מול עורכי הדין הרלוונטיים. עובדים עם הרצוג-פוקס-נאמן ממחלקת הייטק — המסמכים הטובים ביותר שמגנים עליכם כמשקיעים.',
          image: '/images/investors-contract.png',
        },
        {
          title: 'ליווי לאחר השקעה',
          text: 'ההשקעה שלכם בידיים טובות. גם אחרי שחתמתם, אנחנו ממשיכים ללוות את המיזם בתהליך הגיוס בפועל — כדי להגדיל את סיכויי ההצלחה ולשמור על ראש שקט.',
          image: '/images/investors-post-investment.png',
        },
      ],
    },
  },
  {
    id: 'investor-preparation',
    title: 'מעטפת הכנה למשקיעים',
    shortDescription:
      'תיכנסו לפגישת המשקיעים עם ביטחון מלא. סימולציות, תרגול Pitch, הכנה ל-100 השאלות הקשות וחיבור ישיר למשקיעים רלוונטיים.',
    isPremium: false,
    imageSrc: '/images/investor-prep-hero.png',
    fullContent: {
      intro: 'ככל שההכנה המוקדמת מקצועית יותר, כך אתם קרובים יותר לגיוס הכסף. תהליך שמכשיר אתכם לעולם העסקי ומגדיל את אחוזי הגיוס.',
      sections: [
        {
          title: 'הכרת החומרים והמונחים',
          text: 'תדברו בשפה של משקיעים מיום ראשון. קריאה והבנה של מילון מונחים, תהליכי פיתוח, הליכי פטנט — כל מה שצריך לדעת כדי לא להיתפס לא מוכנים.',
          image: '/images/investor-prep-terms.png',
        },
        {
          title: 'כתיבת נאום מעלית',
          text: 'תשכנעו כל משקיע ב-60 שניות. הזמן מול המשקיע יקר — נלמד אתכם למקסם כל שנייה עם נאום מעלית חד שגורם למשקיע לרצות לשמוע עוד.',
          image: '/images/investor-prep-elevator.png',
        },
        {
          title: 'הכנה ל-100 השאלות הקשות',
          text: 'תהיו מוכנים לכל שאלה שמשקיע יזרוק עליכם. מאגר של 100 שאלות לפי נושאים וקטגוריות — עם תשובות מוכנות שמראות שאתם שולטים בחומר.',
          image: '/images/investor-prep-questions.png',
        },
        {
          title: 'סימולציות פגישת משקיעים',
          text: 'תתרגלו עד שזה מושלם. סימולציות של מצגת 15 דקות, קריאה מעמיקה של התוכנית העסקית והפיננסית — כדי שתגיעו לפגישה האמיתית בטוחים ומוכנים.',
          image: '/images/investor-prep-simulations.png',
        },
        {
          title: 'חיבור ישיר למשקיעים',
          text: 'תפגשו את המשקיעים הנכונים. ל-WeCcelerate קשרים אישיים עם מאנג׳לים ועד הקרנות הגדולות בהייטק הישראלי. מיפוי מעגלי השקעה, ניסוח מיילים ומעקב צמוד עד לסגירת עסקה.',
          image: '/images/investor-prep-connections.png',
        },
        {
          title: 'ליווי בתהליך החוזה',
          text: 'תסגרו עסקה מוגנת. מעבר על חוזה השקעה, הסכמי סודיות (NDA), הדרכה על קרנות הון סיכון — כל המסמכים המשפטיים שמגנים עליכם, בליווי הרצוג-פוקס-נאמן.',
          image: '/images/investor-prep-contract.png',
        },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// ENGLISH
// ---------------------------------------------------------------------------

export const servicesEn: Service[] = [
  {
    id: 'business-consulting',
    title: 'Business Consulting & Strategy',
    shortDescription:
      'From in-depth market research to precise financial planning. Building the foundations for fundraising and business success.',
    isPremium: false,
    imageSrc: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    fullContent: {
      intro: 'Full-service business consulting providing a 360° support for founders.',
      sections: [
        {
          title: 'Market Research & Consumer Surveys',
          text: 'The first and most significant milestone. Gathering information on markets, competitors and the business environment, including in-depth consumer surveys, to establish marketing ability and differentiation for investors.',
        },
        {
          title: 'Marketing Plan',
          text: 'A roadmap for achieving goals. Defining customer touchpoints, competitors and the strategy for achieving objectives within a defined timeframe.',
        },
        {
          title: 'Financial Plan',
          text: 'Forecasting the economic future. Calculating required investments in R&D, marketing and operations to understand breakeven and ROI.',
        },
        {
          title: 'Investor Pitch Deck',
          text: 'Building a professional investor presentation that tells your story and convinces investors. Including design, financial model and pitch practice.',
        },
        {
          title: 'Executive Summary (One Pager)',
          text: 'The most important document for investors. Summarizing the problem, solution, market and advantages into a readable document that leads to an investor pitch.',
        },
        {
          title: 'Investor Preparation & Investment Process Support*',
          text: 'Comprehensive preparation for investor meetings, support throughout the investment process, pitch practice and connecting with relevant investors. *No guarantee of investment outcomes.',
        },
        {
          title: 'Business Plan',
          text: 'A detailed work plan for proper and efficient planning. Investors and funds examine it to make an investment decision. Includes: capital requirements, pricing, team, market entry and milestones.',
        },
      ],
    },
  },
  {
    id: 'physical-product',
    title: 'Physical Product Development',
    shortDescription:
      'Recognized as an R&D company by the Innovation Authority. Two development methods: traditional from scratch or a shortcut via global factory sourcing.',
    isPremium: false,
    imageSrc: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
    fullContent: {
      intro: 'Recognized as an R&D company by the Innovation Authority, thanks to the complex developments the company undertakes. Engineering and design process with two development methods.',
      sections: [
        {
          title: 'Traditional Method — Development from Scratch',
          text: 'Full development process including target audience analysis, concept development, engineering design, prototyping and mass production.',
        },
        {
          title: 'Shortcut Method — Global Factory Sourcing',
          text: 'Locating factories and suppliers worldwide for manufacturing and development based on pre-defined requirements. Significantly reducing time and costs.',
        },
        {
          title: 'Engineering & Design',
          text: 'Utilizing engineers and industrial designers to create blueprints and 3D renderings.',
        },
        {
          title: 'Prototyping',
          text: 'A crucial stage for real-world testing. Creating the model closest to the final product for feasibility assessment and improvements.',
        },
        {
          title: 'Mass Production',
          text: 'Planning production lines, product files, manufacturing instructions and preparations for Mass Production.',
        },
      ],
    },
  },
  {
    id: 'digital-product',
    title: 'Digital Product Development',
    shortDescription:
      'Developing apps and web systems. From UX/UI design, through coding, to store launches.',
    isPremium: false,
    imageSrc: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
    fullContent: {
      intro: 'End-to-end technology development.',
      sections: [
        {
          title: 'Design & UX/UI',
          text: 'Creating logos, brand books, and full user experience design. Visuals that speak to investors.',
        },
        {
          title: 'Technical Specification',
          text: 'Precise documentation for developers to prevent errors and define budget and timeline.',
        },
        {
          title: 'Development',
          text: 'Recruiting a team (Front, Back, Full Stack), writing code under project management supervision with thorough QA.',
        },
        {
          title: 'Go-to-Market',
          text: 'Publishing to stores (App Store/Google Play), running user pilots, and continuing feature development.',
        },
      ],
    },
  },
  {
    id: 'marketing',
    title: 'Marketing, Advertising & PR',
    shortDescription:
      'Full marketing execution across social media and digital channels. Including advertising, PR, campaign management and brand building.',
    isPremium: false,
    imageSrc: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    fullContent: {
      intro: 'Complete marketing support for ventures — from strategy to hands-on execution.',
      sections: [
        {
          title: 'Digital Advertising',
          text: 'Managing paid campaigns across social media (Facebook, Instagram, LinkedIn, TikTok), Google Ads and other platforms.',
        },
        {
          title: 'Public Relations (PR)',
          text: 'Building PR strategy, writing press releases, establishing media relationships, and managing venture reputation.',
        },
        {
          title: 'Social Media Marketing',
          text: 'Ongoing management of venture social media pages — content creation, graphic design, community building and engagement.',
        },
        {
          title: 'Marketing Strategy',
          text: 'Building a comprehensive marketing plan including audience mapping, messaging, distribution channels and success metrics.',
        },
      ],
    },
  },
  {
    id: 'medtech-leumit',
    title: 'MedTech Track (Leumit)',
    shortDescription:
      'The premium track for medical ventures. Expert medical opinions, full regulatory support and market research in partnership with Leumit.',
    isPremium: true,
    imageSrc: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
    fullContent: {
      intro: 'Leumit WeCcelerate Accelerator — helping early-stage startups get mature-stage support. We made HMO assets accessible at affordable pricing so startups can build their venture right from scratch.',
      sections: [
        {
          title: 'End-to-End Support',
          text: 'Supporting founders from idea stage to working product, with emphasis on early-stage help — expert opinions, regulation and market research.',
        },
        {
          title: 'Expert Medical Opinions',
          text: 'Access to expert physicians for assessing clinical relevance of the venture, and professional consulting for early stages.',
        },
        {
          title: 'Full Regulatory Support',
          text: 'Helping with the entire regulatory process — assisting founders to navigate regulation simply and correctly, including CE and Ministry of Health.',
        },
      ],
    },
  },
  {
    id: 'investors',
    title: 'For Investors',
    shortDescription:
      'Find your next investment — without wasting time on screening. Ventures that completed full acceleration, ready for investment and matched to your interests.',
    isPremium: false,
    imageSrc: '/images/investors-hero.png',
    fullContent: {
      intro: 'We save you ~80% of the screening process. Accelerated ventures, investment-ready and matched to your domain.',
      sections: [
        {
          title: 'Smart Screening That Saves Time',
          text: 'Stop wasting hours on unsuitable ventures. We handle the entire screening process and present only quality ventures that completed full acceleration — matched precisely to your interests and strengths.',
          image: '/images/investors-smart-screening.png',
        },
        {
          title: 'Questionnaire & Personal Matching',
          text: 'Receive a curated list of ventures selected specifically for you. A brief questionnaire helps us understand your interests, budget and domain — and we match the specific venture from our unique portfolio.',
          image: '/images/investors-questionnaire.png',
        },
        {
          title: 'Founder-Investor Meeting',
          text: 'Meet prepared and professional founders. We organize a personal meeting between you and the founder — full preparation, deep-dive into details and human connection.',
          image: '/images/investors-meeting.png',
        },
        {
          title: 'Investment Agreement',
          text: 'Close deals with peace of mind. We lead the contract process with relevant attorneys. Working with Herzog Fox & Neeman from the high-tech department — the best documents to protect you as an investor.',
          image: '/images/investors-contract.png',
        },
        {
          title: 'Post-Investment Support',
          text: 'Your investment is in good hands. Even after signing, we continue to support the venture through the fundraising process — to maximize success rates and give you peace of mind.',
          image: '/images/investors-post-investment.png',
        },
      ],
    },
  },
  {
    id: 'investor-preparation',
    title: 'Investor Preparation Package',
    shortDescription:
      'Walk into investor meetings with full confidence. Simulations, pitch practice, preparation for the 100 toughest questions and direct connections to relevant investors.',
    isPremium: false,
    imageSrc: '/images/investor-prep-hero.png',
    fullContent: {
      intro: 'The more professional your preparation, the closer you are to raising capital. A process that trains you for the business world and increases your fundraising success rate.',
      sections: [
        {
          title: 'Master the Language of Investors',
          text: 'Speak investor language from day one. Understanding terminology, development processes, patent procedures — everything you need to never be caught unprepared.',
          image: '/images/investor-prep-terms.png',
        },
        {
          title: 'Elevator Pitch',
          text: 'Convince any investor in 60 seconds. Time with investors is precious — learn to maximize every second with a sharp elevator pitch that makes investors want to hear more.',
          image: '/images/investor-prep-elevator.png',
        },
        {
          title: 'The 100 Toughest Questions',
          text: 'Be ready for any question an investor throws at you. A database of 100 questions by topic and category — with prepared answers that show you master the material.',
          image: '/images/investor-prep-questions.png',
        },
        {
          title: 'Investor Meeting Simulations',
          text: 'Practice until it is perfect. 15-minute presentation simulations, deep reading of business and financial plans — so you arrive at the real meeting confident and ready.',
          image: '/images/investor-prep-simulations.png',
        },
        {
          title: 'Direct Investor Connections',
          text: 'Meet the right investors. WeCcelerate has personal connections from angels to the largest VC funds in Israeli high-tech. Investment circle mapping, email drafting and close follow-up until deal closing.',
          image: '/images/investor-prep-connections.png',
        },
        {
          title: 'Contract Process Support',
          text: 'Close a protected deal. Investment agreement review, NDAs, VC fund guidance — all legal documents that protect you, with Herzog Fox & Neeman support.',
          image: '/images/investor-prep-contract.png',
        },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Backward-compatible export (used by server components like generateStaticParams)
// ---------------------------------------------------------------------------

export const services = servicesHe;
