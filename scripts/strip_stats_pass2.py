"""Pass 2: aggressively remove ANY remaining invented stat tokens."""
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
FILES = [
    "lib/seo/guides-catalog.ts",
    "lib/seo/guides-catalog-en.ts",
    "lib/seo/faq-catalog.ts",
    "public/llms.txt",
    "public/llms-full.txt",
    "app/sites/main/about/page.tsx",
    "app/sites/main/medtech-guide/page.tsx",
    "app/sites/main/funding-guide/page.tsx",
    "app/sites/main/glossary/page.tsx",
    "app/sites/main/en/glossary/page.tsx",
    "app/sites/leumit/services/page.tsx",
    "app/sites/biz/sections/FAQBiz.tsx",
    "lib/seo/index.ts",
    "lib/seo.ts",
    "app/sites/landing/layout.tsx",
    "app/sites/landing/sections/HeroLanding.tsx",
    "app/sites/landing/sections/ValueProps.tsx",
    "app/sites/main/services/digital-product/page.tsx",
    "app/sites/main/services/digital-product/DigitalProductContent.tsx",
    "app/sites/main/services/business-consulting/page.tsx",
    "app/sites/main/services/business-consulting/BusinessConsultingContent.tsx",
    "app/sites/main/services/medtech-leumit/page.tsx",
    "app/sites/main/services/medtech-leumit/MedTechContent.tsx",
    "app/sites/main/services/marketing/page.tsx",
    "app/sites/main/services/marketing/MarketingContent.tsx",
    "app/sites/main/services/physical-product/page.tsx",
    "app/sites/main/services/physical-product/PhysicalProductContent.tsx",
]

