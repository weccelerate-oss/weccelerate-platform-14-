import type { Metadata } from 'next';
import { LegalPage } from '@/components/landing-helpers/LegalPage';
import { AccessibilityContent } from '@/components/landing-helpers/AccessibilityContent';

export const metadata: Metadata = {
  title: 'הצהרת נגישות · WeCcelerate Business',
  description: 'הצהרת הנגישות של WeCcelerate Business. עומדים בתקן ת"י 5568 רמה AA.',
};

export default function BizAccessibilityPage() {
  return (
    <LegalPage
      title="הצהרת נגישות"
      subtitle="האתר שלנו תומך באנשים עם מוגבלות, בהתאם לחוק שוויון זכויות ובתקן הישראלי AA."
      accentColor="#10B981"
    >
      <AccessibilityContent accentColor="#10B981" />
    </LegalPage>
  );
}
