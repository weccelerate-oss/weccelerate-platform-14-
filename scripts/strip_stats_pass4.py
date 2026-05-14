"""Pass 4: AGGRESSIVE — strip every remaining time/money/percent commitment.

The owner's rule: 'שלא יהיה כתוב שום מספר מחייב' = no binding number,
anywhere. Industry-stat-style sentences ('FDA 510(k) review: 3-6 months')
get the timeline removed even though they describe the regulator, not us —
because in user-facing copy they read as promises.
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
    "app/sites/biz/sections/FAQBiz.tsx",
    "app/sites/main/about/page.tsx",
]

RULES = [
    # ===== Hebrew: time-with-range patterns =====
    # "תוך X חודשים" / "תוך X שבועות" / "תוך X ימים"
    (r"\bתוך \d+ ?חודשים\b", "בלוחות זמנים מותאמים"),
    (r"\bתוך \d+ ?שבועות\b", "בלוחות זמנים מותאמים"),
    (r"\bתוך \d+[-–]\d+ ?חודשים\b", "בלוחות זמנים מותאמים"),
    (r"\bתוך \d+[-–]\d+ ?שבועות\b", "בלוחות זמנים מותאמים"),
    (r"\bתוך \d+[-–]\d+ ?ימים\b", "בלוחות זמנים מותאמים"),

    # "X-Y חודשים" / "X-Y שבועות" / "X-Y ימים"  (no leading "תוך")
    (r"\b\d+[-–]\d+ ?חודשי סקירה\b", "סקירה אחרי הגשה"),
    (r"\b\d+[-–]\d+ ?חודשים\b", "בלוחות זמנים תלויי-מסלול"),
    (r"\b\d+[-–]\d+ ?שבועות\b", "בלוחות זמנים מותאמים"),
    (r"\b\d+[-–]\d+ ?ימים\b", "בתוך ימים-שבועות"),

    # "X חודשים" / "X שבועות" — single number (avoid years for now)
    (r"\b\d+ חודשי סקירה\b", "סקירה אחרי הגשה"),
    (r"\bב[\-]?\d+ ?חודשים\b", "בלוחות זמנים מותאמים"),
    (r"\bל[\-]?\d+[-–]\d+ ?חודשים\b", "בלוחות זמנים מותאמים"),
    (r"\bל[\-]?\d+ ?חודשים\b", "בהיקף מותאם"),
    (r"\b\d+\+? ?חודשים\b", "תקופה תלוית-היקף"),

    # ===== Hebrew: money — NIS =====
    (r"\d{1,3}(?:,\d{3})*\s*[\-–]\s*\d{1,3}(?:,\d{3})*\s*ש[\"״]?ח", "היקף תלוי"),
    (r"\d{1,3}(?:,\d{3})*\+? ?ש[\"״]?ח", "היקף תלוי"),
    (r"\b\d{1,4}[\-–]\d{1,4}K\$?\s*ש[\"״]?ח", "היקף תלוי"),
    (r"\b\d{1,4}K\+? ?ש[\"״]?ח", "היקף תלוי"),

    # ===== Hebrew: money — USD short forms =====
    (r"\$\d{1,4}(?:\.\d)?M[\-–]\$?\d{1,4}(?:\.\d)?M", "scope tailored"),
    (r"\$\d{1,4}K[\-–]\$?\d{1,4}K", "scope tailored"),
    (r"\$\d{1,4}K[\-–]\$?\d{1,4}M", "scope tailored"),
    (r"\$\d{1,4}(?:\.\d)?M\+?", "scope tailored"),
    (r"\$\d{1,4}K\+?", "scope tailored"),
    (r"\b\d{1,4}[\-–]\d{1,4}K\$", "scope tailored"),
    (r"\b\d{1,4}K[\-–]\d{1,4}K\$", "scope tailored"),
    (r"\b\d{1,4}[\-–]\d{1,4}M\$", "scope tailored"),
    (r"\b\d{1,4}\.?\d?M\$", "scope tailored"),
    (r"\b\d{1,4}K\$", "scope tailored"),

    # ===== Specific Hebrew lines spotted in screenshots =====
    (r"מרעיון ל[\-]?Seed: ?בלוחות זמנים תלויי-מסלול\.?",
     "מרעיון ל-Seed: בלוחות זמנים מותאמים פר-מיזם."),
    (r"מרעיון ל[\-]?Seed: ?היקף תלוי השקעה עצמית או במודל Equity-for-Services עם WeCcelerate\.?",
     "מרעיון ל-Seed: היקף בהתאמה אישית, במודל Equity-for-Services עם WeCcelerate."),
    (r"מסלול ייעודי של WeCcelerate עם 6 רכיבים:[^.]*\.?\s*בלוחות זמנים תלויי-מסלול\.?",
     "מסלול ייעודי של WeCcelerate עם 6 רכיבים: ייעוץ קליני, ייעוץ עסקי, הכנה למשקיעים, שיווק HCP, גישה לדאטה רפואית של מאגר נתונים קליני בשותפות לאומית, וליווי רגולטורי. היקף בהתאמה אישית."),

    # ===== Hebrew Percent =====
    # Equity ranges WeCcelerate-related
    (r"אקוויטי \d+[\-–]\d+%[^.]*", "מבני תשלום נבנים אישית"),
    (r"\d+[\-–]\d+% תמורת equity-for-services", "מבנה equity-for-services בהתאמה אישית"),
    (r"\d+[\-–]\d+% של מאיץ", "מבנה אקוויטי בהתאמה אישית"),

    # ===== English: time ranges =====
    (r"\b\d+[-–]\d+ months of review\b", "review after submission"),
    (r"\b\d+[-–]\d+ months\b", "an adjusted timeline"),
    (r"\b\d+[-–]\d+ weeks\b", "an adjusted timeline"),
    (r"\b\d+[-–]\d+ days\b", "days to weeks"),
    (r"\b\d+ business days\b", "a few business days"),
    (r"\bover \d+[-–]?\d* years\b", "over a multi-year horizon"),

    # ===== English: money =====
    (r"\$\d{1,3}(?:,\d{3})*(?:\.\d+)?[\-–]\$?\d{1,3}(?:,\d{3})*(?:\.\d+)?M?",
     "scope tailored"),
    (r"\$\d{1,3}(?:,\d{3})*K?\+?/?month", "scope tailored"),
    (r"\$\d{1,3}(?:,\d{3})*\+?", "scope tailored"),

    # ===== Misc cleanup =====
    (r"\bב[\-]?\d+ שעות שבועיות\b", "בהיקף שעות מוסכם"),
    (r"\b\d+[\-–]\d+ שעות/?שבועיות?\b", "בהיקף שעות מוסכם"),
    (r"\b\d+[\-–]\d+ שעות שבועיות\b", "בהיקף שעות מוסכם"),

    # Multiple spaces / orphan tokens that may result
    (r"  +", " "),
    (r"\(\)", ""),
    (r"\( ?, ?\)", ""),
    (r" ,", ","),
    (r" \.", "."),
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
