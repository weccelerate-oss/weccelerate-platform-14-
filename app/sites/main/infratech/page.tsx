import type { Metadata } from 'next';
import InfratechContent from './InfratechContent';

export const metadata: Metadata = {
  title: 'Infratech | מערכת אבחון ליקויי בנייה',
  description: 'מערכת לניהול ביקורות, אבחון ליקויים, והפקת דוחות מקצועיים',
  robots: { index: false, follow: false },
};

export default function InfratechPage() {
  return <InfratechContent />;
}
