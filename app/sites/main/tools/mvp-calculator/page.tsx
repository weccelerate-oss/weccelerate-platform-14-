import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import MVPCalculatorContent from './MVPCalculatorContent';

export const metadata: Metadata = constructMetadata({
  title: 'מחשבון עלות MVP | MVP Cost Calculator',
  description: 'כמה עולה לפתח MVP? מחשבון עלויות חינמי מבית WeCcelerate. ענו על כמה שאלות וקבלו הערכת עלות מיידית לפיתוח המוצר הראשוני שלכם.',
  keywords: [
    'מחשבון MVP',
    'עלות פיתוח MVP',
    'MVP cost calculator',
    'כמה עולה לפתח אפליקציה',
    'הערכת עלויות פיתוח',
    'startup MVP cost',
    'product development cost Israel',
  ],
  path: '/tools/mvp-calculator',
  locale: 'he',
});

export default function MVPCalculatorPage() {
  return <MVPCalculatorContent />;
}
