# מסמך תכנון ואפיון — דפי נחיתה לסאבדומיינים
## WeCcelerate Platform | leumit · biz · landing

**תאריך:** 2026-04-14
**גרסה:** 1.0
**מטרה:** בניית שלושה דפי נחיתה איכותיים ברמת העיצוב של הדומיין הראשי, כולל SEO/GEO/AEO, שימוש בנכסים קיימים, ופרומפטים ליצירת חוזרים ויזואליים חדשים.

---

## 1. סקירה כללית (Executive Summary)

### 1.1 מה קיים היום
שלושת הסאבדומיינים (`leumit`, `biz`, `landing`) קיימים כ**סטאבים** ב-[app/sites/](../app/sites/) עם layout בסיסי וכרטיסי דאשבורד ריקים. ה-middleware מנתב אליהם נכון, אבל אין בהם עיצוב או תוכן שיווקי.

### 1.2 מה נבנה
שלושה **דפי נחיתה שיווקיים מלאים** — לא דאשבורדים — כל אחד עם זהות ויזואלית תואמת למותג, תוכן שיווקי ממוקד המרה, טקסטים בעברית מדויקים, אנימציות Framer Motion, אינטגרציית SEO/GEO/AEO מלאה, ושימוש מרבי בנכסים הוויזואליים הקיימים בפרויקט.

### 1.3 קהל יעד לכל סאבדומיין

| Subdomain | קהל יעד | Pain Point | CTA ראשי |
|-----------|---------|------------|----------|
| **leumit** | יזמים בתחום ה-MedTech/HealthTech — רופאים, חוקרים, סטארטאפיסטים רפואיים | רגולציה מסובכת, חוסר גישה לדאטה רפואי, היעדר ליווי קליני | "קבלו ייעוץ רפואי-עסקי" |
| **biz** | בעלי עסקים מבוססים ומנהלים — חיפוש חדשנות, הקמת מיזם פנימי (intrapreneurship), שותפויות אסטרטגיות | חברה קיימת רוצה להזניק יחידה חדשה / לפתח מוצר חדש בלי לסכן את הליבה | "בואו נבנה את היחידה הבאה שלכם" |
| **landing** | יזמים בשלב רעיון — קמפיינים ממומנים (Meta/Google Ads) | "יש לי רעיון אבל אין לי מושג מאיפה להתחיל" | "קבלו שיחת ייעוץ חינם" |

---

## 2. ניתוח רפרנסים

### 2.1 `weccelerate.as7.co.il` (הרפרנס הקיים של landing)
- **כותרת Hero:** "יש לך רעיון?" — שאלה פתוחה שמזמינה
- **תת-כותרת:** רשימת אפשרויות (סטארטאפ/אפליקציה/מוצר/מיזם) — יוצרת הזדהות רחבה
- **מסר:** "אחרי שעזרנו למאות יזמים, יש לנו את הדרך עבורך"
- **טופס קלט רב-ברירה** — "מה הכי חסר לכם?" עם checkboxes
- **3 עמודי ערך:** Proven Results / 360° / Integrated Teams
- **Social proof:** 4 וידאו-עדויות של יזמים מלקוחות אמיתיים
- **Media mentions:** כלכליסט, רשת 13

