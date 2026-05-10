## 1. Timeline graphic — pixel-perfect match to reference

Rewrite `src/components/site/TimelineGraphic.tsx` so the SVG layout mirrors the uploaded image exactly.

**Layout (desktop SVG, viewBox 1600×1000):**

```text
                                  [Personal Projects]
                                                          ┌──────────────────┐         ┌──────────────┐
                                                          │ 06. Facade Opt   │         │ 05. Hangar   │
                                                          └────────┬─────────┘         └──────┬───────┘
            [Professional]                                         │                          │
                                  ┌──────────────┐    ┌────────────┴─────┐                    │
                                  │ 03. Internship│   │ 04. Interiors    │                    │
                                  └──────┬───────┘    └─────────┬────────┘                    │
[Academic]                               │                      │                             │
       ┌──────────────┐  ┌──────────────────┐                   │                             │
       │ 01. House…   │  │ 02. Sculpted…    │                   │                             │
       └────┬─────────┘  └────────┬─────────┘                   │                             │
            \\dashed              \\dashed                       │                             │
        ── bar ──             ── bar ──                    ── bar ── ── bar ──             ── bar ──
   ──+──────+──────+──────+──────+──────+──────+─────⇢
     2021   2022   2023   2024   2025   2026  Present
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━            ╭────────────────╮
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━              │ Design Systems │
                  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━              │ & Automation   │
                                  ━━━━━━━━━━━━━━━━━              ╰────────────────╯
                                            ━━━━━━━━━              ╭────────────────╮
                                            ━━━━━━━━━              │ LoRA + ControlNet│
                                                                   ╰────────────────╯
   AutoCAD  Revit  Rhino+GH  Render  C#/Python                    [Learning in progress]
                  Rhino.Inside.Revit          (skill chips below bars)
                  [BIM] [Parametric]    [Computational]
```

**Hard-coded positions** matching the reference, derived from the data row's `start_year` so admin still drives content:

- 3 lanes stacked vertically above axis with italic bracket labels at left margin (`[Academic]`, `[Professional]`, `[Personal Projects]`).
- Pills (black bg, white text, page-ref in muted white) sit ABOVE their lane row, connected by a thin dashed leader line down to a short solid bar that touches the axis.
- Multiple pills in same year on same lane stack vertically (e.g. Interiors above its bar at 2025).
- Axis: horizontal line with `+` tick marks at each year, year labels below, dashed extension to `→` arrow on the right ending past "Present".
- Skill bars: thick solid horizontal lines BELOW the axis, each on its own row, starting at the skill's `start_year` and extending to `end_year` (or to "Present" if null). Below each bar's start a dashed drop-line connects to a rounded skill chip with the skill name. Below some chips, a small italic bracket category (`[BIM]`, `[Parametric]`, `[Computational]`).
- "Learning in progress" cluster: rounded chips on the FAR RIGHT, past Present, with italic `[Learning in progress]` label underneath.

**Animation (once on scroll-into-view):**
- Axis line draws left → right (1.4s ease).
- For each year as the sweep crosses it: tick `+` fades in, year label fades in.
- Each pill/bar appears when the sweep reaches its start year (bar draws first, then pill drops in from above with dashed leader).
- Skill bars animate as horizontal draws starting at their `start_year`, duration proportional to span.
- Learning cluster fades in last.

**Mobile (<md):** keep current vertical stacked timeline (no change to fidelity needed).

**DB seed update** (migration to update existing rows so labels, years, page refs, lanes match the image exactly):
- 01 House of Slabs · academic · 2022 · p.03
- 02 Sculpted Earth House · academic · 2023 · p.07
- 03 Internship · professional · 2024 · p.11
- 04 Interiors · professional · 2025 · p.12
- 05 Hangar · personal · 2026 · p.13
- 06 Facade Optimization · personal · 2025 · p.15
- Skills: AutoCAD (2021–present), Revit (2022–present, [BIM]), Rhino+Grasshopper (2023–present, [Parametric]), Rhino.Inside.Revit (2023–present, [Parametric]), Rendering Softwares (2025–present), C# RhinoCommon (2026–present, [Computational]), Python (2026–present, [Computational])
- Learning: Design Systems & Automation, LoRA + ControlNet

## 2. Wordmark scroll behavior

In `src/components/site/CornerLabels.tsx`, wrap the top-left wordmark `<Link>` in the same `motion.div` pattern as the top-right nav, using the existing `navHidden` value (`!atTop && direction === "down"`). No footer handoff. Symmetric animation: `y: -40, opacity: 0` on hide.

## 3. Admin CMS — fill missing CRUD

Audit results vs DB schema:

| Table | Missing in admin |
|---|---|
| `projects` | `gallery_urls` (multi-image upload), `metrics` (jsonb editor) |
| `experience` | (complete) |
| `writing` | (complete) |
| `timeline_entries` | dropdowns for `kind` and `lane` instead of free-text |
| `now_items` | (complete) |

Changes to `src/routes/admin.index.tsx`:

- Extend `RecordEditor`'s `Field.type` with `"gallery"` (multi-upload, array of URLs with previews + remove buttons) and `"json"` (textarea that parses to JSON, used for metrics — already half-supported, just expose it as a field type).
- Add `"select"` field type with `options: string[]`.
- `ProjectsTab`: add `gallery_urls` (gallery), `metrics` (json) fields.
- `TimelineTab`: change `kind` and `lane` to `select` with the enum options.
- All saves already invalidate React Query; public pages refetch on next mount. Verify no stale-cache issues.

## Files

- **Edit:** `src/components/site/TimelineGraphic.tsx` (full rewrite for desktop SVG), `src/components/site/CornerLabels.tsx` (wordmark animation), `src/routes/admin.index.tsx` (new field types + ProjectsTab/TimelineTab updates).
- **Migration:** UPDATE existing `timeline_entries` rows to match reference exactly (delete + reseed).
- **No new files, no schema changes** (existing columns cover everything).
