import { ReactNode } from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { constructMetadata } from '@/lib/seo/metadata';
import { WhatsAppFloat } from '@/components/ui/WhatsAppFloat';
import { SkipToContent } from '@/components/ui/SkipToContent';

export const metadata: Metadata = constructMetadata({
  title: 'יש לך רעיון? בואו נתחיל · WeCcelerate',
  description:
    'ליווי אישי מהרעיון לסטארטאפ מצליח — 200+ יזמים, $150M+ גיוסים. שיחת ייעוץ חינם של 20 דקות עם יועץ בכיר. כל הצוות במקום אחד: עסקי, טכנולוגי, שיווק, משפטי.',
  siteKey: 'landing',
  path: '/',
  locale: 'he_IL',
  keywords: [
    'יזמות',
    'סטארטאפ',
    'רעיון לאפליקציה',
    'תוכנית עסקית',
    'הכנה למשקיעים',
    'יועץ עסקי',
    'פיתוח אפליקציה',
    'מיזם חדש',
    'פיתוח מוצר',
    'WeCcelerate',
  ],
});

interface LandingLayoutProps {
  children: ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#070b1e] text-white font-heebo overflow-x-hidden" dir="rtl">
      <SkipToContent />

      <header className="absolute top-0 left-0 right-0 z-50">
        <nav className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="relative h-12 sm:h-14 md:h-16 w-36 sm:w-44 md:w-52 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
            <Image
              src="/images/weccelerate-gold.png"
              alt="WeCcelerate"
              fill
              className="object-contain object-right"
              priority
            />
          </div>
          <a
            href="tel:+972555647538"
            dir="ltr"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-[#e8d48b] transition-colors"
          >
            📞 +972-55-564-7538
          </a>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[#030713] border-t border-white/5 py-10">
        <div className="container mx-auto px-4 flex flex-col items-center gap-4">
          <div className="relative h-12 w-40">
            <Image
              src="/images/weccelerate-gold.png"
              alt="WeCcelerate"
              fill
              className="object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            />
          </div>
          <div className="text-center text-xs text-white/30 px-4 leading-relaxed">
            © {new Date().getFullYear()} WeCcelerate Ltd. ·{' '}
            <a href="/privacy" className="hover:text-white/60 transition-colors">
              מדיניות פרטיות
            </a>{' '}
            ·{' '}
            <a href="/accessibility" className="hover:text-white/60 transition-colors">
              הצהרת נגישות
            </a>{' '}
            ·{' '}
            <a href="https://weccelerate.co.il" className="text-[#c8a951]/70 hover:text-[#c8a951] transition-colors">
              weccelerate.co.il ↗
            </a>
          </div>
        </div>
      </footer>

      <WhatsAppFloat />
    </div>
  );
}
