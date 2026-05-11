## Goal

Push the site further into Swiss editorial / magazine territory: replace soft UI cues (gradients, drop shadows, decorative borders, ring/glow cursor) with **hard-edged**, **graphic**, **block-color** treatments. Keep all motion intact.

---

## 1. Cursor — Swiss-style crosshair

`src/components/site/Cursor.tsx`

- Replace the current dot + soft ring with a **hard crosshair reticle**:
  - Two thin (1px) ink-colored lines forming a `+`, ~22px long each.
  - Small filled square (4×4) at the center, in the editorial vermilion accent.
  - On hoverable elements (`a, button, [role=button]`): swap to a filled vermilion square (10×10), no border, no scaling halo.
- Remove `mix-blend-difference`, `border`, `rounded-full`, and the soft transition. Use sharp color from tokens (`--foreground`, `--accent`).
- Lerp position kept (so it still feels alive) but no size morphing — instant state swap on hover.

## 2. Remove drop shadows & decorative borders

Global sweep — keep only **hairline rules** that act as typographic dividers (the `.rule` / `border-y` used as horizontal lines in toolbars, metrics band, footer top). Remove everything else:

- `src/components/ui/card.tsx` — remove `shadow` and `border` from `Card` base; leave it as a plain block.
- `src/components/ui/button.tsx` — strip `shadow`, `shadow-sm`, `border` from default/destructive/outline/secondary variants. Outline becomes a plain inverted block (bg swap on hover) instead of a bordered pill. Keep `rounded-md` removed already by `--radius: 0`.
- `src/routes/work.$slug.tsx` — remove the rounded-pill border around tag chips (lines 92–96): render tags as plain uppercase labels separated by middots, no border, no padding box.
- `src/components/site/CornerLabels.tsx` — remove the `backdrop-blur-sm` + translucent bg on the top bar; replace with a solid paper fill (`bg-background`) and keep only the bottom hairline. No shadow.
- `src/routes/work.index.tsx` toolbar (line 95) — drop `backdrop-blur` and translucent bg; use solid `bg-background` with top + bottom hairline only.
- Search the project for any remaining `shadow-`, `drop-shadow`, `ring-`, `rounded-full`, `rounded-xl` used decoratively and strip them. Form inputs keep their functional focus ring.

## 3. Footer — filled ink block

`src/components/site/Footer.tsx`

- Invert the footer into a **solid ink slab**: `background: var(--foreground)`, `color: var(--background)`. No top border (the color change is the divider).
- Increase vertical padding to feel like a poster colophon.
- Restructure into a 12-col magazine colophon:
  - Left (cols 1–4): oversized wordmark + role, set in `.display` at ~clamp(2rem, 5vw, 4rem).
  - Middle (cols 5–8): `dt/dd` style contact list (Email, Instagram, LinkedIn, GitHub) — each row a hairline divider in `--background / 20%`.
  - Right (cols 9–12): big tabular year `© 2026` and section index, right-aligned.
- Hover state on links: vermilion accent only (no underline animation).
- Remove the existing IndexCounter row inside the footer (visual noise) — section index lives in the right column instead.

## 4. Replace gradients with sharp color blocks

Hunt down every `bg-gradient-*`, `from-…/to-…`, and soft scrim, and swap for **flat planes** that read as magazine compositional blocks.

- `src/components/site/HeroRotator.tsx` (line 77) — delete the `bg-gradient-to-t from-background/80 …` scrim. Instead overlay a **solid paper caption slab** (bottom ~38% of the viewport) using `background: var(--background)`, with the image cropped above it. The image and the slab meet on a hard horizontal line — classic magazine cover. Caption block rendered on top of the slab.
- `src/routes/work.$slug.tsx` hero (line 48) — delete gradient scrim. Move title + meta out of the absolute overlay and into a **flat paper slab below** the image (full-bleed image, then a ruled white caption block). Title baseline aligns to a 12-col grid; meta sits on a hairline above the title.
- `src/routes/index.tsx` Continue affordance (line 28) — already flat; tighten to a 1px vermilion vertical rule + label, no fade.
- Remove any `via-…` / `to-transparent` overlays elsewhere (search and verify).

## 5. Graphical magazine layout cues (presentational only)

Small additions to reinforce the editorial shift, motion preserved:

- Add a `.poster-num` utility in `src/styles.css` for oversized tabular figures used as folio markers (e.g. running project number on hero, "01" badges in Work index list).
- `src/routes/work.index.tsx` GridView: convert uniform 3-col grid into an **asymmetric editorial catalogue** — rows alternate `[col-span-8, col-span-4]`, `[col-span-4, col-span-8]`, full-bleed feature every 5th item. No card chrome — image meets caption directly with a hairline above.
- `src/routes/work.index.tsx` ListView: large folio numbers on the left in vermilion, hairline rows, title sliding right on hover (already implemented) — keep.
- `AboutSection`: add a **vermilion block marker** (8×8 filled square) before each section label ("About", "Trajectory", "Experience") instead of the current plain text.

---

## Files touched

- `src/components/site/Cursor.tsx` (rewrite)
- `src/components/site/Footer.tsx` (rewrite layout, filled bg)
- `src/components/site/HeroRotator.tsx` (gradient → paper slab)
- `src/components/site/CornerLabels.tsx` (solid bar, no blur/shadow)
- `src/components/site/AboutSection.tsx` (square markers)
- `src/components/ui/card.tsx`, `src/components/ui/button.tsx` (strip shadows/borders)
- `src/routes/index.tsx` (Continue affordance tweak)
- `src/routes/work.index.tsx` (toolbar, asymmetric grid)
- `src/routes/work.$slug.tsx` (hero slab, tag chips)
- `src/styles.css` (add `.poster-num`, `.block-marker` utilities; ensure no shadow tokens)

## Out of scope

- Routing / data / business logic — visual presentation only.
- No font swaps; current grotesk stack stays.
- No motion changes — all framer-motion timings preserved.
