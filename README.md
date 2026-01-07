# WeCcelerate Platform

A multi-domain Next.js 14+ application with subdomain-based routing for WeCcelerate's business operations.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Single Next.js App                        │
├─────────────────────────────────────────────────────────────────┤
│                         Middleware                               │
│  (Routes requests based on subdomain to appropriate site folder) │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│   │    main     │  │   leumit    │  │     biz     │  │ landing │ │
│   │             │  │             │  │             │  │         │ │
│   │ weccelerate │  │   leumit.   │  │    biz.     │  │landing. │ │
│   │   .co.il    │  │ weccelerate │  │ weccelerate │  │weccel.. │ │
│   │             │  │   .co.il    │  │   .co.il    │  │ .co.il  │ │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│                                                                   │
│   /app/sites/main  /app/sites/leumit /app/sites/biz  /sites/landing│
└─────────────────────────────────────────────────────────────────┘
```

## Domain Mapping

| Domain | Subdomain | Site Folder | Purpose |
|--------|-----------|-------------|---------|
| weccelerate.co.il | (none) | `/app/sites/main` | Main website, blog, portal login |
| leumit.weccelerate.co.il | leumit | `/app/sites/leumit` | Leumit partner portal |
| biz.weccelerate.co.il | biz | `/app/sites/biz` | Business operations dashboard |
| landing.weccelerate.co.il | landing | `/app/sites/landing` | Marketing landing pages |

## Project Structure

```
weccelerate-platform/
├── app/
│   ├── globals.css           # Global styles & Tailwind theme
│   ├── layout.tsx            # Root layout (fonts, base HTML)
│   └── sites/
│       ├── main/             # Main website
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── (marketing)/  # Marketing pages group
│       │   └── (portal)/     # Portal pages group
│       ├── leumit/           # Leumit partner site
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── biz/              # Business dashboard
│       │   ├── layout.tsx
│       │   └── page.tsx
│       └── landing/          # Landing pages
│           ├── layout.tsx
│           └── page.tsx
├── components/
│   ├── ui/                   # Shared UI components
│   └── shared/               # Cross-site components
├── config/
│   └── sites.ts              # Site configuration
├── lib/
│   └── site-context.ts       # Server utilities for site context
├── middleware.ts             # Subdomain routing logic
└── public/
```

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom theme
- **Icons**: Lucide React

## Color Palette

The design system uses a "prestigious and innovative" color palette:

| Color | Purpose | CSS Variable |
|-------|---------|--------------|
| Royal Blue | Primary (trust, prestige) | `--royal-*` |
| Gold | Accent (premium, success) | `--gold-*` |
| Teal | Secondary (innovation) | `--teal-*` |
| Slate | Neutral (professional) | `--slate-*` |
| Emerald | Success states | `--emerald-*` |
| Coral | CTAs, energy | `--coral-*` |

## Development

### Prerequisites
- Node.js 18+
- npm 9+

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Testing Subdomains Locally

Since localhost doesn't support subdomains, use one of these methods:

**Option 1: Query Parameter**
```
http://localhost:3000?site=biz
http://localhost:3000?site=leumit
http://localhost:3000?site=landing
```

**Option 2: Custom Header**
Add `x-subdomain: biz` header in your API client.

**Option 3: hosts file** (macOS/Linux)
```
# Add to /etc/hosts
127.0.0.1 weccelerate.local
127.0.0.1 biz.weccelerate.local
127.0.0.1 leumit.weccelerate.local
127.0.0.1 landing.weccelerate.local
```

### Building for Production

```bash
npm run build
npm start
```

## Configuration

### Adding a New Subdomain

1. Add entry to `SUBDOMAIN_MAP` in `middleware.ts`
2. Add site config to `config/sites.ts`
3. Create folder in `app/sites/{subdomain}/`
4. Add `layout.tsx` and `page.tsx`

### Site Context in Components

**Server Components:**
```tsx
import { getSiteContext } from '@/lib/site-context';

export default async function MyComponent() {
  const { site, siteKey, subdomain } = await getSiteContext();
  // Use site configuration
}
```

## Deployment Notes

For Vercel deployment with custom domains:
1. Add all domains in Vercel dashboard
2. Ensure wildcard subdomain is configured: `*.weccelerate.co.il`
3. DNS should point to Vercel nameservers

---

© WeCcelerate Ltd.
