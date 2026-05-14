"""Pass 9: collapse repeated 'בלוחות זמנים' phrasing in single answers
to read naturally. The earlier passes blindly substituted every X-Y חודשים
with the same phrase, producing answers like
'X. Y בלוחות זמנים תלויי-מסלול. Z בלוחות זמנים תלויי-מסלול.'
This pass rewrites the most common offenders into natural Hebrew.
"""
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
FILES = [
    "lib/seo/guides-catalog.ts",
    "lib/seo/faq-catalog.ts",
    "lib/seo/index.ts",
    "lib/seo.ts",
    "public/llms.txt",
    "public/llms-full.txt",
    "app/sites/main/medtech-guide/page.tsx",
    "app/sites/main/funding-guide/page.tsx",
    "app/sites/main/glossary/page.tsx",
    "app/sites/main/en/glossary/page.tsx",
    "app/sites/leumit/services/page.tsx",
    "app/sites/leumit/sections/FAQLeumit.tsx",
    "app/sites/biz/sections/FAQBiz.tsx",
]

RULES = [
    # ---------- Three-or-more 'בלוחות זמנים תלויי-מסלול' in one sentence ----------
    (r"בלוחות זמנים תלויי-מסלול\s*\.\s*בלוחות זמנים תלויי-מסלול\s+הכנה,\s*בלוחות זמנים תלויי-מסלול",
     "התהליך אורך זמן שמשתנה בין מסלולים, כולל הכנה,"),

    # "בלוחות זמנים תלויי-מסלול,\s+בלוחות זמנים תלויי-מסלול,\s+בלוחות זמנים תלויי-מסלול"
    (r"(?:בלוחות זמנים תלויי-מסלול[,.]\s+){2,}",
     "התהליך אורך זמן שתלוי במסלול ובהיקף. "),
    (r"(?:בלוחות זמנים מותאמים[,.]\s+){2,}",
     "בלוחות זמנים שנקבעים פר-מיזם. "),

    # ---------- Empty list-row pricing tables ----------
    # Lines like "MVP מובייל בסיסי (iOS+Android, 5-10 מסכים): היקף תלוי, בלוחות זמנים מותאמים"
    # turn into clean bullet form
    (r"\([^)]*?\d+-\d+ מסכים[^)]*?\):\s*היקף תלוי, בלוחות זמנים מותאמים",
     "(מובייל בסיסי) — היקף ולוחות זמנים שנקבעים פר-מיזם"),

    # ---------- Hebrew "ב-WORD" hyphen artifacts where WORD doesn't need it ----------
    (r"\bב\-סטארטאפים\b", "עם סטארטאפים"),
    (r"\bלסטארטאפ\s*ישראלי\s+טיפוסי", "לסטארטאפ ישראלי בקנה-מידה טיפוסי"),

    # ---------- Common stuttering ----------
    (r"היקף ולוחות זמנים אישיים\s+אם", "היקף ולוחות זמנים אישיים, אם"),
    (r"בלוחות זמנים מותאמים\s+הוא הטווח הסטנדרטי", "טווח שמשתנה בין פרויקטים"),
    (r"בלוחות זמנים תלויי-מסלול\s+מסיום", "תקופה שתלויה בקנה-מידה אחרי סיום"),
    (r"בלוחות זמנים תלויי-מסלול בממוצע לסבב Seed",
     "תקופה משתנה לסבב Seed"),
    (r"מ-Idea ל-Seed",
     "מרעיון ל-Seed"),

    # ---------- Specific answer-rewrites for known FAQ items ----------
    (r"a:\s*'הקמת חברה משפטית: בתוך ימים-שבועות\. MVP: בלוחות זמנים מותאמים\. גיוס Seed: בלוחות זמנים תלויי-מסלול מסיום ה-MVP\. סה\"כ מרעיון למימון ראשון: בלוחות זמנים תלויי-מסלול\.'",
     "a: 'הקמת חברה משפטית אורכת ימים עד שבועות. בניית MVP, גיוס Seed והדרך מרעיון למימון ראשון — לוחות זמנים שנקבעים פר-מיזם בהתאם לתחום ולמורכבות.'"),

    # CTO matching FAQ
    (r"a:\s*'ממוצע: בלוחות זמנים תלויי-מסלול\. סטארטאפים צעירים עובדים מ-Idea ל-Seed\. סטארטאפים אחרי Seed עובדים בלוחות זמנים תלויי-מסלול עד שמגייסים CTO מלא\.'",
     "a: 'משך ההתקשרות נקבע פר-מיזם — סטארטאפים צעירים מלווים מהרעיון ועד גיוס ה-Seed, ואחרים עד גיוס CTO מלא.'"),

    # ---------- Fix awkward translation artifacts ----------
    (r"לוחות זמנים שתלויים בתחום ובהיקף\b", "לוחות זמנים שתלויים בתחום ובמורכבות"),

    # ---------- llms-full pricing table fragments ----------
    (r"USDscope tailored", "USD (scope tailored)"),
    (r"USD\s*\d{1,3}(?:,\d{3})*[\-–]\s*,\d{0,3}\s*ILS", "USD (scope tailored)"),

    # ---------- Cleanup ----------
    (r"\s+\.\s", ". "),
    (r"\s+,\s", ", "),
    # Do NOT touch leading whitespace
]

def clean(fp: Path):
    if not fp.exists(): return 0
    text = fp.read_text(encoding="utf-8")
    orig = text
    hits = 0
    for pattern, repl in RULES:
        text, n = re.subn(pattern, repl, text)
        hits += n
    if text != orig:
        fp.write_text(text, encoding="utf-8")
    return hits

if __name__ == "__main__":
    total = 0
    for rel in FILES:
        h = clean(REPO / rel)
        if h:
            print(f"  {h:>4} hits | {rel}")
            total += h
    print(f"\nTOTAL: {total} hits")
