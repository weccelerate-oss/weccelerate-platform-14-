import { Suspense } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle, Navigation, Map } from 'lucide-react';
import { ContactForm } from './ContactForm';

// Skip prerendering - this page uses useSearchParams
export const dynamic = 'force-dynamic';

export default function ContactPage() {
  return (
    <main id="main-content">
      {/* Hero */}
      <section className="relative bg-slate-900 py-20 md:py-28">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500" />
        <div className="container-corporate">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  ראשי
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-yellow-400">צור קשר</li>
            </ol>
          </nav>

          <h1 className="heading-display text-white mb-6">
            צרו קשר
            <br />
            <span className="text-yellow-400">נשמח לשמוע מכם</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
            יש לכם רעיון לסטארטאפ? מחפשים שותף טכנולוגי? רוצים לשמוע עוד על
            השירותים שלנו? מלאו את הטופס או פנו אלינו ישירות.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section-padding bg-white">
        <div className="container-corporate">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Details Sidebar */}
            <aside className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="heading-3 text-slate-900 mb-6">פרטי התקשרות</h2>
                <ul className="space-y-5">
                  <li>
                    <a
                      href="tel:+972555647538"
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-10 h-10 bg-slate-100 group-hover:bg-yellow-500 flex items-center justify-center flex-shrink-0 transition-colors">
                        <Phone className="w-5 h-5 text-slate-700 group-hover:text-slate-900 transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">טלפון</p>
                        <p className="font-medium text-slate-900" dir="ltr">
                          055-564-7538
                        </p>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://wa.me/972555647538"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-10 h-10 bg-green-50 group-hover:bg-green-500 flex items-center justify-center flex-shrink-0 transition-colors">
                        <MessageCircle className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">WhatsApp</p>
                        <p className="font-medium text-green-600">שלחו הודעה</p>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:Raz@weccelerate.co.il"
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-10 h-10 bg-slate-100 group-hover:bg-yellow-500 flex items-center justify-center flex-shrink-0 transition-colors">
                        <Mail className="w-5 h-5 text-slate-700 group-hover:text-slate-900 transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">אימייל</p>
                        <p className="font-medium text-slate-900">
                          Raz@weccelerate.co.il
                        </p>
                      </div>
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">משרד ראשי</p>
                      <p className="font-medium text-slate-900 mb-2">
                        רחוב הרכבת 58, תל אביב
                      </p>
                      <div className="flex items-center gap-3">
                        <a
                          href="https://www.google.com/maps/search/?api=1&query=%D7%A8%D7%97%D7%95%D7%91+%D7%94%D7%A8%D7%9B%D7%91%D7%AA+58+%D7%AA%D7%9C+%D7%90%D7%91%D7%99%D7%91"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Map className="w-3.5 h-3.5" />
                          Google Maps
                        </a>
                        <span className="text-slate-300">|</span>
                        <a
                          href="https://waze.com/ul?q=%D7%A8%D7%97%D7%95%D7%91+%D7%94%D7%A8%D7%9B%D7%91%D7%AA+58+%D7%AA%D7%9C+%D7%90%D7%91%D7%99%D7%91"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-800 transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          Waze
                        </a>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  שעות פעילות
                </h3>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>ראשון - חמישי: 09:00 - 18:00</li>
                  <li>שישי: 09:00 - 14:00</li>
                  <li>שבת: סגור</li>
                </ul>
              </div>
            </aside>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <h2 className="heading-3 text-slate-900 mb-6">שלחו לנו הודעה</h2>
              <Suspense fallback={<div className="py-12 text-center text-slate-400">טוען טופס...</div>}>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
