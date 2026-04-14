import type { Metadata } from 'next';
import { LegalPage } from '@/components/landing-helpers/LegalPage';
import { AccessibilityContent } from '@/components/landing-helpers/AccessibilityContent';

export const metadata: Metadata = {
  title: 'הצהרת נגישות · Leumit × WeCcelerate',
  description: 'הצהרת הנגישות לדף הנחיתה של תוכנית ה-MedTech של לאומית ו-WeCcelerate. עומדים בתקן ת"י 5568 רמה AA.',
};

export default function LeumitAccessibilityPage() {
  return (
    <LegalPage
      title="הצהרת נגישות"
      subtitle="האתר שלנו תומך באנשים עם מוגבלות, בהתאם לחוק שוויון זכויות ובתקן הישראלי AA."
      accentColor="#06B6D4"
    >
      <AccessibilityContent accentColor="#06B6D4" />
    </LegalPage>
  );
}
