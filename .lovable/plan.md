
## Overview

Nine changes across navigation, home page, project/essay detail pages, admin, and a new editable timeline graphic. Below is grouped by area, then numbered by your original list at the end.

---

## 1. Routing & nav cleanup (items #1, #3, #9)

- Delete `src/routes/about.tsx`. The `/about` URL will 404 to the global not-found.
- Remove the "About" entry from `siteConfig.nav`. Nav becomes: Work, Thinking, Contact (3 items). Index counter logic in `IndexCounter` keeps working.
- The Index page already renders `AboutSection` + `Footer` after the hero, so no content is lost.
- `CornerLabels` chrome rework:
  - Top-right nav: hide on scroll-down, reveal on scroll-up (and always visible at the very top). Implemented with a small scroll-direction hook (`useScrollDirection`) wired to a translate-Y + opacity transition on the nav row only.
  - Top-left wordmark, bottom-right meta: stay fixed/absolute as today.
  - Bottom-left section + index counter: when the footer enters the viewport, fade these out at the fixed position and render the same labels inside the footer's top-left cell instead. Detect with `IntersectionObserver` on the footer.
- `Footer` rework: no text in the bottom-left cell anymore. Layout becomes:
  - Top-left of footer: section name + index counter (handed off from CornerLabels when in view).
  - Center: email link.
  - Right: socials (Instagram, LinkedIn, GitHub).
  - Copyright moves to a thin row at the bottom-center or bottom-right (kept on a single line on mobile).

## 2. Home page additions (item #2 — animated timeline)

