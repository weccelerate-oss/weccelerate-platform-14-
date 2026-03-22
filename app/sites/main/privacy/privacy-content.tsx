'use client';

import { useState } from 'react';

type Language = 'he' | 'en';

export function PrivacyBody() {
  const [lang, setLang] = useState<Language>('he');

  return (
    <div>
      {/* Language Tabs */}
      <div className="flex border-b border-white/[0.06] mb-10">
        <button
          onClick={() => setLang('he')}
          className={`px-6 py-3 text-sm font-semibold transition-colors relative cursor-pointer ${
            lang === 'he'
              ? 'text-white'
              : 'text-white/40 hover:text-white/60'
          }`}
          aria-pressed={lang === 'he'}
        >
          עברית
          {lang === 'he' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c8a951]" />
          )}
        </button>
        <button
          onClick={() => setLang('en')}
          className={`px-6 py-3 text-sm font-semibold transition-colors relative cursor-pointer ${
            lang === 'en'
              ? 'text-white'
              : 'text-white/40 hover:text-white/60'
          }`}
          aria-pressed={lang === 'en'}
        >
          English
          {lang === 'en' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c8a951]" />
          )}
        </button>
      </div>

      {/* Content */}
      {lang === 'he' ? <HebrewPrivacy /> : <EnglishPrivacy />}
    </div>
  );
}

// =============================================================================
// SHARED STYLES
// =============================================================================

const sectionHeadingClass =
  'text-xl font-bold text-white mb-4 mt-10 first:mt-0';
const paragraphClass = 'text-white/60 leading-relaxed mb-4';
const listClass = 'text-white/60 leading-relaxed mb-4 list-disc pr-6 space-y-2';
const listClassLtr = 'text-white/60 leading-relaxed mb-4 list-disc pl-6 space-y-2';

// =============================================================================
// HEBREW PRIVACY POLICY
// =============================================================================

