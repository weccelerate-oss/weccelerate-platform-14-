import Link from 'next/link';

// Guide copy references other guides inline as plain paths ("/guides/<slug>", "/en/guides/<slug>").
const GUIDE_PATH = /(\/(?:en\/)?guides\/[a-z0-9-]+)/g;

/** Renders guide paragraph/list text, turning inline guide paths into internal links. */
export function GuideText({ text }: { text: string }) {
  const parts = text.split(GUIDE_PATH);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Link key={i} href={part} dir="ltr" className="text-[#e8d48b] underline hover:text-[#c8a951]">
            {part}
          </Link>
        ) : (
          part
        ),
      )}
    </>
  );
}