**מה לאמץ לעמוד landing:** מבנה זהה, אותו טון-דיבור, אבל עם העיצוב הדארק-מוד של הדומיין הראשי (#070b1e + זהב #C8A951), לא הלבן-ירוק של הרפרנס.

### 2.2 `leumitweccelerate.com` (הרפרנס הקיים של leumit)
- **כותרת Hero:** "יש לך רעיון לסטארטאפ רפואי?"
- **תת-כותרת:** "לא יודע מאיפה להתחיל?"
- **נתון מרכזי:** 720,000+ מטופלים · 8.7M ביקורים שנתיים
- **6 מסלולים:** ייעוץ קליני, עסקי ופיננסי, הכנה למשקיעים, שיווק, דאטה רפואי, הנחיה ל-FDA
- **סמכות:** ד"ר סוזן הלפרט (FDA לשעבר) כחבר ועדה מייעצת
- **Subsidy:** הטבה כספית חלקית לסטארטאפים נבחרים

**מה לאמץ לעמוד leumit:** כל התוכן כמעט כפי שהוא, אבל בטיפוגרפיה וצבעוניות של MedTechContent הקיים (ציאן #06B6D4 + זהב #D4AF37), עם הקומפוננטות BioScanPanel ו-ServiceEcosystem.

---

## 3. מערכת העיצוב הקיימת (Design System Reference)

כל שלושת הדפים חייבים להישען על מערכת העיצוב של הדומיין הראשי — אין להמציא פלטה חדשה.

### 3.1 פלטת צבעים
```css
--bg-primary:   #070b1e;   /* רקע ראשי */
--bg-alt:       #0a0e27;   /* רקע חלופי */
--bg-darkest:   #050810;   /* רקע עמוק */
--royal-blue:   #1E3A8A → #1D4ED8;  /* יוקרה */
--gold:         #D4AF37 / #C8A951;  /* הדגשה יוקרתית */
--teal-cyan:    #14B8A6 → #06B6D4;  /* חדשנות */
--slate:        #0F172A → #64748B;  /* ניטרלי */
--emerald:      #10B981;  /* הצלחה */
--coral:        #F97316;  /* קריאה לפעולה (אנרגיה) */
```

**ייחוד לכל סאבדומיין:**
- **leumit:** דומיננטיות של **Cyan #06B6D4** + Gold (כמו `MedTechContent.tsx`)
- **biz:** דומיננטיות של **Slate + Royal Blue** + Emerald (יוקרתי-קורפורטיבי)
- **landing:** דומיננטיות של **Gold** + Coral CTA (אנרגטי-המרה)

### 3.2 טיפוגרפיה
- **פונט ראשי:** Heebo (Google Fonts) — נטען ב-[app/layout.tsx](../app/layout.tsx)
- **משקלים בשימוש:** 300, 400, 500, 600, 700, 800, 900
- **היררכיה:**
  - `heading-display` — 4-6rem, כותרות Hero
  - `heading-3` — 2-3rem, כותרות סקשן
  - `body` — 1.125rem, גוף טקסט
- **RTL:** כל הקומפוננטות תומכות `dir="rtl"` מ-[LanguageContext](../lib/i18n/LanguageContext.tsx)

### 3.3 דפוסים ויזואליים (מתוך main)
- **gold-glow:** `box-shadow: 0 0 20px rgba(200,169,81,0.2)`
- **gradient-text:** `bg-gradient-to-r from-[#c8a951] to-[#e8d48b] bg-clip-text text-transparent`
- **premium-border-wrapper:** מסגרת גרדיאנט מונפשת (קיים ב-ServiceEcosystem עבור MedTech)
- **container-corporate:** container רחב עם padding אחיד
- **section-padding:** ריווח אנכי עקבי

### 3.4 קומפוננטות לשימוש חוזר
מתוך [components/](../components/):

| Component | קובץ | שימוש בדפים החדשים |
|-----------|------|---------------------|
| `CorporateNavbar` | [components/layout/CorporateNavbar.tsx](../components/layout/CorporateNavbar.tsx) | ניווט עליון (גרסה מופחתת לכל סאב) |
| `HeroSection` | [components/ui/hero-section.tsx](../components/ui/hero-section.tsx) | בסיס ל-Hero בכל דף |
| `ServiceEcosystem` | [components/sections/ServiceEcosystem.tsx](../components/sections/ServiceEcosystem.tsx) | רשת שירותים (leumit, biz) |
| `SuccessStories` | [components/ui/success-stories.tsx](../components/ui/success-stories.tsx) | טסטימוניאלס |
| `ScrollReveal` | [components/ui/ScrollReveal.tsx](../components/ui/ScrollReveal.tsx) | עטיפה לאנימציות |
| `ContactForm` | [components/forms/contact-form.tsx](../components/forms/contact-form.tsx) | טופס ליד בכל דף |
| `WhatsAppFloat` | [components/ui/WhatsAppFloat.tsx](../components/ui/WhatsAppFloat.tsx) | כפתור WhatsApp צף |
| `BioScanPanel` | [app/sites/main/services/medtech-leumit/BioScanPanel.tsx](../app/sites/main/services/medtech-leumit/BioScanPanel.tsx) | פאנל אינטראקטיבי ב-leumit |
| `OptimizedImage` | [components/ui/optimized-image.tsx](../components/ui/optimized-image.tsx) | כל התמונות |
| `WhatsAppFloat`, `AccessibilityWidget`, `SkipToContent` | [components/ui/](../components/ui/) | נגישות וצף |

---

## 4. אפיון מפורט — Subdomain #1: `leumit`

### 4.1 מטרה
דף נחיתה שמגדיר את WeCcelerate+Leumit כשותפות ה-MedTech המובילה בישראל ומניע יזמים רפואיים לפנות לייעוץ ראשוני.

### 4.2 URL & Route
- **URL:** `https://leumit.weccelerate.co.il/`
- **Route בקוד:** [app/sites/leumit/page.tsx](../app/sites/leumit/page.tsx)
- **Layout:** [app/sites/leumit/layout.tsx](../app/sites/leumit/layout.tsx) (יכלול Navbar מופחת + Footer מותאם)

### 4.3 מבנה הדף (Section-by-Section)

#### Section 1 — Hero
**רכיבים:** רקע וידאו/תמונה רפואית + כותרת גדולה + תת-כותרת + 2 CTA + לוגו שותפות
**תמונות לשימוש:**
- רקע: [public/images/hero/hero-medtech.jpg](../public/images/hero/hero-medtech.jpg) (קיים) עם overlay `#070b1e/80`
- לוגו שותפות: [public/images/leumit-weccelerate.png](../public/images/leumit-weccelerate.png) (קיים)

**טקסט (עברית):**
```
כותרת עליונה (Badge):
🏥 שותפות אסטרטגית · Leumit × WeCcelerate

כותרת ראשית (H1):
יש לך רעיון לסטארטאפ רפואי?
בואו נהפוך אותו למציאות.

תת-כותרת (H2):
ליווי מעטפת 360° ליזמי MedTech — מהרעיון לאישור רגולטורי,
עם גישה ל-720,000 מטופלים, רופאים מומחים, וייעוץ FDA ישיר.

CTA ראשי:  קבלו שיחת ייעוץ רפואית  (gold button)
CTA משני:  צפו בתוכנית המלאה →
```

**אנימציה:** Fade-in עם stagger על טקסט (0.2s → 0.4s → 0.6s), scale-in על CTA, תמונת רקע עם parallax עדין (כבר קיים ב-HeroVideo).

#### Section 2 — Stats Bar (סרגל נתונים)
**רקע:** `#0a0e27`, גבול עליון ותחתון זהב.
**מבנה:** 4 עמודות עם מספרים גדולים ותיאור קצר.

```
720K+        8.7M           200+             6
מטופלים      ביקורים שנתיים  משקיעים מומחים   מסלולי ייעוץ
ברשת לאומית  בקליניקות       ברשת שלנו         רפואיים
```

**אנימציה:** CountUp נומרי כש-scroll מגיע (כבר קיים כפטרן).

#### Section 3 — 6 מסלולי ליווי (מתוך הרפרנס leumitweccelerate.com)
**רכיב:** גריד 3×2, כרטיסים עם אייקון Lucide, כותרת, תיאור, וקישור "קראו עוד".
**קומפוננטה:** שימוש חוזר ב-`ServiceEcosystem` עם data מותאם.

| # | מסלול | אייקון | תיאור קצר |
|---|-------|--------|-----------|
| 1 | ייעוץ קליני | `Stethoscope` | חוות דעת רפואיות, ליווי בניסויים קליניים, ועדת הלסינקי |
| 2 | ייעוץ עסקי ופיננסי | `TrendingUp` | תוכנית עסקית, מודל פיננסי, הכנה למשקיעים רפואיים |
| 3 | הכנה למשקיעים | `Users` | סימולציית פגישות, pitch deck, רשת 200+ משקיעי MedTech |
| 4 | אסטרטגיית שיווק | `Megaphone` | מיצוב מותג, Go-to-Market, הכנה לכנסים רפואיים |
| 5 | גישה לדאטה רפואי | `Database` | דאטה אנונימית מ-720K מטופלים של לאומית (עם אישור הלסינקי) |
| 6 | ליווי FDA ו-CE | `ShieldCheck` | ייעוץ רגולטורי ישיר, ליווי מומחה לשעבר ב-FDA |

#### Section 4 — BioScan Panel (אינטראקטיבי)
**רכיב:** שימוש ב-[BioScanPanel.tsx](../app/sites/main/services/medtech-leumit/BioScanPanel.tsx) הקיים.
**מיקום:** חצי רוחב שמאלי פאנל, חצי ימני טקסט הסבר: "כך נראית גישה לדאטה רפואי אצלנו".

#### Section 5 — ועדה מייעצת (Advisory Board)
**רכיב:** גריד של 3-4 כרטיסי מומחים עם תמונה, שם, תפקיד, ומשפט-רקע.
**תמונות לשימוש:** [public/images/team/](../public/images/team/) או תמונות חדשות אם נדרש.
**דוגמה:**
- אלון פנחס — CEO, WeCcelerate (תמונה: `/images/team/alon.jpg`)
- עידו סבג — CTO, WeCcelerate (`/images/team/ido.jpg`)
- [שם] — מנהל חדשנות, לאומית *(תמונה חסרה — ראו סעיף 8)*
- ד"ר סוזן הלפרט — יועצת FDA לשעבר *(תמונה חסרה — ראו סעיף 8)*

#### Section 6 — Success Story Spotlight
**רכיב:** `SuccessStories` קומפוננטה עם 2-3 סטארטאפים רפואיים מהפורטפוליו.
**תוכן:** שם הסטארטאפ, מייסד, לוגו, ציטוט, תוצאה מספרית (גיוס/אישור).

#### Section 7 — FAQ
**רכיב:** accordion עם 6-8 שאלות נפוצות. גם מוזן כ-FAQ Schema (ראו סעיף 9).

**שאלות:**
1. כמה עולה להצטרף למסלול?
2. מה דרוש כדי להתקבל?
3. האם יש מסלול בחינם לשלב הרעיון?
4. כמה זמן לוקח התהליך?
5. האם אקבל גישה לדאטה של לאומית?
6. מה קורה אחרי ההאצה?
7. האם אתם משתתפים בגיוסים?
8. האם אתם עובדים עם סטארטאפים מחו"ל?

#### Section 8 — CTA סופי + טופס
**רקע:** גרדיאנט `from-cyan-900/30 via-#070b1e to-gold-900/20`.
**טקסט:** "מוכנים להתחיל? בואו נדבר." + טופס קצר (שם, טלפון, אימייל, תחום) + WhatsApp.

#### Section 9 — Footer
גרסה מופחתת של `CorporateFooter` — יצירת קשר, לוגו שותפות, קישורים לדומיין הראשי.

### 4.4 קומפוננטות לבנייה
- [app/sites/leumit/LeumitLandingContent.tsx](../app/sites/leumit/LeumitLandingContent.tsx) (חדש)
- [app/sites/leumit/sections/](../app/sites/leumit/sections/) (חדש): `HeroLeumit.tsx`, `StatsBar.tsx`, `TracksGrid.tsx`, `AdvisoryBoard.tsx`, `FAQLeumit.tsx`
- שימוש חוזר: `BioScanPanel`, `ServiceEcosystem`, `SuccessStories`, `ContactForm`

---

## 5. אפיון מפורט — Subdomain #2: `biz`

### 5.1 מטרה
דף נחיתה שמיצב את WeCcelerate כשותף האסטרטגי של **עסקים מבוססים** שרוצים להזניק יחידה חדשה (intrapreneurship / venture building לתאגידים) — לא סטארטאפיסטים.

### 5.2 URL & Route
- **URL:** `https://biz.weccelerate.co.il/`
- **Route:** [app/sites/biz/page.tsx](../app/sites/biz/page.tsx)

### 5.3 מבנה הדף

#### Section 1 — Hero
**רקע:** [public/images/Two_people_*.jpeg](../public/images/) (שימוש באחת מהתמונות המקצועיות) עם overlay כחול-Slate.

```
כותרת עליונה:
⚡ For Enterprises · WeCcelerate Business

כותרת ראשית:
החברה שלכם מוכנה למיזם הבא.
אנחנו יודעים איך להקים אותו.

תת-כותרת:
אנחנו ה-Venture Builder של ארגונים בישראל — בונים לכם יחידה עצמאית,
מוצר חדש, או מיזם אחות, מהרעיון ועד ההשקה, בלי לסכן את הליבה.

CTA ראשי: בואו נתאם שיחה אסטרטגית
CTA משני: הורידו את המתודולוגיה →
```

#### Section 2 — לוגואים של ארגונים (Trust Bar)
**רכיב:** `AutoScrollCarousel` (קיים) עם לוגואים של לקוחות/שותפים.
**לוגואים בשימוש:**
- [public/images/logos/herzog-logo.png](../public/images/logos/herzog-logo.png)
- [public/images/logos/harashut-logo.png](../public/images/logos/harashut-logo.png)
- [public/images/logos/jerusalem-development-authority.png](../public/images/logos/jerusalem-development-authority.png)
- [public/images/logos/har-hozvim-logo.png](../public/images/logos/har-hozvim-logo.png)
- [public/images/logos/leumit-logo.png](../public/images/logos/leumit-logo.png)

#### Section 3 — "The Problem" — 3 כרטיסי כאב
רקע כהה, כרטיסים עם אייקון אדום-כהה וטקסט לבן.

```
1. ❌ "החדשנות תקועה בוועדות"
   הפרויקט המבטיח של השנה שעברה עוד לא הגיע לאור — ה-POC נתקע ב-R&D.

2. ❌ "הצוות הפנימי עמוס מדי"
   אין לכם ידיים פנויות לבנות מוצר חדש מאפס בלי לפגוע בליבה.

3. ❌ "אתם לא רוצים לפתוח חברה חדשה לבד"
   הסיכון גבוה, הניסיון חסר, וה-Board רוצה תוצאות מוכחות.
```

#### Section 4 — "The Solution" — מודל 4 שלבים
**רכיב:** קומפוננטת timeline אופקית (ניתן לשכפל מ-`BusinessTimeline.tsx`).

```
שלב 1: אבחון והיתכנות  (2-4 שבועות)
שלב 2: עיצוב וגיבוש מודל עסקי  (4-6 שבועות)
שלב 3: בניית MVP ו-Validation  (3-6 חודשים)
שלב 4: השקה ו-Spin-off  (6-12 חודשים)
```

#### Section 5 — "What You Get" — 6 ערכים
גריד 3×2:
1. **צוות יעודי** — CTO, מנהל מוצר, דיזיינר, מפתחים
2. **מתודולוגיה מוכחת** — 40+ מיזמים שהוקמו
3. **רשת משקיעים** — 200+ VCs לשלב הבא
4. **שותפות אסטרטגית** — אתם חלק מההחלטות
5. **גמישות בתמחור** — Equity, Success Fee, או Retainer
6. **יציאה נקייה** — IP מלא נשאר אצלכם

#### Section 6 — Case Studies (קיסים)
**רכיב:** 3 כרטיסים גדולים עם תמונה, שם, תוצאה מספרית, 2-3 שורות תיאור, וקישור.
**תמונות לשימוש:** [public/images/service-*.jpeg](../public/images/), [public/images/Elegant_*.jpeg](../public/images/), [public/images/Cinematic_*.jpeg](../public/images/)

**דוגמה למבנה:**
```
לקוח: [חברת ייצור מובילה]
יחידה חדשה: פלטפורמת SaaS B2B2C
תוצאה: 2.5M$ גיוס תוך 14 חודשים
```

#### Section 7 — Stats Bar
```
$150M+         40+            200+           6
גויסו על ידי   מיזמים שהוקמו  משקיעים ברשת   שנות ניסיון
לקוחות WeCc.
```

#### Section 8 — FAQ
#### Section 9 — CTA + טופס
#### Section 10 — Footer

### 5.4 קומפוננטות לבנייה
- [app/sites/biz/BizLandingContent.tsx](../app/sites/biz/BizLandingContent.tsx) (חדש)
- [app/sites/biz/sections/](../app/sites/biz/sections/): `HeroBiz.tsx`, `ProblemCards.tsx`, `SolutionTimeline.tsx`, `ValueGrid.tsx`, `CaseStudies.tsx`

---

## 6. אפיון מפורט — Subdomain #3: `landing`

### 6.1 מטרה
דף נחיתה **להמרה גבוהה** לקמפיינים ממומנים (Meta/Google). קצר, ממוקד, ללא הסחות דעת — הקונים הם יזמים בשלב הרעיון שהתעניינו במודעה.

### 6.2 URL & Route
- **URL:** `https://landing.weccelerate.co.il/`
- **Route:** [app/sites/landing/page.tsx](../app/sites/landing/page.tsx)
- **חשוב:** ללא Navbar ראשי — רק לוגו + כפתור WhatsApp צף. Single-page long-scroll.

### 6.3 מבנה הדף

#### Section 1 — Hero (בהשראת `weccelerate.as7.co.il`)
**רקע:** וידאו [public/images/hero/hero-bg.mp4](../public/images/hero/hero-bg.mp4) או תמונה סטטית + overlay.

```
כותרת ראשית (H1, גדול מאוד):
יש לך רעיון?

תת-כותרת מחליפה (rotating subtitle):
לסטארטאפ? לאפליקציה? למוצר? לעסק? למיזם חדש?

Supporting copy:
אחרי שליווינו 200+ יזמים וגייסנו יחד מעל $150M,
יש לנו את הדרך עבורך. בואו נתחיל בשיחה.

CTA ראשי (גדול, זהב): קבלו שיחת ייעוץ חינם
מתחת (מיקרו-copy): ⏱ 20 דקות · ללא התחייבות · ישירות עם יועץ בכיר
```

**אנימציה:** Type-writer effect על תת-הכותרת (החלפת המילה: סטארטאפ → אפליקציה → מוצר → עסק).

#### Section 2 — Multi-select Form (כמו ברפרנס as7)
**רכיב:** טופס מודרני עם checkboxes בעיצוב כרטיסים.

```
שאלה: "מה הכי חסר לכם כרגע?"

☐ ייעוץ עסקי כללי
☐ הכנה למשקיעים
☐ כתיבת תוכנית עסקית
☐ מחקר שוק
☐ פיתוח אפליקציה
☐ פיתוח מוצר פיזי
☐ שיווק ומיתוג
☐ רגולציה רפואית

כפתור: "קדימה, בואו נדבר →"
```

אחרי בחירה — טופס פרטים קצר (שם, טלפון, אימייל) ושליחה ל-Pipedrive (קיים ב-[lib/pipedrive.ts](../lib/pipedrive.ts)).

#### Section 3 — 3 עמודי ערך
אייקונים + כותרות + שורה אחת:
1. 🏆 **ניסיון מוכח** — 200+ יזמים, $150M+ גיוסים
2. 🎯 **ליווי מעטפת 360°** — מהרעיון לשוק, בלי פיזורים
3. 🤝 **צוות אחד, כל המומחים** — עסקי, טק, שיווק, משפטי

#### Section 4 — טסטימוניאל ראשי
וידאו או ציטוט בולט — מייסד אחד בולט, תמונה, ציטוט, תוצאה.

#### Section 5 — "איך זה עובד?" — 4 שלבים
טיימליין אופקי:
```
1. שיחת היכרות (20 דקות, חינם)
2. אבחון ותוכנית פעולה
3. ליווי צמוד עם הצוות שלנו
4. השקה והצלחה
```

#### Section 6 — טסטימוניאלס נוספים
`SuccessStories` קומפוננטה עם 3-4 ציטוטים.

#### Section 7 — Media logos
לוגואים של כלי תקשורת שכיסו את WeCcelerate (כלכליסט, רשת 13, גלובס, TheMarker).

#### Section 8 — FAQ (4-5 שאלות בלבד)
#### Section 9 — CTA סופי אחרון
חזרה על ה-CTA הראשי של Section 1, אבל בגדול יותר עם טיימר/דחיפות עדין: "היום עוד 3 מקומות פנויים לייעוץ השבוע."

### 6.4 קומפוננטות לבנייה
- [app/sites/landing/LandingPageContent.tsx](../app/sites/landing/LandingPageContent.tsx) (חדש)
- [app/sites/landing/sections/](../app/sites/landing/sections/): `HeroLanding.tsx`, `MultiSelectForm.tsx`, `ValueProps.tsx`, `HowItWorks.tsx`, `FinalCTA.tsx`

---

## 7. תמונות קיימות — מיפוי לשימוש

כל התמונות קיימות ב-[public/images/](../public/images/) — אין צורך ליצור חדשות לרוב הסקשנים.

### 7.1 leumit
| Section | תמונה קיימת |
|---------|-------------|
| Hero background | [hero-medtech.jpg](../public/images/hero/hero-medtech.jpg) |
| Partnership logo | [leumit-weccelerate.png](../public/images/leumit-weccelerate.png) |
| Leumit logo | [leumit-logo.png](../public/images/logos/leumit-logo.png) |
| Team photos (Advisory) | [team/alon.jpg](../public/images/team/alon.jpg), [team/ido.jpg](../public/images/team/ido.jpg) |
| Service icon backgrounds | [A_clean_futuristic_2k_*.jpeg](../public/images/) |
| BioScan visual | קומפוננטה אינטראקטיבית — לא תמונה |

### 7.2 biz
| Section | תמונה קיימת |
|---------|-------------|
| Hero background | [Two_people_*.jpeg](../public/images/) |
| Trust bar logos | כל הלוגואים ב-[logos/](../public/images/logos/) |
| Case study 1 | [service-business.jpeg](../public/images/) או [Elegant_*.jpeg](../public/images/) |
| Case study 2 | [service-digital.jpeg](../public/images/) |
| Case study 3 | [service-physical.jpeg](../public/images/) |
| Solution timeline BG | [Cinematic_*.jpeg](../public/images/) |

### 7.3 landing
| Section | תמונה קיימת |
|---------|-------------|
| Hero video | [hero-bg.mp4](../public/hero-bg.mp4) + [hero-bg-poster.jpeg](../public/hero-bg-poster.jpeg) |
| Value props icons | Lucide icons (ללא תמונות) |
| Testimonial background | [Two_people_*.jpeg](../public/images/) |
| Media logos | יש ליצור/להשיג (ראו סעיף 8) |

---

## 8. תמונות חדשות שצריך ליצור — פרומפטים

אלה הפריטים שאין עבורם נכס קיים מספק. כל פרומפט כתוב ב-English כי כלי יצירת תמונות עובדים טוב יותר באנגלית.

### 8.1 leumit — ועדה מייעצת (פורטרטים)
**שימוש:** Advisory Board section.

**Prompt 1 — יועץ FDA:**
```
Professional corporate headshot portrait of a senior female medical advisor, late 50s, short silver hair, warm confident smile, wearing a navy blazer over a white blouse. Soft studio lighting from the left, shallow depth of field, neutral charcoal background with subtle gradient. Sharp focus on eyes, skin retouched but natural. Photographed on a Canon 5D, 85mm lens, f/2.0. High-end LinkedIn / executive photography style. 4K, photorealistic, editorial quality. Aspect ratio 1:1.
```

**Prompt 2 — מנהל חדשנות לאומית:**
```
Professional corporate headshot portrait of a male healthcare innovation director, mid-40s, short dark hair with grey at temples, clean shaven, confident direct gaze, wearing a dark grey suit with an open collar blue shirt. Studio lighting with rim light from behind, neutral dark-blue gradient background. Photographed on a Canon 5D, 85mm lens, f/2.0. Editorial executive photography, shallow depth of field, sharp eyes, subtle cinematic color grading. 4K, photorealistic. Aspect ratio 1:1.
```

### 8.2 leumit — הירו משני (תמונת קליניקה)
**שימוש:** כרקע ל-Section 4 (BioScan + הסבר).

```
A modern high-tech medical research lab in Israel, wide angle shot. Two researchers in white coats (one male, one female) looking at a large futuristic holographic screen displaying anonymized patient data charts, DNA strands, and medical scans. Soft cyan and gold ambient lighting, dark navy walls. Cinematic, shallow depth of field, volumetric lighting, photo-realistic. 16:9 aspect ratio. Style: clean, minimalist, premium medical innovation. Ultra-detailed, 4K.
```

### 8.3 biz — Hero Background
**שימוש:** רקע ל-Hero של `biz`.

```
Cinematic wide-angle shot of a modern corporate boardroom in a glass high-rise tower at golden hour. View through the window shows Tel Aviv skyline with Mediterranean coastline in distance. Interior: a sleek long oak meeting table, minimalist, empty chairs, warm ambient lighting, subtle gold reflections on glass. Overall mood: executive, aspirational, powerful. Royal blue and slate color palette with gold accents. No people. Shot on ARRI Alexa, ultra-wide 24mm, f/4, photorealistic, 4K. 16:9 aspect ratio.
```

### 8.4 biz — Case Study Visuals (3 תמונות)
**שימוש:** 3 כרטיסי case study.

**Prompt A — Tech SaaS venture:**
```
Aerial top-down view of a modern tech startup workspace: a sleek laptop displaying a clean SaaS dashboard on screen, coffee cup, notebook with sketches, smartphone, and a small potted succulent, all arranged on a dark walnut wooden desk. Warm gold desk lamp light. Deep navy blue accents. Minimalist, professional, premium B2B SaaS aesthetic. Shot from directly above, photorealistic, 4K. Aspect ratio 4:3.
```

**Prompt B — Physical product manufacturing:**
```
Close-up macro shot of an engineer's hands in a high-tech manufacturing facility, assembling a sleek aluminum consumer product prototype (abstract, no logos). Clean workbench, soft industrial lighting, shallow depth of field focusing on the product. Background shows blurred CNC machines and blue LED strip lights. Professional product development photography. 4K, photorealistic, cinematic color grading. Aspect ratio 4:3.
```

**Prompt C — Corporate innovation:**
```
Cinematic shot of a corporate innovation workshop: a diverse team of 5 professionals (mix of genders, mid-30s to 50s) standing around a glass whiteboard covered in colorful post-it notes and strategy diagrams. Modern office, floor-to-ceiling windows showing city skyline, warm natural light mixed with cool overhead LEDs. Mood: collaborative, energetic, strategic. Photorealistic, shot on Sony A7, 35mm, f/2.8. 4K. Aspect ratio 4:3.
```

### 8.5 landing — Media Logos
**הערה:** לוגואים של כלי תקשורת (כלכליסט, רשת 13, גלובס) דורשים שימוש בחומרים **רשמיים** של הערוצים. אין ליצור אותם ב-AI — יש להוריד מ-press kit או לבקש רשות. אם לא זמין:
- לוותר על הסקשן ולהחליף ב"כיסוי תקשורתי" עם טקסט בלבד
- או להשתמש בצילומי מסך/screenshots של כתבות (יש להסדיר זכויות)

### 8.6 כללי — Patterns & Textures
אם צריך רקעים דקורטיביים:

```
Abstract subtle geometric pattern, dark navy (#070b1e) background with thin gold (#C8A951) isometric grid lines, very minimal, barely visible, 5% opacity. Seamless tileable texture for web background. Style: premium corporate, futuristic, elegant. 4K, tileable.
```

---

## 9. אסטרטגיית SEO / GEO / AEO

### 9.1 SEO — על-דפי (On-Page)

#### Metadata לכל סאבדומיין
ייצוא `generateMetadata()` ב-[app/sites/{sub}/page.tsx](../app/sites/):

**leumit:**
```typescript
export const metadata: Metadata = {
  title: 'ליווי MedTech עם לאומית | WeCcelerate Leumit',
  description: 'ליווי מעטפת 360° ליזמי רפואה דיגיטלית — גישה ל-720,000 מטופלים, ייעוץ רגולטורי FDA, רופאים מומחים, וקבוצת 200+ משקיעי MedTech. שותפות אסטרטגית Leumit × WeCcelerate.',
  keywords: ['MedTech Israel', 'האצה רפואית', 'סטארטאפ רפואי', 'לאומית שירותי בריאות', 'FDA ישראל', 'רגולציה רפואית', 'Digital Health', 'קליני פיילוט'],
  openGraph: {
    title: 'שותפות MedTech מובילה | Leumit × WeCcelerate',
    description: '...',
    images: ['/images/leumit-weccelerate.png'],
    locale: 'he_IL',
  },
  alternates: {
    canonical: 'https://leumit.weccelerate.co.il',
    languages: { 'he-IL': '/', 'en-US': '/en' },
  },
};
```

**biz:**
```typescript
title: 'Venture Builder לארגונים בישראל | WeCcelerate Business',
description: 'בונים ליחידות חדשנות בארגונים גדולים — מאבחון ועד השקה. אנחנו ה-Venture Builder של תאגידים ישראלים, עם 40+ מיזמים ו-$150M גיוסים מצטברים.',
keywords: ['Corporate Venture Building', 'intrapreneurship Israel', 'חדשנות בארגונים', 'פיתוח מוצר לתאגידים', 'ספין-אוף ישראל'],
```

**landing:**
```typescript
title: 'יש לך רעיון לסטארטאפ? בואו נתחיל | WeCcelerate',
description: 'ליווי אישי מרעיון לסטארטאפ — 200+ יזמים, $150M+ גיוסים. שיחת ייעוץ חינם של 20 דקות עם יועץ בכיר. כל הצוות במקום אחד: עסקי, טק, שיווק.',
robots: { index: true, follow: true }, // landing גם כן אינדקס, למרות שזה דף קמפיין
```

#### Sitemap
עדכון [app/sitemap.ts](../app/sitemap.ts) להוסיף את שלוש הכתובות:
```typescript
{ url: 'https://leumit.weccelerate.co.il', lastModified: new Date(), priority: 0.9, changeFrequency: 'weekly' },
{ url: 'https://biz.weccelerate.co.il', lastModified: new Date(), priority: 0.9, changeFrequency: 'weekly' },
{ url: 'https://landing.weccelerate.co.il', lastModified: new Date(), priority: 0.7, changeFrequency: 'monthly' },
```

#### robots.txt
לוודא שכל הסאבדומיינים נגישים לזחלני גוגל, למעט `/admin` ו-`/portal`.

#### Structured Data (JSON-LD)
לכל דף להוסיף schemas מתוך [components/seo/](../components/seo/):

**leumit:**
- `OrganizationSchema` (בנאריאציה המציינת את השותפות)
- `MedicalOrganization` schema (חדש — דרוש יצירה)
- `Service` schema × 6 (אחד לכל מסלול)
- `FAQPage` schema
- `BreadcrumbList`

**biz:**
- `OrganizationSchema`
- `Service` schema × 6
- `FAQPage` schema
- `Review` / `AggregateRating` (אם יש)

**landing:**
- `OrganizationSchema` (מינימלי)
- `FAQPage` schema (קצר)
- `LocalBusiness` schema

### 9.2 GEO — אופטימיזציה גיאוגרפית

כבר קיים [components/seo/GeoSchema.tsx](../components/seo/GeoSchema.tsx). יש להרחיב:

**Geo targeting לכל סאבדומיין:**
```html
<meta name="geo.region" content="IL-TA" />
<meta name="geo.placename" content="Tel Aviv-Yafo" />
<meta name="geo.position" content="32.0619;34.7761" />
<meta name="ICBM" content="32.0619, 34.7761" />
```

**LocalBusiness Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": ["ProfessionalService", "LocalBusiness"],
  "name": "WeCcelerate",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "HaRakevet 58",
    "addressLocality": "Tel Aviv",
    "postalCode": "6777016",
    "addressCountry": "IL"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 32.0619, "longitude": 34.7761 },
  "telephone": "+972-55-564-7538",
  "areaServed": ["IL", "Tel Aviv", "Jerusalem", "Israel"],
  "openingHours": "Su-Th 09:00-18:00"
}
```

**Google Business Profile:** לוודא שה-GBP מקושר לדומיין הראשי ולעדכן "Services" בהתאם לסאבדומיינים החדשים.

**Hreflang:**
```html
<link rel="alternate" hreflang="he-IL" href="https://leumit.weccelerate.co.il/" />
<link rel="alternate" hreflang="en-US" href="https://leumit.weccelerate.co.il/en" />
<link rel="alternate" hreflang="x-default" href="https://leumit.weccelerate.co.il/" />
```

### 9.3 AEO — Answer Engine Optimization (ChatGPT/Perplexity/Gemini)

#### מבנה התוכן
- **שאלות ותשובות מפורשות** בסקשן FAQ (כל דף) — זה הגורם #1 ב-AEO.
- **הצהרות עובדתיות מסופרות** (mood: encyclopedic): "WeCcelerate מפעילה 200+ משקיעים", "לאומית מכסה 720,000 מטופלים".
- **מידע מובנה בטבלאות** — LLMs קוראים טבלאות טוב מטקסט זורם.
- **כותרות מפורשות שעונות על intent:** "כמה עולה להאיץ סטארטאפ רפואי?" (ולא "תמחור").

#### עדכון קבצי AEO
[public/llms.txt](../public/llms.txt) ו-[public/llms-full.txt](../public/llms-full.txt) — יש להוסיף סקשנים ייעודיים:

```
## Leumit × WeCcelerate MedTech Track
- URL: https://leumit.weccelerate.co.il
- Partnership: Leumit Health Services + WeCcelerate
- Target: MedTech/HealthTech entrepreneurs
- Access: 720,000+ patient records, 8.7M annual visits
- Tracks: Clinical Advisory, Business & Finance, Investor Prep, Marketing, Medical Data, FDA Guidance
- Key Advisors: Former FDA advisor Dr. Susan Helppert
- Contact: via main WeCcelerate channels

