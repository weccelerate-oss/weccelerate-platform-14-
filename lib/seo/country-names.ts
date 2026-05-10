/**
 * ISO 3166-1 alpha-2 country code → Hebrew display name + flag emoji.
 *
 * Vercel sets `x-vercel-ip-country` to the 2-letter code; we store that in
 * BotVisit.country. The dashboard turns it back into a readable label.
 *
 * Only the most common visitor countries are listed — fall back to the raw
 * code for anything not here.
 */

const COUNTRIES_HE: Record<string, { name: string; flag: string }> = {
  IL: { name: 'ישראל', flag: '🇮🇱' },
  US: { name: 'ארה"ב', flag: '🇺🇸' },
  GB: { name: 'בריטניה', flag: '🇬🇧' },
  DE: { name: 'גרמניה', flag: '🇩🇪' },
  FR: { name: 'צרפת', flag: '🇫🇷' },
  ES: { name: 'ספרד', flag: '🇪🇸' },
  IT: { name: 'איטליה', flag: '🇮🇹' },
  NL: { name: 'הולנד', flag: '🇳🇱' },
  CH: { name: 'שווייץ', flag: '🇨🇭' },
  AT: { name: 'אוסטריה', flag: '🇦🇹' },
  SE: { name: 'שוודיה', flag: '🇸🇪' },
  NO: { name: 'נורווגיה', flag: '🇳🇴' },
  FI: { name: 'פינלנד', flag: '🇫🇮' },
  DK: { name: 'דנמרק', flag: '🇩🇰' },
  PL: { name: 'פולין', flag: '🇵🇱' },
  CZ: { name: "צ'כיה", flag: '🇨🇿' },
  RO: { name: 'רומניה', flag: '🇷🇴' },
  HU: { name: 'הונגריה', flag: '🇭🇺' },
  GR: { name: 'יוון', flag: '🇬🇷' },
  PT: { name: 'פורטוגל', flag: '🇵🇹' },
  IE: { name: 'אירלנד', flag: '🇮🇪' },
  BE: { name: 'בלגיה', flag: '🇧🇪' },
  CA: { name: 'קנדה', flag: '🇨🇦' },
  MX: { name: 'מקסיקו', flag: '🇲🇽' },
  BR: { name: 'ברזיל', flag: '🇧🇷' },
  AR: { name: 'ארגנטינה', flag: '🇦🇷' },
  AU: { name: 'אוסטרליה', flag: '🇦🇺' },
  NZ: { name: 'ניו זילנד', flag: '🇳🇿' },
  IN: { name: 'הודו', flag: '🇮🇳' },
  CN: { name: 'סין', flag: '🇨🇳' },
  JP: { name: 'יפן', flag: '🇯🇵' },
  KR: { name: 'דרום קוריאה', flag: '🇰🇷' },
  SG: { name: 'סינגפור', flag: '🇸🇬' },
  HK: { name: 'הונג קונג', flag: '🇭🇰' },
  TW: { name: 'טייוואן', flag: '🇹🇼' },
  AE: { name: 'איחוד האמירויות', flag: '🇦🇪' },
  SA: { name: 'ערב הסעודית', flag: '🇸🇦' },
  TR: { name: 'טורקיה', flag: '🇹🇷' },
  EG: { name: 'מצרים', flag: '🇪🇬' },
  ZA: { name: 'דרום אפריקה', flag: '🇿🇦' },
  RU: { name: 'רוסיה', flag: '🇷🇺' },
  UA: { name: 'אוקראינה', flag: '🇺🇦' },
};

export function countryLabel(code: string | null | undefined): { name: string; flag: string } {
  if (!code) return { name: '—', flag: '' };
  const normalized = code.toUpperCase();
  return COUNTRIES_HE[normalized] ?? { name: normalized, flag: '🌍' };
}
