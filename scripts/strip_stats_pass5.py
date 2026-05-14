"""Pass 5: final sweep — catch K/M-suffixed ranges still in the catalogs."""
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
    # NIS with K/M suffixes (e.g., "500K-1M ש"ח")
    (r"\b\d{1,4}(?:\.\d)?[KMkm][\-–]\d{1,4}(?:\.\d)?[KMkm]\s*ש[\"״]?ח", "היקף תלוי"),
    (r"\b\d{1,4}(?:\.\d)?[KMkm]\+? ?ש[\"״]?ח", "היקף תלוי"),
    # NIS — single number with comma e.g. "500,000 ש"ח"
    (r"\d{1,3}(?:,\d{3})+\+? ?ש[\"״]?ח", "היקף תלוי"),
    # Plain numeric NIS like "30 ש"ח"
    (r"\b\d{1,5}\+? ?ש[\"״]?ח", "היקף תלוי"),
    # Leftover patterns like "X-היקף תלוי" or "200K-היקף תלוי"
    (r"\b\d{1,4}[KMkm]?[\-–]היקף תלוי\b", "היקף תלוי"),
    (r"\b\d{1,4}[KMkm]?[\-–]scope tailored\b", "scope tailored"),
    # Leftover patterns like "היקף תלוי ל-בלוחות..."
    (r"היקף תלוי ל[\-]?בלוחות זמנים", "היקף בהתאמה אישית בלוחות זמנים"),
    # "X-YM" / "X-YK" → scope tailored
    (r"\b\d{1,4}[KMkm][\-–]\d{1,4}(?:\.\d)?[KMkm]\$?", "scope tailored"),
    (r"\b\d{1,4}(?:\.\d)?[KMkm]\$", "scope tailored"),
    # "X-Y$" plain
    (r"\b\d{1,4}[\-–]\d{1,4}\$", "scope tailored"),
    # Standalone "X+ years" / "X-Y years" (industry stats are OK if generic; strip the specific numbers)
    (r"\b\d+[\-–]\d+ שנים\b", "מספר שנים"),
    (r"\b\d+ שנים\b", "מספר שנים"),
    # Common phrasing leftover
    (r"\bב[\-]?\d+ שעות בשבוע\b", "במספר שעות שבועי"),
    (r"\bל[\-]?\d+[\-–]\d+ שעות\b", "להיקף שעות"),
    # NIS prefixed by "כ-"
    (r"כ[\-]?\d{1,3}(?:,\d{3})*\s*ש[\"״]?ח", "היקף תלוי"),
    (r"\b\d{1,4}K[\-–]\d{1,4}K\$?\b", "scope tailored"),
    # Cleanup
    (r"  +", " "),
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
