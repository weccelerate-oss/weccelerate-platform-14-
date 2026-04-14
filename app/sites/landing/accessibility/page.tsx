import type { Metadata } from 'next';
import { LegalPage } from '@/components/landing-helpers/LegalPage';
import { AccessibilityContent } from '@/components/landing-helpers/AccessibilityContent';

export const metadata: Metadata = {
  title: 'הצהרת נגישות · WeCcelerate',
  description: 'הצהרת הנגישות של WeCcelerate. עומדים בתקן ת"י 5568 רמה AA.',
};

export default function LandingAccessibilityPage() {
  return (
    <LegalPage
      title="הצהרת נגישות"
      subtitle="האתר שלנו תומך באנשים עם מוגבלות, בהתאם לחוק שוויון זכויות ובתקן הישראלי AA."
      accentColor="#C8A951"
    >
      <AccessibilityContent accentColor="#C8A951" />
    </LegalPage>
  );
}
