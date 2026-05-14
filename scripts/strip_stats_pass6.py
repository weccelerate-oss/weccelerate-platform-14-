"""Pass 6: surgical removal of WeCcelerate-claim numbers.

These are sentences that name WeCcelerate AND a specific count/duration —
the most dangerous category because they are unverified claims about our
own performance. Rewrite each into value-prop language without numbers.
"""
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
FILES = [
    "lib/seo/guides-catalog.ts",
    "lib/seo/guides-catalog-en.ts",
    "lib/seo/faq-catalog.ts",
    "lib/seo/press-catalog.ts",
    "public/llms.txt",
    "public/llms-full.txt",
]

RULES = [
    # "WeCcelerate בונה MVP ב-8 שבועות בממוצע" / לקוחות ב-X
    (r"WeCcelerate בונה MVP של לקוחות ב[\-]?\d+ שבועות בממוצע[^,\.]*",
     "WeCcelerate בונה MVP בלוחות זמנים שנקבעים פר-מיזם"),
    (r"WeCcelerate בונה MVP ל[\-]? ?לקוחות ב[\-]?\d+ שבועות בממוצע[^,\.]*",
     "WeCcelerate בונה MVP בלוחות זמנים שנקבעים פר-מיזם"),
    (r"WeCcelerate builds MVPs for clients in an average of \d+ weeks[^.]*",
     "WeCcelerate builds MVPs on timelines tailored per project"),

    # "צוות Venture Builder מאיץ את התהליך ל-8 שבועות בלבד"
    (r"צוות Venture Builder מאיץ את התהליך ל[\-]?\d+ שבועות בלבד\.?",
     "צוות Venture Builder מאיץ את התהליך ומלווה את הבנייה."),

    # "אחרי אפיון מפורט של 2 שבועות"
    (r"אחרי אפיון מפורט של \d+ שבועות?", "אחרי אפיון מפורט"),
    # "הצעה ראשונית חינם תוך 48 שעות"
    (r"הצעה ראשונית חינם תוך \d+ שעות[^.]*", "הצעה ראשונית חינם אחרי פגישת ההיכרות"),

    # "היכרות חמה עם X-Y משקיעים"
    (r"היכרות חמה עם \d+[\-–]?\d* משקיעים רלוונטיים",
     "היכרות חמה עם משקיעים רלוונטיים"),
    (r"היכרות עם \d+[\-–]?\d* משקיעים", "היכרות עם משקיעים"),

    # "תהליך Pitch Deck ב-WeCcelerate: שבוע 1 ... שבועות 5-6"
    (r"תהליך Pitch Deck ב[\-]?WeCcelerate: שבוע \d+ —[^.]+\. שבוע \d+ —[^.]+\. שבוע \d+ —[^.]+\. שבוע \d+ —[^.]+\. שבועות [\d\-–]+ —[^.]+\.",
     "תהליך Pitch Deck ב-WeCcelerate בנוי משלבי אפיון, ניתוח תחרות, טיוטה ראשונה, סבבי Pitch Practice עם יועצים, עיצוב מקצועי והיכרויות עם משקיעים."),

    # "X סבבי Pitch Practice"
    (r"\d+ סבבי Pitch Practice", "סבבי Pitch Practice"),
    (r"\d+ rounds? of Pitch Practice", "rounds of Pitch Practice"),

    # "20 שנות היסטוריה" / "20+ שנות היסטוריה"
    (r"\d+\+? שנות היסטוריה", "היסטוריה ארוכה"),
    (r"\d+\+? years of history", "years of history"),

    # "WeCcelerate בונה MVP של לקוחות ב-8 שבועות"
    (r"WeCcelerate בונה MVP[^.]{0,30}ב[\-]?\d+ שבועות[^.]{0,30}\.",
     "WeCcelerate בונה MVP בלוחות זמנים שנקבעים פר-מיזם."),

    # "זמן ממוצע לאישור נחתך בחצי"
    (r"זמן ממוצע לאישור נחתך בחצי[^.]*\.",
     "תהליך מובנה שמייעל את השלבים מול הוועדה."),

    # "40+ ונצ'רים שנבנו, סכומים משמעותיים גויסו"
    (r"\d+\+? ונצ['׳]?רים שנבנו, ", ""),
    (r", סכומים משמעותיים גויסו ע\"י חברות בפורטפוליו",
     " עם חברות בפורטפוליו"),

    # "Venture Builders (WeCcelerate): 10-40% תלוי בתרומה"
    (r"Venture Builders \(WeCcelerate\): \d+[\-–]\d+% תלוי בתרומה\.?",
     "Venture Builders (WeCcelerate): מבני אקוויטי שנקבעים אישית."),
    (r"Venture Builders \(כמו WeCcelerate\) — \d+[\-–]\d+% אקוויטי \+ [^.]+\.",
     "Venture Builders (כמו WeCcelerate) — מבני אקוויטי ושירותים בהתאמה אישית."),

    # "רשת של 200+ אנג׳לים וקרנות"
    (r"רשת של \d+\+? אנג['׳]לים וקרנות אקטיביות",
     "רשת אנג׳לים וקרנות אקטיביות"),
    (r"רשת של \d+\+? אנג['׳]לים", "רשת אנג׳לים"),

    # "מרפאות של לאומית עם 700,000+ מטופלים"
    (r"מרפאות של לאומית עם \d{1,3}(?:,\d{3})*\+? מטופלים",
     "מרפאות של לאומית"),

    # "1,000 ראיונות לקוחות ב-מספר שנים" / "1,000+"
    (r"מעל \d{1,3}(?:,\d{3})*\+? ראיונות לקוחות",
     "ניסיון רחב בראיונות לקוחות"),

    # "20-30 עמודים"
    (r"דוח JTBD של \d+[\-–]\d+ עמודים", "דוח JTBD מעמיק"),

    # "אצלנו מעל 60%"
    (r"אצלנו מעל \d+%", "אצלנו ביעילות גבוהה"),

    # "הצלחה ממוצעת 25-40%"
    (r"הצלחה ממוצעת \d+[\-–]\d+%", "שיעור הצלחה משמעותי"),

    # "מ-5% ל-40%"
    (r"מ[\-]?\d+% ל[\-]?\d+%", "באופן משמעותי"),

    # "ל-12+ משקיעים ייעודיים"
    (r"ל[\-]?\d+\+? משקיעים ייעודיים", "למשקיעים ייעודיים"),

    # "WeCcelerate ארגנה 8+ matches מוצלחים ב-2024-2025"
    (r"WeCcelerate ארגנה \d+\+? matches מוצלחים[^.]*\.?",
     "WeCcelerate מחברת בין יזמים משלימים."),

    # "WeCcelerate מחברת מיזמים ל-30+ קרנות Series A"
    (r"WeCcelerate מחברת מיזמים ל[\-]?\d+\+? קרנות Series A",
     "WeCcelerate מחברת מיזמים לקרנות Series A"),

    # "מעלות את היחס ל-15-20%"
    (r"מעלות את היחס ל[\-]?\d+[\-–]\d+%",
     "משפרות משמעותית את שיעור ההמרה"),

    # "5%" / "30%" / "40%" — keep generic industry stats but remove WeCcelerate-attached
    # The above already cover the WeCcelerate-prefixed cases.

    # Cleanup
    (r"  +", " "),
    (r"\s+\.", "."),
    (r"\s+,", ","),
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
