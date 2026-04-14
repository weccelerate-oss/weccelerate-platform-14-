import { ReactNode } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { constructMetadata } from '@/lib/seo/metadata';
import { WhatsAppFloat } from '@/components/ui/WhatsAppFloat';
import { SkipToContent } from '@/components/ui/SkipToContent';

export const metadata: Metadata = constructMetadata({
  title: 'Venture Builder לארגונים · WeCcelerate Business',
  description:
    'אנחנו ה-Venture Builder של תאגידים ישראלים — בונים יחידות חדשנות, מוצרים חדשים ומיזמי Spin-off מהאבחון ועד ההשקה. 40+ מיזמים, $150M+ גיוסים.',
  siteKey: 'biz',
  path: '/',
  locale: 'he_IL',
  keywords: [
    'Corporate Venture Building',
    'intrapreneurship Israel',
    'חדשנות בארגונים',
    'פיתוח מוצר לתאגידים',
    'ספין-אוף ישראל',
    'Innovation Unit',
    'Enterprise Innovation',
    'WeCcelerate Business',
  ],
});

interface BizLayoutProps {
  children: ReactNode;
}

export default function BizLayout({ children }: BizLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#070b1e] text-white font-heebo" dir="rtl">
      <SkipToContent />

      <header className="sticky top-0 z-50 bg-[#070b1e]/90 backdrop-blur-md border-b border-white/5">
        <nav className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink min-w-0">
            <div className="relative h-10 sm:h-12 md:h-14 w-32 sm:w-36 md:w-44 flex-shrink-0">
              <Image
                src="/images/weccelerate-gold.png"
                alt="WeCcelerate"
                fill
                className="object-contain object-right group-hover:opacity-90 transition-opacity drop-shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                priority
              />
            </div>
            <span className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded whitespace-nowrap">
              Business
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-6 text-sm text-white/60">
            <a href="#problem" className="hover:text-emerald-300 transition-colors">
              הבעיה
            </a>
            <a href="#process" className="hover:text-emerald-300 transition-colors">
              התהליך
            </a>
            <a href="#cases" className="hover:text-emerald-300 transition-colors">
              Case Studies
            </a>
            <a href="#faq" className="hover:text-emerald-300 transition-colors">
              שאלות נפוצות
            </a>
          </div>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-lg shadow-emerald-500/20 hover:scale-[1.03] transition-transform text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
          >
            תיאום שיחה
          </a>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[#030713] border-t border-white/5">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-10 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-14 sm:h-16 w-44 sm:w-52">
                  <Image
                    src="/images/weccelerate-gold.png"
                    alt="WeCcelerate"
                    fill
                    className="object-contain object-right drop-shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                  />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-1 rounded">
                  Business
                </span>
              </div>
              <p className="text-white/50 leading-relaxed max-w-lg text-sm">
                ה-Venture Builder המוביל בישראל לארגונים. אנחנו בונים לכם יחידות חדשנות עצמאיות, ממאבחון הזדמנות ועד השקה מוצלחת — בלי לסכן את הליבה.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">צרו קשר</h3>
              <address className="not-italic space-y-2 text-sm text-white/50">
                <p>רחוב הרכבת 58, תל אביב</p>
                <p>
                  <a href="tel:+972555647538" className="hover:text-emerald-400 transition-colors" dir="ltr">
                    +972-55-564-7538
                  </a>
                </p>
                <p>
                  <a href="mailto:business@weccelerate.co.il" className="hover:text-emerald-400 transition-colors">
                    business@weccelerate.co.il
                  </a>
                </p>
              </address>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <p className="text-white/30">
              © {new Date().getFullYear()} WeCcelerate Ltd. כל הזכויות שמורות.
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link href="/privacy" className="text-white/30 hover:text-white/60 transition-colors">
                מדיניות פרטיות
              </Link>
              <Link href="/accessibility" className="text-white/30 hover:text-white/60 transition-colors">
                הצהרת נגישות
              </Link>
              <a href="https://weccelerate.co.il" className="text-emerald-400/70 hover:text-emerald-400 transition-colors">
                weccelerate.co.il ↗
              </a>
            </div>
          </div>
        </div>
      </footer>

      <WhatsAppFloat />
    </div>
  );
}