# Token-level rules — these run AFTER the structured rules, catching anything
# the phrase-level patterns missed.
TOKEN_RULES = [
    # Numbers attached to specific WeCcelerate claims
    (r"רשת של 200\+? המשקיעים שלנו", "רשת המשקיעים שלנו"),
    (r"רשת של 200\+? משקיעים", "רשת משקיעים"),
    (r"לרשת של 200\+? משקיעים", "לרשת משקיעים"),
    (r"רשת 200\+? המשקיעים", "רשת המשקיעים"),
    (r"גיוס Seed מ-200\+? משקיעים", "גיוס Seed דרך רשת משקיעים"),
    (r"ל-200\+? משקיעים", "לרשת משקיעים"),
    (r"200\+? משקיעים\b", "רשת משקיעים"),
    (r"connect you to 200\+? verified investors", "connect you to a network of investors"),
    (r"200\+? verified investors", "a network of investors"),
    (r"200\+? specialized investors", "a network of specialized investors"),
    (r"200\+? MedTech-specialized investors", "MedTech-focused investors"),

    # Money raised
    (r"גייסו יחד מעל 150M\$", "גייסו ביחד סכומים משמעותיים"),
    (r"גייסו מעל 150M\$", "גייסו סכומים משמעותיים"),
    (r"גייסו ביחד מעל 150 ?M\$", "גייסו סכומים משמעותיים"),
    (r"150M\$\b", "סכום משמעותי"),
    (r"\$150M\+?", "significant capital"),
    (r"collectively raised \$?150M\+?", "raised significant capital collectively"),
    (r"raised \$?150M\+?", "raised significant capital"),

    # Ventures count
    (r"עם 40\+? ונצ['׳]רים שנבנו", "עם ניסיון בבניית סטארטאפים"),
    (r"40\+? ונצ['׳]רים שנבנו", "סטארטאפים בפורטפוליו"),
    (r"40\+? ונצ['׳]רים", "סטארטאפים"),
    (r"40\+? Leumit clinics for clinical pilots", "Leumit clinics for clinical pilots"),
    (r"40\+? Leumit clinics", "Leumit clinics"),
    (r"across 40\+? Leumit clinics", "across Leumit clinics"),
    (r"40\+? portfolio companies", "portfolio companies"),
    (r"\b40\+?\b(?=\s|,|\.|$)", ""),

    # Patient records / clinical visits
    (r"720,?000\+? תיקי מטופלים אנונימיים", "מאגר נתונים קליני"),
    (r"720,?000\+? anonymized patient records", "anonymized clinical data"),
    (r"720K\+? תיקי מטופלים אנונימיים", "מאגר נתונים קליני"),
    (r"720K\+? anonymized patient records", "anonymized clinical data"),
    (r"720,?000\+?\s+(?:patient|insured)", "clinical"),
    (r"720K\+?", ""),
    (r"720,?000\+?", ""),
    (r"8\.7M ביקורים קליניים בשנה", "פעילות קלינית רחבה"),
    (r"8\.7M ביקורים קליניים שנתיים", "פעילות קלינית רחבה"),
    (r"8\.7M ביקורים", "פעילות קלינית רחבה"),
    (r"8\.7M annual clinical visits", "extensive clinical activity"),
    (r"8\.7M annual visits", "extensive clinical activity"),
    (r"8\.7M\b", ""),

    # Leadership "המוביל" cleanup
    (r"WeCcelerate is Israel'?s leading Venture Builder", "WeCcelerate is an Israeli Venture Builder"),
    (r"Israel'?s leading Venture Builder", "an Israeli Venture Builder"),
    (r"the leading Venture Builder in Israel", "an Israeli Venture Builder"),

    # Exit averages
    (r"אקזיט M&A ממוצע ב-2024: \$80-150M", "אקזיט M&A — תלוי בתחום ובשלב"),
    (r"average M&A exit: \$80-150M", "average M&A — depends on sector and stage"),

    # ============================================================
    # PRICE COMMITMENTS — NIS amounts the company is not allowed to publish
    # ============================================================
    (r"MVP בסיסי למובייל:\s*[\d,]+[\s-]*[\d,]+\s*ש[\"״]?ח\s*\(?[\d\-–\s]+(?:שבועות|חודשים)\)?\.\s*",
     "MVP בסיסי למובייל — היקף תלוי במורכבות. "),
    (r"פלטפורמת ווב מלאה:\s*[\d,]+[\s-]*[\d,]+\s*ש[\"״]?ח\s*\(?[\d\-–\s]+(?:שבועות|חודשים)\)?\.\s*",
     "פלטפורמת ווב מלאה — היקף תלוי במורכבות. "),
    (r"SaaS מורכב עם AI:\s*[\d,]+\s*ש[\"״]?ח ומעלה[^.]*\.",
     "SaaS מורכב עם AI — היקף נקבע לפי המוצר."),
    (r"חבילת ייעוץ עסקי מלאה[^:]*:\s*[\d,]+[\s-]*[\d,]+\s*ש[\"״]?ח[^.]*\.",
     "חבילת ייעוץ עסקי מלאה — היקף תלוי בצורך הספציפי."),
    (r"מסלול MedTech מלא עם לאומית:\s*[\d,]+\s*ש[\"״]?ח ומעלה[^.]*\.",
     "מסלול MedTech מלא עם לאומית — היקף נבנה אישית לכל venture."),
    (r"\d{1,3}(?:,\d{3})*\s*[\-–]\s*\d{1,3}(?:,\d{3})*\s*ש[\"״]?ח", "היקף תלוי"),
    (r"\$?\s?\d{1,3}(?:,\d{3})*\s*ש[\"״]?ח\s*ומעלה", "היקף בהתאמה אישית"),
    (r"\$?\s?\d{1,3}(?:,\d{3})*\s*ש[\"״]?ח", "היקף תלוי"),

    # ============================================================
    # TIME COMMITMENTS — generic guarantees of duration
    # ============================================================
    (r"בונה MVP בדרך כלל תוך \d+[\-–]\d+ שבועות", "בונה MVP בלוחות זמנים שמוגדרים פר-מיזם"),
    (r"MVP טיפוסי נבנה ב[\-]?\d+[\-–]\d+ שבועות במתודולוגיות Agile",
     "MVP נבנה במתודולוגיות Agile, היקף ולוחות זמנים תלויים במוצר"),
    (r"ה[\-]?sprint הוא בן שבועיים", "ה-sprint הוא יחידת עבודה בסיסית"),
    (r"\bתוך \d+[\-–]\d+ שבועות\b", "בלוחות זמנים תלויי-היקף"),
    (r"\bב[\-]?\d+[\-–]\d+ שבועות\b", "בלוחות זמנים מותאמים"),
    (r"\bב[\-]?\d+[\-–]\d+ חודשים\b", "בלוחות זמנים מותאמים"),
    (r"\bתוך \d+[\-–]\d+ חודשים\b", "בלוחות זמנים מותאמים"),
    (r"לתוכנית של \d+[\-–]\d+ חודשים", ""),
    (r"\b\d+[\-–]\d+ weeks\b", "in adjusted timelines"),
    (r"\b\d+[\-–]\d+ months\b", "over a flexible duration"),

    # ============================================================
    # Cleanup leftover double spaces / orphan tokens
    # ============================================================
    (r"  +", " "),
    (r"מעל ב-3 השנים האחרונות", "ב-3 השנים האחרונות"),
    (r"שגייסו יחד מעל ", "שגייסו סכומים משמעותיים, "),
]

def clean(fp: Path):
    if not fp.exists():
        return 0
    text = fp.read_text(encoding="utf-8")
    orig = text
    hits = 0
    for pattern, repl in TOKEN_RULES:
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
            print(f"  {h:>3} hits | {rel}")
            total += h
    print(f"\nTOTAL: {total} hits")
