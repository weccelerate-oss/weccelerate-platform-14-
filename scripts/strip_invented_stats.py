"""One-off cleanup: remove every invented binding number/claim about WeCcelerate.
Run: python scripts/strip_invented_stats.py
"""
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

FILES = [
    "app/sites/main/page-corporate.tsx",
    "app/sites/main/en/funding-guide/page.tsx",
    "lib/seo/guides-catalog.ts",
    "lib/seo/guides-catalog-en.ts",
    "lib/seo/faq-catalog.ts",
    "lib/seo/index.ts",
    "lib/seo.ts",
    "lib/seo/press-catalog.ts",
    "lib/i18n/he.ts",
    "lib/mock-data.ts",
    "scripts/seed-news.ts",
    "public/llms.txt",
    "public/llms-full.txt",
    "app/sites/main/about/page.tsx",
    "app/sites/main/guides/page.tsx",
    "app/sites/main/guides/[slug]/page.tsx",
    "app/sites/main/faq/page.tsx",
    "app/sites/main/press/page.tsx",
    "app/sites/main/comparisons/page.tsx",
    "app/sites/main/glossary/page.tsx",
    "app/sites/main/en/glossary/page.tsx",
    "app/sites/main/funding-guide/page.tsx",
    "app/sites/main/medtech-guide/page.tsx",
    "app/sites/main/en/medtech-guide/page.tsx",
    "app/sites/main/en/guides/[slug]/page.tsx",
    "app/sites/biz/sections/ValueGrid.tsx",
    "app/sites/biz/sections/CaseStudies.tsx",
    "app/sites/biz/sections/FAQBiz.tsx",
    "app/sites/biz/layout.tsx",
    "app/sites/leumit/sections/TracksGrid.tsx",
    "app/sites/leumit/sections/FAQLeumit.tsx",
    "app/sites/leumit/sections/BioScanShowcase.tsx",
    "app/sites/leumit/layout.tsx",
    "app/sites/leumit/services/page.tsx",
    "app/feed.xml/route.ts",
]

