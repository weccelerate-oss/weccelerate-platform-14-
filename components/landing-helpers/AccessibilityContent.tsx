import { LegalSection } from './LegalPage';

interface Props {
  accentColor?: string;
}

export function AccessibilityContent({ accentColor }: Props) {
  return (
    <>
      <p className="text-white/80 text-base sm:text-lg leading-relaxed">
        WeCcelerate Ltd. רואה חשיבות עליונה בכך שכל אדם — ללא יוצא מן הכלל — יוכל לגשת לתוכן ולשירותים
        שלנו בקלות ובכבוד. אנו פועלים לעמידה בדרישות חוק שוויון זכויות לאנשים עם מוגבלות (התשנ&quot;ח-1998)
        ובתקן הישראלי{' '}
        <strong className="text-white/90">ת&quot;י 5568</strong> ברמה <strong className="text-white/90">AA</strong>{' '}
        המבוסס על הנחיות{' '}
        <strong className="text-white/90">WCAG 2.1</strong>.
      </p>

      <LegalSection title="התאמות הנגישות באתר" accentColor={accentColor}>
        <p>אתרי WeCcelerate נבנו עם מגוון התאמות נגישות:</p>
        <ul className="list-disc list-inside space-y-1.5 mr-2">
          <li>ניווט מלא באמצעות המקלדת (Tab, Enter, Escape)</li>
          <li>תמיכה מלאה בקוראי מסך (NVDA, JAWS, VoiceOver)</li>
          <li>תיוג סמנטי של כל היסודות (HTML5 + ARIA)</li>
          <li>קישור &quot;דלג לתוכן הראשי&quot; (Skip to Content) בראש כל דף</li>
          <li>ניגודיות צבעים גבוהה — לבן על רקע כהה ביחס של 18:1</li>
          <li>טקסט אלטרנטיבי (alt) לכל התמונות הרלוונטיות</li>
          <li>הצגת focus ברורה על כל אלמנט ניווט</li>
          <li>טפסים עם תוויות (labels) ברורות והודעות שגיאה זמינות</li>
          <li>תמיכה בכיוון RTL מלא</li>
          <li>תיאורי ARIA לכל הכפתורים והקישורים החיוניים</li>
          <li>ויג&apos;ט נגישות זמין בכל דף — לשינוי גודל גופן, ניגודיות, וסמן עכבר</li>
        </ul>
      </LegalSection>

      <LegalSection title="תאימות לדפדפנים וטכנולוגיות מסייעות" accentColor={accentColor}>
        <p>האתר תואם ונבדק על:</p>
        <ul className="list-disc list-inside space-y-1 mr-2">
          <li>Google Chrome (גרסה אחרונה)</li>
          <li>Mozilla Firefox (גרסה אחרונה)</li>
          <li>Safari (macOS / iOS)</li>
          <li>Microsoft Edge</li>
          <li>קוראי מסך: NVDA, JAWS, VoiceOver, TalkBack</li>
        </ul>
      </LegalSection>

      <LegalSection title="התאמות נוספות בוויג'ט הנגישות" accentColor={accentColor}>
        <p>בלחיצה על אייקון הנגישות (בצד ימין למעלה) ניתן:</p>
        <ul className="list-disc list-inside space-y-1 mr-2">
          <li>להגדיל / להקטין את גודל הטקסט</li>
          <li>להפעיל מצב ניגודיות גבוהה</li>
          <li>להפעיל מצב טקסט בלבד (ללא תמונות)</li>
          <li>להגדיל את סמן העכבר</li>
          <li>להדגיש קישורים</li>
          <li>לעצור אנימציות</li>
          <li>לאפס את כל ההגדרות</li>
        </ul>
      </LegalSection>

      <LegalSection title="חלקים שייתכן ולא נגישים במלואם" accentColor={accentColor}>
        <p>למרות מאמצינו, חלקים מהתוכן עשויים להיות פחות נגישים:</p>
        <ul className="list-disc list-inside space-y-1 mr-2">
          <li>סרטוני וידאו ישנים שטרם הותאמו עם כתוביות</li>
          <li>תוכן צד שלישי המוטמע באתר (כגון מפות Google)</li>
          <li>קבצי PDF היסטוריים שהועלו לפני 2024</li>
        </ul>
        <p>אנו פועלים לתיקון הדרגתי של פערים אלה.</p>
      </LegalSection>

      <LegalSection title="רכז הנגישות" accentColor={accentColor}>
        <p>במידה ונתקלתם בקושי בנגישות האתר, או יש לכם הצעות לשיפור — אנא פנו אלינו:</p>
        <p className="mt-3">
          <strong className="text-white/85">רכז הנגישות:</strong> צוות WeCcelerate
          <br />
          <strong className="text-white/85">אימייל:</strong>{' '}
          <a href="mailto:accessibility@weccelerate.co.il" className="hover:underline">
            accessibility@weccelerate.co.il
          </a>
          <br />
          <strong className="text-white/85">טלפון:</strong>{' '}
          <a href="tel:+972555647538" dir="ltr" className="hover:underline">
            +972-55-564-7538
          </a>
          <br />
          <strong className="text-white/85">שעות מענה:</strong> ראשון-חמישי, 09:00-18:00
        </p>
        <p className="mt-3 text-white/55 text-xs sm:text-sm">
          התחייבותנו: נחזיר תשובה לכל פנייה בנושא נגישות תוך 5 ימי עסקים.
        </p>
      </LegalSection>

      <LegalSection title="הצהרת התאמה" accentColor={accentColor}>
        <p>
          הצהרת הנגישות עודכנה לאחרונה באפריל 2026. האתר נבדק על ידי כלי ה-Lighthouse של Google
          וקיבל ציון נגישות גבוה. בדיקות נגישות ידניות מבוצעות אחת לרבעון על ידי צוות הפיתוח שלנו.
        </p>
      </LegalSection>
    </>
  );
}
