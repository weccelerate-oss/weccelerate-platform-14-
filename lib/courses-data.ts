/**
 * Course data for the Learning Center
 * Static course content with YouTube links organized by categories
 */

export interface LessonData {
  title: string;
  slug: string;
  youtubeUrl: string;
  youtubeId: string;
  description: string;
}

export interface SubcategoryData {
  name: string;
  slug: string;
  description: string;
  lessons: LessonData[];
}

export interface CategoryData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  subcategories: SubcategoryData[];
}

function ytId(url: string): string {
  const match = url.match(/youtu\.be\/([^?&]+)/);
  return match ? match[1] : '';
}

export const COURSES_DATA: CategoryData[] = [
  {
    name: 'מושגים פיננסיים',
    slug: 'financial-concepts',
    description: 'הבנת עולם הפיננסים והדוחות הכספיים - הבסיס לכל יזם',
    icon: 'TrendingUp',
    color: 'blue',
    subcategories: [
      {
        name: 'דוחות כספיים',
        slug: 'financial-reports',
        description:
          'במהלך המסע היזמי נתמודד עם דוחות ומסמכים שונים ומגוונים. הדוחות הפיננסים הם אבני היסוד של כל חברה ומיזם ועל ידם נוכל להפיק תובנות, לקבוע יעדים ולהשיג מטרות.',
        lessons: [
          {
            title: 'דוח P&L',
            slug: 'pl-report',
            youtubeUrl: 'https://youtu.be/wLySKQKtvQY',
            youtubeId: ytId('https://youtu.be/wLySKQKtvQY'),
            description:
              'דוח רווח והפסד (P&L) הוא הכלי המרכזי שמראה את הביצועים הכספיים של החברה שלך. הבנת הדוח הזה תאפשר לך לזהות מגמות, לחתוך הוצאות מיותרות ולהציג למשקיעים תמונה ברורה של העסק.',
          },
          {
            title: 'רווח גולמי',
            slug: 'gross-profit',
            youtubeUrl: 'https://youtu.be/K2fBeT5KAv0',
            youtubeId: ytId('https://youtu.be/K2fBeT5KAv0'),
            description:
              'הרווח הגולמי מראה כמה כסף נשאר אחרי עלויות הייצור הישירות. מדד קריטי שמשקיעים בודקים ראשון - הוא מגלה אם המודל העסקי שלך באמת עובד.',
          },
          {
            title: 'רווח תפעולי',
            slug: 'operating-profit',
            youtubeUrl: 'https://youtu.be/XhZxkeKu1Oc',
            youtubeId: ytId('https://youtu.be/XhZxkeKu1Oc'),
            description:
              'הרווח התפעולי חושף את היעילות האמיתית של העסק שלך. הוא מראה כמה אתה מרוויח מהפעילות השוטפת, לפני מימון ומיסים - וזה בדיוק מה שמשקיעים רוצים לראות.',
          },
          {
            title: 'רווח נקי',
            slug: 'net-profit',
            youtubeUrl: 'https://youtu.be/1wCM-dGYuBA',
            youtubeId: ytId('https://youtu.be/1wCM-dGYuBA'),
            description:
              'השורה התחתונה - כמה כסף באמת נשאר בסוף. הרווח הנקי הוא המדד הסופי שקובע אם החברה שלך רווחית, וזה מה שקובע את הדיבידנדים ואת ערך המניה.',
          },
          {
            title: 'מאזן',
            slug: 'balance-sheet',
            youtubeUrl: 'https://youtu.be/mMjjfJW4g9U',
            youtubeId: ytId('https://youtu.be/mMjjfJW4g9U'),
            description:
              'המאזן הוא תמונת מצב של הנכסים, ההתחייבויות וההון העצמי של החברה. זהו המסמך שמראה למשקיעים מה בדיוק יש לחברה ומה היא חייבת - ובאיזה מצב פיננסי היא נמצאת.',
          },
          {
            title: 'תחזית פיננסית',
            slug: 'financial-forecast',
            youtubeUrl: 'https://youtu.be/mMjjfJW4g9U',
            youtubeId: ytId('https://youtu.be/mMjjfJW4g9U'),
            description:
              'תחזית פיננסית היא המפה שלך קדימה. היא מציגה למשקיעים את הפוטנציאל של החברה ומראה שיש לך תוכנית ברורה לצמיחה - בלי תחזית אין גיוס.',
          },
          {
            title: 'הוצאות מימון',
            slug: 'financing-costs',
            youtubeUrl: 'https://youtu.be/mMjjfJW4g9U',
            youtubeId: ytId('https://youtu.be/mMjjfJW4g9U'),
            description:
              'הוצאות מימון כוללות ריביות, עמלות בנקאיות ותשלומים על הלוואות. הבנה שלהן תעזור לך לנהל נכון את תזרים המזומנים ולבחור את מקורות המימון הנכונים לסטארטאפ שלך.',
          },
          {
            title: 'Financial Statement',
            slug: 'financial-statement',
            youtubeUrl: 'https://youtu.be/zbCIA1znsF4',
            youtubeId: ytId('https://youtu.be/zbCIA1znsF4'),
            description:
              'הדוחות הכספיים הם השפה שבה עסקים מדברים עם משקיעים, בנקים ורגולטורים. שליטה בשפה הזו היא חובה לכל יזם שרוצה לגייס כסף ולנהל חברה מצליחה.',
          },
          {
            title: 'R&D',
            slug: 'research-and-development',
            youtubeUrl: 'https://youtu.be/9qrleP4rtZo',
            youtubeId: ytId('https://youtu.be/9qrleP4rtZo'),
            description:
              'הוצאות מחקר ופיתוח הן הדלק של חברות טכנולוגיה. הבנה של איך לנהל ולדווח על R&D היא קריטית - גם בגלל הטבות מס וגם בגלל שמשקיעים רוצים לראות שאתה משקיע בעתיד.',
          },
          {
            title: 'The Big Four',
            slug: 'big-four',
            youtubeUrl: 'https://youtu.be/_8XCVeLxOYM',
            youtubeId: ytId('https://youtu.be/_8XCVeLxOYM'),
            description:
              'ארבע חברות רואי החשבון הגדולות בעולם (Deloitte, PwC, EY, KPMG) הן שחקניות מפתח בעולם העסקים. הכרת התפקיד שלהן חשובה כשהחברה שלך גדלה ונדרשת לביקורת מקצועית.',
          },
        ],
      },
      {
        name: 'הערכת שווי',
        slug: 'valuation',
        description:
          'לכל דבר יש שווי, שווי שעבורו אנחנו מוכנים להקריב דברים מסויימים ודברים אחרים פחות. כל חברה צריכה לדעת את השווי שלה ואיך מעריכים אותה בשוק. השווי של חברה מגלם את ההשקעה שנעשתה עד כה וכן את הפוטנציאל הגלום בהמשך פיתוח החברה.',
        lessons: [
          {
            title: 'הערכת שווי',
            slug: 'company-valuation',
            youtubeUrl: 'https://youtu.be/4f9WoA3JZJU',
            youtubeId: ytId('https://youtu.be/4f9WoA3JZJU'),
            description:
              'הערכת שווי היא הנושא הכי חשוב במו"מ עם משקיעים. ככל שתבין יותר את השיטות והגישות - כך תוכל לנהל משא ומתן טוב יותר ולהגן על האחוזים שלך בחברה.',
          },
          {
            title: 'Equity Capital',
            slug: 'equity-capital',
            youtubeUrl: 'https://youtu.be/4f9WoA3JZJU',
            youtubeId: ytId('https://youtu.be/4f9WoA3JZJU'),
            description:
              'הון עצמי הוא הכסף שהבעלים השקיעו בחברה. הבנה של מבנה ההון חיונית כדי לדעת כמה שווים המניות שלך ומה קורה כשנכנסים משקיעים חדשים.',
          },
          {
            title: 'DCF',
            slug: 'dcf-model',
            youtubeUrl: 'https://youtu.be/2elgAqZL0aM',
            youtubeId: ytId('https://youtu.be/2elgAqZL0aM'),
            description:
              'שיטת היוון תזרימי מזומנים (DCF) היא אחת השיטות המקובלות ביותר להערכת שווי. היא מחשבת כמה שווה היום הכסף שהחברה שלך תייצר בעתיד - כלי הכרחי לכל סבב גיוס.',
          },
        ],
      },
    ],
  },
  {
    name: 'מושגים עסקיים',
    slug: 'business-concepts',
    description: 'בניית תשתית עסקית חזקה - מתוכנית עסקית ועד מודל הכנסות',
    icon: 'Briefcase',
    color: 'emerald',
    subcategories: [
      {
        name: 'תוכנית עסקית',
        slug: 'business-plan',
        description:
          'תוכנית עסקית הינה מסמך המאגד בתוכו את כלל האבני הבניין של מיזם ושל חברה. החל מסקירת השוק, בחינת הכדאיות, הבידול והמודל העסקי, הצפי הפיננסי והאסטרטגיה השיווקית - תוכנית עסקית צריכה להקיף את כלל הצרכים של המיזם על מנת להתוות עבורו את הדרך קדימה.',
        lessons: [
          {
            title: 'תוכנית עסקית',
            slug: 'business-plan-overview',
            youtubeUrl: 'https://youtu.be/RDlhSKjQDuw',
            youtubeId: ytId('https://youtu.be/RDlhSKjQDuw'),
            description:
              'תוכנית עסקית היא המפת דרכים שלך. בלעדיה, אתה מנווט בחושך. משקיעים, בנקים ושותפים פוטנציאליים - כולם רוצים לראות תוכנית ברורה לפני שהם מתחייבים.',
          },
          {
            title: 'One Pager',
            slug: 'one-pager',
            youtubeUrl: 'https://youtu.be/RDlhSKjQDuw',
            youtubeId: ytId('https://youtu.be/RDlhSKjQDuw'),
            description:
              'ה-One Pager הוא כרטיס הביקור של הסטארטאפ שלך. עמוד אחד שמסכם את הכל - הבעיה, הפתרון, השוק והצוות. זה מה שנשלח למשקיע לפני הפגישה הראשונה.',
          },
          {
            title: 'Pitch Deck',
            slug: 'pitch-deck',
            youtubeUrl: 'https://youtu.be/jMzKqZKNWVg',
            youtubeId: ytId('https://youtu.be/jMzKqZKNWVg'),
            description:
              'מצגת הפיץ\' היא הכלי שלך לשכנע משקיעים ב-10 דקות. זו ההזדמנות שלך לספר את הסיפור של החברה בצורה שמעוררת התלהבות ורצון להשקיע.',
          },
        ],
      },
      {
        name: 'מודלים עסקיים',
        slug: 'business-models',
        description:
          'מודל עסקי הוא הדרך בה מיזם מוציא לפועל את האסטרטגיה העסקית שלו ומייצר הכנסה לטובת קייום העסק ואפשרות הצמיחה שלו. ישנם מודלים עסקיים רבים כתלות במגוון אסטרטגיות עסקיות שיש לעסקים שונים בתחומים שונים.',
        lessons: [
          {
            title: 'SaaS',
            slug: 'saas-model',
            youtubeUrl: 'https://youtu.be/mDDveAxCJ8A',
            youtubeId: ytId('https://youtu.be/mDDveAxCJ8A'),
            description:
              'מודל SaaS (תוכנה כשירות) הוא אחד המודלים הפופולריים ביותר בסטארטאפים. הוא מייצר הכנסה חוזרת ויציבה, וזה בדיוק מה שמשקיעים אוהבים - הבנה עמוקה שלו תעזור לך לבנות עסק סקיילבילי.',
          },
        ],
      },
    ],
  },
  {
    name: 'השקעות וצמיחה',
    slug: 'investments-growth',
    description: 'הכל על גיוס הון, סוגי משקיעים ואסטרטגיות צמיחה',
    icon: 'Rocket',
    color: 'violet',
    subcategories: [
      {
        name: 'השקעות',
        slug: 'investments',
        description:
          'השקעות בחברות סטארט-אפ נועדו לאפשר לחברה לצמוח. צמיחת החברה היא יעד מרכזי של היזם כאשר ההשקעות בחברה צריכות לתת לה את הבסיס ואת האפשרויות לצמיחה. ברגע שמתבצעת השקעה בחברה, יעדי הצמיחה עוברים מאינטרס של היזם בלבד לאינטרס של בעלי המניות כולם.',
        lessons: [
          {
            title: 'FFF',
            slug: 'fff-funding',
            youtubeUrl: 'https://youtu.be/Nv9kvT5mago',
            youtubeId: ytId('https://youtu.be/Nv9kvT5mago'),
            description:
              'Friends, Family & Fools - הסבב הראשון שרוב היזמים עוברים. חשוב להכיר את הכללים כדי לא לפגוע ביחסים אישיים ולעשות את זה בצורה מקצועית מהיום הראשון.',
          },
          {
            title: 'Due Diligence',
            slug: 'due-diligence',
            youtubeUrl: 'https://youtu.be/m5bLN6tVJC8',
            youtubeId: ytId('https://youtu.be/m5bLN6tVJC8'),
            description:
              'בדיקת נאותות היא התהליך שבו משקיעים בודקים את החברה שלך לעומק. הכרת התהליך מראש תעזור לך להתכונן כמו שצריך ולהימנע מהפתעות שעלולות להרוס עסקה.',
          },
          {
            title: 'Cap Table',
            slug: 'cap-table',
            youtubeUrl: 'https://youtu.be/fXKT3Xn0Ryw',
            youtubeId: ytId('https://youtu.be/fXKT3Xn0Ryw'),
            description:
              'טבלת ההון היא המסמך שמראה מי מחזיק כמה אחוזים בחברה. ניהול נכון שלה הוא קריטי - טעויות ב-Cap Table יכולות למנוע מכם לגייס בעתיד.',
          },
          {
            title: 'דיבידנד',
            slug: 'dividend',
            youtubeUrl: 'https://youtu.be/fXKT3Xn0Ryw',
            youtubeId: ytId('https://youtu.be/fXKT3Xn0Ryw'),
            description:
              'דיבידנד הוא חלוקת רווחים לבעלי המניות. בסטארטאפים זה פחות נפוץ, אבל חשוב להבין את המושג כשאתה מנהל משא ומתן עם משקיעים על זכויות ותנאים.',
          },
          {
            title: 'IPO',
            slug: 'ipo',
            youtubeUrl: 'https://youtu.be/N_9F8Q8y3jQ',
            youtubeId: ytId('https://youtu.be/N_9F8Q8y3jQ'),
            description:
              'הנפקה ראשונית לציבור (IPO) היא החלום של כל יזם - הרגע שבו החברה הופכת לציבורית. הבנה של התהליך תעזור לך לתכנן את הדרך לשם מהיום הראשון.',
          },
          {
            title: 'אסטרטגיית גיוס',
            slug: 'fundraising-strategy',
            youtubeUrl: 'https://youtu.be/N_9F8Q8y3jQ',
            youtubeId: ytId('https://youtu.be/N_9F8Q8y3jQ'),
            description:
              'אסטרטגיית גיוס נכונה היא ההבדל בין גיוס מוצלח לגיוס כושל. תלמד מתי לגייס, כמה לגייס, ואיך לגשת למשקיעים בצורה שמגדילה את הסיכויים שלך.',
          },
          {
            title: 'משקיע אסטרטגי',
            slug: 'strategic-investor',
            youtubeUrl: 'https://youtu.be/R1pdEL2pWkw',
            youtubeId: ytId('https://youtu.be/R1pdEL2pWkw'),
            description:
              'משקיע אסטרטגי מביא יותר מכסף - הוא מביא קשרים, ידע וגישה לשווקים. חשוב לדעת מתי לבחור משקיע אסטרטגי על פני משקיע פיננסי ומה ההשלכות.',
          },
          {
            title: 'משקיע פיננסי',
            slug: 'financial-investor',
            youtubeUrl: 'https://youtu.be/R1pdEL2pWkw',
            youtubeId: ytId('https://youtu.be/R1pdEL2pWkw'),
            description:
              'משקיע פיננסי מתמקד בתשואה על ההשקעה. הוא מביא הון ומומחיות פיננסית, ולרוב מעורב פחות בניהול היומיומי. הכרת ההבדלים תעזור לך לבחור את המשקיע הנכון.',
          },
          {
            title: 'Angel',
            slug: 'angel-investor',
            youtubeUrl: 'https://youtu.be/R1pdEL2pWkw',
            youtubeId: ytId('https://youtu.be/R1pdEL2pWkw'),
            description:
              'משקיעי אנג\'ל הם לרוב יזמים מנוסים שמשקיעים מכספם הפרטי בשלבים מוקדמים. הם מביאים ניסיון, מנטורינג וקשרים - לעתים קרובות הם ההשקעה הכי חשובה שתקבל.',
          },
          {
            title: 'Early Stage',
            slug: 'early-stage',
            youtubeUrl: 'https://youtu.be/R1pdEL2pWkw',
            youtubeId: ytId('https://youtu.be/R1pdEL2pWkw'),
            description:
              'שלב ה-Early Stage הוא השלב בו רוב הסטארטאפים נמצאים - עם רעיון או מוצר ראשוני. הבנת הדינמיקה של השלב הזה תעזור לך להתמקד בדברים הנכונים ולגייס בתנאים טובים.',
          },
          {
            title: 'Late Stage',
            slug: 'late-stage',
            youtubeUrl: 'https://youtu.be/R1pdEL2pWkw',
            youtubeId: ytId('https://youtu.be/R1pdEL2pWkw'),
            description:
              'שלב ה-Late Stage הוא כשהחברה כבר הוכיחה את עצמה ומחפשת להתרחב. סבבי הגיוס כאן גדולים יותר, התנאים שונים, והדרישות מהחברה מחמירות.',
          },
          {
            title: 'PE',
            slug: 'private-equity',
            youtubeUrl: 'https://youtu.be/R1pdEL2pWkw',
            youtubeId: ytId('https://youtu.be/R1pdEL2pWkw'),
            description:
              'קרנות Private Equity משקיעות בחברות בוגרות יותר ולרוב רוכשות שליטה. הבנה של איך PE עובד תעזור לך לתכנן את מסלול האקזיט של החברה.',
          },
          {
            title: 'VC',
            slug: 'venture-capital',
            youtubeUrl: 'https://youtu.be/R1pdEL2pWkw',
            youtubeId: ytId('https://youtu.be/R1pdEL2pWkw'),
            description:
              'קרנות הון סיכון (VC) הן השחקניות המרכזיות בעולם הסטארטאפים. הן מחפשות חברות עם פוטנציאל צמיחה מטורף. הכרת האופן בו VC חושב תעזור לך לפנות אליהם בצורה הנכונה.',
          },
        ],
      },
      {
        name: 'פיתוח',
        slug: 'development',
        description:
          'כל מיזם נובע מצורך מסויים. פיתוח הפתרון, בין אם כשירות בין אם כמוצר הוא אבן היסוד של החברה, הדרך בה היא מאמינה שתוכל לתת מענה לצורך ולפתור את הבעיה. עולם הפיתוח הינו עולם רחב. עולם זה נע בין מוצרים פיזיים למוצרי תוכנה וחולש על תחומים מגוונים ביותר.',
        lessons: [
          {
            title: 'אב טיפוס',
            slug: 'prototype',
            youtubeUrl: 'https://youtu.be/MWC95cw0eVk',
            youtubeId: ytId('https://youtu.be/MWC95cw0eVk'),
            description:
              'אב טיפוס הוא הגרסה הראשונה והפשוטה של המוצר שלך. הוא מאפשר לך לבדוק את הרעיון, לקבל פידבק ולשכנע משקיעים - בלי להשקיע הון עתק בפיתוח מלא.',
          },
          {
            title: 'אלגוריתם',
            slug: 'algorithm',
            youtubeUrl: 'https://youtu.be/g68wXX1peDc',
            youtubeId: ytId('https://youtu.be/g68wXX1peDc'),
            description:
              'אלגוריתם הוא סדרת הוראות שפותרת בעיה. גם אם אתה לא מתכנת, הבנה בסיסית של אלגוריתמים תעזור לך לתקשר טוב יותר עם צוות הפיתוח ולהבין את המוצר שלך.',
          },
          {
            title: 'AI',
            slug: 'artificial-intelligence',
            youtubeUrl: 'https://youtu.be/y25WNcX0hmY',
            youtubeId: ytId('https://youtu.be/y25WNcX0hmY'),
            description:
              'בינה מלאכותית היא הטרנד הגדול ביותר בטכנולוגיה. גם אם הסטארטאפ שלך לא מבוסס AI, הבנה של היכולות והמגבלות של AI תעזור לך למצוא הזדמנויות ולהישאר רלוונטי.',
          },
          {
            title: 'BI',
            slug: 'business-intelligence',
            youtubeUrl: 'https://youtu.be/tCWVsCDpqNY',
            youtubeId: ytId('https://youtu.be/tCWVsCDpqNY'),
            description:
              'Business Intelligence הוא היכולת להפוך נתונים גולמיים לתובנות עסקיות. כלי BI יעזרו לך לקבל החלטות מבוססות מידע ולא על תחושות בטן.',
          },
          {
            title: 'Big Data',
            slug: 'big-data',
            youtubeUrl: 'https://youtu.be/32qYeUvHc0s',
            youtubeId: ytId('https://youtu.be/32qYeUvHc0s'),
            description:
              'Big Data הוא היכולת לעבד ולנתח כמויות עצומות של מידע. הבנה של מה אפשר לעשות עם Big Data תפתח לך דלתות לאפשרויות עסקיות שלא חשבת עליהן.',
          },
          {
            title: 'MVP',
            slug: 'minimum-viable-product',
            youtubeUrl: 'https://youtu.be/7jAfGt_gf0Y',
            youtubeId: ytId('https://youtu.be/7jAfGt_gf0Y'),
            description:
              'מוצר מינימלי בר קיימא (MVP) הוא הגרסה הבסיסית ביותר של המוצר שמאפשרת לך ללמוד מלקוחות אמיתיים. זו הגישה שחוסכת זמן, כסף וכאב ראש - ומשקיעים אוהבים לראות שאתה יודע לעבוד ככה.',
          },
          {
            title: 'POC',
            slug: 'proof-of-concept',
            youtubeUrl: 'https://youtu.be/xXMM5KFwV7M',
            youtubeId: ytId('https://youtu.be/xXMM5KFwV7M'),
            description:
              'הוכחת היתכנות (POC) מוכיחה שהרעיון שלך אפשרי מבחינה טכנית. זהו השלב הקריטי שמפריד בין חלום למציאות - ומשכנע משקיעים שאתה לא רק חולם.',
          },
          {
            title: 'UI',
            slug: 'user-interface',
            youtubeUrl: 'https://youtu.be/Eb_erw3F2Vs',
            youtubeId: ytId('https://youtu.be/Eb_erw3F2Vs'),
            description:
              'ממשק המשתמש (UI) הוא הפנים של המוצר שלך - זה מה שהמשתמש רואה ונוגע בו. עיצוב UI טוב יכול להיות ההבדל בין מוצר שאנשים אוהבים לבין מוצר שהם נוטשים.',
          },
          {
            title: 'UX',
            slug: 'user-experience',
            youtubeUrl: 'https://youtu.be/MpPYujS3NqY',
            youtubeId: ytId('https://youtu.be/MpPYujS3NqY'),
            description:
              'חווית המשתמש (UX) היא האיך שמשתמש מרגיש כשהוא משתמש במוצר שלך. UX טוב הופך משתמשים ללקוחות נאמנים, ו-UX גרוע גורם להם לברוח למתחרים.',
          },
        ],
      },
    ],
  },
  {
    name: 'ניהול זמן',
    slug: 'time-management',
    description: 'עקרונות ניהול זמן, כלים פרקטיים ושיטות עבודה יעילות ליזם',
    icon: 'Clock',
    color: 'amber',
    subcategories: [
      {
        name: 'עקרונות ניהול זמן',
        slug: 'time-management-basics',
        description:
          'ניהול זמן הוא אחד הכישורים החשובים ביותר ליזם. כשאתה מנהל סטארטאפ, הזמן שלך הוא המשאב הכי יקר. למד את העקרונות הבסיסיים שיעזרו לך לנצל כל רגע בצורה חכמה.',
        lessons: [
          {
            title: 'ניהול זמן',
            slug: 'time-management-intro',
            youtubeUrl: 'https://youtu.be/pRYGz_37LHg',
            youtubeId: ytId('https://youtu.be/pRYGz_37LHg'),
            description:
              'מבוא לעקרונות ניהול זמן - הבסיס שכל יזם חייב להכיר. למד איך לנהל את הזמן שלך כדי להספיק יותר ולהרגיש פחות לחוץ.',
          },
          {
            title: 'אפיון איזה בן אדם אתה?',
            slug: 'time-behavior-assessment',
            youtubeUrl: 'https://youtu.be/LiN0Fz8_uGw',
            youtubeId: ytId('https://youtu.be/LiN0Fz8_uGw'),
            description:
              'שאלון אפיון התנהגות בניהול זמן - הכר את עצמך כדי לבנות שיטת עבודה שמתאימה בדיוק לך. כל אחד מנהל זמן אחרת, והצעד הראשון הוא להבין את הסגנון שלך.',
          },
          {
            title: 'מולטיטסקינג',
            slug: 'multitasking',
            youtubeUrl: 'https://youtu.be/hs5rkcHNsP8',
            youtubeId: ytId('https://youtu.be/hs5rkcHNsP8'),
            description:
              'ההולסטיקה - יתרונות וחסרונות של מולטיטסקינג. למד מתי כדאי לעשות כמה דברים במקביל ומתי עדיף להתמקד בדבר אחד - טיפ קריטי לכל יזם שמנסה לעשות הכל בו-זמנית.',
          },
        ],
      },
      {
        name: 'עקרונות ופרקטיקה - מקום, מחשבה, זמן',
        slug: 'practical-principles',
        description:
          'עקרונות פרקטיים שאפשר ליישם מיד. שלושה צירים מרכזיים - מקום, מחשבה וזמן - שיעזרו לך לארגן את העבודה ולהפוך ליעיל יותר.',
        lessons: [
          {
            title: 'עקרונות פרקטיקה - מקום',
            slug: 'practice-place',
            youtubeUrl: 'https://youtu.be/o4sn-4dKW24',
            youtubeId: ytId('https://youtu.be/o4sn-4dKW24'),
            description:
              'הקדמה ועקרונות פרקטיקה הקשורים למקום העבודה שלך. הסביבה שבה אתה עובד משפיעה ישירות על הפרודוקטיביות - למד איך לארגן את המרחב שלך לעבודה יעילה.',
          },
          {
            title: 'עקרונות פרקטיקה - מחשבה',
            slug: 'practice-mindset',
            youtubeUrl: 'https://youtu.be/u_V_JikhM5A',
            youtubeId: ytId('https://youtu.be/u_V_JikhM5A'),
            description:
              'עקרונות פרקטיים לניהול המחשבות וההתמקדות. הראש שלך הוא הכלי הכי חשוב - למד איך לנקות רעשים, לתעדף ולהישאר ממוקד במה שחשוב.',
          },
          {
            title: 'עקרונות פרקטיקה - זמן',
            slug: 'practice-time',
            youtubeUrl: 'https://youtu.be/MTpSQampC28',
            youtubeId: ytId('https://youtu.be/MTpSQampC28'),
            description:
              'עקרונות פרקטיים לניהול הזמן עצמו. טכניקות ושיטות שיעזרו לך לחלק את היום, להקצות זמן נכון למשימות ולהימנע מבזבוז זמן.',
          },
        ],
      },
      {
        name: 'הקדמה + קביעת נקודות איסוף דיגיטלי',
        slug: 'digital-collection-points',
        description:
          'בעידן הדיגיטלי, מידע ומשימות מגיעים מכל כיוון. למד איך לקבוע נקודות איסוף, לנהל תהליכים ולהפוך את הכאוס לסדר ברור ויעיל.',
        lessons: [
          {
            title: 'קביעת נקודות איסוף דיגיטלי',
            slug: 'digital-collection',
            youtubeUrl: 'https://youtu.be/_LP07ETcMI0',
            youtubeId: ytId('https://youtu.be/_LP07ETcMI0'),
            description:
              'למד איך לקבוע נקודות איסוף דיגיטליות שמרכזות את כל המידע, המשימות וההודעות שלך במקום אחד - כך שלא תפספס שום דבר חשוב.',
          },
          {
            title: 'שלב התהליך - מה, מתי, איפה',
            slug: 'process-what-when-where',
            youtubeUrl: 'https://youtu.be/dVvHtlPvGrk',
            youtubeId: ytId('https://youtu.be/dVvHtlPvGrk'),
            description:
              'הבנת שלבי התהליך - מה צריך לעשות, מתי לעשות את זה ואיפה. מסגרת חשיבה שתעזור לך לפרק כל משימה מורכבת לצעדים ברורים.',
          },
          {
            title: 'דוגמאות פרקטיות - מה, מתי, איפה',
            slug: 'process-examples',
            youtubeUrl: 'https://youtu.be/OOGgZIlNa8w',
            youtubeId: ytId('https://youtu.be/OOGgZIlNa8w'),
            description:
              'דוגמאות פרקטיות ליישום שיטת מה-מתי-איפה בחיי היום-יום של יזם. ראה איך זה עובד בפועל עם מקרים אמיתיים.',
          },
          {
            title: 'ללמוד לומר \'לא\'',
            slug: 'learn-to-say-no',
            youtubeUrl: 'https://youtu.be/ik0qI7zZcuo',
            youtubeId: ytId('https://youtu.be/ik0qI7zZcuo'),
            description:
              'אחד הכישורים הכי חשובים ליזם - לדעת מתי ואיך לומר \'לא\'. כשאתה אומר כן לכל דבר, אתה למעשה אומר לא לדברים החשובים באמת.',
          },
          {
            title: 'ביצוע תהלוך למשימות עם דוגמאות',
            slug: 'task-walkthrough',
            youtubeUrl: 'https://youtu.be/OOGgZIlNa8w',
            youtubeId: ytId('https://youtu.be/OOGgZIlNa8w'),
            description:
              'ביצוע תהלוך מעשי למשימות עם דוגמאות מהשטח. למד את התהליך המלא מקבלת משימה ועד השלמתה בצורה יעילה ומסודרת.',
          },
        ],
      },
      {
        name: 'סיכום קורס וכלים פרקטיים',
        slug: 'tools-and-summary',
        description:
          'כלים דיגיטליים שיעזרו לך ליישם את כל מה שלמדת. מכלי אוטומציה ועד ארגון מידע - הכלים שיחסכו לך שעות כל שבוע.',
        lessons: [
          {
            title: 'Magical',
            slug: 'magical-tool',
            youtubeUrl: 'https://youtu.be/_LP07ETcMI0',
            youtubeId: ytId('https://youtu.be/_LP07ETcMI0'),
            description:
              'Magical - כלי אוטומציה שמאפשר לך ליצור קיצורי טקסט, תבניות ותגובות מהירות. חוסך זמן יקר בפעולות חוזרות שיזמים עושים עשרות פעמים ביום.',
          },
          {
            title: 'סננים במייל',
            slug: 'email-filters',
            youtubeUrl: 'https://youtu.be/zJpdc8Pue7c',
            youtubeId: ytId('https://youtu.be/zJpdc8Pue7c'),
            description:
              'למד איך להגדיר סננים במייל שיסדרו את תיבת הדואר שלך אוטומטית. תפסיק לבזבז זמן על מיון מיילים ותתמקד במה שחשוב.',
          },
          {
            title: 'Texpand',
            slug: 'texpand-tool',
            youtubeUrl: 'https://youtu.be/GOS5R2bgdNg',
            youtubeId: ytId('https://youtu.be/GOS5R2bgdNg'),
            description:
              'Texpand - כלי להרחבת טקסט שמאפשר לך להקליד קיצורים ולקבל טקסטים שלמים. מושלם להודעות חוזרות, חתימות ותבניות שאתה משתמש בהן הרבה.',
          },
          {
            title: 'סיכום הקורס וטיפים נוספים',
            slug: 'course-summary-tips',
            youtubeUrl: 'https://youtu.be/70MRt3YOTXA',
            youtubeId: ytId('https://youtu.be/70MRt3YOTXA'),
            description:
              'סיכום הקורס עם טיפים נוספים - מסך הבית בטלפון, גוגל Keep וסיכום הקורס וטיפים אישיים נוספים. הכל על כלים שיעזרו לך לשמור על הסדר גם מחוץ למחשב.',
          },
        ],
      },
    ],
  },
];

/** Total number of lessons across all courses */
export function getTotalLessons(): number {
  return COURSES_DATA.reduce(
    (total, cat) =>
      total + cat.subcategories.reduce((sub, s) => sub + s.lessons.length, 0),
    0
  );
}

/** Get lesson count per subcategory */
export function getSubcategoryLessonCount(subcategorySlug: string): number {
  for (const cat of COURSES_DATA) {
    for (const sub of cat.subcategories) {
      if (sub.slug === subcategorySlug) return sub.lessons.length;
    }
  }
  return 0;
}
