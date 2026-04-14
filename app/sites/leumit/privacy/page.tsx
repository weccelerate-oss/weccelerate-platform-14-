import type { Metadata } from 'next';
import { LegalPage } from '@/components/landing-helpers/LegalPage';
import { PrivacyContent } from '@/components/landing-helpers/PrivacyContent';

export const metadata: Metadata = {
  title: 'מדיניות פרטיות · Leumit × WeCcelerate',
  description: 'מדיניות הפרטיות של דף הנחיתה של תוכנית ה-MedTech של לאומית ו-WeCcelerate.',
};

export default function LeumitPrivacyPage() {
  return (
    <LegalPage
      title="מדיניות פרטיות"
      subtitle="כל מה שצריך לדעת על המידע שאנו אוספים, למה, ואיך אנחנו שומרים עליו."
      accentColor="#06B6D4"
    >
      <PrivacyContent accentColor="#06B6D4" />
    </LegalPage>
  );
}