## WeCcelerate Business (for Enterprises)
- URL: https://biz.weccelerate.co.il
- Target: Mid-large enterprises seeking corporate venture building
- Services: Feasibility → Model Design → MVP → Spin-off
- Track record: 40+ ventures built, $150M+ raised by portfolio
- Pricing models: Equity, Success Fee, Retainer
...
```

#### Content best practices ל-LLMs
1. כל שם חברה/אדם יופיע במלואו (ולא קיצור) ברישום הראשון.
2. מספרים עם יחידות ("720,000 מטופלים" ולא "720K").
3. תאריכים מלאים ("נוסדה ב-2016").
4. קישורים פנימיים מפורשים (קל ל-crawlers).
5. כותרות H2/H3 שעונות על שאלות קונקרטיות.

#### Core Web Vitals (משפיע על AEO דרך דירוג)
- LCP < 2.5s — שימוש ב-`OptimizedImage` עם `priority` על Hero
- INP < 200ms — צמצום JavaScript בסקשנים שלא בלמעלה
- CLS < 0.1 — הגדרת `width/height` על כל תמונה

---

## 10. Accessibility & Performance

### 10.1 נגישות (WCAG AA)
- שימוש ב-[AccessibilityWidget](../components/ui/AccessibilityWidget.tsx) (קיים)
- כל CTA עם `aria-label` מפורש
- ניגודיות טקסט > 4.5:1 (לבן על `#070b1e` = 18:1 ✓)
- סדר לוגי של headings (H1 → H2 → H3)
- `alt` לכל תמונה (בעברית)
- Focus states ברורים
- תמיכה בקורא מסך — `role="region"` על סקשנים
- `<SkipToContent />` בראש כל דף

