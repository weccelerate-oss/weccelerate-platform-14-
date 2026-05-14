import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { ServicePageSchema } from '@/components/seo/ServicePageSchema';
import MarketingContent from './MarketingContent';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = constructMetadata({
 title: 'שיווק, פרסום ויח"צ | Marketing, Advertising & PR',
 description:
 'מעטפת שיווקית מלאה למיזמים — פרסום דיגיטלי, יחסי ציבור, שיווק ברשתות חברתיות ואסטרטגיית שיווק מקיפה.',
 keywords: [
 'שיווק לסטארטאפים',
 'שיווק למיזמים',
 'שיווק ליזמים',
 'פרסום דיגיטלי',
 'יחסי ציבור סטארטאפ',
 'יחסי ציבור מיזם',
 'Social Media Marketing',
 'Digital Advertising Israel',
 'שיווק דיגיטלי תל אביב',
 'content marketing startup',
 'PR Israel startups',
 'Google Ads management',
 'אסטרטגיית שיווק למיזם',
 'מיתוג למיזם',
 'GTM strategy',
 ],
 path: '/services/marketing',
 locale: 'he',
});

// =============================================================================
// PAGE
// =============================================================================

export default function MarketingPage() {
 return (
 <>
 <ServicePageSchema
 serviceId="marketing"
 title='שיווק, פרסום ויח"צ'
 titleEn="Marketing, Advertising & PR"
 description='מעטפת שיווקית מלאה למיזמים — פרסום דיגיטלי, יחסי ציבור, שיווק ברשתות חברתיות ואסטרטגיית שיווק מקיפה.'
 descriptionEn="Full marketing suite for startups — digital advertising, public relations, social media marketing, and comprehensive marketing strategy."
 path="/services/marketing"
 category="Marketing & Advertising"
 faqs={[
 {
 question: 'כמה עולה שיווק דיגיטלי לסטארטאפ?',
 answer: 'תקציב שיווק דיגיטלי לסטארטאפ תלוי בשלב ובמטרות. WeCcelerate ממליצה להתחיל עם 5,000-15,000 ₪ לחודש לקמפיינים ממוקדים, ולהגדיל ככל שמוכחת התשואה.',
 },
 {
 question: 'What marketing channels work best for Israeli startups?',
 answer: 'For B2B: LinkedIn Ads + content marketing + PR in Israeli tech media. For B2C: Facebook/Instagram Ads + Google Ads + influencer partnerships. WeCcelerate builds a tailored channel mix based on your audience and budget.',
 },
 ]}
 />
 <MarketingContent />
 </>
 );
}
