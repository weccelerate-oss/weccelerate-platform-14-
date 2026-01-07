import { ReactNode } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { constructPrivateMetadata } from '@/lib/seo/metadata';
import { LeumitPartnerSchema } from '@/components/seo/organization-schema';
import { ServiceSchema, MedicalRegulationServiceSchema } from '@/components/seo/service-schema';
import { FAQSchema, LeumitFAQ } from '@/components/seo/faq-schema';

// Leumit portal - indexed for GEO authority
export const metadata: Metadata = constructPrivateMetadata({
  title: 'WeCcelerate x Leumit | תוכנית חדשנות בריאותית',
  description: 'שותפות אסטרטגית בין WeCcelerate ללאומית שירותי בריאות להאצת סטארטאפים בתחום הבריאות הדיגיטלית, מכשור רפואי וחדשנות רפואית.',
  siteKey: 'leumit',
});

interface LeumitLayoutProps {
  children: ReactNode;
}

export default function LeumitLayout({ children }: LeumitLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-teal-50/30">
      {/* GEO Authority - Enhanced JSON-LD for Medical Trust */}
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

      {/* Leumit-branded header */}
      <header className="sticky top-0 z-50 bg-white border-b border-teal-200 shadow-sm">
        {/* Partnership banner */}
        <div className="bg-gradient-to-l from-teal-600 to-teal-700 text-white text-sm py-2">
          <div className="container mx-auto px-4 flex items-center justify-center gap-2">
            <span>🏥</span>
            <span>שותפות אסטרטגית עם לאומית שירותי בריאות</span>
            <span className="mx-2">|</span>
            <Link href="https://www.leumit.co.il" className="underline hover:no-underline">
              leumit.co.il
            </Link>
          </div>
        </div>

        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* WeCcelerate Logo */}
            <Link href="/" className="font-bold text-xl text-royal-700 hover:text-royal-600 transition-colors">
              WeCcelerate
            </Link>
            <span className="text-slate-400">×</span>
            {/* Leumit Branding */}
            <div className="flex items-center gap-2">
              <div className="font-bold text-lg text-teal-700">
                לאומית
              </div>
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium">
                Health Innovation
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/services/medical-regulation" className="text-slate-600 hover:text-teal-700 transition-colors">
                רגולציה רפואית
              </Link>
              <Link href="/programs" className="text-slate-600 hover:text-teal-700 transition-colors">
                תוכניות
              </Link>
              <Link href="/success-stories" className="text-slate-600 hover:text-teal-700 transition-colors">
                סיפורי הצלחה
              </Link>
            </nav>
            <Link
              href="/apply"
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
            >
              הגשת מועמדות
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* Leumit-branded footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Partnership info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl font-bold text-white">WeCcelerate</span>
                <span className="text-slate-500">×</span>
                <span className="text-xl font-bold text-teal-400">לאומית</span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-4">
                שותפות אסטרטגית להאצת חדשנות בתחום הבריאות הדיגיטלית. 
                יחד אנחנו מקדמים סטארטאפים ישראלים בתחומי המדטק, בריאות דיגיטלית ו-AI רפואי.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  FDA Consulting
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  CE Marking
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  ISO 13485
                </span>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-white font-semibold mb-4">שירותים</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/services/medical-regulation" className="hover:text-teal-400 transition-colors">ייעוץ רגולציה רפואית</Link></li>
                <li><Link href="/services/fda-consulting" className="hover:text-teal-400 transition-colors">הכנה ל-FDA 510(k)</Link></li>
                <li><Link href="/services/ce-marking" className="hover:text-teal-400 transition-colors">תקן CE והתאמה ל-MDR</Link></li>
                <li><Link href="/services/clinical-trials" className="hover:text-teal-400 transition-colors">ניסויים קליניים</Link></li>
                <li><Link href="/services/digital-health" className="hover:text-teal-400 transition-colors">בריאות דיגיטלית</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">צרו קשר</h3>
              <address className="not-italic space-y-2 text-sm text-slate-400">
                <p>מגדל עזריאלי שרונה, קומה 35</p>
                <p>תל אביב, ישראל</p>
                <p className="pt-2">
                  <a href="tel:+97235551234" className="hover:text-teal-400 transition-colors">
                    03-555-1234
                  </a>
                </p>
                <p>
                  <a href="mailto:leumit@weccelerate.co.il" className="hover:text-teal-400 transition-colors">
                    leumit@weccelerate.co.il
                  </a>
                </p>
              </address>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800">
          <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p className="text-slate-500">
              © {new Date().getFullYear()} WeCcelerate Ltd. בשותפות עם לאומית שירותי בריאות.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-slate-500 hover:text-white transition-colors">
                מדיניות פרטיות
              </Link>
              <Link href="/terms" className="text-slate-500 hover:text-white transition-colors">
                תנאי שימוש
              </Link>
              <Link href="https://www.leumit.co.il" className="text-teal-400 hover:text-teal-300 transition-colors">
                leumit.co.il ↗
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
