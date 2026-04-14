'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface FAQ {
  question: string;
  answer: string;
}

export const LEUMIT_FAQS: FAQ[] = [
  {
    question: 'כמה עולה להצטרף לתוכנית MedTech של לאומית × WeCcelerate?',
    answer:
      'המודל הכלכלי גמיש ומותאם לכל יזם — שילוב של Equity, Retainer חודשי ו/או Success Fee על גיוסים. פגישת הייעוץ הראשונה היא חינם וללא התחייבות, ובה נבין יחד את הצרכים והמסלול המתאים.',
  },
  {
    question: 'מה דרוש כדי להתקבל לתוכנית?',
    answer:
      'אנו מלווים יזמים בכל השלבים — מרעיון ראשוני ועד חברה עם מוצר ראשוני. הקריטריונים העיקריים: צורך רפואי אמיתי ומוכח, צוות מייסד מחויב, וחזון ברור. שלבי סינון כוללים שיחת היכרות, ניתוח היתכנות וראיון עם הוועדה הרפואית.',
  },
  {
    question: 'האם אקבל גישה לדאטה הרפואי של לאומית?',
    answer:
      'כן. יזמים שמתקבלים לתוכנית יכולים לבקש גישה לדאטה אנונימית ממאגר של 720,000+ מטופלים ו-8.7 מיליון ביקורים שנתיים, בכפוף לאישור ועדת הלסינקי של לאומית, התאמה לרגולציית הגנת הפרטיות, ולבקשת מחקר מובנית.',
  },
  {
    question: 'כמה זמן לוקח התהליך?',
    answer:
      'משך הליווי משתנה לפי שלב הסטארטאפ: יזמים בשלב רעיוני משלימים בדרך כלל תוך 6-9 חודשים שלב POC ראשוני. סטארטאפים עם מוצר ראשוני (MVP) יכולים לסיים את כל מסלול הרגולציה ולהגיע להכנה לגיוס תוך 12-18 חודשים.',
  },
  {
    question: 'מה קורה אחרי שמסיימים את התוכנית?',
    answer:
      'אנחנו לא נעלמים אחרי ההשקה. ממשיכים ללוות את החברה ברמה אסטרטגית, מחברים למשקיעי המשך מהרשת שלנו, מסייעים בהרחבה לשווקים חדשים (FDA / CE), ושומרים על זכאות לתמיכה מלאומית לאורך זמן.',
  },
  {
    question: 'האם התוכנית פתוחה ליזמים מחו״ל?',
    answer:
      'בהחלט. התוכנית פתוחה ליזמים בינלאומיים שמחפשים את הגישה הייחודית למערכת הבריאות הישראלית כפלטפורמת Pilot רפואית. המפגשים מתקיימים בעברית או באנגלית לפי הצורך.',
  },
  {
    question: 'האם WeCcelerate משקיעה כסף בסטארטאפים?',
    answer:
      'WeCcelerate אינה קרן הון סיכון מסורתית, אך אנו עובדים בשילוב עם רשת של 200+ משקיעים ומסייעים בגיוס ישיר מהם. במקרים מסוימים מודל התמחור כולל Equity כחלק מה-Success Fee של התוכנית.',
  },
  {
    question: 'מה ההבדל בין התוכנית הזו לבין האצה רגילה?',
    answer:
      'רוב ההאצות מתמחות בעסקי בלבד, או בטק בלבד. התוכנית שלנו ייחודית בכך שהיא משלבת ליווי עסקי מקצה לקצה יחד עם גישה ייחודית למערכת בריאות פעילה (לאומית), ייעוץ רגולטורי בין-לאומי (FDA), ורופאים מומחים שזמינים לייעוץ שוטף — תחת גג אחד.',
  },
];

export default function FAQLeumit() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-20 md:py-28 bg-[#040B16]">
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent"
      />

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
                מה עוד אתם רוצים לדעת?
              </h2>
            </ScrollReveal>
            <ScrollReveal variant="up" delay={200}>
              <p className="text-white/55 text-lg">
                כל השאלות החשובות — עם תשובות ישירות וכנות.
              </p>
            </ScrollReveal>
          </div>

          <div className="space-y-3">
            {LEUMIT_FAQS.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <ScrollReveal key={idx} variant="up" delay={idx * 60}>
                  <div
                    className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                      isOpen
                        ? 'border-cyan-500/30 bg-gradient-to-b from-cyan-500/[0.04] to-transparent'
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
                          isOpen ? 'text-cyan-50' : 'text-white'
                        }`}
                      >
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${
                          isOpen ? 'text-cyan-400 rotate-180' : 'text-white/40'
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

      {/* JSON-LD FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: LEUMIT_FAQS.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </section>
  );
}
