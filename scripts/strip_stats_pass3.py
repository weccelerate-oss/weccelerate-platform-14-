"""Pass 3: clean remaining $-amounts, equity-percent, and specific time/cost
commitments in FAQ/guide catalogs. Goal: zero binding numbers about
WeCcelerate services. Generic industry stats (e.g. "Class II 510(k) review
takes 3-6 months") are kept since those describe the world, not us.
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

TOKEN_RULES = [
    # ---------------- WeCcelerate-specific service prices/timelines ----------------
    # Hebrew — "WeCcelerate בונה MVP של לקוחות ב-8 שבועות בממוצע"
    (r"WeCcelerate בונה MVP[^\.]{0,40}ב[\-]?\d+ שבועות[^\.]{0,30}\.",
     "WeCcelerate בונה MVP בלוחות זמנים מותאמים פר-מיזם."),
    (r"WeCcelerate בונה Pitch Decks מקצועיים בתוך \d+[\-–]\d+ שבועות[^\.]*\.",
     "WeCcelerate בונה Pitch Decks מקצועיים בליווי תהליך מובנה."),
    (r"WeCcelerate מספקת את השירות לסטארטאפים ישראלים ל[\-]?\d+[\-–]\d+ חודשים\.?",
     "WeCcelerate מספקת את השירות לסטארטאפים ישראלים בהיקף שנקבע אישית."),
    (r"לקוחות שלנו קיבלו 510\(k\) clearance תוך \d+ חודשים[^\.]*\.",
     "אנחנו מלווים לקוחות בתהליך 510(k) clearance מול ה-FDA."),
    (r"לקוחות WeCcelerate: \d+ חודשים \(הממוצע הישראלי הוא \d+[\-–]\d+ חודשים\)\.?",
     "לקוחות WeCcelerate נהנים מליווי מובנה של ועדת הלסינקי דרך לאומית."),
    (r"זמן אישור ממוצע עבור לקוחות WeCcelerate:[^\.]+\.",
     "אנחנו מלווים תהליך מובנה מול ועדת הלסינקי של לאומית."),
    (r"דרך לאומית × WeCcelerate: \d+ חודשים בממוצע\.?",
     "דרך לאומית × WeCcelerate: ליווי תהליך מובנה."),

    # English equivalents
    (r"WeCcelerate builds MVPs for clients in an average of \d+ weeks[^\.]*\.",
     "WeCcelerate builds MVPs on timelines tailored per project."),
    (r"WeCcelerate provides this service for Israeli startups for over a flexible duration at \$[\d,\-K]+/month\.?",
     "WeCcelerate provides this service for Israeli startups with scope tailored per engagement."),
    (r"CTO as a Service at WeCcelerate: \$[\d,\-K]+ per month \([^)]+\), minimum \d+-month commitment\.?",
     "CTO as a Service at WeCcelerate: scope tailored per engagement."),
    (r"WeCcelerate — \$[\d,\-K]+\.?", "WeCcelerate — scope tailored per engagement."),
    (r"WeCcelerate builds professional business plans in in adjusted timelines for \$[\d,\-K]+\.?",
     "WeCcelerate builds professional business plans on tailored timelines."),
    (r"WeCcelerate — \$[\d,\-K]+ depending on scope[^\.]*\.",
     "WeCcelerate — scope tailored per engagement."),
    (r"\(\$[\d,\-K]+ each, in adjusted timelines\)", ""),

    # ---------------- WeCcelerate equity percentages ----------------
    (r"אקוויטי 10[\-–]30% תלוי במעורבות", "מבני תשלום נבנים אישית"),
    (r"Venture Builder \(בונה מיזמים\) — תורם צוות תפעולי מלא ועובד בפועל על המיזם, אקוויטי 10[\-–]30%",
     "Venture Builder (בונה מיזמים) — תורם צוות תפעולי מלא ועובד בפועל על המיזם"),
    (r"A Venture Builder — contributes a full operational team and works on the venture, 10[\-–]30% equity",
     "A Venture Builder — contributes a full operational team and works on the venture"),
    (r"\bאקוויטי 10[\-–]30%", "מבני תשלום נבנים אישית"),
    (r"\b10[\-–]30% equity", "with structures built per engagement"),
    (r"100,?000\+? ש[\"״]?ח ל[\-]?\d+[\-–]\d+ חודשים\.?", "היקף נבנה אישית לכל venture."),

    # ---------------- catalog metadata fields with $ tables ----------------
    # FAQ answers that lead with "$X-Y" pricing tables — strip the price column
    (r"\$[\d,]+[\-–]\$?[\d,]+K?,? ?(?:in adjusted timelines|over a flexible duration)",
     "scope tailored per project"),
    (r"\$[\d,]+K?[\-–]\$?[\d,]+K?,? ?(?:in adjusted timelines|over a flexible duration)",
     "scope tailored per project"),
    (r"\$[\d,]+K?[\-–]\$?[\d,]+K?\b", "scope tailored"),
    (r"\$[\d,]+K?\+? ?\b(?:per month|/month)\b", "scope tailored"),

    # ---------------- "WeCcelerate ב-XK" Hebrew price drops ----------------
    (r"WeCcelerate (?:עבור |מציעה |בונה )([^,\.]+?), \d+[\-–]\d+K? ?₪",
     r"WeCcelerate \1, היקף בהתאמה אישית"),
    (r"\d+[\-–]\d+K\$ ל[־-]חודש", "היקף בהתאמה אישית"),

    # ---------------- "מחיר: ..." price lines ----------------
    (r"מחיר: [^.]*?\d[^.]*?\.", "מחיר: היקף בהתאמה אישית, פגישת היכרות חינם."),

    # ---------------- residual cleanups ----------------
    (r"  +", " "),
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
