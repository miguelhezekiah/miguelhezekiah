
## Goal

Rebuild the portfolio in the minimal, slow-cinematic aesthetic of `simonholm.studio`, using your existing content from `miguelhezekiah.github.io`. Content lives in Lovable Cloud (editable without code changes). Hosted via Lovable + GitHub sync. All repeatable values live in a single config file.

## Hosting

Lovable hosting + GitHub two-way sync. Code stays on GitHub; deploy via Lovable's Publish button. Lovable Cloud (database + storage) is enabled in the same project — no separate accounts.

## Content source — Lovable Cloud

Three tables (public read, no public writes):

```
projects     id, slug, title, year, category, role, location,
             summary, body (text[]), tags (text[]),
             metrics (jsonb [["label","value"]]),
             hero_image_url, gallery_urls (text[]),
             sort_order, created_at

writing      id, slug, title, date, read_time, tag,
             excerpt, body, sort_order, created_at

experience   id, role, org, years, note, sort_order, created_at
```

Storage bucket `portfolio-assets` (public read) for images. RLS: public SELECT only.

I'll seed the tables with the 6 projects, 4 writing entries, and 5 experience rows from your current `data.jsx`. Hero images start as placeholder dark gradients; you swap them later by editing one URL field per row in the Cloud dashboard — no rebuild needed.

`now_items`, bio, name, role, socials live in the centralized config file (small, rarely changed).

## Centralized variables — one source of truth

`src/config/site.ts`:

```ts
export const siteConfig = {
  name: "Miguel Hezekiah",
  role: "Computational Designer",
  copyright: "©2026",
  email: "hello@...",
  socials: { instagram, linkedin, github },
  nav: [
    { label: "Index",    to: "/" },
    { label: "Work",     to: "/work" },
    { label: "Thinking", to: "/thinking" },
    { label: "About",    to: "/about" },
    { label: "Contact",  to: "/contact" },
  ],
  bio: { short, long },
  nowItems: [...],
};

export const motionConfig = {
  ease: [0.65, 0, 0.35, 1] as const,
  pageDuration: 0.7,
  heroCrossfadeDuration: 1.2,
  heroIntervalMs: 4500,
  hoverDuration: 0.5,
  revealDuration: 0.7,
};
```

Design tokens (colors, font stack, base sizes) live as CSS variables in `src/styles.css`. Same DRY rule — change once, cascades everywhere.

## Visual system

- `--background` near-black `oklch(0.16 0.005 260)`
- `--foreground` off-white `oklch(0.92 0.005 260)`
- `--muted-foreground` for counters/meta
- One neutral grotesk via Google Fonts in root `head()`
- Tiny uniform sans for nav and corner labels; large display reserved for case-study titles
- Generous negative space, no borders, no cards, no shadows

## Motion system

`framer-motion`, all timings pulled from `motionConfig`:

- 700ms eased page transitions (8px translateY + opacity)
- 1200ms hero cross-fade with 1.04 → 1.0 scale, auto-rotate every 4500ms
- 500ms hover shift (~12px) on Work rows, image preview fades in to the right
- 700ms scroll reveals on scroll-into-view sections
- No springs, no bounce

## Routes

```text
src/routes/
  __root.tsx          shared chrome (corner labels, cursor, page transition)
  index.tsx           / — full-bleed hero rotator + index counter (0 1)
  work.tsx            /work — vertical project list, hover preview
  work.$slug.tsx      /work/:slug — case study (summary, body, metrics, gallery)
  about.tsx           /about — bio, experience timeline, Now list
  thinking.tsx        /thinking — writing index
  thinking.$slug.tsx  /thinking/:slug — article view
  contact.tsx         /contact — single-screen email + socials
```

Each route has its own `head()` for SEO (title, description, og tags). Where applicable, leaf routes set `og:image` from the loaded hero URL.

## Components

- `<CornerLabels />` — name (TL), role (TR), Index counter (BL), copyright (BR)
- `<IndexCounter idx total />` — animated digit ticker
- `<Cursor />` — subtle follow accent (disabled on touch)
- `<PageTransition />` — wraps `<Outlet />` in `__root`
- `<HeroRotator projects />`, `<WorkRow project />`, `<ScrollReveal />`

## Data layer

- Browser Supabase client + TanStack Query hooks: `useProjects()`, `useProject(slug)`, `useWriting()`, `useArticle(slug)`, `useExperience()`
- Public reads only — no server functions needed for v1
- Sorted by `sort_order` asc

## Real assets — swap later

You upload via Lovable Cloud → Storage (or paste any public URL into the row's `hero_image_url` field). Until then, each row gets a deterministic dark gradient placeholder generated from the project slug — same dimensions, same aesthetic, no layout shift on swap.

## Out of scope

- Admin UI for editing content (use the Cloud dashboard — already a CMS)
- Auth (portfolio is fully public)
- Contact form submission (mailto link only)
- Analytics, comments, i18n

## Technical notes

- TanStack Start file-based routes, Tailwind v4 via `styles.css`, framer-motion added via `bun add`
- Browser Supabase client only (`@/integrations/supabase/client`); no `createServerFn` needed since all data is public-read
- Routes that fetch from Supabase use `useQuery` in components, not loaders, to avoid SSR/auth coupling
- `siteConfig.nav` drives both header and footer to keep them in sync

## What I need from you (later, not now)

- 6 hero images (≥1920×1200 JPG/WebP) — upload to the Storage bucket
- Final email + social URLs (currently placeholder)
- Optional: headshot for /about, favicon

Everything is editable post-launch with zero code changes.
