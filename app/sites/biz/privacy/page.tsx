import type { Metadata } from 'next';
import { LegalPage } from '@/components/landing-helpers/LegalPage';
import { PrivacyContent } from '@/components/landing-helpers/PrivacyContent';

export const metadata: Metadata = {
  title: 'מדיניות פרטיות · WeCcelerate Business',
  description: 'מדיניות הפרטיות של WeCcelerate Business — Venture Builder לארגונים וחברות מבוססות.',
};

export default function BizPrivacyPage() {
  return (
    <LegalPage
      title="מדיניות פרטיות"
      subtitle="כל מה שצריך לדעת על המידע שאנו אוספים, למה, ואיך אנחנו שומרים עליו."
      accentColor="#10B981"
    >
      <PrivacyContent accentColor="#10B981" />
    </LegalPage>
  );
}
