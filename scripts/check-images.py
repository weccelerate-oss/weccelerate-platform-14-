import os, re

roots = ['app/sites/leumit/sections', 'app/sites/biz/sections', 'app/sites/landing/sections']
referenced = set()
for root in roots:
    for f in os.listdir(root):
        if f.endswith('.tsx'):
            with open(os.path.join(root, f), 'r', encoding='utf-8') as fh:
                content = fh.read()
            for m in re.finditer(r"""(/images/landing-assets/[^"'\s)]+)""", content):
                referenced.add(m.group(1))

existing = set()
for r, dirs, files in os.walk('public/images/landing-assets'):
    for f in files:
        full = os.path.join(r, f)
        # Convert windows backslash to forward slash, strip 'public' prefix
        rel = full.replace(os.sep, '/').replace('public', '', 1)
        existing.add(rel)

ignored = {
    '/images/landing-assets/biz/.gitkeep',
    '/images/landing-assets/landing/.gitkeep',
    '/images/landing-assets/leumit/.gitkeep',
    '/images/landing-assets/patterns/.gitkeep',
}

missing = sorted(referenced - existing)
extra = sorted(existing - referenced - ignored)

print('=' * 60)
print(f'REFERENCED: {len(referenced)}')
print(f'EXISTING:   {len(existing)}')
print(f'MISSING:    {len(missing)}')
print(f'EXTRA:      {len(extra)}')
print('=' * 60)
print()
if missing:
    print('Missing images (will show graceful fallback):')
    for m in missing:
        print(f'  - {m}')
    print()
if extra:
    print('Extra files not referenced by code:')
    for e in extra:
        print(f'  + {e}')
