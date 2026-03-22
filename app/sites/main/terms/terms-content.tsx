'use client';

import { useState } from 'react';
import Link from 'next/link';

type Language = 'he' | 'en';

export function TermsContent() {
  const [lang, setLang] = useState<Language>('he');

  return (
    <div>
      {/* Language Tabs */}
      <div className="flex border-b border-white/[0.06] mb-10">
        <button
          onClick={() => setLang('he')}
          className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
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
          className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
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
      {lang === 'he' ? <HebrewTerms /> : <EnglishTerms />}
    </div>
  );
}

// =============================================================================
// SHARED STYLES
// =============================================================================

const sectionHeadingClass =
  'text-xl font-bold text-white mb-4 mt-10 first:mt-0';
const paragraphClass = 'text-white/60 leading-relaxed mb-4';
const subHeadingClass = 'font-semibold text-white/80 mb-2 mt-6';

// =============================================================================
// HEBREW TERMS
// =============================================================================

function HebrewTerms() {
  return (
    <article dir="rtl" lang="he" className="prose-terms">
      <h2 className={sectionHeadingClass}>1. כללי</h2>
      <p className={paragraphClass}>
        ברוכים הבאים לאתר WeCcelerate (להלן: &quot;האתר&quot;). האתר מופעל על ידי חברת
        וויסלרייט בע&quot;מ (להלן: &quot;החברה&quot; או &quot;WeCcelerate&quot;). השימוש באתר,
        בתכניו ובשירותים המוצעים בו מעיד על הסכמתך לתנאים אלה.
      </p>

      <h2 className={sectionHeadingClass}>2. מהות האתר והגבלת אחריות</h2>
      <p className={paragraphClass}>
        האתר מספק מידע אודות שירותי החברה בתחומי היזמות, פיתוח עסקי, וטכנולוגיה
        רפואית.
      </p>

      <h3 className={subHeadingClass}>העדר ייעוץ</h3>
      <p className={paragraphClass}>
        המידע המופיע באתר אינו מהווה ייעוץ משפטי, פיננסי, רפואי או עסקי. כל
        הסתמכות על המידע הינה באחריות המשתמש בלבד.
      </p>

      <h3 className={subHeadingClass}>השקעות וגיוס הון</h3>
      <p className={paragraphClass}>
        אזכורים של גיוסי הון, סכומים או הצלחות עבר (כגון אקזיטים או תשואות)
        מוצגים למטרות אינפורמטיביות בלבד ואינם מהווים הבטחה לתשואה או הצעה
        מחייבת להשקעה.
      </p>

      <h3 className={subHeadingClass}>תחום רפואי (MedTech)</h3>
      <p className={paragraphClass}>
        שיתוף הפעולה עם &quot;לאומית שירותי בריאות&quot; או כל גוף רפואי אחר המוזכר
        באתר נועד לצרכי מחקר ופיתוח בלבד. האתר אינו מספק ייעוץ רפואי.
      </p>

      <h2 className={sectionHeadingClass}>3. קניין רוחני</h2>
      <p className={paragraphClass}>
        כל זכויות הקניין הרוחני באתר, לרבות העיצוב, הקוד, הלוגו, התוכן המילולי,
        הסרטונים והתמונות, הינם רכושה הבלעדי של החברה (או של צדדים שלישיים שהתירו
        לחברה להשתמש בהם). אין להעתיק, לשכפל, להפיץ או לעשות שימוש מסחרי בתוכן
        ללא אישור בכתב.
      </p>

      <h2 className={sectionHeadingClass}>4. פורטל יזמים ורישום</h2>
      <p className={paragraphClass}>
        חלק מהשירותים באתר (כגון &quot;פורטל היזמים&quot;) דורשים הרשמה. המשתמש
        אחראי לשמור על סודיות פרטי הכניסה שלו. החברה שומרת לעצמה את הזכות לחסום
        גישה למשתמש המפר את תנאי השימוש.
      </p>

      <h2 className={sectionHeadingClass}>5. פרטיות</h2>
      <p className={paragraphClass}>
        אנו מכבדים את פרטיות המשתמשים. השימוש באתר כפוף ל
        <Link href="/privacy" className="text-[#c8a951] hover:text-[#e8d48b] underline underline-offset-2">
          מדיניות הפרטיות
        </Link>{' '}
        שלנו, המפרטת כיצד נאסף ומעובד המידע (כולל Cookies וטפסי לידים).
      </p>

      <h2 className={sectionHeadingClass}>6. סמכות שיפוט</h2>
      <p className={paragraphClass}>
        על תנאי שימוש אלה יחולו דיני מדינת ישראל בלבד. סמכות השיפוט הבלעדית בכל
        עניין הקשור לאתר נתונה לבתי המשפט המוסמכים בעיר תל-אביב יפו.
      </p>

      <h2 className={sectionHeadingClass}>7. יצירת קשר</h2>
      <p className={paragraphClass}>
        לשאלות בנוגע לתנאי השימוש, ניתן לפנות אלינו:
      </p>
      <ul className="text-white/60 leading-relaxed mb-4 list-none space-y-1">
        <li>
          אימייל:{' '}
          <a
            href="mailto:info@weccelerate.co.il"
            className="text-[#c8a951] hover:text-[#e8d48b] underline underline-offset-2"
          >
            info@weccelerate.co.il
          </a>
        </li>
        <li>
          טלפון:{' '}
          <a
            href="tel:+972555647538"
            className="text-[#c8a951] hover:text-[#e8d48b] underline underline-offset-2"
          >
            055-564-7538
          </a>
        </li>
      </ul>
    </article>
  );
}

