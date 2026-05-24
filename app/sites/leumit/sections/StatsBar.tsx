/**
 * Pillars bar — qualitative value props, no hard numbers.
 *
 * Replaced the original "720K patients / 8.7M visits / 200+ investors / 6
 * tracks" stats with non-committal value pillars. Reason: in regulated
 * medtech we don't want to make data-backed promises on a public marketing
 * page (patient counts, conversion implied, "real results" etc.). Each
 * pillar speaks to a CAPABILITY we offer, not a measured outcome.
 */

import { Stethoscope, ShieldCheck, Users, Compass } from 'lucide-react';

interface Pillar {
  Icon: typeof Stethoscope;
  label: string;
  sub: string;
}

const PILLARS: Pillar[] = [
  {
    Icon: Stethoscope,
    label: 'גישה קלינית',
    sub: 'רופאים, מומחים ומסגרות פעולה ברשת לאומית',
  },
  {
    Icon: ShieldCheck,
    label: 'ליווי רגולטורי',
    sub: 'FDA, CE, ועדת הלסינקי ומשרד הבריאות',
  },
  {
    Icon: Users,
    label: 'רשת שותפים',
    sub: 'משקיעים, יזמים ושותפים אסטרטגיים',
  },
  {
    Icon: Compass,
    label: 'ליווי בינתחומי',
    sub: 'אסטרטגיה, מוצר, רגולציה ומימון תחת גג אחד',
  },
];

export default function StatsBar() {
  return (
    <section
      className="relative py-16 md:py-20 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #040B16 0%, #0a1628 50%, #040B16 100%)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />

      <div className="container-corporate relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {PILLARS.map(({ Icon, label, sub }, idx) => (
            <div
              key={idx}
              className="text-center md:border-l border-white/5 first:border-l-0 md:px-4"
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-[#D4AF37]/10 border border-cyan-400/30 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-cyan-500/10">
                  <Icon className="w-7 h-7 text-cyan-300" strokeWidth={1.6} />
                </div>
              </div>
              <div className="text-base sm:text-lg font-semibold text-white tracking-wide mb-1.5">
                {label}
              </div>
              <div className="text-xs sm:text-sm text-white/45 leading-relaxed max-w-[14rem] mx-auto">
                {sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