# Each entry: (compiled regex, replacement). Order matters — long phrases first.
RULES = [
    # ============================================================
    # COMBINED PHRASES (longest patterns first)
    # ============================================================
    # "WeCcelerate ליווה 40+ ונצ'רים שגייסו יחד מעל 150 מיליון דולר"
    (r"(?:WeCcelerate\s+)?ליוו?ו?ה?\s+(?:את\s+)?40\+?\s*(?:ונצ['׳]?רים|מיזמים|חברות|סטארטאפים)\s+שגייסו\s+(?:יחד\s+)?(?:מעל\s+)?(?:USD\s+|\$?)?150\s*(?:מיליון\s+דולר|M\$?|מיליון|מיל)\+?",
     "מציעים ליווי לסטארטאפים — מהרעיון ועד גיוס הון"),
    # "40+ מיזמים שגייסו 150M$+"
    (r"40\+?\s*(?:ונצ['׳]?רים|מיזמים|חברות|סטארטאפים)\s+(?:שגייסו|שהוקמו|בנו)\s+(?:יחד\s+)?(?:מעל\s+|כ-?)?(?:USD\s+|\$?)?150\s*(?:מיליון\s+דולר|M\$?|מיליון|מיל)\+?",
     "סטארטאפים מתחומי AI, MedTech, SaaS"),
    # "40+ מיזמים, 150M$+ גויסו"
    (r"40\+?\s*(?:ונצ['׳]?רים|מיזמים|חברות|סטארטאפים)[,;]\s*(?:USD\s+|\$?)?150\s*(?:מיליון\s+דולר|M\$?|מיליון|מיל)\+?\s*(?:גויסו|raised)?",
     "ליווי סטארטאפים בכל שלבי הפיתוח"),
    # "720,000 patient records, 8.7M annual clinical visits"
    (r"720,?000\+?\s*patient\s+records?[,;]?\s*8\.7\s*million\s+(?:annual\s+)?clinical\s+visits?",
     "structured clinical data access via the Leumit partnership"),
    (r"720,?000\+?\s*(?:תיק[יו]?\s*(?:מטופלים|חברים|מבוטחים)?|מבוטחים)\s*(?:ו[\-]?\s*8\.7\s*מיליון\s+ביקורים?\s*(?:שנתיים)?)?",
     "מאגר נתונים קליני בשותפות לאומית"),
    (r"8\.7\s*מיליון\s*(?:ביקורים\s+(?:קליניים\s+)?שנתיים|ביקורים)",
     "פעילות קלינית רחבת היקף"),
    (r"8\.7\s*million\s+(?:annual\s+)?clinical\s+visits?",
     "extensive clinical activity"),

    # ============================================================
    # WeCcelerate-specific stats
    # ============================================================
    (r"40\+?\s*(?:ונצ['׳]?רים|מיזמים|חברות|סטארטאפים)\s+(?:שהוקמו|שנבנו|בפורטפוליו|תחת\s+הגג\s+שלנו|נבנו)",
     "סטארטאפים בפורטפוליו"),
    (r"40\+?\s*(?:ונצ['׳]?רים|מיזמים|חברות|סטארטאפים)",
     "סטארטאפים"),
    (r"40\+?\s*ventures(?:\s+built|\s+launched)?",
     "ventures launched"),
    (r"(?:USD\s+|\$\s?)?150\s*(?:מיליון\s+דולר|M\$?|מיליון|מיל)\+?\s*(?:גויסו|שגויסו)",
     "סכומים משמעותיים גויסו"),
    (r"(?:USD\s+|\$\s?)?150M\+?\s+raised(?:\s+by\s+portfolio\s+companies)?",
     "significant capital raised by portfolio companies"),
    (r"200\+?\s*(?:אנשי\s*קשר|משקיעים\s+(?:מומחים|מאומתים|פעילים)?)",
     "רשת משקיעים, יזמים ושותפים אסטרטגיים"),
    (r"לרשת\s+(?:של\s+)?200\+?\s*משקיעים(?:\s+(?:מומחים|מאומתים))?",
     "לרשת משקיעים, יזמים ושותפים אסטרטגיים"),
    (r"\b200\+?\s+(?:investors|active\s+investors)",
     "a network of investors and strategic partners"),
    (r"50\+?\s*(?:חברות|companies|startups)\s+(?:שעבדו|that\s+worked)\s+(?:מולנו|with\s+us)",
     "סטארטאפים שאנחנו עובדים איתם"),
    (r"50\+?\s*startups?\s+supported",
     "ongoing startup support"),

    # ============================================================
    # Leadership claims
    # ============================================================
    (r"\s*[—–\-]?\s*ה[\-]?Venture\s+Builder\s+(?:ומאיץ\s+הסטארטאפים\s+)?המוביל\s+בישראל",
     " — Venture Builder ומאיץ סטארטאפים בישראל"),
    (r"בונה\s+המיזמים\s+ומאיץ\s+הסטארטאפים\s+המוביל\s+בישראל",
     "בונה מיזמים ומאיץ סטארטאפים בישראל"),
    (r"בונה\s+המיזמים\s+המוביל\s+בישראל",
     "בונה מיזמים בישראל"),
    (r"מאיץ\s+הסטארטאפים\s+המוביל\s+בישראל",
     "מאיץ סטארטאפים בישראל"),
    (r"\(Venture\s+Builder\)\s+ומאיץ\s+הסטארטאפים\s+המוביל\s+בישראל",
     "(Venture Builder) ומאיץ סטארטאפים בישראל"),
    (r"ה[\-]?Venture\s+Builder\s+המוביל",
     "Venture Builder"),
    (r"המוביל\s+בישראל",
     "פעיל בישראל"),
    (r"Israel'?s\s+leading\s+Venture\s+Builder",
     "Israeli Venture Builder"),
    (r"the\s+leading\s+Venture\s+Builder\s+in\s+Israel",
     "an Israeli Venture Builder"),
    (r"ה?מאיץ\s+הראשון\s+(?:בישראל|in\s+Israel)?",
     "מאיץ סטארטאפים"),
    (r"the\s+first\s+accelerator\s+(?:in\s+Israel)?",
     "an accelerator"),

    # ============================================================
    # Leumit-specific stats
    # ============================================================
    (r"700,?000\+?\s*(?:members|מבוטחים|חברים|חברי\s+קופ['׳]?ת)",
     "אוכלוסיית מבוטחים נרחבת"),
    (r"2,?000\+?\s*(?:רופאים\s+(?:מומחים|מקצועיים)?|physicians|doctors)",
     "צוות רפואי מקצועי"),
    (r"95%\s*(?:אחוז\s+הצלחה|הצלחה|מהמקרים)\s*(?:באישורים?|ב[\-]?FDA|ב[\-]?CE|רגולטוריים?)?",
     "ליווי מקצועי בתהליך"),
    (r"95%\s*(?:success\s+rate|approval\s+success|first[\-]?time\s+approval)",
     "structured approval guidance"),
    (r"(?:אישור\s+)?Helsinki\s+ב[\-]?2\s*חודשים\s+(?:ממוצע\s+)?(?:במקום\s+4[\-]?6)?",
     "Helsinki — ליווי בתהליך הוועדה"),
    (r"2\s*חודשים\s+ממוצע\s+אישור\s+HELSINKI",
     "ליווי תהליך Helsinki"),
    (r"ב[\-]?2\s*חודשים\s+במקום\s+4[\-]?6",
     "בתהליך מובנה"),
    (r"10M\+?\s+(?:רשומות\s+רפואיות|medical\s+records)",
     "clinical records access"),

    # ============================================================
    # JSX entity-encoded apostrophes (he&apos;rew)
    # ============================================================
    (r"40\+?\s*ונצ&apos;רים\s+שגייסו\s+יחד\s+מעל\s+150\s*מיליון\s+דולר",
     "סטארטאפים בפורטפוליו"),

    # ============================================================
    # Funding-guide hardcoded stat cards
    # ============================================================
    (r"\$?\s?150M\+?\s+(?:raised\s+by\s+portfolio\s+companies?|גויסו\s+ע[\"׳']י\s+חברות\s+בפורטפוליו|raised|גויסו)?",
     "significant capital raised"),
    (r"\$?150,?\s?000,?000\+?",
     "significant capital"),
    (r"raised\s+over\s+\$?150M",
     "significant capital raised"),
    (r"(?:our|המ?)portfolio\s+companies?\s+have\s+(?:collectively\s+)?raised\s+over\s+\$?150M\+?",
     "portfolio companies have raised meaningful funding"),

    # ============================================================
    # Glossary exit stats
    # ============================================================
    (r"WeCcelerate\s+ליווה\s+מספר\s+אקזיטים\s+בפורטפוליו",
     "אנחנו עובדים עם סטארטאפים בכל שלבי הפיתוח"),
    (r"WeCcelerate\s+has\s+supported\s+multiple\s+portfolio\s+exits",
     "we work with startups across all stages"),

    # ============================================================
    # Generic "leading platform / leading accelerators" claims
    # ============================================================
    (r"הפלטפורמה\s+המובילה\s+(?:בישראל\s+)?(?:להאצת\s+סטארטאפים\s+רפואיים\s+וטכנולוגיים)?",
     "פלטפורמה לליווי סטארטאפים"),
    (r"הפלטפורמה\s+המובילה\s+ב[\-]?ישראל",
     "פלטפורמה לליווי יזמים"),
    (r"המאיץ\s+העסקי\s+המוביל",
     "מאיץ עסקי"),
    (r"מאיצי\s+הסטארטאפים\s+המובילים\s+בישראל",
     "מאיצי סטארטאפים בישראל"),
    (r"the\s+leading\s+(?:platform|accelerator)s?\s+in\s+Israel",
     "an Israeli platform"),

    # ============================================================
    # Leumit standalone JSX stat boxes
    # ============================================================
    (r"720,000\+?\s*מטופלים?\s*[\-—]?\s*הגדול\s+בישראל",
     "מאגר נתונים קליני בשותפות לאומית"),
    (r"8\.7M\s+ביקורים\s+השנה",
     "פעילות קלינית רחבה"),
    (r"\$?\s?150M\+?\s+(?:in\s+)?capital\s+raised",
     "significant capital raised"),

    # ============================================================
    # English medtech-guide hardcoded text
    # ============================================================
    (r"unlocks\s+access\s+to\s+720,000\s+anonymized\s+patient\s+records",
     "unlocks structured access to clinical data"),
    (r"access\s+to\s+720,000\s+anonymized\s+patient\s+records\s+for\s+AI\s+model\s+training",
     "structured access to anonymized clinical data for AI model training"),

    # ============================================================
    # Misc Hebrew specifics
    # ============================================================
    (r"רשת\s+של\s+רשת\s+משקיעים",  # double-prefix from earlier replacement
     "רשת משקיעים"),
    (r"סטארטאפים\s+סטארטאפים",  # double from earlier replacement
     "סטארטאפים"),
    (r"ב[\-]?2024[\-]?2026",  # remove date "track record" claim
     ""),
    (r"זמן\s+ממוצע\s+של\s+4\s+חודשים\s+מתחילת\s+פגישות\s+לסגירה",
     "תהליך מובנה לסגירת סבבי גיוס"),
    (r"M&A\s+ממוצע:\s*\$?80[\-]?150M",
     "M&A — תלוי בתחום ובשלב"),
    (r"average\s+M&A\s+exit:\s*\$?80[\-]?150M",
     "M&A — depends on sector and stage"),
    (r"מסלול\s+בלעדי",
     "מסלול ייעודי"),
    (r"exclusive\s+(?:strategic\s+)?partnership",
     "strategic partnership"),
    (r"Exclusive\s+Leumit\s+Health\s+Services\s+partnership",
     "Strategic Leumit Health Services partnership"),
]

def clean_file(fp: Path) -> tuple[int, int]:
    """Returns (chars removed, hits replaced)."""
    if not fp.exists():
        return 0, 0
    text = fp.read_text(encoding="utf-8")
    orig = text
    hits = 0
    for pattern, repl in RULES:
        new_text, n = re.subn(pattern, repl, text)
        hits += n
        text = new_text
    if text != orig:
        fp.write_text(text, encoding="utf-8")
    return len(orig) - len(text), hits

def main():
    total_files = 0
    total_chars = 0
    total_hits = 0
    for rel in FILES:
        chars, hits = clean_file(REPO / rel)
        if hits > 0:
            total_files += 1
            total_chars += chars
            total_hits += hits
            print(f"  {hits:>3} hits | {chars:>+5} chars | {rel}")
    print(f"\n=== TOTAL: {total_files} files, {total_hits} hits, {total_chars:+} chars ===")

if __name__ == "__main__":
    main()
