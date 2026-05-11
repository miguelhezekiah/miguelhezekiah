# Work detail page — Tosen-style layout

Restructure `src/routes/work.$slug.tsx` to follow the Tosen/Estratos page rhythm, while keeping our Swiss-editorial typography, hard hairlines, vermilion accent, and existing motion (image scale-in, ScrollReveal, hover transforms).

## Reference rhythm (top → bottom)

```
[ full-bleed hero image
   └── TITLE overlaid at bottom-left ]
[ metadata grid: 4 columns of "Label /" + "Value" pairs ]
[ paragraph 1 (lead) ]
[ full-bleed image ]
[ paragraph 2 ]
[ full-bleed image ]
[ full-bleed image ]
[ paragraph 3 + 4 ]
[ full-bleed image ]
…body and images alternate, all single-column full-bleed…
[ Related Works — 2 thumbnails side-by-side ]
```

## Sections

### 1. Hero with title overlay
- Full-bleed image, ~85dvh, keep current scale-in motion.
- H1 absolutely positioned at bottom-left, sitting on the image with site padding (`left: var(--site-padding-x)`, `bottom: var(--site-padding-y)`).
- Title only — no metadata, no eyebrow, no scrim/gradient (matches Swiss style: hard contrast, no soft overlays).
- `display`, `clamp(2.5rem, 9vw, 8rem)`, `leading-[0.9]`, color `--background` (white) for legibility against image. Pointer-events none so it doesn't block image.
- No paper slab or gradient — title sits directly on the image.

### 2. Metadata grid (just below hero)
- 4-column grid on desktop (2 on mobile), site-padded.
- Top + bottom hairline, vertical 1px dividers between columns.
- Each cell: `Label /` in `label label-muted` (vermilion `/`) + value in `display text-lg md:text-xl`.
- Mapped from schema: Place=location, Year=year, Program=category, Role=role, Type=first tag (omit if absent).

### 3. Long-form body
- Single column, max-w ~72ch, left-aligned within site padding.
- First paragraph promoted to lead size.
- Remaining paragraphs in `ScrollReveal`.

### 4. Body + gallery interleave
- Replace `chunkAsymmetric` with single-column full-bleed image stack.
- Insert images after paragraph indexes 1, 3, 5… until images run out, dump remainder below.
- Each image: full viewport-width, lazy-loaded, wrapped in ScrollReveal.

### 5. Metrics band
- Keep, between body and Related Works (top/bottom hairline, tabular figures).

### 6. Related Works
- Section heading `Related works` in `display`, hairline above.
- Next 2 projects (modulo wrap), 2-column grid (stacked on mobile).
- Each card: aspect-[4/3] image + title + category/year, hover scale on image and translate on title.

## Visual style

- Hairlines: `border-foreground` 1px only.
- No shadows, no rounded corners, no gradients/scrims.
- Vermilion accent on `/` separators and section eyebrows.
- Tabular `.num` for year and metric values.
- Motion preserved: hero scale-in, ScrollReveal, hover transforms.

## Files

- `src/routes/work.$slug.tsx` — full JSX restructure. Remove `chunkAsymmetric` helper, replace with inline interleave. No schema or data-layer changes.