### 10.2 ביצועים
- שימוש ב-Next.js Image עם AVIF/WebP אוטומטי (קיים ב-[next.config.ts](../next.config.ts))
- Lazy-load של סקשנים מתחת ל-fold (`loading="lazy"`)
- וידאו Hero עם `preload="metadata"` ו-poster
- Font subsetting של Heebo (hebrew subset בלבד) — קיים
- אין JavaScript מיותר — עדיפות לקומפוננטות Server
- Lighthouse target: Performance > 90, SEO > 95, A11y > 95, Best Practices > 95

---

## 11. Analytics & Tracking

### 11.1 אירועים לעקיבה
שימוש במערכת [lib/analytics/track.ts](../lib/analytics/track.ts) הקיימת. אירועים לכל סאבדומיין:

```typescript
// גנריים
trackEvent('subdomain_pageview', { subdomain: 'leumit', section: 'hero' });
trackEvent('cta_click', { subdomain, cta_label, position });
trackEvent('form_start', { subdomain, form_type });
trackEvent('form_submit', { subdomain, form_type, fields_filled });
trackEvent('scroll_depth', { subdomain, depth_percent });

// ייחודיים ל-landing
trackEvent('multiselect_option_checked', { option });
trackEvent('whatsapp_click', { subdomain });
```

