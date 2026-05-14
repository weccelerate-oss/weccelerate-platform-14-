"""Restore () that pass4 mistakenly stripped from function declarations and call sites."""
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
FILES = [
    "app/sites/biz/sections/FAQBiz.tsx",
    "app/sites/leumit/sections/FAQLeumit.tsx",
    "app/sites/leumit/services/page.tsx",
    "app/sites/main/about/page.tsx",
    "app/sites/main/en/glossary/page.tsx",
    "app/sites/main/funding-guide/page.tsx",
    "app/sites/main/glossary/page.tsx",
    "app/sites/main/medtech-guide/page.tsx",
]

# Restore parens for: `function name {` → `function name() {`
# and `name {` (just braces after a known function name pattern)
# and `=> {` is fine
# Common arrows: `() => {`, lost to `=> {`?  No, () => was likely stripped.
RULES = [
    # function declarations
    (r"\bfunction (\w+) \{", r"function \1() {"),
    # const/let/var arrow without args: "= => {" → "= () => {"
    (r"= => ", "= () => "),
    # method call without parens: ".filter(Boolean) " is fine
    # JSX components calls: " name {" only at start of arrow body
]

def fix(fp: Path):
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
        h = fix(REPO / rel)
        if h:
            print(f"  {h:>3} hits | {rel}")
            total += h
    print(f"\nTOTAL: {total} hits")
