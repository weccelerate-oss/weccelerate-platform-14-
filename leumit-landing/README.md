# WeCcelerate — Leumit landing

דף נחיתה קולנועי, scroll-jacked, עם הסרטון `LEUMIT.mp4` שמתנגן לפי מיקום הגלילה.

## הרצה מקומית

הסרטון `LEUMIT.mp4` יושב ב-`../public/LEUMIT.mp4`. הדרך הפשוטה ביותר היא להרים שרת סטטי **משורש הפרויקט** (לא מתוך התיקייה הזאת):

```powershell
# מתיקיית weccelerate-platform (14)
python -m http.server 8000
```

אז פותחים: `http://localhost:8000/leumit-landing/`

> **חשוב:** אם תריץ את השרת מתוך `leumit-landing/`, הסרטון לא יטען (הוא יושב רמה אחת מעל). תמיד מהשורש.

## עובד ב:

- ✅ Chrome / Edge / Firefox דסקטופ
- ✅ Safari דסקטופ
- ✅ iOS Safari — אחרי הטאפ הראשון (יש לי trick שמשחרר את seek-ing של `currentTime`)
- ✅ אנדרואיד Chrome

## מבנה

| קובץ | תפקיד |
|---|---|
| `index.html` | מבנה — hero, scroll section, outro |
| `styles.css` | עיצוב + responsive (desktop / tablet / phone / landscape / touch) |
| `script.js` | הלוגיקה: scroll → `video.currentTime`, scene activation, dots, iOS unlock |

## נקודות עיצוב

- **Hero (100dvh)** — כותרת editorial עם בלוק accent זהוב אדום משובץ באיטליק.
- **Scroll section (600vh)** — stage דביק 100dvh בפנים. שש סצנות עברית, נקודות פרוגרס בצד שמאל, מונה למעלה.
- **Logo reveal** — מופיע ב-92% האחרונים של הגלילה.
- **Outro** — CTA פשוט שצריך לחבר לפלואו האמיתי.

## אם תרצה לפרוס את זה ב-Next.js עצמו

כיוון שהפרויקט הראשי הוא Next.js, אפשר לפרסם את הדף הזה גם דרכו:

1. העתק את 3 הקבצים ל-`public/leumit/`.
2. שנה ב-`index.html` את `src="../public/LEUMIT.mp4"` ל-`src="/LEUMIT.mp4"`.
3. הדף יהיה זמין ב-`weccelerate.co.il/leumit/`.

## TODO לפני production

- [ ] להחליף את `href="#"` ב-CTA בלינק לטופס/מודאל אמיתי
- [ ] להוסיף `<meta>` OG + Twitter cards
- [ ] לבדוק על iOS Safari אמיתי שה-unlock עובד אצלך
- [ ] לדחוס את `LEUMIT.mp4` אם הוא יותר מ-15MB (H.264, 720p, ~3-5 Mbps זה הסטנדרט לוובסקרול)
