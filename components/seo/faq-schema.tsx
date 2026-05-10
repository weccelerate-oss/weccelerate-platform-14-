/**
 * FAQ Schema Component
 * 
 * Implements JSON-LD FAQPage schema for GEO optimization.
 * Provides structured answers to common questions about:
 * - FDA approval process
 * - MedTech fundraising
 * - Startup acceleration
 * - Medical device regulation
 * 
 * Features:
 * - Dynamic FAQ data support
 * - Pre-built default questions
 * - Visual FAQ component with accordion
 * - Bilingual support (Hebrew/English)
 * 
 * @see https://schema.org/FAQPage
 * @see https://developers.google.com/search/docs/appearance/structured-data/faqpage
 */

'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface FAQItem {
  /** Unique identifier */
  id: string;
  /** Question text */
  question: string;
  /** Answer text (can include HTML for rich formatting) */
  answer: string;
  /** Category for grouping */
  category?: string;
  /** Language code */
  lang?: 'he' | 'en';
}

export interface FAQSchemaProps {
  /** FAQ items to display */
  items?: FAQItem[];
  /** Include default WeCcelerate FAQs */
  includeDefaults?: boolean;
  /** Filter by category */
  category?: string;
  /** Language filter */
  lang?: 'he' | 'en' | 'all';
  /** Page URL for schema */
  pageUrl?: string;
  /** Show visual component */
  showVisual?: boolean;
  /** Visual component title */
  title?: string;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// DEFAULT FAQ DATA
// =============================================================================

const DEFAULT_FAQS: FAQItem[] = [
  // FDA & Medical Regulation
  {
    id: 'fda-approval-process',
    question: 'How do I get FDA approval for my medical device?',
    answer: `Getting FDA approval depends on your device classification. Most medical devices (Class I and II) require 510(k) premarket notification, demonstrating substantial equivalence to a predicate device. The process includes: 
1. Device classification determination
2. Predicate device identification
3. Performance testing and documentation
4. 510(k) submission preparation
5. FDA review (typically 90 days)

For Class III devices or novel technologies, you may need a more rigorous Premarket Approval (PMA). WeCcelerate's regulatory team has helped over 50 companies successfully navigate FDA submissions with a 95% first-submission approval rate.`,
    category: 'medical-regulation',
    lang: 'en',
  },
  {
    id: 'fda-approval-hebrew',
    question: 'איך מקבלים אישור FDA למכשיר רפואי?',
    answer: `קבלת אישור FDA תלויה בסיווג המכשיר שלך. רוב המכשירים הרפואיים (Class I ו-II) דורשים הודעת 510(k), המוכיחה שוויון מהותי למכשיר קיים. התהליך כולל:
1. קביעת סיווג המכשיר
2. זיהוי מכשיר ייחוס (Predicate)
3. בדיקות ביצועים ותיעוד
4. הכנת הגשת 510(k)
5. בדיקת FDA (בדרך כלל 90 יום)

עבור מכשירי Class III או טכנולוגיות חדשניות, ייתכן שתצטרך תהליך מחמיר יותר של PMA. צוות הרגולציה של WeCcelerate עזר ליותר מ-50 חברות לעבור בהצלחה הגשות FDA עם שיעור אישור של 95% בהגשה ראשונה.`,
    category: 'medical-regulation',
    lang: 'he',
  },
  {
    id: 'ce-marking-mdr',
    question: 'What is CE marking and how do I get it for my medical device?',
    answer: `CE marking indicates your medical device meets EU safety requirements. Under the Medical Device Regulation (MDR 2017/745), the process includes:
1. Device classification (Rule 1-22)
2. Quality Management System (ISO 13485)
3. Technical documentation preparation
4. Clinical evaluation
5. Conformity assessment by Notified Body (for Class IIa and above)
6. EU Declaration of Conformity

The timeline is typically 6-18 months depending on device class. WeCcelerate partners with accredited Notified Bodies and can guide you through MDR compliance efficiently.`,
    category: 'medical-regulation',
    lang: 'en',
  },
  
  // MedTech Fundraising
  {
    id: 'medtech-seed-funding',
    question: 'How do I raise seed funding for a MedTech startup?',
    answer: `Raising seed funding for MedTech requires demonstrating both clinical value and commercial potential. Key steps include:
1. **Validate the problem**: Show unmet clinical need with data
2. **Prototype development**: Have at least a working prototype or MVP
3. **Regulatory strategy**: Present a clear pathway to approval
4. **IP protection**: File provisional patents for key innovations
5. **Team building**: Assemble clinical and business expertise
6. **Financial model**: Project 5-year financials with clear milestones

Typical MedTech seed rounds in Israel range from $500K-$3M. WeCcelerate's network includes specialized HealthTech VCs like OurCrowd, Pitango HealthTech, and aMoon who actively invest in Israeli MedTech.`,
    category: 'funding',
    lang: 'en',
  },
  {
    id: 'medtech-seed-hebrew',
    question: 'איך מגייסים סבב סיד לסטארטאפ מדטק?',
    answer: `גיוס סיד למדטק דורש הוכחת ערך קליני ופוטנציאל מסחרי כאחד. השלבים העיקריים:
1. **אימות הבעיה**: הצגת צורך קליני לא ממומש עם נתונים
2. **פיתוח אב-טיפוס**: לפחות אב-טיפוס עובד או MVP
3. **אסטרטגיה רגולטורית**: מסלול ברור לאישור
4. **הגנת IP**: הגשת פטנטים זמניים לחידושים מרכזיים
5. **בניית צוות**: מומחיות קלינית ועסקית
6. **מודל פיננסי**: תחזית 5 שנים עם אבני דרך ברורות

סבבי סיד טיפוסיים למדטק בישראל נעים בין $500K-$3M. הרשת של WeCcelerate כוללת קרנות הון סיכון מתמחות בהלת'טק כמו OurCrowd, פיטנגו הלת'טק ו-aMoon.`,
    category: 'funding',
    lang: 'he',
  },
  {
    id: 'startup-valuation',
    question: 'How is a MedTech startup valued at seed stage?',
    answer: `MedTech seed valuations typically range from $2M-$10M pre-money, influenced by:
- **Team**: Clinical and entrepreneurial experience
- **Technology**: Novelty, IP protection, technical feasibility
- **Market size**: TAM, SAM, SOM analysis
- **Regulatory pathway**: Complexity and timeline to approval
- **Clinical data**: Any proof-of-concept or pilot results
- **Competition**: Competitive landscape and differentiation

Israeli MedTech startups often command premium valuations due to the ecosystem's track record. WeCcelerate helps optimize valuation through strategic positioning and investor matching.`,
    category: 'funding',
    lang: 'en',
  },
  
  // Startup Acceleration
  {
    id: 'acceleration-program',
    question: 'What does WeCcelerate\'s acceleration program include?',
    answer: `WeCcelerate's acceleration program is a comprehensive 6-month journey that includes:
- **Weekly mentorship**: 1-on-1 sessions with industry experts
- **Regulatory guidance**: FDA/CE/AMAR pathway planning
- **Business development**: Go-to-market strategy and partnerships
- **Fundraising support**: Pitch preparation and investor introductions
- **Technical resources**: Access to labs, prototyping facilities
- **Peer network**: Cohort of 8-12 fellow startups
- **Demo Day**: Pitch to 100+ investors and partners

Our portfolio companies have raised over $150M collectively. Program fee is equity-based (typically 5-8%), with no upfront costs.`,
    category: 'acceleration',
    lang: 'en',
  },
  {
    id: 'acceleration-program-hebrew',
    question: 'מה כוללת תוכנית ההאצה של WeCcelerate?',
    answer: `תוכנית ההאצה של WeCcelerate היא מסע מקיף של 6 חודשים הכולל:
- **מנטורינג שבועי**: פגישות 1-על-1 עם מומחי תעשייה
- **הדרכה רגולטורית**: תכנון מסלול FDA/CE/AMAR
- **פיתוח עסקי**: אסטרטגיית Go-to-market ושותפויות
- **תמיכה בגיוס הון**: הכנת פיץ' והיכרות עם משקיעים
- **משאבים טכניים**: גישה למעבדות ומתקני אב-טיפוס
- **רשת עמיתים**: קבוצה של 8-12 סטארטאפים
- **Demo Day**: פיץ' מול 100+ משקיעים ושותפים

חברות הפורטפוליו שלנו גייסו יחד מעל $150M. עלות התוכנית מבוססת אקוויטי (בדרך כלל 5-8%), ללא עלויות מראש.`,
    category: 'acceleration',
    lang: 'he',
  },
  
  // Factory Sourcing
  {
    id: 'china-manufacturing',
    question: 'How do I find a reliable manufacturer in China for my product?',
    answer: `Finding a reliable Chinese manufacturer requires systematic due diligence:
1. **Define requirements**: Detailed specs, quality standards, volumes
2. **Initial screening**: Trade shows, Alibaba, industry referrals
3. **Qualification**: Factory audits, certifications (ISO, etc.)
4. **Sample testing**: Multiple rounds of prototype evaluation
5. **Contract negotiation**: MOQs, payment terms, IP protection
6. **Quality assurance**: Inspection protocols, ongoing monitoring

WeCcelerate has on-ground teams in Shenzhen and Shanghai with relationships with 500+ vetted factories. We typically reduce sourcing time by 70% and costs by 30-40% compared to independent searches.`,
    category: 'factory',
    lang: 'en',
  },
  
  // Business Consulting
  {
    id: 'business-consulting-what',
    question: 'What business consulting services does WeCcelerate offer?',
    answer: 'WeCcelerate provides comprehensive business consulting including: market research and competitive analysis, business plan development, financial modeling and projections, executive summary writing, marketing strategy, and fundraising preparation. Our consultants have helped over 100 startups build investor-ready business plans.',
    category: 'consulting',
    lang: 'en',
  },
  {
    id: 'business-consulting-what-hebrew',
    question: 'מה כולל הייעוץ העסקי של WeCcelerate?',
    answer: 'WeCcelerate מציעה ייעוץ עסקי מקיף הכולל: מחקר שוק וניתוח תחרות, בניית תוכנית עסקית, מודל פיננסי ותחזיות, כתיבת תקציר מנהלים, אסטרטגיית שיווק, והכנה לגיוס הון. היועצים שלנו סייעו ליותר מ-100 סטארטאפים לבנות תוכניות עסקיות מוכנות למשקיעים.',
    category: 'consulting',
    lang: 'he',
  },

  // Digital Product Development
  {
    id: 'mvp-cost-israel',
    question: 'How much does it cost to develop an MVP in Israel?',
    answer: 'MVP development costs in Israel vary by complexity. A basic mobile app MVP typically costs $15,000-$50,000. A web platform with user dashboard: $40,000-$120,000. A complex SaaS with integrations: $80,000+. WeCcelerate offers a free MVP cost calculator on our website and provides CTO-as-a-Service to optimize your development budget.',
    category: 'development',
    lang: 'en',
  },
  {
    id: 'mvp-cost-hebrew',
    question: 'כמה עולה לפתח MVP בישראל?',
    answer: 'עלות פיתוח MVP בישראל משתנה לפי מורכבות. אפליקציית מובייל בסיסית: 50,000-150,000 ₪. פלטפורמת WEB עם דשבורד: 120,000-400,000 ₪. מערכת SaaS מורכבת: 250,000 ₪ ומעלה. WeCcelerate מציעה מחשבון עלויות MVP חינמי באתר ושירות CTO-as-a-Service לאופטימיזציה של תקציב הפיתוח.',
    category: 'development',
    lang: 'he',
  },

  // Marketing
  {
    id: 'startup-marketing',
    question: 'How should a startup approach marketing on a limited budget?',
    answer: 'WeCcelerate recommends a phased approach: Phase 1 (Pre-launch): Build social media presence, create content, PR outreach. Phase 2 (Launch): Targeted Facebook/Google Ads with $2,000-5,000/month, influencer partnerships. Phase 3 (Growth): Scale proven channels, add retargeting, expand to LinkedIn for B2B. Key metrics to track: CAC, LTV, and conversion rates at each stage.',
    category: 'marketing',
    lang: 'en',
  },
  {
    id: 'startup-marketing-hebrew',
    question: 'איך סטארטאפ צריך לגשת לשיווק עם תקציב מוגבל?',
    answer: 'WeCcelerate ממליצה על גישה מדורגת: שלב 1 (לפני השקה): בניית נוכחות ברשתות חברתיות, יצירת תוכן, יחסי ציבור. שלב 2 (השקה): קמפיינים ממוקדים בפייסבוק/גוגל עם 5,000-15,000 ₪ לחודש. שלב 3 (צמיחה): הגדלת ערוצים מוכחים, ריטרגטינג, הוספת LinkedIn ל-B2B. מדדים מרכזיים: עלות רכישת לקוח, ערך חיי לקוח, ושיעורי המרה.',
    category: 'marketing',
    lang: 'he',
  },

  // Leumit Partnership
  {
    id: 'leumit-partnership',
    question: 'What is the WeCcelerate-Leumit Health Innovation partnership?',
    answer: `WeCcelerate partners with Leumit Health Services to accelerate HealthTech innovation in Israel. The partnership offers:
- **Clinical access**: Pilot programs within Leumit's 700,000 member network
- **Medical expertise**: Advisory from Leumit's clinical staff
- **Digital health focus**: Priority for digital health and AI solutions
- **Regulatory support**: Guidance on Israeli healthcare regulations
- **Go-to-market**: Path to deployment in Leumit clinics

This partnership provides unique validation and scale opportunities for HealthTech startups targeting the Israeli healthcare market.`,
    category: 'leumit',
    lang: 'en',
  },
  {
    id: 'leumit-partnership-hebrew',
    question: 'מה כוללת השותפות בין WeCcelerate ללאומית שירותי בריאות?',
    answer: `WeCcelerate שותפה עם לאומית שירותי בריאות להאצת חדשנות בריאותית בישראל. השותפות מציעה:
- **גישה קלינית**: תוכניות פיילוט ברשת של 700,000 חברי לאומית
- **מומחיות רפואית**: ייעוץ מצוות הרופאים של לאומית
- **מיקוד בבריאות דיגיטלית**: עדיפות לפתרונות בריאות דיגיטלית ו-AI
- **תמיכה רגולטורית**: הדרכה על רגולציה בריאותית ישראלית
- **Go-to-market**: מסלול לפריסה במרפאות לאומית

שותפות זו מספקת הזדמנויות ייחודיות לאימות ולסקייל לסטארטאפים בריאותיים המכוונים לשוק הבריאות הישראלי.`,
    category: 'leumit',
    lang: 'he',
  },
];

// =============================================================================
// SCHEMA COMPONENT (JSON-LD Only)
// =============================================================================

export function FAQSchema({
  items = [],
  includeDefaults = true,
  category,
  lang = 'all',
  pageUrl,
}: Omit<FAQSchemaProps, 'showVisual' | 'title' | 'className'>) {
  // Combine items
  let allItems = includeDefaults ? [...DEFAULT_FAQS, ...items] : items;
  
  // Filter by category
  if (category) {
    allItems = allItems.filter((item) => item.category === category);
  }
  
  // Filter by language
  if (lang !== 'all') {
    allItems = allItems.filter((item) => !item.lang || item.lang === lang);
  }

  // Build FAQ schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': pageUrl ? `${pageUrl}#faq` : undefined,
    mainEntity: allItems.map((item) => ({
      '@type': 'Question',
      '@id': `#faq-${item.id}`,
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer.replace(/\*\*/g, '').replace(/\n/g, ' '),
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0),
      }}
    />
  );
}

