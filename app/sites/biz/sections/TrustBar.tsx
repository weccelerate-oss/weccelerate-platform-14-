'use client';

import Image from 'next/image';

const LOGOS = [
  { src: '/images/logos/leumit-logo.png', alt: 'Leumit Health Services' },
  { src: '/images/logos/herzog-fox-neeman.png', alt: 'Herzog Fox Neeman' },
  { src: '/images/logos/harashut-logo.png', alt: 'Israel Innovation Authority' },
  { src: '/images/logos/jerusalem-development-authority.png', alt: 'Jerusalem Development Authority' },
  { src: '/images/logos/har-hozvim-logo.png', alt: 'Har HaHotzvim' },
  { src: '/images/logos/innovation-authority.jpg', alt: 'Innovation Authority' },
];

export default function TrustBar() {
  return (
    <section className="relative py-14 bg-[#050914] border-y border-white/5">
      <div className="container-corporate">
        <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-white/40 mb-10">
          שותפים אסטרטגיים · לקוחות ארגוניים
        </p>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-8 md:gap-10 items-center max-w-5xl mx-auto">
          {LOGOS.map((logo, idx) => (
            <div
              key={idx}
              className="relative h-12 md:h-14 grayscale brightness-200 contrast-50 opacity-60 hover:opacity-90 hover:grayscale-0 hover:brightness-100 hover:contrast-100 transition-all duration-500"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 30vw, 15vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
