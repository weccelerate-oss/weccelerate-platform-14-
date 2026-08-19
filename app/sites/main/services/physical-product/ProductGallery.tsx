'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Boxes, Users } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import CaseVideo from '@/components/services/CaseVideo';

// =============================================================================
// PRODUCTS IN DEVELOPMENT — products that reached a factory through us
// =============================================================================

const products = [
  { image: '/images/cases/product1.jpg', category: 'טכנולוגיה', categoryEn: 'Technology' },
  { image: '/images/cases/product2.png', category: 'אלקטרוניקה', categoryEn: 'Electronics' },
  { image: '/images/cases/product3.png', category: 'אגרוטק', categoryEn: 'AgroTech' },
  { image: '/images/cases/product4.jpg', category: 'ניקיון והיגיינה', categoryEn: 'Cleaning & hygiene' },
  { image: '/images/cases/product5.jpg', category: 'מכשור מדעי', categoryEn: 'Scientific instruments' },
  { image: '/images/cases/product6.jpg', category: 'ציוד תעשייתי', categoryEn: 'Industrial equipment' },
  { image: '/images/cases/product7.jpg', category: 'ציוד רפואי', categoryEn: 'Medical equipment' },
  { image: '/images/cases/product8.jpeg', category: 'פתרונות לוגיסטיקה', categoryEn: 'Logistics solutions' },
  { image: '/images/cases/product9.jpg', category: 'ציוד תעשייתי', categoryEn: 'Industrial equipment' },
  { image: '/images/cases/product10.jpeg', category: 'מוצרים ירוקים', categoryEn: 'Green products' },
  { image: '/images/cases/product11.jpg', category: 'מוצר משקאות חכם', categoryEn: 'Smart beverage product' },
  { image: '/images/cases/product12.jpg', category: 'תאורה חכמה', categoryEn: 'Smart lighting' },
  { image: '/images/cases/product15.jpg', category: 'רכיבים מכניים', categoryEn: 'Mechanical components' },
  { image: '/images/cases/product16.jpg', category: 'אלקטרוניקה', categoryEn: 'Electronics' },
  { image: '/images/cases/product17.jpg', category: 'מערכות מים', categoryEn: 'Water systems' },
  { image: '/images/cases/product18.jpg', category: 'רכיבי פלסטיק', categoryEn: 'Plastic components' },
  { image: '/images/cases/product19.jpg', category: 'מכשירי חשמל', categoryEn: 'Electrical appliances' },
  { image: '/images/cases/product23.jpg', category: 'מערכות בקרה', categoryEn: 'Control systems' },
];

const conferences = [
  {
    videoId: 'MRd7x79blE4',
    title: 'כנס Vesting 2024',
    titleEn: 'Vesting 2024 Conference',
    subtitle: 'בשיתוף FireFly ומגדלי מיקרוסופט תל אביב',
    subtitleEn: 'With FireFly, at the Microsoft towers in Tel Aviv',
  },
  {
    videoId: 'nionjAdg3r4',
    title: 'כנס יזמים בתחילת דרכם',
    titleEn: 'Conference for early-stage founders',
    subtitle: 'בשיתוף Microsoft for Startups וקרן ההשקעות של אוניברסיטת ת"א',
    subtitleEn: 'With Microsoft for Startups and the Tel Aviv University investment fund',
  },
];

export default function ProductGallery() {
  const { lang } = useLanguage();
  const isHe = lang === 'he';

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1321] to-[#070b1e]" />

      <div className="container-corporate relative z-10">
        {/* Heading */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 font-mono text-[#c8a951]/60 text-xs tracking-[0.25em] uppercase mb-4">
            <Boxes className="w-3.5 h-3.5" />
            IN_PRODUCTION
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            {isHe ? 'מוצרים נוספים בתהליך פיתוח' : 'More Products in Development'}
          </h2>
          <p className="text-lg text-white/45 max-w-2xl mx-auto leading-relaxed">
            {isHe
              ? 'לאחר איתור מפעלים — מוצרים חדשניים בדרך לשוק.'
              : 'After factory sourcing — innovative products on their way to market.'}
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.image}
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: Math.min(index, 11) * 0.04 }}
              className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
            >
              <Image
                src={product.image}
                alt={isHe ? product.category : product.categoryEn}
                fill
                sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e] via-[#070b1e]/10 to-transparent" />
              <span className="absolute bottom-2 inset-x-2 text-center text-[11px] font-semibold text-white/80 leading-snug">
                {isHe ? product.category : product.categoryEn}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Conferences */}
        <div className="mt-16 sm:mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-5 h-5 text-[#c8a951]" />
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {isHe ? 'הכנסים שלנו' : 'Our Conferences'}
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
            {conferences.map((conference) => (
              <div
                key={conference.videoId}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
              >
                <CaseVideo
                  videoId={conference.videoId}
                  title={isHe ? conference.title : conference.titleEn}
                />
                <h4 className="mt-4 text-lg font-bold text-white">
                  {isHe ? conference.title : conference.titleEn}
                </h4>
                <p className="mt-1 text-sm text-white/45 leading-relaxed">
                  {isHe ? conference.subtitle : conference.subtitleEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
