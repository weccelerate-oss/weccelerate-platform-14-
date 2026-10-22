/**
 * Schema helpers shared by the Hebrew and English static guide pages:
 * every figure becomes an ImageObject (Article.image + image sitemap), and
 * every verified source becomes a CreativeWork in Article.citation.
 */

import type { GuideFigure, GuideSource } from './guides-catalog';

type SectionWithFigure = { figure?: GuideFigure };

export function guideFigures(sections: readonly SectionWithFigure[]): GuideFigure[] {
  return sections.flatMap((s) => (s.figure ? [s.figure] : []));
}

export function guideImageObjects(sections: readonly SectionWithFigure[], siteUrl: string) {
  return guideFigures(sections).map((f) => ({
    '@type': 'ImageObject',
    contentUrl: `${siteUrl}${f.src}`,
    url: `${siteUrl}${f.src}`,
    width: f.width,
    height: f.height,
    caption: f.caption,
    description: f.alt,
    ...(f.credit && { creditText: f.credit }),
    ...(f.sourceUrl && { isBasedOn: f.sourceUrl }),
  }));
}

/** Sources plus any screenshot source pages not already listed, deduplicated by URL. */
export function guideCitations(sources: readonly GuideSource[] | undefined, sections: readonly SectionWithFigure[]) {
  const seen = new Set<string>();
  const out: Array<Record<string, unknown>> = [];
  for (const s of sources ?? []) {
    if (seen.has(s.url)) continue;
    seen.add(s.url);
    out.push({ '@type': 'CreativeWork', name: s.title, url: s.url, publisher: { '@type': 'Organization', name: s.publisher } });
  }
  for (const f of guideFigures(sections)) {
    if (!f.sourceUrl || seen.has(f.sourceUrl)) continue;
    seen.add(f.sourceUrl);
    out.push({ '@type': 'CreativeWork', name: f.caption, url: f.sourceUrl });
  }
  return out;
}