function HebrewPrivacy() {
  return (
    <article dir="rtl" lang="he" className="prose-terms">
      <p className="text-white/40 text-sm mb-8">עדכון אחרון: פברואר 2026</p>

      <h2 className={sectionHeadingClass}>1. כללי</h2>
      <p className={paragraphClass}>
        חברת וויסלרייט בע&quot;מ (&quot;החברה&quot; או &quot;WeCcelerate&quot;)
        מכבדת את פרטיות המשתמשים באתר. מסמך זה מפרט איזה מידע אנחנו אוספים,
        כיצד אנו משתמשים בו וכיצד אנו שומרים עליו, בהתאם לחוק הגנת הפרטיות,
        תשמ&quot;א-1981.
      </p>

      <h2 className={sectionHeadingClass}>2. איזה מידע אנו אוספים?</h2>
      <p className={paragraphClass}>
        <strong className="text-white/80">מידע שאתה מוסר לנו באופן יזום:</strong>{' '}
        שם מלא, כתובת דוא&quot;ל, מספר טלפון, פרטים על המיזם שלך (תקציר מנהלים,
        מצגות) וכל מידע אחר שיוזן בטפסי יצירת הקשר או בפורטל היזמים.
      </p>
      <p className={paragraphClass}>
        <strong className="text-white/80">מידע שנאסף באופן אוטומטי:</strong> בעת
        הגלישה באתר, ייתכן וייאסף מידע טכני כגון כתובת ה-IP שלך, סוג הדפדפן,
        דפים בהם ביקרת, וזמן השהות באתר (באמצעות Cookies וטכנולוגיות דומות).
      </p>

      <h2 className={sectionHeadingClass}>3. השימוש במידע</h2>
      <p className={paragraphClass}>אנו משתמשים במידע שנאסף למטרות הבאות:</p>
      <ul className={listClass}>
        <li>יצירת קשר עמך לבחינת שיתופי פעולה, השקעות או ייעוץ.</li>
        <li>שיפור חווית המשתמש והתאמת התוכן באתר.</li>
        <li>
          שליחת עדכונים, ניוזלטרים ומידע שיווקי (בכפוף להסכמתך כדין).
        </li>
        <li>ניתוח סטטיסטי של תנועת הגולשים באתר (ללא זיהוי אישי).</li>
      </ul>

      <h2 className={sectionHeadingClass}>4. מסירת מידע לצדדים שלישיים</h2>
      <p className={paragraphClass}>
        החברה לא תעביר את פרטיך האישיים לצדדים שלישיים, למעט במקרים הבאים:
      </p>
      <ul className={listClass}>
        <li>
          במקרה של שיתופי פעולה אסטרטגיים (כגון מסלול MedTech עם לאומית שירותי
          בריאות או משקיעים פוטנציאליים), המידע יועבר רק לאחר קבלת הסכמתך
          המפורשת.
        </li>
        <li>
          לספקי שירות וספקי ענן (כגון שרתי אחסון ומערכות CRM) הפועלים מטעמנו
          ותחת הסכמי סודיות קפדניים.
        </li>
        <li>
          אם נחויב לעשות זאת על פי צו שיפוטי או דרישת רשות מוסמכת כדין.
        </li>
      </ul>

      <h2 className={sectionHeadingClass}>5. מידע רפואי ומסלול MedTech</h2>
      <p className={paragraphClass}>
        החברה מפעילה מסלול האצה בתחום הטכנולוגיה הרפואית (MedTech) בשיתוף פעולה עם
        לאומית שירותי בריאות. יובהר כי{' '}
        <strong className="text-white/80">
          אתר זה אינו מאחסן רשומות רפואיות רגישות של מטופלים.
        </strong>{' '}
        כל טיפול בנתונים קליניים מתבצע בערוצים מאובטחים ונפרדים, בכפוף לרגולציה
        המחמירה החלה על מידע רפואי, לרבות אישורים רגולטוריים נדרשים ותקנות הגנת
        הפרטיות.
      </p>

      <h2 className={sectionHeadingClass}>6. אבטחת מידע</h2>
      <p className={paragraphClass}>
        אנו מיישמים מערכות ונהלים מתקדמים לאבטחת מידע כדי להגן על הנתונים
        והמיזמים שלך מגישה בלתי מורשית. האתר מוגן באמצעות הצפנת SSL ומנגנוני הגנה
        נוספים. עם זאת, אין אנו יכולים להבטיח חסינות מוחלטת מפני חדירות למחשבי
        החברה.
      </p>

      <h2 className={sectionHeadingClass}>7. שימוש בעוגיות (Cookies)</h2>
      <p className={paragraphClass}>
        האתר משתמש בעוגיות לצורך תפעולו השוטף, כולל איסוף נתונים סטטיסטיים, אימות
        פרטים והתאמת האתר להעדפותיך האישיות. באפשרותך לשנות את הגדרות הדפדפן שלך
        כדי לחסום שימוש בעוגיות.
      </p>

      <h2 className={sectionHeadingClass}>8. זכות עיון ותיקון מידע</h2>
      <p className={paragraphClass}>
        על פי חוק, הנך זכאי לעיין במידע שעליך המוחזק במאגרי החברה. אם מצאת
        שהמידע אינו נכון, שלם, ברור או מעודכן, הנך רשאי לפנות אלינו בבקשה
        לתקנו או למוחקו.
      </p>

      <h2 className={sectionHeadingClass}>9. יצירת קשר</h2>
      <p className={paragraphClass}>
        בכל בקשה הקשורה לפרטיות, ניתן לפנות אלינו בכתובת:
      </p>
      <ul className="text-white/60 leading-relaxed mb-4 list-none space-y-1">
        <li>
          דוא&quot;ל:{' '}
          <a
            href="mailto:info@weccelerate.co.il"
            className="text-[#c8a951] hover:text-[#e8d48b] underline underline-offset-2"
          >
            info@weccelerate.co.il
          </a>
        </li>
      </ul>
    </article>
  );
}

// =============================================================================
// ENGLISH PRIVACY POLICY
// =============================================================================

