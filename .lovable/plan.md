# Plan — Fix slug routing + Swiss editorial redesign

## 1. Bug: project / thinking detail pages redirect to index

**Root cause.** With TanStack's flat file routing, `src/routes/work.tsx` is
treated as the *layout* for `src/routes/work.$slug.tsx` because a child
route exists. `WorkIndex` doesn't render an `<Outlet />`, so navigating to
`/work/hangar` matches the slug route but only the parent layout
(WorkIndex) ever paints — you appear to "go back" to /work. Same bug for
`thinking.tsx` + `thinking.$slug.tsx`.

**Fix.** Rename the index pages so they're true sibling routes, not parent
layouts:

- `src/routes/work.tsx`  →  `src/routes/work.index.tsx`
- `src/routes/thinking.tsx`  →  `src/routes/thinking.index.tsx`

No code changes inside the files. The Vite plugin will regenerate
`routeTree.gen.ts` automatically. This makes `/work` and `/work/$slug`
proper siblings under the root, and the slug pages will render.

## 2. Swiss editorial redesign (motion preserved)

Goal: shift from the current near-black cinematic look to a **Swiss
editorial** aesthetic — Müller-Brockmann / Massimo Vignelli / Werkplaats
energy: strict 12-col grid, hairline rules, generous white space, big
left-aligned headlines, tabular meta, small caps labels, restrained accent.
Keep all current Framer Motion transitions (page sweep, hero crossfade,
hover, scroll-reveal) — only visual tokens and layout rhythm change.

### 2a. Tokens (`src/styles.css`)

- **Palette:** flip to a paper-white canvas with near-black ink and a
  single editorial red accent.
  - `--background` paper white (~oklch(0.985 0.003 90))
  - `--foreground` near-black ink (~oklch(0.16 0.01 260))
  - `--muted-foreground` mid grey for meta
  - `--border` 1px hairline at ~12% ink
  - `--accent` editorial vermilion (~oklch(0.58 0.21 28)) — used sparingly
    on active states, the index counter, current-section underline, and
    `::selection`
- **Type stack:**
  - `--font-display-stack`: a grotesk pair —
    `"Neue Haas Grotesk Display", "Helvetica Neue", Helvetica, Arial, sans-serif`
    (falls back cleanly; no webfont required)
  - `--font-sans-stack`: same family for body, slightly tighter tracking
  - `.display` weight goes from 300 → **500/600** with tighter
    `letter-spacing: -0.025em` and `line-height: 0.92` for poster-scale H1s
  - `.label` becomes 10/11px tabular-nums, +0.12em tracking, uppercase
- **Grid rhythm:** keep 12-col; tighten gutters
  (`--grid-gap: clamp(16px, 1.6vw, 24px)`), widen page padding
  (`--site-padding-x: clamp(24px, 3vw, 48px)`).
- **Rules:** introduce a `.rule` utility (1px hairline) and a `.rule-thick`
  (2px) used as section dividers — a Swiss staple.
- **Numbering:** add `.num` (tabular-nums, mono-feel via grotesk) for the
  01 / 04 counters in CornerLabels and ListView.

### 2b. Header / CornerLabels

- Replace the floating wordmark + nav with a **top hairline-ruled bar**:
  wordmark left, nav right, all underneath a 1px rule that spans the page.
  Active nav uses the accent colour + small bullet, not underline.
- Bottom-left: section label gets a leading numeric prefix `§ 02 / Work`,
  tabular-nums.
- Bottom-right meta becomes a 3-line stack: role / location / © year.
- Keep the existing scroll-direction hide animation untouched.

### 2c. Index / Hero

- HeroRotator keeps its crossfade. Overlay a Swiss caption block in the
  bottom-left (not centered) with a 12-col mini-grid:
  - col 1–2: running number (`01 / 06`)
  - col 3–7: project title (poster scale, tight)
  - col 8–12: meta stack (category / location / year), each on its own line
- Replace the centered "scroll" pill with a left-aligned vertical rule +
  tiny "↓ continue" label.

### 2d. Work index

- Convert grid view from 3-up squares to a **classic editorial 12-col
  catalogue**: alternating asymmetric rows (3+9, 6+6, 9+3) with image
  thumbs that have *no* rounded corners or shadow — just the photograph
  and a tight caption block underneath (title left, year right, hairline
  rule, category small-caps).
- List view: numbered table with 4 columns
  (`№ | Title | Category | Year`), `border-t` hairlines, hover slides the
  title 12px right (existing motion kept).
- Toolbar: drop the bg-blur pill; use a flush hairline-ruled strip with
  uppercase label dividers (`View · Sort · Type · Tags`) separated by
  vertical hairlines.

### 2e. Project detail (`work.$slug.tsx`)

- Replace the dark gradient hero overlay with a **white caption slab**
  that sits beneath the hero (not over it), Swiss-style: huge left-aligned
  H1, 12-col meta strip, then a 1px rule.
- Sticky sidebar becomes a true 3-col aside with `dt/dd` definition list
  styling (label small-caps, value grotesk regular).
- Body copy moves to col 5–11 (max measure ~62ch) — single-column, tight
  leading, drop-cap on the first paragraph.
- Metrics band: numbers become poster-scale (`clamp(3rem, 6vw, 6rem)`)
  with hairline dividers between cells.
- Gallery: keep asymmetric chunking but remove all gaps inside row pairs
  (full-bleed pair) for a magazine-spread feel.
- Next-project block: full-bleed, swap to a horizontal 12-col layout with
  oversized `→` glyph in the accent colour.

### 2f. Thinking, Contact, Footer

- Apply the same hairline + grotesk + accent treatment so pages feel
  unified. No structural changes beyond what falls out of the new tokens.

### 2g. Motion — unchanged

`motionConfig` values stay as-is. Page sweep, hero crossfade,
ScrollReveal, list-hover slide, IndexCounter — all preserved. Only the
visual chrome changes.

## Out of scope

- No CMS / admin changes this round.
- No new content; copy stays.
- No new dependencies (system grotesk fallbacks only — can swap to a real
  Neue Haas / Helvetica Now webfont later if you want).

## Files touched

- **Renamed:** `src/routes/work.tsx` → `work.index.tsx`,
  `src/routes/thinking.tsx` → `thinking.index.tsx`
- **Edited tokens/global:** `src/styles.css`
- **Edited components:** `CornerLabels.tsx`, `HeroRotator.tsx`,
  `Footer.tsx`, `AboutSection.tsx`
- **Edited routes:** `index.tsx`, `work.index.tsx`, `work.$slug.tsx`,
  `thinking.index.tsx`, `thinking.$slug.tsx`, `contact.tsx`