### 11.2 יעדי המרה
| Subdomain | יעד עיקרי | יעד משני |
|-----------|----------|----------|
| **leumit** | טופס "קבלו ייעוץ רפואי" נשלח | צפייה בוידאו Advisory Board |
| **biz** | תיאום שיחה דרך הטופס | הורדת PDF של המתודולוגיה |
| **landing** | טופס multi-select נשלח | לחיצה על WhatsApp |

### 11.3 Pipedrive integration
שימוש חוזר ב-[lib/pipedrive.ts](../lib/pipedrive.ts) הקיים. יצירת Lead עם שדה `source` מותאם:
- `leumit.weccelerate.co.il` → Pipedrive stage "MedTech Inquiry"
- `biz.weccelerate.co.il` → "Enterprise Inquiry"
- `landing.weccelerate.co.il` → "General Inquiry"

---

## 12. תוכנית יישום — Phased Rollout

### Phase 1 — תשתית (יום 1-2)
- [ ] יצירת `app/sites/{sub}/sections/` לכל סאבדומיין
- [ ] יצירת `layout.tsx` מותאם לכל סאבדומיין (ללא main Navbar בצורתו המלאה)
- [ ] הגדרת metadata, robots, sitemap
- [ ] הוספת `generateMetadata()` לכל `page.tsx`

