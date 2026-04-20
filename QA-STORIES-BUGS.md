# QA Report — סיפורי הצלחה (Success Stories Admin)
**תאריך:** 31.3.2026

---

## באגים קריטיים (HIGH)

### 1. שדה `fullStoryEn` חסר בטופס
**קובץ:** `app/(admin)/admin/stories/story-form-dialog.tsx`
**בעיה:** השדה קיים ב-DB אבל אין אפשרות לערוך אותו בטופס. כל עדכון מוחק את התרגום לאנגלית.
**פתרון:** להוסיף textarea לשדה fullStoryEn בטופס.

### 2. אין בדיקת ייחודיות Slug בעדכון
**קובץ:** `app/(admin)/admin/actions.ts` → `updateStoryAction()`
**בעיה:** ביצירה יש בדיקה ש-slug ייחודי, אבל בעדכון אין. אפשר ליצור כפילויות ב-URL.
**פתרון:** להוסיף בדיקת slug ייחודי גם ב-update (עם `NOT: { id }` כדי לא לבדוק את עצמו).

---

## באגים משמעותיים (MEDIUM)

### 3. שדה `metrics` לא ניתן לעריכה
**קובץ:** `app/(admin)/admin/stories/story-form-dialog.tsx`
**בעיה:** ה-DB תומך במטריקות (למשל "גייסו: $2M") אבל אין UI לערוך אותן.
**פתרון:** להוסיף ממשק לעריכת מטריקות (label + value).

### 4. הודעות שגיאה גנריות
**קובץ:** `app/(admin)/admin/actions.ts`
**בעיה:** בעדכון/מחיקה, הודעת השגיאה היא "Failed to update story" בלי פירוט.
**פתרון:** להציג את השגיאה האמיתית: `error instanceof Error ? error.message : 'Unknown'`

### 5. Slug יכול להיווצר ריק
**קובץ:** `app/(admin)/admin/stories/story-form-dialog.tsx` → `generateSlug()`
**בעיה:** אם שם החברה מכיל רק תווים מיוחדים, ה-slug יהיה ריק.
**פתרון:** fallback ל-`story-${Date.now()}` אם הslug ריק.

### 6. Seed לא מעביר `fullStoryEn`
**קובץ:** `app/(admin)/admin/actions.ts` → `seedSuccessStories()`
**בעיה:** פונקציית ה-seed לא שומרת תרגום אנגלית של סיפורים.

### 7. Seed לא בודק ייחודיות Slug
**קובץ:** `app/(admin)/admin/actions.ts`
**בעיה:** ייבוא סיפורים מ-mock data יכול ליצור כפילויות slug.

---

## באגים קלים (LOW)

### 8. שדה `projectLink` לא בטופס
**קובץ:** `app/(admin)/admin/stories/story-form-dialog.tsx`
**בעיה:** השדה קיים ב-interface אבל אין שדה קלט בטופס.
**פתרון:** להוסיף שדה URL.

### 9. אין ולידציה לשדות חובה ריקים
**קובץ:** `app/(admin)/admin/stories/story-form-dialog.tsx`
**בעיה:** HTML `required` לא מספיק — צריך בדיקה צד-לקוח שהשדות לא ריקים אחרי trim.

### 10. חוסר עקביות Empty String vs Null
**קובץ:** `app/(admin)/admin/stories/story-form-dialog.tsx`
**בעיה:** שדות אופציונליים מאותחלים כ-`''` אבל נשמרים כ-`null`.

---

## סיכום

| # | חומרה | בעיה | סטטוס |
|---|--------|------|--------|
| 1 | HIGH | fullStoryEn חסר בטופס | ❌ לתקן |
| 2 | HIGH | slug לא ייחודי בעדכון | ❌ לתקן |
| 3 | MEDIUM | metrics לא ניתן לעריכה | ❌ לתקן |
| 4 | MEDIUM | הודעות שגיאה גנריות | ❌ לתקן |
| 5 | MEDIUM | slug ריק אפשרי | ❌ לתקן |
| 6 | MEDIUM | seed חסר fullStoryEn | ❌ לתקן |
| 7 | MEDIUM | seed ללא בדיקת slug | ❌ לתקן |
| 8 | LOW | projectLink לא בטופס | ⚠️ שיפור |
| 9 | LOW | ולידציה חלשה | ⚠️ שיפור |
| 10 | LOW | empty string vs null | ⚠️ שיפור |
