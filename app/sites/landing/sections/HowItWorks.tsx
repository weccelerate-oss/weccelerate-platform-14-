'use client';

import { MessageCircle, Map, Users, Award } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const STEPS = [
  {
    num: '1',
    icon: MessageCircle,
    title: 'שיחת היכרות',
    duration: '20 דקות · חינם',
    description: 'נכיר אתכם, נשמע על הרעיון, נבין מה הצרכים והאתגרים.',
  },
  {
    num: '2',
    icon: Map,
    title: 'תוכנית פעולה',
    duration: 'תוך שבוע',
    description: 'נבנה יחד מסלול אישי: מה לעשות, באיזה סדר, ומה יעלה.',
  },
  {
    num: '3',
    icon: Users,
    title: 'ליווי צמוד',
    duration: 'עד ההצלחה',
    description: 'הצוות שלנו עובד לצד שלכם — לא במקומכם. אנחנו שותפים, לא ספקים.',
  },
  {
    num: '4',
    icon: Award,
    title: 'השקה והצלחה',
    duration: 'יחד',
    description: 'מהגיוס הראשון ועד הכניסה לשוק הבינלאומי — ממשיכים לצד שלכם.',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-20 md:py-24 bg-[#070b1e]">
      <div className="container-corporate">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <ScrollReveal variant="up">
            <p className="text-[#c8a951] text-sm font-bold uppercase tracking-[0.22em] mb-4">
              איך זה עובד
            </p>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={100}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              פשוט. ברור. בלי הפתעות.
            </h2>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={idx} variant="up" delay={idx * 100}>
                <div className="relative h-full p-6 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-[#c8a951]/25 hover:bg-[#c8a951]/[0.02] transition-all duration-500">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c8a951]/15 to-[#c8a951]/5 border border-[#c8a951]/25 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-[#c8a951]" />
                      </div>
                      <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#c8a951] text-[#070b1e] text-xs font-bold flex items-center justify-center">
                        {step.num}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-[#e8d48b]/70 text-xs font-semibold mb-3">{step.duration}</p>
                  <p className="text-white/55 text-sm leading-relaxed">{step.description}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