- New section `TimelineGraphic` inserted in the home page between the bio paragraphs and the Experience list inside `AboutSection`.
- Visuals follow the reference image you uploaded:
  - Horizontal axis with `+` ticks for 2021 → 2026 → Present.
  - Three lanes above the axis: `[Academic]`, `[Professional]`, `[Personal Projects]`. Each project is a black pill (e.g. "01. House of Slabs") connected to its year by a dashed leader line.
  - Below the axis: skill bars (AutoCAD, Revit, Rhino + Grasshopper, Rhino.Inside.Revit, Rendering Softwares, C# RhinoCommon, Python) drawn as horizontal lines starting at the year the skill was adopted and extending to "Present".
  - "Learning in progress" cluster on the right (Design Systems & Automation, LoRA + ControlNet).
- Animation (plays once on scroll-into-view via `IntersectionObserver` + Framer Motion):
  1. Axis line draws left → right (~1.2s).
  2. As the "loading" point passes each year tick, that year label fades in.
  3. Project pills + their leader lines fade/draw in when the loader passes their year.
  4. Skill lines extend from their start year toward Present, in sync with the same loader sweep, so a skill that starts at 2023 begins drawing only when the loader reaches 2023.
  5. Text labels (lane titles, "Learning in progress") fade in last.
- Built with inline SVG (axis, lines, pills) wrapped in `motion.svg`. Uses `pathLength` animations for the lines and `opacity` for labels. Respects `prefers-reduced-motion` (renders the final state immediately).
- Responsive: at viewports <768px, the graphic switches from horizontal to a vertical stacked timeline (axis becomes top→bottom, project pills stack on the right, skill bars stack below). Same animation behavior.

## 3. Timeline data — new editable table (item #2 data layer)

New `timeline_entries` table:
- `id` uuid pk
- `kind` text ('project' | 'skill' | 'lane_label')
- `lane` text ('academic' | 'professional' | 'personal' | null) — for projects only
- `label` text — pill/skill text
- `start_year` integer — required
- `end_year` integer | null — null means "Present" (skills); for projects defaults to start_year
- `page_ref` text | null — e.g. "p.03"
- `sort_order` integer

Standard RLS: public read, admin write (mirrors `experience`). Seeded with the entries from your reference image.

Admin page gains a "Timeline" tab with the same edit/add/delete pattern as Experience.

## 4. Detail pages — fix routing + redesign (item #5)

Investigation already done: routes `/work/$slug` and `/thinking/$slug` exist and the projects exist in the DB. The 404 is most likely the same trailing-slash router config that previously broke `/admin`. Fix it once at the router level and verify both detail routes load.

Then redesign:

- **`/work/$slug`** (editorial layout):
  - Full-bleed hero image with title overlaid bottom-left.
  - Two-column intro: left = sticky meta block (year, role, location, category, tags), right = summary in display type, then long-form body paragraphs.
  - Metrics row in a thin border-y band.
  - Gallery as an asymmetric mosaic (1-up, then 2-up, then 1-up) instead of a uniform 2-col grid.
  - Sticky "Next project →" footer card with hero thumbnail.
- **`/thinking/$slug`** (long-read layout):
  - Centered max-w-prose column, large display title, drop-cap on first paragraph.
  - Sticky meta column on the left at md+ (date · tag · read time).
  - Footer block with "← All writing" and a "Next essay" link.

## 5. Experience section update (item #6)

- Add `image_url` text column (nullable) to `experience`.
- Layout in `AboutSection` changes from a 3-column row (years | role+org | note) to a 2-row block per entry:
  - Row 1 (existing): years | role + org | note (kept).
  - Row 2 (new): a wide image area spanning the columns under role+org+note (years stays empty in row 2). Always renders — falls back to the same gradient placeholder used elsewhere when `image_url` is null.
  - On mobile the image stacks below the text.
- Admin "Experience" tab gains an image upload field (uses existing `uploadAsset` helper + `portfolio-assets` bucket).

## 6. Work toolbar polish (item #7)

In `src/routes/work.tsx`:
- Replace the inline `Sort` button row with a shadcn `Select` dropdown (Year ↓ / Year ↑ / A–Z / Type).
- Replace the inline `Type` button row with a shadcn `Select` (single-select; "All" + each category).
- Tags: drop the "Tag" group label; render the tag chips inline as a horizontal row (still toggleable, multi-select).
- Toolbar wraps cleanly at mobile widths (the View / Sort / Type selects stack into 2 rows).

## 7. Responsiveness pass (item #8)

While touching each affected file, verify and adjust at 360 / 414 / 768 / 1024 / 1440:
- Home hero, AboutSection bio + new timeline + experience.
- Footer (handoff of corner labels works on mobile too — labels move into footer, no overlap with email/socials).
- Work toolbar (selects + tag chips wrap, no horizontal scroll).
- Work detail hero + asymmetric gallery (mosaic collapses to single column).
- Thinking detail (sticky meta hides at <md, becomes a top header).
- CornerLabels: at <640px, hide the bottom-right meta block and shorten labels to avoid overlap with corner padding.

## 8. Images (item #4)

You said you'll upload them in this chat. The plan assumes you'll attach images for each of the 4 projects + experience entries before I run the changes that need them. Build flow:
1. You drop the image files into chat with a short note mapping each file to a project slug and experience role.
2. I copy them into the `portfolio-assets` storage bucket and update `projects.hero_image_url` / `experience.image_url` rows.
3. Detail pages and AboutSection then pick them up automatically.

If any images are missing at build time, those entries fall back to the existing gradient placeholder so nothing breaks.

---

## Technical notes

- New file: `src/components/site/TimelineGraphic.tsx` (SVG + Framer Motion).
- New file: `src/hooks/useScrollDirection.ts`.
- New file: `src/components/site/AdminTimeline.tsx` (admin tab).
- Modified: `src/config/site.ts` (drop About from nav), `src/routes/index.tsx` (insert TimelineGraphic), `src/components/site/AboutSection.tsx` (new experience layout + insert TimelineGraphic between bio and experience), `src/components/site/CornerLabels.tsx` (scroll-aware nav + footer handoff), `src/components/site/Footer.tsx` (new layout), `src/routes/work.tsx` (Select dropdowns), `src/routes/work.$slug.tsx` (redesign), `src/routes/thinking.$slug.tsx` (redesign), `src/routes/admin.index.tsx` (Timeline tab + experience image field), `src/lib/portfolio.ts` (queries + types for timeline + experience image), `src/router.tsx` (trailing-slash fix if confirmed).
- Deleted: `src/routes/about.tsx`.
- DB migrations: create `timeline_entries` + RLS, add `image_url` to `experience`, seed `timeline_entries` from the reference image.

## Mapping back to your numbered list

1. Erase /about + nav link → §1.
2. Animated timeline graphic → §2 + §3.
3. Absolute nav (hide on scroll-down) + footer chrome handoff → §1.
4. Replace placeholders with uploaded images → §8 (waiting on your uploads).
5. Project + essay pages working and redesigned → §4.
6. Experience image spanning role/org/note → §5.
7. Sort + Type as Selects, drop "Tag" label → §6.
8. Responsivity → §7.
9. Pointer-event chrome updated; footer left side empty until scrolled-to → §1.
