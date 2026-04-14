'use client';

import { motion } from 'framer-motion';
import {
  Stethoscope,
  TrendingUp,
  Users,
  Megaphone,
  Database,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SafeImage } from '@/components/landing-helpers/SafeImage';

interface Track {
  icon: React.ElementType;
  title: string;
  description: string;
  highlights: string[];
  image: string;
}

const TRACKS: Track[] = [
  {
    icon: Stethoscope,
    title: 'ייעוץ קליני',
    description:
      'חוות דעת מרופאים מומחים, ליווי בניסויים קליניים, ועדת הלסינקי ואישורים רפואיים.',
    highlights: ['רופאים מומחים', 'ניסויים קליניים', 'ועדת הלסינקי'],
    image: '/images/landing-assets/leumit/track-clinical.jpg',
  },
  {
    icon: TrendingUp,
    title: 'ייעוץ עסקי ופיננסי',
    description:
      'תוכנית עסקית מותאמת למשקיעי MedTech, מודל פיננסי ריאלי ומצגת גיוס שמשכנעת.',
    highlights: ['תוכנית עסקית', 'מודל פיננסי', 'Pitch Deck'],
    image: '/images/landing-assets/leumit/track-business.jpg',
  },
  {
    icon: Users,
    title: 'הכנה למשקיעים',
    description:
      'סימולציות פגישות, הכנה לשאלות קשות, וגישה לרשת של 200+ משקיעי MedTech מובילים.',
    highlights: ['סימולציות', '200+ משקיעים', 'Term Sheet'],
    image: '/images/landing-assets/leumit/track-investors.jpg',
  },
  {
    icon: Megaphone,
    title: 'אסטרטגיית שיווק',
    description:
      'מיצוב מותג רפואי, אסטרטגיית Go-to-Market, הכנה לכנסים בינלאומיים ו-PR מקצועי.',
    highlights: ['מיצוב מותג', 'Go-to-Market', 'כנסים בינלאומיים'],
    image: '/images/landing-assets/leumit/track-marketing.jpg',
  },
  {
    icon: Database,
    title: 'גישה לדאטה רפואי',
    description:
      'גישה ייחודית לדאטה אנונימית ממאגר לאומית עם 720,000+ מטופלים, באישור ועדת הלסינקי.',
    highlights: ['720K+ רשומות', 'דאטה אנונימית', 'אישור הלסינקי'],
    image: '/images/landing-assets/leumit/track-data.jpg',
  },
  {
    icon: ShieldCheck,
    title: 'ליווי FDA ו-CE',
    description:
      'ייעוץ רגולטורי ישיר למסלול FDA האמריקאי, סימון CE אירופי וליווי משרד הבריאות הישראלי.',
    highlights: ['FDA Pathway', 'CE Marking', 'משרד הבריאות'],
    image: '/images/landing-assets/leumit/track-fda.jpg',
  },
];

export default function TracksGrid() {
  return (
    <section
      id="tracks"
      className="relative py-20 md:py-28"
      style={{ background: 'linear-gradient(180deg, #040B16 0%, #060F1F 100%)' }}
    >
      <div className="container-corporate relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <ScrollReveal variant="up">
            <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.25em] mb-4">
              התוכנית
            </p>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={100}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
              6 מסלולי ליווי.{' '}
              <span className="bg-gradient-to-l from-cyan-400 to-[#D4AF37] bg-clip-text text-transparent">
                מעטפת אחת.
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={200}>
            <p className="text-lg text-white/55 leading-relaxed">
              כל מה שצריך כדי להפוך רעיון רפואי לחברה מצליחה — הכול תחת גג אחד, עם מומחים
              שהיו שם לפניכם.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRACKS.map((track, idx) => {
            const Icon = track.icon;
            return (
              <ScrollReveal key={idx} variant="up" delay={idx * 80}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group relative h-full rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-cyan-500/40 hover:from-cyan-500/[0.04] transition-all duration-500 overflow-hidden"
                  style={{ backdropFilter: 'blur(8px)' }}
                >
                  {/* Background image — top portion of card */}
                  <div className="relative h-40 overflow-hidden">
                    <SafeImage
                      src={track.image}
                      alt={track.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040B16] via-[#040B16]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-[#D4AF37]/10 group-hover:from-cyan-500/15 transition-all duration-500" />

                    {/* Floating icon */}
                    <div className="absolute bottom-4 right-5">
                      <motion.div
                        whileHover={{ rotate: 12, scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                        className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/30 to-[#D4AF37]/20 border border-cyan-400/40 backdrop-blur-md shadow-lg shadow-cyan-500/20"
                      >
                        <Icon className="w-7 h-7 text-cyan-300" />
                      </motion.div>
                    </div>

                    {/* Number badge */}
                    <div className="absolute top-4 left-4 text-xs font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-400/30 backdrop-blur-sm px-2.5 py-1 rounded-full tabular-nums">
                      0{idx + 1}
                    </div>
                  </div>

                  <div className="relative p-7 pt-6">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-50 transition-colors">
                      {track.title}
                    </h3>
                    <p className="text-white/55 text-sm leading-relaxed mb-5">
                      {track.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {track.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="text-[11px] text-cyan-300/70 bg-cyan-500/5 border border-cyan-500/15 px-2.5 py-1 rounded-full group-hover:bg-cyan-500/10 group-hover:border-cyan-500/25 transition-colors"
                        >
                          {h}
                        </span>
                      ))}
                    </div>

                    <a
                      href="#contact"
                      className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                    >
                      קראו עוד
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </a>
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
