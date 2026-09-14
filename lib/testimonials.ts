/**
 * Client quotes approved for the main site (owner approval 2026-09-14).
 *
 * Same three founders as the landing-page testimonials, quotes verbatim,
 * WITHOUT the "result" line that carried numbers and timelines — house rule:
 * nothing quantified externally. Initials render when a photo is missing.
 */

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  initials: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'רותם לוי',
    role: 'מייסדת',
    company: 'Gesher',
    quote:
      'הם עזרו לי בתוכנית העסקית, בשיווק, בפיתוח הפלטפורמה, וגם גייסו לי כספים. הכול במקום אחד, עם אנשים שאכפת להם באמת.',
    initials: 'רל',
  },
  {
    name: 'גיא שחם',
    role: 'מייסד',
    company: 'Grouping',
    quote:
      'אני יזם ותיק ועבדתי עם הרבה יועצים. הצוות של WeCcelerate הוא הראשון שעשה בפועל, לא רק דיבר. מקצועיים ברמה הכי גבוהה.',
    initials: 'גש',
  },
  {
    name: 'אריאל סנה',
    role: 'מייסד',
    company: 'Arine',
    quote:
      'פיתחנו מוצר פיזי מאפס. בלעדיהם לא היינו מצליחים. הליווי קצה לקצה עשה את כל ההבדל, מהעיצוב ועד הייצור.',
    initials: 'אס',
  },
];