// =============================================================================
// VISUAL FAQ COMPONENT
// =============================================================================

interface FAQAccordionProps {
  items: FAQItem[];
  title?: string;
  className?: string;
}

function FAQAccordion({ items, title, className }: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <h2 className="mb-6 text-2xl font-bold text-slate-900">
          {title}
        </h2>
      )}
      <div className="space-y-4">
        {items.map((item) => {
          const isOpen = openItems.has(item.id);
          
          return (
            <div
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white overflow-hidden"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className={cn(
                  'w-full flex items-center justify-between p-4 text-right',
                  'hover:bg-slate-50 transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-royal-500/20'
                )}
                aria-expanded={isOpen}
              >
                <span className="font-medium text-slate-900 text-right flex-1">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-slate-500 flex-shrink-0 mr-4',
                    'transition-transform duration-200',
                    isOpen && 'rotate-180'
                  )}
                />
              </button>
              
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                <div className="p-4 pt-0 text-slate-600 whitespace-pre-line">
                  {item.answer.split('**').map((part, index) => 
                    index % 2 === 1 ? (
                      <strong key={index} className="font-semibold text-slate-800">
                        {part}
                      </strong>
                    ) : (
                      part
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// COMBINED COMPONENT
// =============================================================================

export function FAQSection({
  items = [],
  includeDefaults = true,
  category,
  lang = 'all',
  pageUrl,
  showVisual = true,
  title = 'שאלות נפוצות',
  className,
}: FAQSchemaProps) {
  // Combine and filter items
  let allItems = includeDefaults ? [...DEFAULT_FAQS, ...items] : items;
  
  if (category) {
    allItems = allItems.filter((item) => item.category === category);
  }
  
  if (lang !== 'all') {
    allItems = allItems.filter((item) => !item.lang || item.lang === lang);
  }

  return (
    <>
      {/* JSON-LD Schema */}
      <FAQSchema
        items={allItems}
        includeDefaults={false}
        pageUrl={pageUrl}
      />
      
      {/* Visual Component */}
      {showVisual && (
        <FAQAccordion
          items={allItems}
          title={title}
          className={className}
        />
      )}
    </>
  );
}

// =============================================================================
// CATEGORY-SPECIFIC EXPORTS
// =============================================================================

export function MedicalRegulationFAQ({ showVisual = true }: { showVisual?: boolean }) {
  return (
    <FAQSection
      category="medical-regulation"
      title="שאלות נפוצות - רגולציה רפואית"
      showVisual={showVisual}
    />
  );
}

export function FundingFAQ({ showVisual = true }: { showVisual?: boolean }) {
  return (
    <FAQSection
      category="funding"
      title="שאלות נפוצות - גיוס הון"
      showVisual={showVisual}
    />
  );
}

export function LeumitFAQ({ showVisual = true }: { showVisual?: boolean }) {
  return (
    <FAQSection
      category="leumit"
      title="שאלות נפוצות - שותפות לאומית"
      showVisual={showVisual}
    />
  );
}

// =============================================================================
// DEFAULT FAQS EXPORT
// =============================================================================

export { DEFAULT_FAQS };

export default FAQSection;
