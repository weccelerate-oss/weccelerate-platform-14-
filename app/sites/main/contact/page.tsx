import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import ContactContent from './ContactContent';

export const metadata: Metadata = constructMetadata({
  title: 'צור קשר | Contact Us',
  description: 'צרו קשר עם WeCcelerate (וויסלרייט) — ייעוץ עסקי, פיתוח מוצר, שיווק ומסלול MedTech. משרדים בתל אביב וירושלים. טלפון: 055-564-7538.',
  keywords: [
    'צור קשר WeCcelerate',
    'ייעוץ סטארטאפ',
    'contact WeCcelerate',
    'startup consultation Israel',
    'ייעוץ עסקי תל אביב',
  ],
  path: '/contact',
  locale: 'he',
});

// Skip prerendering - this page uses useSearchParams
export const dynamic = 'force-dynamic';

export default function ContactPage() {
  return <ContactContent />;
}
