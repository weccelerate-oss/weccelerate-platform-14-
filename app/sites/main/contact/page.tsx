import { Suspense } from 'react';
import { ContactForm } from './ContactForm';

// Skip prerendering - this page uses useSearchParams
export const dynamic = 'force-dynamic';

export default function ContactPage() {
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <ContactForm />
    </Suspense>
  );
}