function EnglishPrivacy() {
  return (
    <article dir="ltr" lang="en" className="prose-terms">
      <p className="text-white/40 text-sm mb-8">Last Updated: February 2026</p>

      <h2 className={sectionHeadingClass}>1. General</h2>
      <p className={paragraphClass}>
        WeCcelerate Ltd. (the &quot;Company&quot; or &quot;WeCcelerate&quot;)
        respects the privacy of our website users. This policy details what
        information we collect, how we use it, and how we protect it, in
        accordance with applicable privacy laws.
      </p>

      <h2 className={sectionHeadingClass}>2. Information We Collect</h2>
      <p className={paragraphClass}>
        <strong className="text-white/80">
          Information you actively provide:
        </strong>{' '}
        Full name, email address, phone number, details about your venture
        (executive summaries, pitch decks), and any other information entered
        into contact forms or the Entrepreneur Portal.
      </p>
      <p className={paragraphClass}>
        <strong className="text-white/80">
          Information collected automatically:
        </strong>{' '}
        When browsing the Site, technical information such as your IP address,
        browser type, pages visited, and time spent on the Site may be collected
        (using Cookies and similar technologies).
      </p>

      <h2 className={sectionHeadingClass}>3. Use of Information</h2>
      <p className={paragraphClass}>
        We use the collected information for the following purposes:
      </p>
      <ul className={listClassLtr}>
        <li>
          Contacting you to explore collaborations, investments, or consulting.
        </li>
        <li>Improving user experience and customizing Site content.</li>
        <li>
          Sending updates, newsletters, and marketing materials (subject to your
          legal consent).
        </li>
        <li>Statistical analysis of Site traffic (on an anonymous basis).</li>
      </ul>

      <h2 className={sectionHeadingClass}>
        4. Sharing Information with Third Parties
      </h2>
      <p className={paragraphClass}>
        The Company will not transfer your personal details to third parties,
        except in the following cases:
      </p>
      <ul className={listClassLtr}>
        <li>
          For strategic partnerships (e.g., the MedTech track with Leumit Health
          Services or potential investors), information will be shared only after
          obtaining your explicit consent.
        </li>
        <li>
          To service providers and cloud vendors (such as hosting servers and CRM
          systems) acting on our behalf under strict confidentiality agreements.
        </li>
        <li>
          If we are required to do so by a court order or lawful request from a
          competent authority.
        </li>
      </ul>

      <h2 className={sectionHeadingClass}>
        5. Medical Data &amp; MedTech Track
      </h2>
      <p className={paragraphClass}>
        The Company operates a MedTech acceleration track in partnership with
        Leumit Health Services. It is hereby clarified that{' '}
        <strong className="text-white/80">
          this website itself does not store sensitive patient medical records.
        </strong>{' '}
        Any handling of clinical data is conducted through secured, separate
        channels, subject to strict medical data regulations including Helsinki
        Committee approvals and applicable privacy protection regulations.
      </p>

      <h2 className={sectionHeadingClass}>6. Data Security</h2>
      <p className={paragraphClass}>
        We implement advanced information security systems and procedures to
        protect your data and venture details from unauthorized access. The Site
        is protected by SSL encryption and additional security mechanisms.
        However, absolute security cannot be guaranteed.
      </p>

      <h2 className={sectionHeadingClass}>7. Use of Cookies</h2>
      <p className={paragraphClass}>
        The Site uses cookies for its ongoing operation, including gathering
        statistical data, verifying details, and adapting the Site to your
        personal preferences. You can change your browser settings to block
        cookies.
      </p>

      <h2 className={sectionHeadingClass}>
        8. Right to Review and Correct Information
      </h2>
      <p className={paragraphClass}>
        Under applicable law, you are entitled to review your information held in
        our databases. If you find the information is incorrect, incomplete,
        unclear, or outdated, you may contact us to request its correction or
        deletion.
      </p>

      <h2 className={sectionHeadingClass}>9. Contact Us</h2>
      <p className={paragraphClass}>
        For any privacy-related requests, please contact us at:
      </p>
      <ul className="text-white/60 leading-relaxed mb-4 list-none space-y-1">
        <li>
          Email:{' '}
          <a
            href="mailto:info@weccelerate.co.il"
            className="text-[#c8a951] hover:text-[#e8d48b] underline underline-offset-2"
          >
            info@weccelerate.co.il
          </a>
        </li>
      </ul>
    </article>
  );
}
