import type { Metadata } from 'next';
import { LegalPage } from '@/components/landing-helpers/LegalPage';
import { PrivacyContent } from '@/components/landing-helpers/PrivacyContent';

export const metadata: Metadata = {
  title: 'מדיניות פרטיות · WeCcelerate',
  description: 'מדיניות הפרטיות של WeCcelerate — מה אנו אוספים ואיך אנחנו שומרים על המידע שלכם.',
};

export default function LandingPrivacyPage() {
  return (
    <LegalPage
      title="מדיניות פרטיות"
      subtitle="כל מה שצריך לדעת על המידע שאנו אוספים, למה, ואיך אנחנו שומרים עליו."
      accentColor="#C8A951"
    >
      <PrivacyContent accentColor="#C8A951" />
    </LegalPage>
  );
}
