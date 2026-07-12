/**
 * GEO Daily Snapshot — the "is our GEO improving?" time series.
 *
 * Runs once per morning (david-daily, right after analyze). Computes a single
 * 0-100 GEO score over a ROLLING 14-DAY window of geo_probes and upserts one
 * GeoDailySnapshot row for today. The rolling window smooths the sparse
 * per-query cadence (7-28 days) into a stable daily trend line — the admin
 * graph and the daily-email sparkline read straight from this table.
 *
 * Score = 60% cited rate + 25% mentioned rate + 15% top-position rate
 * (share of cited answers where weccelerate was within the first 3 sources).
 */

import { prisma } from '@/lib/db';

const WINDOW_DAYS = 14;

export interface GeoSnapshotResult {
  date: string;
  geoScore: number;
  citedRate: number;
  mentionedRate: number;
  probesInWindow: number;
}

interface Bucket { cited: number; mentioned: number; total: number }

function pct(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

export async function writeGeoDailySnapshot(): Promise<GeoSnapshotResult> {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 3600 * 1000);

  // Failed probes (error set) are excluded — an outage day must not read as
  // "citations dropped to zero".
  const probes = await prisma.geoProbe.findMany({
    where: { timestamp: { gte: since }, error: null },
    select: {
      provider: true,
      category: true,
      cited: true,
      mentioned: true,
      position: true,
    },
  });

  let cited = 0;
  let mentioned = 0;
  let topPositioned = 0;
  const byCategory: Record<string, Bucket> = {};
  const byProvider: Record<string, Bucket> = {};

  for (const p of probes) {
    if (p.cited) cited++;
    if (p.mentioned) mentioned++;
    if (p.cited && p.position !== null && p.position <= 3) topPositioned++;

    const cat = p.category ?? 'uncategorized';
    byCategory[cat] ??= { cited: 0, mentioned: 0, total: 0 };
    byCategory[cat].total++;
    if (p.cited) byCategory[cat].cited++;
    if (p.mentioned) byCategory[cat].mentioned++;

    byProvider[p.provider] ??= { cited: 0, mentioned: 0, total: 0 };
    byProvider[p.provider].total++;
    if (p.cited) byProvider[p.provider].cited++;
    if (p.mentioned) byProvider[p.provider].mentioned++;
  }

  const citedRate = pct(cited, probes.length);
  const mentionedRate = pct(mentioned, probes.length);
  const topPositionRate = pct(topPositioned, cited); // among cited answers
  const geoScore = Math.round(
    citedRate * 0.6 + mentionedRate * 0.25 + topPositionRate * 0.15,
  );

  // One row per calendar day; re-running the cron the same day just refreshes it.
  const today = new Date();
  const dateOnly = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  await prisma.geoDailySnapshot.upsert({
    where: { date: dateOnly },
    create: {
      date: dateOnly,
      geoScore,
      citedRate,
      mentionedRate,
      probesInWindow: probes.length,
      byCategory,
      byProvider,
    },
    update: {
      geoScore,
      citedRate,
      mentionedRate,
      probesInWindow: probes.length,
      byCategory,
      byProvider,
    },
  });

  return {
    date: dateOnly.toISOString().slice(0, 10),
    geoScore,
    citedRate,
    mentionedRate,
    probesInWindow: probes.length,
  };
}

/**
 * Regression check for the daily report: compares the average score of the
 * last 7 snapshots vs the 7 before them. A drop of 10+ points triggers the
 * red banner (and should push David toward refresh work over new writing).
 */
export async function detectGeoRegression(): Promise<{
  regressed: boolean;
  recentAvg: number;
  previousAvg: number;
} | null> {
  const rows = await prisma.geoDailySnapshot.findMany({
    orderBy: { date: 'desc' },
    take: 14,
    select: { geoScore: true },
  });
  if (rows.length < 14) return null; // not enough history yet

  const avg = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
  const recentAvg = avg(rows.slice(0, 7).map((r: { geoScore: number }) => r.geoScore));
  const previousAvg = avg(rows.slice(7).map((r: { geoScore: number }) => r.geoScore));

  return { regressed: previousAvg - recentAvg >= 10, recentAvg, previousAvg };
}

/**
 * Inline SVG sparkline of the last `days` snapshots for the daily email.
 * Returns '' when there aren't at least 2 points — the email just omits it.
 * (Email clients render inline SVG inconsistently; Gmail strips <svg>, so the
 * caller embeds this via an <img src="data:image/svg+xml,..."> which Gmail
 * does render.)
 */
export async function geoSparklineDataUri(days = 30): Promise<{ uri: string; latest: number } | null> {
  const rows = await prisma.geoDailySnapshot.findMany({
    orderBy: { date: 'desc' },
    take: days,
    select: { geoScore: true },
  });
  if (rows.length < 2) return null;

  const scores = rows.reverse().map((r: { geoScore: number }) => r.geoScore);
  const W = 260;
  const H = 48;
  const PAD = 4;
  const max = Math.max(...scores, 1);
  const min = Math.min(...scores, 0);
  const span = Math.max(max - min, 1);
  const x = (i: number) => PAD + (i * (W - 2 * PAD)) / (scores.length - 1);
  const y = (s: number) => H - PAD - ((s - min) * (H - 2 * PAD)) / span;
  const points = scores.map((s: number, i: number) => `${x(i).toFixed(1)},${y(s).toFixed(1)}`).join(' ');
  const last = scores[scores.length - 1];

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<polyline fill="none" stroke="#7c3aed" stroke-width="2" points="${points}"/>` +
    `<circle cx="${x(scores.length - 1).toFixed(1)}" cy="${y(last).toFixed(1)}" r="3" fill="#7c3aed"/>` +
    `</svg>`;

  return { uri: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, latest: last };
}
