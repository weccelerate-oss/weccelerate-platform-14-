'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const FAQS = [
  {
    question: 'כמה עולה שיחת הייעוץ?',
    answer:
      'שיחת הייעוץ הראשונה היא חינם לחלוטין — ללא התחייבות, ללא עלות נסתרת. 20 דקות עם יועץ בכיר שישמע אתכם ויתן לכם תמונת מצב כנה.',
  },
  {
    question: 'מתי מתחילים לשלם?',
    answer:
      'רק אחרי שהבנו יחד את הצרכים והכיוון. אין תשלום לפני שאתם יודעים בדיוק על מה אתם משלמים, מה אתם מקבלים, ומה הזמן הצפוי. כל המחירים גלויים ושקופים.',
  },
  {
    question: 'האם זה מתאים ליזם שמתחיל מאפס?',
    answer:
      'בהחלט. רוב היזמים שאנחנו מלווים מגיעים עם רעיון בלבד. דווקא בשלב הזה הערך שלנו הכי גבוה — אנחנו חוסכים לכם שנים של ניסוי וטעייה, ונעזור לכם לתכנן נכון מהתחלה.',
  },
  {
    question: 'כמה זמן לוקח לראות תוצאות?',
    answer:
      'זה תלוי במסלול. תוכנית עסקית מוכנה תוך 4-6 שבועות. MVP של אפליקציה — 3-5 חודשים. גיוס ראשון — 6-12 חודשים. בכל שלב יש לכם KPI-ים ברורים ותוצאות קונקרטיות.',
  },
  {
    question: 'מה ההבדל ביניכם לבין יועץ עסקי רגיל?',
    answer:
      'יועץ רגיל נותן לכם עצה. אנחנו עושים את העבודה — יחד איתכם. יש לנו צוות טכני, צוות שיווק, משפטנים, ומומחי גיוס. הכול תחת גג אחד. אתם לא צריכים לרדוף אחרי 5 ספקים שונים.',
  },
];

export default function FAQLanding() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="relative py-20 md:py-24 bg-[#070b1e]">
      <div className="container-corporate">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <ScrollReveal variant="up">
              <p className="text-[#c8a951] text-sm font-bold uppercase tracking-[0.22em] mb-4">
                שאלות נפוצות
              </p>
            </ScrollReveal>
            <ScrollReveal variant="up" delay={100}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                מה עוד חשוב לדעת
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
                        ? 'border-[#c8a951]/30 bg-gradient-to-b from-[#c8a951]/[0.04] to-transparent'
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
                          isOpen ? 'text-[#e8d48b]' : 'text-white'
                        }`}
                      >
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${
                          isOpen ? 'text-[#c8a951] rotate-180' : 'text-white/40'
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
