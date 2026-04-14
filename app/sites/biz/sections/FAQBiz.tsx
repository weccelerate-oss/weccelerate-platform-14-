'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const FAQS = [
  {
    question: 'מה זה Venture Building לארגונים ובמה זה שונה מייעוץ רגיל?',
    answer:
      'ייעוץ רגיל נגמר ב-PowerPoint — אנחנו לא. אנחנו בונים את המיזם בפועל: צוות, מוצר, פיילוטים, גיוס. אתם לא מקבלים מסמך — אתם מקבלים חברה פועלת. זה ההבדל בין "המלצנו" לבין "עשינו".',
  },
  {
    question: 'איך מתחלק ה-Equity בסוף?',
    answer:
      'תלוי במודל: ב-Equity Deal אנחנו שומרים על מיעוט מוסכם מראש (בדרך כלל 10-25%) כתמריץ להצלחה. ב-Retainer אתם משלמים חודשי ושומרים 100% מה-IP. ב-Success Fee אנחנו מקבלים אחוז מגיוס/exit. כל ההסכמים שקופים ונידונים מראש.',
  },
  {
    question: 'כמה זמן לוקח עד שיש לנו יחידה עצמאית פועלת?',
    answer:
      'שלבי אבחון ועיצוב נמשכים 2-3 חודשים. MVP ראשון מוכן תוך 3-6 חודשים נוספים. Spin-off מלא עם גיוס ראשון — בדרך כלל 12-18 חודשים מתחילת התהליך. הכל תלוי במורכבות הטכנולוגית ובבשלות השוק.',
  },
  {
    question: 'האם אתם עובדים עם חברות קטנות-בינוניות (SMB) או רק עם תאגידים?',
    answer:
      'שני הסוגים. יש לנו התאמה למסלול קצר יותר (3-6 חודשים) לחברות קטנות-בינוניות שרוצות להקים מוצר חדש או לפתח יחידה חדשה. התאגידים הגדולים מקבלים מסלול מלא של 12-18 חודשים.',
  },
  {
    question: 'מה קורה אם המיזם לא עובד?',
    answer:
      'יש לנו 4 decision points במהלך המסלול. בכל שלב אתם מקבלים דוח שקוף שמראה מה עובד ומה לא. אם מחליטים לעצור — עוצרים בלי מלחמות. אתם שומרים על כל ה-IP שנוצר, ואנחנו נפרדים בידידות. זה הסטנדרט.',
  },
  {
    question: 'האם אתם מגייסים במקומנו?',
    answer:
      'אנחנו פותחים דלתות — לא חותמים במקומכם. ברשת שלנו 200+ משקיעים (VCs, אנג׳לים, אסטרטגיים). אנחנו מציגים אתכם, מכינים אתכם לפגישות, ותומכים במו״מ. החתימה תמיד שלכם.',
  },
  {
    question: 'מה עם סודיות (NDA) וקניין רוחני?',
    answer:
      'NDA נחתם לפני הפגישה הראשונה, עוד לפני שמראים לכם פרטים. ה-IP שנוצר במסגרת המיזם מוגדר ברור בחוזה — בדרך כלל שייך לחברה החדשה שמוקמת, עם רישיונות חזרה אליכם לצרכים הקיימים.',
  },
];

export default function FAQBiz() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-20 md:py-28 bg-[#070b1e]">
      <div className="container-corporate">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <ScrollReveal variant="up">
              <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.25em] mb-4">
                שאלות נפוצות
              </p>
            </ScrollReveal>
            <ScrollReveal variant="up" delay={100}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                השאלות של מנכ״לים
              </h2>
            </ScrollReveal>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <ScrollReveal key={idx} variant="up" delay={idx * 60}>
                  <div
                    className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                      isOpen
                        ? 'border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.04] to-transparent'
                        : 'border-white/8 bg-white/[0.02] hover:border-white/15'
                    }`}
                  >
                    <button
                      onClick={() => setOpenIdx(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-4 p-5 text-right"
                      aria-expanded={isOpen}
                    >
                      <h3
                        className={`text-base md:text-lg font-semibold flex-1 transition-colors ${
                          isOpen ? 'text-emerald-50' : 'text-white'
                        }`}
                      >
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${
                          isOpen ? 'text-emerald-400 rotate-180' : 'text-white/40'
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-white/60 leading-relaxed text-sm md:text-base border-t border-white/5 pt-4">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          }),
        }}
      />
    </section>
  );
}