### Phase 2 — `leumit` (יום 3-5)
- [ ] Hero + Stats Bar
- [ ] 6 Tracks grid (שימוש ב-ServiceEcosystem)
- [ ] BioScan integration
- [ ] Advisory Board
- [ ] FAQ + Schema
- [ ] CTA + טופס
- [ ] QA + Lighthouse

### Phase 3 — `biz` (יום 6-8)
- [ ] Hero + Trust bar
- [ ] Problem/Solution/Value grids
- [ ] Timeline ו-Case studies
- [ ] FAQ + Schema
- [ ] CTA + טופס
- [ ] QA + Lighthouse

### Phase 4 — `landing` (יום 9-10)
- [ ] Hero + multi-select form
- [ ] Value props + How it works
- [ ] Testimonials + Media logos
- [ ] Final CTA עם דחיפות
- [ ] A/B test variants (כותרת, CTA)
- [ ] QA + Lighthouse

### Phase 5 — SEO/AEO/GEO (יום 11-12)
- [ ] עדכון [public/llms.txt](../public/llms.txt) ו-[public/llms-full.txt](../public/llms-full.txt)
- [ ] סכימות JSON-LD לכל דף
- [ ] Hreflang, canonical, Open Graph
- [ ] הגשת Sitemap ל-Google Search Console
- [ ] הגדרת Google Business Profile

