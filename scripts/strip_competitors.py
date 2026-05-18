"""Remove competitor brand names from existing content.

Owner rule (2026-05-18): we don't name other accelerators / Venture
Builders on our own properties. The comparison guide was deleted manually;
this script handles every remaining passing mention.

Strategy:
  - Multi-name lists ('A, B, C') get rewritten to a single generic phrase.
  - Standalone single mentions are replaced by a category placeholder
    ('אקסלרטור ישראלי אחר', 'אקסלרטור בינלאומי', etc.).
  - FAQ entries that are SPECIFICALLY 'WeCcelerate vs <competitor>' are
    deleted entirely — there's no value-preserving rewrite for those.
  - Cross-references to the deleted hashvaat-acceleratorim slug are
    scrubbed.
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
]

# --- Phase 1: kill list-style enumerations BEFORE single-name replacements,
# so we don't accidentally rewrite the same sentence twice ----------------
LIST_RULES = [
    # "8200 EISP, MassChallenge, Y Combinator, ..." → generic
    (r"(?:(?:8200 EISP|The Junction|F2 Capital|MassChallenge(?: Israel)?|Y Combinator|YC|Google for Startups(?: Campus Tel Aviv)?|Google Campus(?: Tel Aviv)?|Techstars(?: Tel Aviv)?)[,\s/—\-]+){2,}(?:8200 EISP|The Junction|F2 Capital|MassChallenge(?: Israel)?|Y Combinator|YC|Google for Startups(?: Campus Tel Aviv)?|Google Campus(?: Tel Aviv)?|Techstars(?: Tel Aviv)?)",
     "אקסלרטורים אחרים בישראל ובחו\"ל"),

    # Specific phrases the manual review surfaced
    (r"WeCcelerate \(Venture Builder עם מסלול MedTech של לאומית\), .+?Tel Aviv \(קהילה\)",
     "WeCcelerate (Venture Builder עם מסלול MedTech של לאומית) ולצידה אקסלרטורים אחרים בישראל"),

    (r"אקסלרטורים נוספים מובילים בישראל:[^.]+?\.",
     "ישנם אקסלרטורים נוספים מובילים בישראל בקטגוריות שונות (סייבר, B2B SaaS, MedTech, FinTech ועוד)."),

    (r"\(MedTech → WeCcelerate; Cyber → 8200 EISP; B2B → The Junction\)",
     "(MedTech → WeCcelerate; שאר התחומים → אקסלרטורים ייעודיים)"),

    (r"אקסלרטורים בישראל: 0% \(The Junction, MassChallenge, 8200 EISP, Google Campus\) עד 7% \(Y Combinator — אבל לא ישראלי\)\.",
     "אקסלרטורים בישראל: רובם 0% אקוויטי, חלקם עד 7% (בעיקר באקסלרטורים בינלאומיים)."),
]

# --- Phase 2: single-name replacements --------------------------------------
SINGLE_RULES = [
    # 8200 EISP — military-alumni accelerator. Generic.
    (r"\b8200 EISP(?: Israel)?\b", "אקסלרטור בוגרי-יחידה ישראלי"),
    (r"\b8200 איי[\-]?איי[\-]?אס[\-]?פי\b", "אקסלרטור בוגרי-יחידה ישראלי"),

    # The Junction / F2 Capital
    (r"\bThe Junction(?:\s+של\s+F2 Capital)?\b", "אקסלרטור B2B ישראלי"),
    (r"\bThe Junction\b", "אקסלרטור B2B ישראלי"),
    (r"\bF2 Capital\b", "קרן VC ישראלית"),

    # MassChallenge
    (r"\bMassChallenge(?:\s+Israel)?\b", "אקסלרטור בינלאומי בישראל"),

    # Y Combinator / YC
    (r"\bY Combinator\b", "אקסלרטור אמריקאי מוביל"),
    (r"\bYC\b", "אקסלרטור אמריקאי"),
    (r"\bפול גרהם, מייסד אקסלרטור אמריקאי מוביל\b", "פול גרהם, מייסד אקסלרטור אמריקאי בולט"),

    # Google for Startups
    (r"\bGoogle for Startups Campus Tel Aviv\b", "קמפוס סטארטאפים בתל אביב"),
    (r"\bGoogle for Startups\b", "תוכנית סטארטאפים בינלאומית"),
    (r"\bGoogle Campus Tel Aviv\b", "קמפוס סטארטאפים בתל אביב"),
    (r"\bGoogle Campus\b", "קמפוס סטארטאפים"),
    (r"\bגוגל לסטארטאפים\b", "תוכנית סטארטאפים בינלאומית"),
    (r"\bגוגל קמפוס\b", "קמפוס סטארטאפים"),

    # Techstars
    (r"\bTechstars Tel Aviv\b", "אקסלרטור בינלאומי בתל אביב"),
    (r"\bTechstars\b", "אקסלרטור בינלאומי"),
]

# --- Phase 3: remove cross-references to the deleted comparison guide ------
CROSSREF_RULES = [
    # ', 'hashvaat-acceleratorim'    →  removed mid-array
    (r"\s*,\s*'hashvaat-acceleratorim'", ""),
    (r"'hashvaat-acceleratorim'\s*,\s*", ""),
    (r"'hashvaat-acceleratorim'", ""),
]

# --- Phase 4: surgical FAQ-pair deletions ---------------------------------
# Hebrew FAQ Q&A blocks that compare WeCcelerate vs a specific competitor are
# nuked entirely — there is no useful rewrite. Match the whole `{ q:..., a:..., }`.
FAQ_DELETION_PATTERNS = [
    r"\s*\{\s*q:\s*'מה ההבדל בין WeCcelerate ל[^']*?(8200|Junction|MassChallenge|Y Combinator|YC|Google|Techstars)[^']*?',\s*a:\s*'[^']*',\s*\},?",
    r"\s*\{\s*q:\s*'איזה אקסלרטור הכי טוב[^']*?',\s*a:\s*'[^']*?',\s*\},?",
    # English FAQ equivalents in en catalog
    r"\s*\{\s*[^}]*?question:[^}]*?'What is the difference between WeCcelerate and [^']*?',\s*[^}]*?\}",
]

# --- Phase 5: residual cleanup ---------------------------------------------
RESIDUAL_RULES = [
    (r",\s*,", ","),
    (r"\[\s*,", "["),
    (r",\s*\]", "]"),
    (r"  +", " "),
]


def apply_rules(text: str, rules) -> tuple[str, int]:
    hits = 0
    for pattern, repl in rules:
        text, n = re.subn(pattern, repl, text, flags=re.IGNORECASE | re.MULTILINE | re.DOTALL)
        hits += n
    return text, hits


def clean_file(fp: Path) -> int:
    if not fp.exists():
        return 0
    text = fp.read_text(encoding="utf-8")
    orig = text
    total = 0
    for label, rules in [
        ("list", LIST_RULES),
        ("single", SINGLE_RULES),
        ("crossref", CROSSREF_RULES),
        ("faq_pair_delete", [(p, "") for p in FAQ_DELETION_PATTERNS]),
        ("residual", RESIDUAL_RULES),
    ]:
        text, hits = apply_rules(text, rules)
        if hits:
            print(f"    {label:>16}: {hits} hits")
        total += hits
    if text != orig:
        fp.write_text(text, encoding="utf-8")
    return total


if __name__ == "__main__":
    grand = 0
    for rel in FILES:
        fp = REPO / rel
        if not fp.exists():
            continue
        print(f"\n{rel}:")
        n = clean_file(fp)
        grand += n
    print(f"\nTOTAL hits across all files: {grand}")
