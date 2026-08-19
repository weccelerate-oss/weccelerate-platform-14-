'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface CaseVideoProps {
  videoId: string;
  title: string;
  /** Tailwind aspect class — 16/9 by default */
  aspect?: string;
}

// =============================================================================
// CASE VIDEO — click-to-play facade, so a service page with several videos
// doesn't pull in a YouTube player for each one on load.
// =============================================================================

export default function CaseVideo({ videoId, title, aspect = 'aspect-video' }: CaseVideoProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className={`relative w-full ${aspect} overflow-hidden rounded-xl border border-white/10 bg-black`}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={title}
      className={`group relative w-full ${aspect} overflow-hidden rounded-xl border border-white/10 bg-black`}
    >
      <Image
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt={title}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-[#070b1e]/80 via-transparent to-transparent" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] shadow-lg shadow-[#c8a951]/25 transition-transform duration-300 group-hover:scale-110">
          <Play className="w-5 h-5 translate-x-0.5" fill="currentColor" />
        </span>
      </span>
    </button>
  );
}
