
## 1. Global grid + spacing system (full-bleed, responsive)

`src/styles.css` tokens (single source of truth):
- `--grid-cols: 6` mobile, `12` ≥768px (via media query)
- `--grid-gap: clamp(12px, 1.4vw, 16px)`
- `--site-padding-x: clamp(16px, 2vw, 24px)`
- `--site-padding-y: clamp(16px, 2.4vh, 28px)`
- `--section-gap: clamp(96px, 14vh, 180px)`

New `<PageGrid>` wrapper used by EVERY route:
```
.page-grid { display:grid; grid-template-columns:repeat(var(--grid-cols),1fr); gap:var(--grid-gap); padding:var(--site-padding-y) var(--site-padding-x); }
```
Utility classes `.col-1`…`.col-12` and `.col-span-1`…`.col-span-12` declared in styles.css. Children declare their span explicitly. Dev `?debug=grid` overlay shows guides.

## 2. Typography → Helvetica (one family for everything)

- Drop Fraunces + Inter Tight + Google Fonts link.
- `--font-sans-stack: "Helvetica Neue", Helvetica, Arial, "Inter", system-ui, sans-serif`
- `--font-display-stack` = same stack, just lighter weight (300) and tighter tracking (-0.02em).
- All `.display`, `.label`, body — same family.

## 3. Navigation: About / Work / Thinking / Contact

- `siteConfig.nav` updated to those 4, in that order.
- `CornerLabels` + `IndexCounter` reflect new set.

## 4. Home (`/`) — hero + scrollable About below

- `/` = full-viewport rotating hero (100dvh) → scroll down reveals shared `<AboutSection>`.
- `/about` route still exists (deep-link), renders the same `<AboutSection>` component. DRY.
- Small chevron + "scroll" label at hero bottom-center.

## 5. Hero bug fix (the "turns pitch black" issue)

Cause: `AnimatePresence` without `mode="wait"`, and the previous frame unmounts before the next paints → flash of empty bg.

Fix:
- Two stacked `<img>` layers; crossfade by toggling opacity between them, never unmount.
- Preload next via `new Image()` before swap.
- Guard against empty array + index overflow on hot reload.

## 6. Image upload — small admin page

Routes (NOT in public nav):
- `/admin/login` — email + password.
- `/admin` — gated; tabs: **Projects | Writing | Experience | Now items**. Inline edit, drop-zone uploads to `portfolio-assets/{table}/{slug}-{ts}.{ext}`, writes public URL into the row. Reorder by `sort_order`.

Backend:
- New table `admins(user_id uuid PK)` + `is_admin(uid)` SECURITY DEFINER fn.
- New table `now_items(id, kind, title, author, note, sort_order)` so Now is editable too.
- RLS: public SELECT stays; INSERT/UPDATE/DELETE on `projects/writing/experience/now_items` allowed only when `is_admin(auth.uid())`.
- Storage RLS on `portfolio-assets`: public read; admin write.
- Trigger: first signup auto-promoted to admin; later signups stay non-admin.
- Auto-confirm email ON for `/admin` (you log in immediately after signup).

Result: upload + edit content in-app, no Supabase dashboard.

## 7. Work page (`/work`) — sort, filter, view toggle

Sticky toolbar:
- **View:** Grid (default) ↔ List — `?view=grid|list`
- **Sort:** Year ↓ (default) / Year ↑ / Alphabetical / Type — `?sort=`
- **Filter:** Category chips + Tag chips, multi-select, layered AND — `?cat=…&tag=…`
- "Clear" button when any filter active.

Search params validated with `zodValidator` + `fallback`.

Grid view: 12-col, cards span 4 desktop / 3 mobile (3-up desktop, 2-up mobile). Square crop. Hover: image scale 1.02, title shifts up 4px.

List view: current row layout + hover preview pane.

Switching views: `AnimatePresence` fade+slide-up.

## 8. Thinking page (`/thinking`) — Essays / Now toggle

- Two underlined text links at top: "Essays" / "Now". Active = solid underline, inactive = 0.4 opacity.
- `?view=essays|now` (default essays).
- Switch animation: outgoing fade+slide-up 12px (200ms), incoming fade+slide-up from +12px (300ms). Honors `prefers-reduced-motion`.
- "Now" sourced from `now_items` table (so it's editable in admin).
- About page no longer has Now section.

## 9. Page transition — subtle horizontal sweep

Replace current vertical fade with:
- Outgoing: opacity 1→0, x 0→ -24px (300ms, eased)
- Incoming: opacity 0→1, x +24px → 0 (500ms, eased, slight 100ms delay)
- Whole-page transition runs in `<PageTransition>` via `AnimatePresence mode="wait"`.
- Disabled under `prefers-reduced-motion`.

## 10. Other refinements (confirmed yes)

- Slim footer (email + socials + © year, sourced from `siteConfig`).
- Skeleton loaders matching layout (replace "Loading…").
- 404 + error pages restyled with display type + grid.
- Favicon + OG image: I'll generate dark monogram placeholders (swap later in admin).
- Global `prefers-reduced-motion` kill switch for hero rotation, page sweep, slide tabs.
- Custom cursor stays; auto-disabled on touch / ≤768px.
- Hero center-crops on portrait — confirmed OK.

## Technical layout

```text
src/
  config/site.ts          ← nav, motion (sweep timings), copyright
  styles.css              ← grid + Helvetica tokens, col-span utils
  components/site/
    PageGrid.tsx          ← NEW; wraps every route
    AboutSection.tsx      ← NEW; shared / and /about
    HeroRotator.tsx       ← FIX (no black flash)
    PageTransition.tsx    ← horizontal sweep
    Footer.tsx            ← NEW
    Skeleton.tsx          ← NEW
    work/Toolbar.tsx, GridView.tsx, ListView.tsx
    thinking/Tabs.tsx, NowList.tsx
    admin/Layout.tsx, ProjectsTab.tsx, WritingTab.tsx, ExperienceTab.tsx, NowTab.tsx, ImageDropzone.tsx
  routes/
    index.tsx             ← hero + AboutSection
    about.tsx             ← AboutSection only
    work.tsx              ← search-param driven (zod)
    thinking.tsx          ← essays↔now
    contact.tsx           ← grid refactor
    admin.tsx             ← layout + auth gate
    admin.login.tsx
  lib/portfolio.ts        ← + useNowItems, useUpsertX, useUploadAsset, useIsAdmin

migrations:
  - admins + is_admin()
  - now_items table + seed from siteConfig.nowItems
  - admin-only write RLS on projects/writing/experience/now_items
  - storage write RLS on portfolio-assets
  - trigger: first signup → admin
```

Implementation order: tokens+grid+Helvetica → hero fix → nav + home scroll → page-sweep transition → admin (auth, RLS, UI) → work toolbar → thinking tabs → footer/skeletons/404/favicon.
