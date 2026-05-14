"""Pass 8: clarity pass — fix awkward Hebrew artifacts left by stripping numbers.
Removes repeated 'בלוחות זמנים תלויי-מסלול', awkward hyphens like
'ל-מאגר' / 'ו-פעילות' / 'מ-13', and leftover '15,000-,' fragments.
"""
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
FILES = [
    "lib/seo/guides-catalog.ts",
    "lib/seo/guides-catalog-en.ts",
    "lib/seo/faq-catalog.ts",
    "lib/seo.ts",
    "lib/seo/index.ts",
    "public/llms.txt",
    "public/llms-full.txt",
    "app/sites/main/medtech-guide/page.tsx",
    "app/sites/main/funding-guide/page.tsx",
    "app/sites/main/glossary/page.tsx",
    "app/sites/main/en/glossary/page.tsx",
    "app/sites/leumit/services/page.tsx",
    "app/sites/leumit/sections/FAQLeumit.tsx",
    "app/sites/biz/sections/FAQBiz.tsx",
    "app/sites/main/about/page.tsx",
]

RULES = [
    # ---------- Broken numerical fragments ----------
    (r"\d{1,3}(?:,\d{3})*[\-–],\s*", "היקף תלוי "),
    (r"\d{1,3}(?:,\d{3})*[\-–],000\b", "scope tailored"),
    (r"USD \d{1,3}(?:,\d{3})*[\-–],\d{0,3}", "USD scope tailored"),
    (r"scope tailored0\b", "scope tailored"),
    (r"\b15,000[\-–]\$", "scope tailored$"),

    # ---------- Awkward "ל-WORD" / "ו-WORD" / "ב-WORD" / "מ-WORD" ----------
    # When the next word doesn't actually need the hyphen separator
    (r"ל\-מאגר", "למאגר"),
    (r"ו\-מאגר", "ומאגר"),
    (r"ו\-פעילות", "ופעילות"),
    (r"ל\-פעילות", "לפעילות"),
    (r"ב\-סטארטאפים", "עם סטארטאפים"),
    (r"ב\-WeCcelerate", "ב-WeCcelerate"),  # keep — common usage
    (r"מ\-\d+ התמחויות", "ממגוון התמחויות"),
    (r"\d+\+? התמחויות", "מגוון התמחויות"),
    (r"מ\-WeCcelerate", "מ-WeCcelerate"),

    # ---------- "X יתרונות שלא ניתן" — remove count claim ----------
    (r"\d+ יתרונות שלא ניתן להשיג",
     "יתרונות שקשה למצוא"),
    (r"\d+ יתרונות ייחודיים",
     "יתרונות ייחודיים"),
    (r"עם \d+ יתרונות", "עם יתרונות"),

    # ---------- Repetitions of the substituted phrase ----------
    # "X, בלוחות זמנים תלויי-מסלול" then again same — unify
    (r"בלוחות זמנים תלויי-מסלול,\s+בלוחות זמנים תלויי-מסלול",
     "בלוחות זמנים תלויי-מסלול"),
    (r"בלוחות זמנים מותאמים\s+בלוחות זמנים מותאמים",
     "בלוחות זמנים מותאמים"),
    (r"בלוחות זמנים תלויי-מסלול\.\s+בלוחות זמנים תלויי-מסלול",
     "בלוחות זמנים תלויי-מסלול. תהליך נוסף"),
    (r"היקף תלוי,\s+בלוחות זמנים", "היקף ולוחות זמנים אישיים"),
    (r"היקף תלוי\s+תלוי", "היקף תלוי"),
    (r"בהיקף תלוי בהיקף", "בהיקף שמותאם פר-פרויקט"),
    (r"היקף תלוי תקציב טיפוסי", "היקף תקציב מותאם פר-פרויקט"),
    (r"של בלוחות זמנים מותאמים של בדיקות",
     "סדרת בדיקות"),
    (r"של בלוחות זמנים תלויי-מסלול",
     "תקופה תלויית-מסלול"),
    (r"לוחות זמנים שתלויים בתחום",
     "לוחות זמנים שתלויים בתחום ובהיקף"),

    # ---------- "FDA 510(k) הוא...סקירה: בלוחות זמנים תלויי-מסלול. הכנה: בלוחות..." ----------
    (r"סקירה של FDA: בלוחות זמנים תלויי-מסלול\. הכנה: בלוחות זמנים תלויי-מסלול\.",
     "סקירת FDA והכנה אורכות זמן שתלוי בסיווג ובמורכבות."),
    (r"סקירה: בלוחות זמנים תלויי-מסלול,",
     "סקירה אחרי הגשה,"),

    # ---------- "WeCcelerate בונה תוכניות עסקיות מקצועיות בלוחות זמנים תלויי-היקף במחיר בהיקף תלוי" ----------
    (r"WeCcelerate בונה תוכניות עסקיות מקצועיות בלוחות זמנים תלויי-היקף במחיר בהיקף תלוי\.?",
     "WeCcelerate בונה תוכניות עסקיות מקצועיות בלוחות זמנים ובמחיר שנקבעים אישית."),
    (r"WeCcelerate בונה MVP בלוחות זמנים שנקבעים פר-מיזם, Next\.js ו-PostgreSQL",
     "WeCcelerate בונה MVP בלוחות זמנים שנקבעים פר-מיזם, תוך שימוש ב-React, Next.js ו-PostgreSQL"),

    # ---------- Mismatched grammar from list pricing tables ----------
    # "MVP מובייל בסיסי (iOS+Android) — היקף תלוי, בלוחות זמנים מותאמים." → unified
    (r"\(iOS\+Android\) — היקף תלוי, בלוחות זמנים מותאמים\. MVP של פלטפורמת SaaS \(web only\) — היקף תלוי, בלוחות זמנים מותאמים\. MVP מורכב עם AI ואינטגרציות — היקף תלוי, בלוחות זמנים מותאמים\. MVP עם חומרה פיזית — היקף תלוי\.",
     "(iOS+Android), פלטפורמת SaaS (web only), MVP מורכב עם AI ואינטגרציות, או MVP עם חומרה פיזית — לכל אחד היקף ולוחות זמנים שנקבעים פר-מיזם."),

    # ---------- Hebrew gender mismatch from substitutions ----------
    (r"סטארטאפים שמתבססים על שילוב AI \+ דאטה רפואית מחליפות",
     "סטארטאפים שמתבססים על שילוב AI ודאטה רפואית מחליפים"),

    # ---------- Hebrew: improper phrasing leftovers ----------
    (r"היקף תלוי בלוחות", "בהיקף ולוחות"),
    (r"לוחות זמנים תלויי-מסלול לרישום מלא",
     "לוחות זמנים תלויי-מוסד לרישום מלא"),

    # ---------- Cleanup the pricing-table list rows globally ----------
    (r"היקף תלוי, בלוחות זמנים מותאמים\b",
     "בהיקף ובלוחות זמנים שנקבעים פר-מיזם"),
    (r"היקף תלוי, בלוחות זמנים תלויי-מסלול\b",
     "בהיקף ובלוחות זמנים שנקבעים פר-מיזם"),

    # ---------- Empty-string artifacts ----------
    (r"\(\s*\)", ""),
    (r"\s+,", ","),
    (r"\s+\.", "."),
    (r"  +", " "),
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
