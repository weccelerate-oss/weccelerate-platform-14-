import { ReactNode } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { constructMetadata } from '@/lib/seo/metadata';
import { LeumitPartnerSchema } from '@/components/seo/organization-schema';
import { ServiceSchema, MedicalRegulationServiceSchema } from '@/components/seo/service-schema';
import { FAQSchema } from '@/components/seo/faq-schema';
import { WhatsAppFloat } from '@/components/ui/WhatsAppFloat';
import { SkipToContent } from '@/components/ui/SkipToContent';

export const metadata: Metadata = constructMetadata({
  title: 'ליווי MedTech עם לאומית · WeCcelerate',
  description:
    'ליווי מעטפת 360° ליזמי MedTech — גישה ל-720,000 מטופלים, רופאים מומחים, ייעוץ FDA וליווי רגולטורי. שותפות אסטרטגית לאומית × WeCcelerate.',
  siteKey: 'leumit',
  path: '/',
  locale: 'he_IL',
  keywords: [
    'MedTech Israel',
    'האצה רפואית',
    'סטארטאפ רפואי',
    'לאומית שירותי בריאות',
    'FDA ישראל',
    'רגולציה רפואית',
    'Digital Health',
    'בריאות דיגיטלית',
    'קליני פיילוט',
    'Medical Accelerator Israel',
  ],
});

interface LeumitLayoutProps {
  children: ReactNode;
}

export default function LeumitLayout({ children }: LeumitLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#040B16] text-white font-heebo" dir="rtl">
      <LeumitPartnerSchema />
      <MedicalRegulationServiceSchema />
      <ServiceSchema
        services={['medical', 'mvp', 'funding']}
        site="leumit"
        includeRating={true}
      />
      <FAQSchema
        includeDefaults={true}
        category="leumit"
        lang="he"
        pageUrl="https://leumit.weccelerate.co.il"
      />

      <SkipToContent />

      <header className="sticky top-0 z-50 bg-[#040B16]/90 backdrop-blur-md border-b border-cyan-500/10">
        <div className="bg-gradient-to-l from-cyan-600/15 via-cyan-500/10 to-[#D4AF37]/15 text-cyan-50 text-xs py-2 border-b border-cyan-500/10">
          <div className="container mx-auto px-4 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>שותפות אסטרטגית · Leumit × WeCcelerate · MedTech Innovation</span>
          </div>
        </div>

        <nav className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 group flex-shrink min-w-0">
            <Image
              src="/images/leumit-weccelerate-transparent.png"
              alt="Leumit × WeCcelerate"
              width={320}
              height={80}
              className="h-10 sm:h-12 md:h-14 w-auto object-contain group-hover:opacity-90 transition-opacity drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              priority
            />
          </Link>

          <div className="hidden lg:flex items-center gap-6 text-sm text-white/70">
            <a href="#tracks" className="hover:text-cyan-400 transition-colors">
              מסלולים
            </a>
            <a href="#advisory" className="hover:text-cyan-400 transition-colors">
              ועדה מייעצת
            </a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors">
              שאלות נפוצות
            </a>
            <a href="https://weccelerate.co.il" className="hover:text-white transition-colors text-white/40">
              weccelerate.co.il ↗
            </a>
          </div>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-lg shadow-cyan-500/20 hover:scale-[1.03] transition-transform text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
          >
            קבלו ייעוץ
          </a>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[#020611] border-t border-cyan-500/10">
        <div className="container mx-auto px-4 py-14">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <Image
                src="/images/leumit-weccelerate-transparent.png"
                alt="Leumit WeCcelerate"
                width={280}
                height={80}
                className="h-12 sm:h-14 w-auto object-contain mb-5 drop-shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              />
              <p className="text-white/50 leading-relaxed mb-5 max-w-md text-sm">
                שותפות אסטרטגית להאצת חדשנות רפואית בישראל. ליווי מלא ליזמי MedTech — מרעיון לאישור רגולטורי ולהשקה בינלאומית.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  FDA Consulting
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  CE Marking
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  Clinical Trials
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  Helsinki Committee
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">מסלולים</h3>
              <ul className="space-y-2.5 text-sm text-white/50">
                <li><a href="#tracks" className="hover:text-cyan-400 transition-colors">ייעוץ קליני</a></li>
                <li><a href="#tracks" className="hover:text-cyan-400 transition-colors">ייעוץ עסקי ופיננסי</a></li>
                <li><a href="#tracks" className="hover:text-cyan-400 transition-colors">הכנה למשקיעים</a></li>
                <li><a href="#tracks" className="hover:text-cyan-400 transition-colors">גישה לדאטה רפואי</a></li>
                <li><a href="#tracks" className="hover:text-cyan-400 transition-colors">ליווי FDA ו-CE</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">צרו קשר</h3>
              <address className="not-italic space-y-2 text-sm text-white/50">
                <p>רחוב הרכבת 58, תל אביב</p>
                <p>
                  <a href="tel:+972555647538" className="hover:text-cyan-400 transition-colors" dir="ltr">
                    +972-55-564-7538
                  </a>
                </p>
                <p>
                  <a href="mailto:info@weccelerate.co.il" className="hover:text-cyan-400 transition-colors">
                    info@weccelerate.co.il
                  </a>
                </p>
                <p className="text-xs text-white/30 pt-2">ראשון-חמישי · 09:00-18:00</p>
              </address>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5">
          <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <p className="text-white/30">
              © {new Date().getFullYear()} WeCcelerate Ltd. בשותפות עם לאומית שירותי בריאות.
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link href="/privacy" className="text-white/30 hover:text-white/60 transition-colors">
                מדיניות פרטיות
              </Link>
              <Link href="/accessibility" className="text-white/30 hover:text-white/60 transition-colors">
                הצהרת נגישות
              </Link>
              <Link href="https://www.leumit.co.il" className="text-cyan-400/70 hover:text-cyan-400 transition-colors">
                leumit.co.il ↗
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <WhatsAppFloat />
    </div>
  );
}
