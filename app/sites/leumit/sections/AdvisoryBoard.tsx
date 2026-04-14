'use client';

import Image from 'next/image';
import { Linkedin } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface Advisor {
  name: string;
  role: string;
  bio: string;
  image: string;
}

const ADVISORS: Advisor[] = [
  {
    name: 'אלון פנחס',
    role: 'CEO & Founder · WeCcelerate',
    bio: 'רו״ח, יזם סדרתי. הוביל מהלכים פיננסיים באינטל ובונה מיזמים טכנולוגיים יותר מעשור.',
    image: '/images/team/alon.jpg',
  },
  {
    name: 'עידו סבג',
    role: 'CTO & VP Technology · WeCcelerate',
    bio: 'מהנדס מכונות (Magna Cum Laude), בעל חברת R&D המוכרת על ידי רשות החדשנות. מוביל פיתוח מוצר קצה-לקצה.',
    image: '/images/team/ido.jpg',
  },
  {
    name: 'אברהם הינוך',
    role: 'VP Marketing · WeCcelerate',
    bio: 'מומחה שיווק דיגיטלי, PR ומיצוב מותג. מלווה סטארטאפים רפואיים בכניסה לשווקים בינלאומיים.',
    image: '/images/team/avraham.jpg',
  },
];

export default function AdvisoryBoard() {
  return (
    <section id="advisory" className="relative py-20 md:py-28 bg-[#040B16]">
      <div className="container-corporate">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <ScrollReveal variant="up">
            <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.25em] mb-4">
              ועדה מייעצת
            </p>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={100}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
              המומחים שמלווים אתכם
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={200}>
            <p className="text-lg text-white/55 leading-relaxed">
              צוות מייסדים ושותפים אסטרטגיים עם ניסיון מוכח בבניית חברות MedTech — משלב
              הרעיון ועד ליציאה לשווקים בינלאומיים.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {ADVISORS.map((advisor, idx) => (
            <ScrollReveal key={idx} variant="up" delay={idx * 120}>
              <div className="group relative rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-b from-white/[0.02] to-transparent hover:border-cyan-500/30 transition-all duration-500">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={advisor.image}
                    alt={advisor.name}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040B16] via-[#040B16]/50 to-transparent" />

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <a
                      href="#"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 backdrop-blur-sm hover:bg-cyan-500/30 transition-colors"
                      aria-label={`LinkedIn ${advisor.name}`}
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{advisor.name}</h3>
                  <p className="text-cyan-400 text-sm font-medium mb-3">{advisor.role}</p>
                  <p className="text-white/50 text-sm leading-relaxed">{advisor.bio}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal variant="up" delay={400}>
          <div className="text-center mt-12">
            <p className="text-xs text-white/30">
              + ועדה רפואית ייעודית הכוללת רופאים ומומחי רגולציה מלאומית שירותי בריאות
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
