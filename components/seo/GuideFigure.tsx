import Image from 'next/image';
import type { GuideFigure as GuideFigureData } from '@/lib/seo/guides-catalog';

/** Screenshot/diagram under a guide section, shared by the Hebrew and English guide pages. */
export function GuideFigure({ figure }: { figure: GuideFigureData }) {
  return (
    <figure className="pt-2">
      {/* Screenshots are dense; link to the full-size file so mobile readers can zoom. */}
      <a href={figure.src} target="_blank" rel="noopener" className="block">
        <Image
          src={figure.src}
          alt={figure.alt}
          width={figure.width}
          height={figure.height}
          sizes="(max-width: 768px) 100vw, 768px"
          className="w-full h-auto rounded-xl border border-white/10 bg-white"
        />
      </a>
      <figcaption className="mt-2 text-sm text-white/55">
        {figure.caption}
        {figure.credit && (
          <>
            {' · '}
            {figure.sourceUrl ? (
              <a
                href={figure.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#e8d48b]"
              >
                {figure.credit}
              </a>
            ) : (
              figure.credit
            )}
          </>
        )}
      </figcaption>
    </figure>
  );
}
