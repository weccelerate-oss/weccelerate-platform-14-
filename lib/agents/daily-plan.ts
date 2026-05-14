/**
 * דוד's weekly schedule.
 *
 * The original cron just ran every stage every day. That meant David asked
 * the same 8 questions to the same 3 LLMs daily and tried to publish a new
 * guide every morning — burning API budget on noise and crowding the index
 * with low-priority content.
 *
 * This file maps each weekday to a focus area. Combined with the
 * cadence-aware probe rotation in geo-probes.ts, David covers ~30 queries
 * over a week instead of asking the same 8 every day, and only writes
 * content on days that fit the topic of the day. Saturday is intentionally
 * quiet — no writing, only essential probes — so we don't publish on Shabbat.
 */

export type Weekday = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface DailyPlan {
  /** Hebrew label for the email subject line. */
  label: string;
  /** Categories of probe queries to prioritize today. Empty = run normal cadence rotation. */
  probeFocus: Array<'brand-en' | 'brand-he' | 'generic-en' | 'generic-he' | 'service' | 'medtech'>;
  /** Whether the writer stage runs today. */
  shouldWrite: boolean;
  /** Whether the self-improver stage runs today. */
  shouldImprove: boolean;
  /** Plain Hebrew description for the daily report. */
  description: string;
}

export const WEEKLY_PLAN: Record<Weekday, DailyPlan> = {
  sunday: {
    label: 'יום ראשון — ברנד וזיהוי',
    probeFocus: ['brand-en', 'brand-he'],
    shouldWrite: true,
    shouldImprove: false,
    description:
      'מודד את עוצמת הברנד אצל ה-LLMs (האם הם יודעים מי אנחנו ומה מייחד אותנו), ' +
      'וכותב את הפער הברנדי הכי בוער.',
  },
  monday: {
    label: 'יום שני — תגליות גנריות',
    probeFocus: ['generic-en', 'generic-he'],
    shouldWrite: true,
    shouldImprove: false,
    description:
      'בודק האם WeCcelerate צצה כשמשתמשים שואלים שאלות גנריות ("Best Israeli accelerators..."), ' +
      'וכותב מאמר שמכוון לשאילתות שבהן עדיין לא מצוטטים.',
  },
  tuesday: {
    label: 'יום שלישי — שירותים מובילים',
    probeFocus: ['service'],
    shouldWrite: true,
    shouldImprove: false,
    description:
      'מתמקד בשאילתות שירות ("איפה מקבלים MVP / CTO / ליווי MedTech"), ' +
      'וכותב תוכן שמסביר את השירות שאנחנו מציעים בלי להמציא נתונים.',
  },
  wednesday: {
    label: 'יום רביעי — חיזוק ותיקון',
    probeFocus: ['brand-en', 'brand-he', 'service'],
    shouldWrite: false,
    shouldImprove: true,
    description:
      'יום ללא פרסום חדש — במקום זאת, רץ Self-Improver על מאמרים מ-14+ ימים שעדיין לא הביאו ציטוט, ' +
      'מסמן אותם לעריכה מחדש מזווית אחרת, ובודק זינוק במתחרים.',
  },
  thursday: {
    label: 'יום חמישי — MedTech',
    probeFocus: ['medtech'],
    shouldWrite: true,
    shouldImprove: false,
    description:
      'יום של עומק MedTech — בודק שאילתות רגולציה, FDA, ועדת הלסינקי, ושותפות לאומית, ' +
      'וכותב מדריך ב-MedTech (היתרון התחרותי המרכזי שלנו).',
  },
  friday: {
    label: 'יום שישי — סקירה תחרותית',
    probeFocus: ['generic-en', 'generic-he', 'medtech'],
    shouldWrite: false,
    shouldImprove: true,
    description:
      'סקירה תחרותית שבועית — בודק אילו מתחרים זינקו השבוע, מסמן הזדמנויות counter-content, ' +
      'ולא מפרסם (כדי לא להעמיס על הבוקר של שישי).',
  },
  saturday: {
    label: 'שבת — שקט',
    probeFocus: [],
    shouldWrite: false,
    shouldImprove: false,
    description: 'שבת. דוד לא מפרסם, לא רץ self-improver, רק מודד probes שנכנסים לסבב הקדנציה הרגיל.',
  },
};

const WEEKDAY_NAMES: Weekday[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

/** Today's plan — derived from the server's day-of-week in Israel time. */
export function planForToday(now: Date = new Date()): { weekday: Weekday; plan: DailyPlan } {
  // Israel = UTC+2 (winter) / UTC+3 (summer). The cron fires at 06:00 UTC,
  // so 08:00–09:00 IL. Using local server time would be wrong on Vercel
  // (UTC). We derive the IL day-of-week from the UTC time + Israel offset.
  // For the weekday boundary purposes a fixed +3 is close enough; off-by-one
  // is harmless because the plan repeats weekly.
  const ilTime = new Date(now.getTime() + 3 * 3600 * 1000);
  const dow = ilTime.getUTCDay(); // 0 = Sunday
  const weekday = WEEKDAY_NAMES[dow];
  return { weekday, plan: WEEKLY_PLAN[weekday] };
}

/** Tomorrow's plan — used in the daily report so the operator sees what's next. */
export function planForTomorrow(now: Date = new Date()): { weekday: Weekday; plan: DailyPlan } {
  const tomorrow = new Date(now.getTime() + 86_400_000);
  return planForToday(tomorrow);
}
