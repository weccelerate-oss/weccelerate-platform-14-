import { LegalSection } from './LegalPage';

interface Props {
  accentColor?: string;
}

export function PrivacyContent({ accentColor }: Props) {
  return (
    <>
      <p className="text-white/80 text-base sm:text-lg leading-relaxed">
        WeCcelerate Ltd. (להלן: &quot;החברה&quot;, &quot;אנחנו&quot;, &quot;שלנו&quot;) מחויבת
        להגן על פרטיות המשתמשים באתרים ובדפי הנחיתה שלנו. מסמך זה מסביר אילו פרטים אנו אוספים,
        כיצד אנו משתמשים בהם, כיצד אנו שומרים עליהם, ומהן הזכויות שלכם.
      </p>

      <LegalSection title="1. איזה מידע אנחנו אוספים" accentColor={accentColor}>
        <p>בעת מילוי טפסי יצירת קשר באתר, אנו אוספים:</p>
        <ul className="list-disc list-inside space-y-1 mr-2">
          <li>שם מלא</li>
          <li>כתובת אימייל</li>
          <li>מספר טלפון</li>
          <li>שם החברה / הסטארטאפ (אם מולא)</li>
          <li>תוכן ההודעה / הפנייה</li>
          <li>כתובת ה-URL ממנה נשלח הטופס וסאבדומיין המקור</li>
          <li>נתוני UTM (אם הגעתם דרך קמפיין שיווקי)</li>
        </ul>
        <p>
          בנוסף, אנו אוספים מידע אנליטי אנונימי באמצעות Google Analytics (סוג דפדפן, מערכת הפעלה,
          אורך השהייה, דפים שנצפו). מידע זה אינו מזוהה אישית.
        </p>
      </LegalSection>

      <LegalSection title="2. כיצד אנו משתמשים במידע" accentColor={accentColor}>
        <p>המידע שאתם מספקים משמש אותנו ל:</p>
        <ul className="list-disc list-inside space-y-1 mr-2">
          <li>יצירת קשר חוזר על מנת לתאם פגישת ייעוץ</li>
          <li>מתן ייעוץ עסקי, רפואי, או טכנולוגי בהתאם לבקשתכם</li>
          <li>שליחת תוכן רלוונטי על שירותינו (רק אם אישרתם)</li>
          <li>שיפור חוויית המשתמש באתר</li>
          <li>עמידה בדרישות חוקיות</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. שיתוף מידע עם צדדים שלישיים" accentColor={accentColor}>
        <p>אנו לא מוכרים את המידע שלכם. אנו עשויים לשתף מידע עם:</p>
        <ul className="list-disc list-inside space-y-1 mr-2">
          <li>ספקי שירות שעוזרים לנו לנהל לידים (Pipedrive, Zapier)</li>
          <li>שירותי אנליטיקה (Google Analytics)</li>
          <li>שירותי תקשורת (WhatsApp Business)</li>
          <li>רשויות במקרים נדירים, כאשר נדרש על פי חוק</li>
        </ul>
        <p>
          במקרה של שירותי MedTech עם לאומית, מידע רלוונטי עשוי להיות משותף עם נציגי לאומית
          שירותי בריאות לצורך התאמה לתוכניות ההאצה — בכפוף להסכמתכם המפורשת ובהתאם לחוק הגנת
          הפרטיות התשמ&quot;א-1981 ולתקנות הבריאות הרלוונטיות.
        </p>
      </LegalSection>

      <LegalSection title="4. אבטחת מידע" accentColor={accentColor}>
        <p>
          אנו נוקטים באמצעי אבטחה סבירים להגנה על המידע: SSL/TLS לכל התעבורה, הצפנת בסיס הנתונים,
          גיבוי קבוע, וגישה מוגבלת לאנשי צוות מורשים בלבד. עם זאת, אין מערכת מאובטחת ב-100% ואנו
          לא יכולים להבטיח אבטחה מוחלטת.
        </p>
      </LegalSection>

      <LegalSection title="5. עוגיות (Cookies)" accentColor={accentColor}>
        <p>
          האתר משתמש בעוגיות לצורך פעולה תקינה ולמדידת ביצועים אנליטיים. ניתן להגדיר את הדפדפן
          לחסום עוגיות, אך הדבר עלול לפגוע בחוויית הגלישה.
        </p>
      </LegalSection>

      <LegalSection title="6. הזכויות שלכם" accentColor={accentColor}>
        <p>בהתאם לחוק הגנת הפרטיות, יש לכם זכות:</p>
        <ul className="list-disc list-inside space-y-1 mr-2">
          <li>לעיין במידע שאנו מחזיקים עליכם</li>
          <li>לבקש תיקון מידע לא מדויק</li>
          <li>לבקש מחיקת המידע שלכם (&quot;הזכות להישכח&quot;)</li>
          <li>להתנגד לעיבוד המידע למטרות שיווק</li>
          <li>להגיש תלונה לרשות להגנת הפרטיות</li>
        </ul>
        <p>לממש כל אחת מהזכויות האלה — שלחו לנו אימייל ל-info@weccelerate.co.il.</p>
      </LegalSection>

      <LegalSection title="7. שינויים במדיניות" accentColor={accentColor}>
        <p>
          אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים מהותיים יפורסמו באתר ויעדכנו את התאריך
          בראש המסמך. המשך השימוש באתר לאחר שינוי מהווה הסכמה לתנאים החדשים.
        </p>
      </LegalSection>

      <LegalSection title="8. יצירת קשר" accentColor={accentColor}>
        <p>
          לכל שאלה בנושא פרטיות:
          <br />
          <strong>WeCcelerate Ltd.</strong>
          <br />
          רחוב הרכבת 58, תל אביב
          <br />
          טלפון:{' '}
          <a href="tel:+972555647538" dir="ltr" className="hover:underline">
            +972-55-564-7538
          </a>
          <br />
          אימייל:{' '}
          <a href="mailto:info@weccelerate.co.il" className="hover:underline">
            info@weccelerate.co.il
          </a>
        </p>
      </LegalSection>
    </>
  );
}