### Phase 6 — QA & Launch (יום 13)
- [ ] בדיקת responsive על mobile/tablet/desktop
- [ ] בדיקת RTL/LTR
- [ ] בדיקת נגישות (axe DevTools, Lighthouse)
- [ ] בדיקת ביצועים (Core Web Vitals)
- [ ] בדיקת טפסים → Pipedrive
- [ ] בדיקת analytics events
- [ ] פריסה ל-Vercel → הוספת סאבדומיינים ב-Domains

---

## 13. סיכונים וחששות

| סיכון | השפעה | הקלה |
|-------|--------|------|
| תוכן רגיש של Leumit דורש אישור משפטי | גבוהה | יש לאשר כל נתון ("720K מטופלים") עם נציג לאומית לפני השקה |
| תמונות AI של אנשים עלולות להיראות מלאכותיות | בינונית | עדיפות לתמונות אמיתיות מהצוות הקיים; AI רק כ-fallback |
| SEO — קניבליזציה בין הדומיין הראשי לסאבדומיינים | בינונית | canonical מובהקים, תוכן ייחודי לכל דף, אין העתקת פסקאות מהדומיין הראשי |
| טפסים זהים בכל 3 דפים — לידים מעורבים | נמוכה | פרמטר `source` ב-Pipedrive + UTM tagging |
| העדר case studies אמיתיים ל-biz | בינונית | להתחיל עם "case studies מוקטנים" ללא שמות + אישור ללקוחות קיימים במקביל |

