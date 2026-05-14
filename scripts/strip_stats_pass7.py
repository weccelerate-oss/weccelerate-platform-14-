"""Pass 7: cleanup phrasing artifacts left by earlier regex passes.
NOTE: do NOT touch leading whitespace — only collapse internal duplicates.
"""
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
FILES = [
    "lib/seo/guides-catalog.ts",
    "lib/seo/guides-catalog-en.ts",
    "lib/seo/faq-catalog.ts",
    "public/llms.txt",
    "public/llms-full.txt",
    "app/sites/main/medtech-guide/page.tsx",
    "app/sites/main/funding-guide/page.tsx",
    "app/sites/main/glossary/page.tsx",
    "app/sites/main/en/glossary/page.tsx",
    "app/sites/leumit/services/page.tsx",
    "app/sites/leumit/sections/FAQLeumit.tsx",
]

RULES = [
    # Duplicate / stuttering phrases produced by overlapping regex passes
    (r"היקף תלוי תלוי בהיקף", "היקף תלוי בהיקף"),
    (r"היקף תלוי תלוי במוסד", "תלוי במוסד"),
    (r"היקף תלוי תלוי", "היקף תלוי"),
    (r"בלוחות זמנים תלויי-מסלול בלוחות זמנים תלויי-מסלול",
     "בלוחות זמנים תלויי-מסלול"),
    (r"בלוחות זמנים מותאמים בלוחות זמנים מותאמים",
     "בלוחות זמנים מותאמים"),
    (r"בלוחות זמנים תלויי-מסלול\. בלוחות זמנים תלויי-מסלול",
     "בלוחות זמנים תלויי-מסלול. תהליך"),
    (r"מתחילת פגישות לסגירה\. בלוחות זמנים תלויי-מסלול הכנה, בלוחות זמנים תלויי-מסלול פגישות, בלוחות זמנים תלויי-מסלול DD, בלוחות זמנים תלויי-מסלול סגירה\. WeCcelerate מקצרת ל[\-]?בלוחות זמנים תלויי-מסלול בממוצע[^.]*\.",
     "מתחילת פגישות לסגירה: שלבי הכנה, פגישות, Due Diligence וסגירה. WeCcelerate מקצרת את התהליך משמעותית דרך היכרויות חמות ו-DD מוקדם."),
    (r"של בלוחות זמנים תלויי-מסלול", "בלוחות זמנים מותאמים"),
    (r"של בלוחות זמנים מותאמים", "בלוחות זמנים מותאמים"),
    (r"ל[\-]?בלוחות זמנים תלויי-מסלול", "בלוחות זמנים מותאמים"),
    (r"השקעה של בלוחות זמנים מותאמים", "השקעה ממוקדת"),
    (r"\(בתוך ימים-שבועות,היקף תלוי\)", "(בתוך ימים-שבועות, אגרה תלויית-מוסד)"),
    (r"גרסה Premium ב[\-]?scope tailored0", "גרסה Premium במחיר תלוי"),
    (r"scope tailored0 MRR", "MRR משמעותי"),
    (r"היקף תלוי, בנייה בלוחות זמנים תלויי-היקף", "היקף שנקבע פר-מיזם"),
    (r"שלוקח בלוחות זמנים תלויי-מסלול", "שלוקח לוחות זמנים שתלויים בתחום"),
    (r"של בהיקף שעות מוסכם", "בהיקף שעות מוסכם"),
    (r"של היקף תלוי", "בהיקף תלוי"),
    (r"היקף תלוי, בלוחות זמנים תלויי-היקף", "היקף ולוחות זמנים שנקבעים אישית"),
    (r"בהיקף תלוי בהיקף", "בהיקף תלוי בהיקף הפרויקט"),
    (r"מ[\-]?\d+ בהיקף מותאם", "תהליך שמתקצר משמעותית"),
]

def clean(fp: Path):
    if not fp.exists():
        return 0
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
