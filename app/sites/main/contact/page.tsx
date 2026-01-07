/**
 * Contact Us Page - Lead Conversion Hub
 * 
 * Route: /contact
 * 
 * Features:
 * - Smart contact form with Zod validation
 * - Google Maps embed
 * - LocalBusiness schema for GEO
 * - Referrer tracking
 * - Split-screen design
 */

import { Metadata } from 'next';
import Script from 'next/script';
import { ContactForm } from './ContactForm';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Building2,
  Globe,
  Linkedin,
  Twitter,
  Send,
} from 'lucide-react';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = {
  title: 'צור קשר | WeCcelerate - מאיץ סטארטאפים',
  description: 'צרו קשר עם WeCcelerate - מאיץ הסטארטאפים המוביל בישראל. משרדים בתל אביב, טלפון 03-555-1234. נשמח לשמוע על הסטארטאפ שלכם.',
  keywords: [
    'צור קשר WeCcelerate',
    'מאיץ סטארטאפים תל אביב',
    'יצירת קשר',
    'פגישת ייעוץ',
  ],
  openGraph: {
    title: 'צור קשר - WeCcelerate',
    description: 'צרו איתנו קשר ונשמח לשמוע על הסטארטאפ שלכם',
    type: 'website',
    locale: 'he_IL',
  },
};

// =============================================================================
// BUSINESS DATA
// =============================================================================

const BUSINESS_INFO = {
  name: 'WeCcelerate',
  legalName: 'WeCcelerate Ltd.',
  description: 'מאיץ סטארטאפים מוביל בישראל בתחום הבריאות הדיגיטלית, בשיתוף לאומית שירותי בריאות',
  
  // Contact
  phone: '+972-3-555-1234',
  phoneDisplay: '03-555-1234',
  email: 'hello@weccelerate.co.il',
  salesEmail: 'sales@weccelerate.co.il',
  
  // Address
  address: {
    street: 'רחוב רוטשילד 45',
    streetEn: '45 Rothschild Blvd',
    city: 'תל אביב',
    cityEn: 'Tel Aviv',
    postalCode: '6578401',
    country: 'ישראל',
    countryCode: 'IL',
  },
  
  // Coordinates (Rothschild Blvd, Tel Aviv)
  geo: {
    latitude: 32.0636,
    longitude: 34.7725,
  },
  
  // Opening Hours
  openingHours: [
    { day: 'ראשון - חמישי', hours: '09:00 - 18:00', dayEn: 'Sun-Thu' },
    { day: 'שישי', hours: 'סגור', dayEn: 'Fri' },
    { day: 'שבת', hours: 'סגור', dayEn: 'Sat' },
  ],
  
  // Social
  social: {
    linkedin: 'https://linkedin.com/company/weccelerate',
    twitter: 'https://twitter.com/weccelerate',
    website: 'https://weccelerate.co.il',
  },
};

// =============================================================================
// JSON-LD STRUCTURED DATA
// =============================================================================

function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://weccelerate.co.il/#organization',
    name: BUSINESS_INFO.name,
    legalName: BUSINESS_INFO.legalName,
    description: BUSINESS_INFO.description,
    url: BUSINESS_INFO.social.website,
    logo: 'https://weccelerate.co.il/images/logo.svg',
    image: 'https://weccelerate.co.il/images/office.jpg',
    
    // Contact
    telephone: BUSINESS_INFO.phone,
    email: BUSINESS_INFO.email,
    
    // Address
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_INFO.address.streetEn,
      addressLocality: BUSINESS_INFO.address.cityEn,
      postalCode: BUSINESS_INFO.address.postalCode,
      addressCountry: BUSINESS_INFO.address.countryCode,
    },
    
    // Geo coordinates
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS_INFO.geo.latitude,
      longitude: BUSINESS_INFO.geo.longitude,
    },
    
    // Opening hours specification
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    
    // Additional info
    priceRange: '$$$$',
    currenciesAccepted: 'ILS, USD',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    
    // Social profiles
    sameAs: [
      BUSINESS_INFO.social.linkedin,
      BUSINESS_INFO.social.twitter,
    ],
    
    // Parent organization
    parentOrganization: {
      '@type': 'Organization',
      name: 'Leumit Health Services',
      url: 'https://leumit.co.il',
    },
    
    // Area served
    areaServed: {
      '@type': 'Country',
      name: 'Israel',
    },
    
    // Service type
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Startup Acceleration',
          description: 'תוכנית האצה לסטארטאפים בתחום הבריאות',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'MedTech Consulting',
          description: 'ייעוץ רגולטורי ופיתוח עסקי לחברות MedTech',
        },
      },
    ],
  };
}

function generateContactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': 'https://weccelerate.co.il/contact',
    name: 'צור קשר - WeCcelerate',
    description: 'דף יצירת קשר עם WeCcelerate - מאיץ סטארטאפים',
    url: 'https://weccelerate.co.il/contact',
    mainEntity: {
      '@id': 'https://weccelerate.co.il/#organization',
    },
  };
}

// =============================================================================
// COMPONENTS
// =============================================================================

function ContactInfo() {
  return (
    <div className="space-y-8">
      {/* Phone */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
          <Phone className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 mb-1">טלפון</h3>
          <a 
            href={`tel:${BUSINESS_INFO.phone}`}
            className="text-lg text-slate-600 hover:text-yellow-600 transition-colors"
            dir="ltr"
          >
            {BUSINESS_INFO.phoneDisplay}
          </a>
          <p className="text-sm text-slate-400 mt-1">
            זמינים בימים א׳-ה׳, 9:00-18:00
          </p>
        </div>
      </div>

      {/* Email */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
          <Mail className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 mb-1">אימייל</h3>
          <a 
            href={`mailto:${BUSINESS_INFO.email}`}
            className="text-lg text-slate-600 hover:text-yellow-600 transition-colors"
          >
            {BUSINESS_INFO.email}
          </a>
          <p className="text-sm text-slate-400 mt-1">
            נחזור אליכם תוך יום עסקים
          </p>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 mb-1">כתובת</h3>
          <address className="not-italic text-lg text-slate-600">
            {BUSINESS_INFO.address.street}
            <br />
            {BUSINESS_INFO.address.city}, {BUSINESS_INFO.address.country}
          </address>
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${BUSINESS_INFO.geo.latitude},${BUSINESS_INFO.geo.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-yellow-600 hover:text-yellow-700 mt-2"
          >
            פתח בגוגל מפות →
          </a>
        </div>
      </div>

      {/* Opening Hours */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
          <Clock className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">שעות פעילות</h3>
          <ul className="space-y-1">
            {BUSINESS_INFO.openingHours.map((item) => (
              <li key={item.day} className="flex justify-between text-slate-600">
                <span>{item.day}</span>
                <span className={item.hours === 'סגור' ? 'text-slate-400' : ''}>
                  {item.hours}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SocialLinks() {
  return (
    <div className="flex items-center gap-4 mt-8 pt-8 border-t border-slate-200">
      <span className="text-sm text-slate-500">עקבו אחרינו:</span>
      <a
        href={BUSINESS_INFO.social.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 bg-slate-100 hover:bg-yellow-500 flex items-center justify-center transition-colors group"
        aria-label="LinkedIn"
      >
        <Linkedin className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
      </a>
      <a
        href={BUSINESS_INFO.social.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 bg-slate-100 hover:bg-yellow-500 flex items-center justify-center transition-colors group"
        aria-label="Twitter"
      >
        <Twitter className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
      </a>
    </div>
  );
}

function GoogleMap() {
  // Google Maps embed URL
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3381.0!2d${BUSINESS_INFO.geo.longitude}!3d${BUSINESS_INFO.geo.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDAzJzQ5LjAiTiAzNMKwNDYnMjEuMCJF!5e0!3m2!1sen!2sil!4v1600000000000!5m2!1sen!2sil`;
  
  return (
    <div className="relative w-full h-full min-h-[300px] lg:min-h-[500px]">
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="מיקום משרדי WeCcelerate"
        className="absolute inset-0"
      />
      
      {/* Overlay with address card */}
      <div className="absolute bottom-6 right-6 bg-white p-4 shadow-xl max-w-xs">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-slate-900">WeCcelerate HQ</h4>
            <p className="text-sm text-slate-600">
              {BUSINESS_INFO.address.street}
              <br />
              {BUSINESS_INFO.address.city}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickContactOptions() {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <a
        href={`tel:${BUSINESS_INFO.phone}`}
        className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-yellow-50 border border-slate-100 hover:border-yellow-200 transition-colors text-center"
      >
        <Phone className="w-6 h-6 text-slate-600" />
        <span className="text-sm font-medium text-slate-700">התקשרו</span>
      </a>
      <a
        href={`mailto:${BUSINESS_INFO.email}`}
        className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-yellow-50 border border-slate-100 hover:border-yellow-200 transition-colors text-center"
      >
        <Mail className="w-6 h-6 text-slate-600" />
        <span className="text-sm font-medium text-slate-700">שלחו מייל</span>
      </a>
      <a
        href="https://wa.me/97235551234"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-green-50 border border-slate-100 hover:border-green-200 transition-colors text-center"
      >
        <MessageSquare className="w-6 h-6 text-slate-600" />
        <span className="text-sm font-medium text-slate-700">WhatsApp</span>
      </a>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function ContactPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLocalBusinessSchema()),
        }}
      />
      <Script
        id="contact-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateContactPageSchema()),
        }}
      />

      <main id="main-content">
        {/* Hero Banner */}
        <section className="bg-slate-900 py-16">
          <div className="container-corporate">
            <div className="max-w-2xl">
              <h1 className="heading-display text-white mb-4">
                בואו
                <span className="text-yellow-400"> נדבר</span>
              </h1>
              <p className="text-xl text-slate-300">
                יש לכם רעיון, סטארטאפ, או שאלה? נשמח לשמוע ולעזור.
                מלאו את הטופס ונחזור אליכם בהקדם.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content - Split Screen */}
        <section className="section-padding bg-white">
          <div className="container-corporate">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              
              {/* Left Side - Form */}
              <div>
                <div className="bg-white lg:bg-slate-50 lg:p-8 lg:border lg:border-slate-100">
                  <div className="mb-8">
                    <h2 className="heading-2 text-slate-900 mb-2">
                      שלחו לנו הודעה
                    </h2>
                    <p className="text-slate-600">
                      מלאו את הפרטים ונחזור אליכם תוך יום עסקים
                    </p>
                  </div>

                  {/* Quick Contact Options (Mobile) */}
                  <div className="lg:hidden">
                    <QuickContactOptions />
                  </div>

                  {/* Contact Form */}
                  <ContactForm />
                </div>
              </div>

              {/* Right Side - Info & Map */}
              <div className="space-y-8">
                {/* Contact Info */}
                <div className="bg-slate-50 p-8 border border-slate-100">
                  <h2 className="heading-3 text-slate-900 mb-6">
                    פרטי התקשרות
                  </h2>
                  <ContactInfo />
                  <SocialLinks />
                </div>

                {/* Google Map */}
                <div className="bg-slate-100 overflow-hidden border border-slate-200">
                  <GoogleMap />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ / Quick Info Section */}
        <section className="section-padding bg-slate-50 border-t border-slate-100">
          <div className="container-corporate">
            <h2 className="heading-2 text-slate-900 text-center mb-12">
              שאלות נפוצות
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-14 h-14 bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  כמה זמן עד תשובה?
                </h3>
                <p className="text-slate-600 text-sm">
                  אנחנו מתחייבים לחזור אליכם תוך יום עסקים אחד
                </p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-7 h-7 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  מה לכתוב בהודעה?
                </h3>
                <p className="text-slate-600 text-sm">
                  ספרו לנו על הסטארטאפ, השלב שאתם נמצאים בו, ובמה נוכל לעזור
                </p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-7 h-7 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  עובדים עם סטארטאפים מחו״ל?
                </h3>
                <p className="text-slate-600 text-sm">
                  בהחלט! אנחנו עובדים עם סטארטאפים מכל העולם שרוצים להיכנס לשוק הישראלי
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