---

## 14. תלויות חיצוניות

- **אישורי תוכן מלאומית** — נתונים רפואיים, שמות יועצים, לוגו (חובה לפני השקה)
- **רשות שימוש בלוגואים של מדיה** — לדף landing
- **חשבונות Pipedrive stages** — צריך ליצור 2 stages חדשים (MedTech, Enterprise)
- **Vercel DNS** — 3 רשומות חדשות אצל רשם הדומיין
- **Google Search Console** — לאמת 3 properties חדשות

---

## 15. קריטריוני הצלחה

### 15.1 Launch criteria (יום 0)
- ✅ Lighthouse > 90 על כל דף (Performance, SEO, A11y, Best Practices)
- ✅ אין שגיאות Console
- ✅ כל הטפסים שולחים ל-Pipedrive בהצלחה
- ✅ כל שלושת הדומיינים פרוסים ב-Vercel עם SSL פעיל
- ✅ sitemap נגיש ואומת ב-GSC

### 15.2 KPIs (חודש 1)
- `leumit`: 10+ לידים איכותיים לחודש
- `biz`: 5+ פניות מארגונים בחודש
- `landing`: CTR > 3% מהקמפיין, CVR > 8% בטופס
- SEO: אינדקס מלא של 3 הדומיינים תוך 14 יום
- AEO: הופעה ב-ChatGPT/Perplexity לשאלה "MedTech accelerator Israel" תוך 30 יום

---

## 16. נספחים

### 16.1 קבצים שיווצרו

```
app/sites/leumit/
├── page.tsx                    (מעודכן)
├── layout.tsx                  (מעודכן)
├── LeumitLandingContent.tsx    (חדש)
└── sections/
    ├── HeroLeumit.tsx
    ├── StatsBar.tsx
    ├── TracksGrid.tsx
    ├── AdvisoryBoard.tsx
    ├── FAQLeumit.tsx
    └── CTAForm.tsx

app/sites/biz/
├── page.tsx                    (מעודכן)
├── layout.tsx                  (מעודכן)
├── BizLandingContent.tsx       (חדש)
└── sections/
    ├── HeroBiz.tsx
    ├── TrustBar.tsx
    ├── ProblemCards.tsx
    ├── SolutionTimeline.tsx
    ├── ValueGrid.tsx
    ├── CaseStudies.tsx
    ├── FAQBiz.tsx
    └── CTAForm.tsx

app/sites/landing/
├── page.tsx                    (מעודכן)
├── layout.tsx                  (מעודכן)
├── LandingPageContent.tsx      (חדש)
└── sections/
    ├── HeroLanding.tsx
    ├── MultiSelectForm.tsx
    ├── ValueProps.tsx
    ├── HowItWorks.tsx
    ├── Testimonials.tsx
    ├── FAQLanding.tsx
    └── FinalCTA.tsx

components/seo/
└── MedicalOrganizationSchema.tsx  (חדש — עבור leumit)

public/
├── llms.txt                    (מעודכן — סקשנים חדשים)
└── llms-full.txt               (מעודכן)
```

### 16.2 תיקונים נדרשים ל-middleware (כבר בוצעו)
תמיכה ב-`*.localhost` ל-dev — ראה [middleware.ts](../middleware.ts).

### 16.3 הפניות
- רפרנס עיצוב: [weccelerate.as7.co.il](https://weccelerate.as7.co.il) (ל-landing)
- רפרנס תוכן: [leumitweccelerate.com](https://leumitweccelerate.com) (ל-leumit)
- מערכת עיצוב: [app/sites/main/services/medtech-leumit/MedTechContent.tsx](../app/sites/main/services/medtech-leumit/MedTechContent.tsx)
- רפרנס קומפוננטות: [components/sections/ServiceEcosystem.tsx](../components/sections/ServiceEcosystem.tsx)
- SEO config: [lib/seo.ts](../lib/seo.ts)

---

**סוף המסמך**

אישור לפיתוח נדרש לפני תחילת Phase 1. כל שינוי בתכולה מחייב עדכון גרסה של המסמך.
