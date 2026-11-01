/**
 * Catches mistyped mailbox domains — gmail.om, gmial.com, gmail.co.il,
 * walla.co.ll, hotmial.com — which otherwise turn a real lead into an
 * unreachable one (the sales reply and the confirmation email both bounce).
 *
 * Deliberately conservative: only a near-miss of a well-known consumer
 * provider is corrected, and a substituted letter only counts as a typo when
 * the two keys are neighbours on the keyboard — so real domains one letter
 * away (email.com, wahoo.com, wella.com) and regional ones (hotmail.fr,
 * yahoo.co.uk) are left alone. A company domain is never touched.
 *
 * Shared by the server (silent correction, original kept in the lead) and the
 * client hint ("התכוונת ל…?"). docs/elementor-email-typo-fix.html is a
 * vanilla-JS port for the Elementor forms on we.weccelerate.co.il — keep the
 * lists in sync.
 */

/** Real domains — never "corrected", even when close to another provider. */
const LEGIT = new Set([
  'gmail.com', 'googlemail.com',
  'walla.co.il', 'walla.com',
  'hotmail.com', 'hotmail.co.il', 'outlook.com', 'outlook.co.il', 'live.com', 'msn.com',
  'yahoo.com', 'ymail.com',
  'icloud.com', 'me.com', 'mac.com',
  'bezeqint.net', 'netvision.net.il', '012.net.il', 'zahav.net.il', 'smile.net.il', 'inter.net.il', '013net.net',
  'aol.com', 'mail.com', 'email.com', 'gmx.com', 'gmx.net', 'protonmail.com', 'proton.me',
]);

/**
 * Provider name typed exactly, ending wrong. `any`: the brand has no regional
 * domains, so any ending is a slip (gmail.co.il → gmail.com). Otherwise only an
 * ending close to one of `tlds` is fixed (hotmail.con yes, hotmail.fr no).
 */
const BY_NAME: Record<string, { any?: string; tlds?: string[] }> = {
  gmail: { any: 'gmail.com' },
  icloud: { any: 'icloud.com' },
  walla: { any: 'walla.co.il' },
  bezeqint: { any: 'bezeqint.net' },
  netvision: { any: 'netvision.net.il' },
  hotmail: { tlds: ['com', 'co.il'] },
  outlook: { tlds: ['com', 'co.il'] },
  yahoo: { tlds: ['com'] },
};

/** Where a misspelled provider name is sent. */
const TARGETS = ['gmail.com', 'walla.co.il', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'bezeqint.net', 'netvision.net.il'];

// --- keyboard-aware edit distance --------------------------------------------
const ROWS: [string, number][] = [['1234567890', 0], ['qwertyuiop', 0.5], ['asdfghjkl', 0.75], ['zxcvbnm,.', 1.25]];
const KEY = new Map<string, [number, number]>();
ROWS.forEach(([keys, shift], row) => [...keys].forEach((k, i) => KEY.set(k, [row, i + shift])));

function adjacent(a: string, b: string): boolean {
  const p = KEY.get(a);
  const q = KEY.get(b);
  return !!p && !!q && Math.abs(p[0] - q[0]) <= 1 && Math.abs(p[1] - q[1]) <= 1;
}

/** Insert/delete/adjacent-swap cost 1; a substitution costs 1 only between neighbouring keys. */
function distance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const sub = a[i - 1] === b[j - 1] ? 0 : adjacent(a[i - 1], b[j - 1]) ? 1 : 2;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + sub);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

const split = (domain: string): [string, string] => {
  const i = domain.indexOf('.');
  return i === -1 ? [domain, ''] : [domain.slice(0, i), domain.slice(i + 1)];
};

const normalize = (domain: string) => domain.trim().toLowerCase().replace(/\.{2,}/g, '.').replace(/^\.+|\.+$/g, '');

/** The corrected domain, or null when the domain is fine / not a provider typo. */
export function correctDomain(rawDomain: string): string | null {
  const domain = normalize(rawDomain);
  if (!domain || LEGIT.has(domain)) return null;
  const [name, tld] = split(domain);

  // gmail.om · gmail.co.il · walla.co.ll · hotmail.con — exact brand, wrong ending
  const brand = BY_NAME[name];
  if (brand?.any) return brand.any;
  if (brand?.tlds) {
    const [bestTld, d] = brand.tlds.map((t) => [t, distance(tld, t)] as const).sort((x, y) => x[1] - y[1])[0];
    return d <= 2 ? `${name}.${bestTld}` : null;
  }

  // gmial.com (name slip, right ending) · gmial.con (one slip in each)
  let best: string | null = null;
  let bestScore = Infinity;
  for (const target of TARGETS) {
    const [tName, tTld] = split(target);
    const dn = distance(name, tName);
    const dt = distance(tld, tTld);
    const nameOk = dn <= (tName.length >= 6 ? 2 : 1);
    if (((dt === 0 && nameOk) || (dn <= 1 && dt <= 1)) && dn + dt < bestScore) {
      best = target;
      bestScore = dn + dt;
    }
  }
  return best;
}

export interface EmailFix {
  email: string;
  original: string;
  /** true when the domain itself changed (a typo was fixed), not just its case */
  corrected: boolean;
}

export function fixEmailTypo(raw: string): EmailFix {
  const original = (raw ?? '').trim();
  const at = original.lastIndexOf('@');
  if (at <= 0) return { email: original, original, corrected: false };
  const typed = original.slice(at + 1);
  const domain = correctDomain(typed) ?? normalize(typed);
  return {
    email: `${original.slice(0, at)}@${domain}`,
    original,
    corrected: domain !== typed.trim().toLowerCase(),
  };
}