// =============================================================================
// ENGLISH TERMS
// =============================================================================

function EnglishTerms() {
  return (
    <article dir="ltr" lang="en" className="prose-terms">
      <h2 className={sectionHeadingClass}>1. General</h2>
      <p className={paragraphClass}>
        Welcome to the WeCcelerate website (the &quot;Site&quot;). The Site is operated by
        WeCcelerate Ltd. (the &quot;Company&quot;). By accessing or using the Site, you
        agree to be bound by these Terms of Use.
      </p>

      <h2 className={sectionHeadingClass}>2. Nature of Services &amp; Disclaimer</h2>
      <p className={paragraphClass}>
        The Site provides information regarding venture building, business
        development, and MedTech acceleration services.
      </p>

      <h3 className={subHeadingClass}>No Professional Advice</h3>
      <p className={paragraphClass}>
        The content provided on the Site does not constitute legal, financial,
        medical, or business advice. Reliance on any information is at your own
        risk.
      </p>

      <h3 className={subHeadingClass}>Investments &amp; Funding</h3>
      <p className={paragraphClass}>
        References to fundraising, past exits, or financial figures are for
        informational purposes only and do not guarantee future success or
        constitute a binding offer to invest.
      </p>

      <h3 className={subHeadingClass}>Medical Disclaimer (MedTech)</h3>
      <p className={paragraphClass}>
        Partnerships mentioned with &quot;Leumit Health Services&quot; or other medical
        entities are for R&amp;D purposes only. The Site does not provide medical
        advice or diagnosis.
      </p>

      <h2 className={sectionHeadingClass}>3. Intellectual Property</h2>
      <p className={paragraphClass}>
        All intellectual property rights in the Site, including design, code,
        logos, text, videos, and images, are the exclusive property of the
        Company (or third parties who have licensed usage). You may not copy,
        reproduce, distribute, or use the content for commercial purposes without
        written consent.
      </p>

      <h2 className={sectionHeadingClass}>4. Entrepreneur Portal &amp; Registration</h2>
      <p className={paragraphClass}>
        Certain features (such as the &quot;Entrepreneur Portal&quot;) may require
        registration. You are responsible for maintaining the confidentiality of
        your login credentials. The Company reserves the right to terminate
        access for users violating these terms.
      </p>

      <h2 className={sectionHeadingClass}>5. Privacy</h2>
      <p className={paragraphClass}>
        We respect your privacy. Use of the Site is subject to our{' '}
        <Link href="/privacy" className="text-[#c8a951] hover:text-[#e8d48b] underline underline-offset-2">
          Privacy Policy
        </Link>
        , which details how data is collected and processed (including
        Cookies and lead forms).
      </p>

      <h2 className={sectionHeadingClass}>6. Governing Law &amp; Jurisdiction</h2>
      <p className={paragraphClass}>
        These Terms shall be governed by the laws of the State of Israel. The
        competent courts in Tel Aviv-Yafo shall have exclusive jurisdiction over
        any dispute arising from the use of the Site.
      </p>

      <h2 className={sectionHeadingClass}>7. Contact Us</h2>
      <p className={paragraphClass}>
        For questions regarding these Terms, please contact us at:
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
        <li>
          Phone:{' '}
          <a
            href="tel:+972555647538"
            className="text-[#c8a951] hover:text-[#e8d48b] underline underline-offset-2"
          >
            +972-55-564-7538
          </a>
        </li>
      </ul>
    </article>
  );
}
