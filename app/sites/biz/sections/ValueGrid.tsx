'use client';

import {
  UsersRound,
  Workflow,
  Network,
  HandshakeIcon,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const VALUES = [
  {
    icon: UsersRound,
    title: 'צוות יעודי מהיום הראשון',
    description: 'CTO, מנהל מוצר, דיזיינר, מפתחים — צוות שלם מתכנסים סביב המיזם שלכם מיד.',
  },
  {
    icon: Workflow,
    title: 'מתודולוגיה מוכחת',
    description: '40+ מיזמים שהוקמו תחת הגג שלנו. אנחנו לא מנסים — אנחנו יודעים מה עובד.',
  },
  {
    icon: Network,
    title: 'רשת 200+ משקיעים',
    description: 'גישה ישירה לקרנות הון סיכון, אנג׳לים ולקוחות אסטרטגיים בישראל ובחו״ל.',
  },
  {
    icon: HandshakeIcon,
    title: 'שותפות אסטרטגית',
    description: 'אנחנו לא ספקים — אנחנו שותפים. אתם חלק מכל החלטה מהותית לאורך הדרך.',
  },
  {
    icon: DollarSign,
    title: 'גמישות בתמחור',
    description: 'Equity, Success Fee, Retainer, או שילוב. המודל מתאים את עצמו למבנה ולצרכים שלכם.',
  },
  {
    icon: ShieldCheck,
    title: 'יציאה נקייה',
    description: 'IP מלא נשאר אצלכם. הסכם שותפות ברור, ללא מלכודות, עם נקודות יציאה שקופות.',
  },
];

export default function ValueGrid() {
  return (
    <section className="relative py-20 md:py-28 bg-[#070b1e]">
      <div className="container-corporate">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <ScrollReveal variant="up">
            <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.25em] mb-4">
              מה אתם מקבלים
            </p>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={100}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
              6 דברים שלא תקבלו במקום אחר
            </h2>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {VALUES.map((value, idx) => {
            const Icon = value.icon;
            return (
              <ScrollReveal key={idx} variant="up" delay={idx * 80}>
                <div className="group h-full p-6 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-emerald-500/30 hover:bg-emerald-500/[0.03] transition-all duration-500">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{value.description}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
