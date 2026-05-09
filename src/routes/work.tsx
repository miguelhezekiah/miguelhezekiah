import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useProjects, heroFor, type Project } from "@/lib/portfolio";
import { motionConfig, siteConfig } from "@/config/site";
import { PageGrid } from "@/components/site/PageGrid";
import { Footer } from "@/components/site/Footer";

const workSearchSchema = z.object({
  view: fallback(z.enum(["grid", "list"]), "grid").default("grid"),
  sort: fallback(z.enum(["year-desc", "year-asc", "alpha", "type"]), "year-desc").default("year-desc"),
  cat: fallback(z.array(z.string()), []).default([]),
  tag: fallback(z.array(z.string()), []).default([]),
});

export const Route = createFileRoute("/work")({
  validateSearch: zodValidator(workSearchSchema),
  head: () => ({
    meta: [
      { title: `Work — ${siteConfig.name}` },
      {
        name: "description",
        content: `Built work, research, and installations by ${siteConfig.name}.`,
      },
      { property: "og:title", content: `Work — ${siteConfig.name}` },
    ],
  }),
  component: WorkIndex,
});

function WorkIndex() {
  const { data: projects = [], isLoading } = useProjects();
  const { view, sort, cat, tag } = Route.useSearch();
  const navigate = useNavigate({ from: "/work" });

  const categories = useMemo(
    () => Array.from(new Set(projects.map((p) => p.category))).sort(),
    [projects],
  );
  const tags = useMemo(
    () => Array.from(new Set(projects.flatMap((p) => p.tags))).sort(),
    [projects],
  );

  const filtered = useMemo(() => {
    let xs = projects.filter(
      (p) =>
        (cat.length === 0 || cat.includes(p.category)) &&
        (tag.length === 0 || tag.some((t) => p.tags.includes(t))),
    );
    xs = [...xs].sort((a, b) => {
      switch (sort) {
        case "year-asc": return Number(a.year) - Number(b.year);
        case "alpha": return a.title.localeCompare(b.title);
        case "type": return a.category.localeCompare(b.category);
        default: return Number(b.year) - Number(a.year);
      }
    });
    return xs;
  }, [projects, cat, tag, sort]);

  const toggle = (key: "cat" | "tag", val: string) =>
    navigate({
      search: (prev) => {
        const cur = (prev as any)[key] as string[];
        const next = cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val];
        return { ...prev, [key]: next };
      },
    });

  const hasFilter = cat.length > 0 || tag.length > 0;

  return (
    <main className="pt-24">
      <PageGrid>
        <div className="col-span-full flex items-end justify-between mb-8">
          <div>
            <div className="label label-muted mb-2">Work</div>
            <h1 className="display text-[clamp(2rem,5vw,4rem)]">
              Selected — {filtered.length} project{filtered.length === 1 ? "" : "s"}
            </h1>
          </div>
        </div>

        {/* Toolbar */}
        <div className="col-span-full flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-border py-5 sticky top-0 bg-background/85 backdrop-blur z-30">
          <ToolbarGroup label="View">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => navigate({ search: (p) => ({ ...p, view: v }) })}
                className={`label transition-opacity ${view === v ? "opacity-100 underline underline-offset-4" : "opacity-50 hover:opacity-100"}`}
              >
                {v}
              </button>
            ))}
          </ToolbarGroup>

          <ToolbarGroup label="Sort">
            {(
              [
                ["year-desc", "Year ↓"],
                ["year-asc", "Year ↑"],
                ["alpha", "A–Z"],
                ["type", "Type"],
              ] as const
            ).map(([k, lbl]) => (
              <button
                key={k}
                onClick={() => navigate({ search: (p) => ({ ...p, sort: k }) })}
                className={`label transition-opacity ${sort === k ? "opacity-100 underline underline-offset-4" : "opacity-50 hover:opacity-100"}`}
              >
                {lbl}
              </button>
            ))}
          </ToolbarGroup>

          <ToolbarGroup label="Type">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => toggle("cat", c)}
                className={`label transition-opacity ${cat.includes(c) ? "opacity-100 underline underline-offset-4" : "opacity-50 hover:opacity-100"}`}
              >
                {c}
              </button>
            ))}
          </ToolbarGroup>

          {tags.length > 0 && (
            <ToolbarGroup label="Tag">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => toggle("tag", t)}
                  className={`label transition-opacity ${tag.includes(t) ? "opacity-100 underline underline-offset-4" : "opacity-50 hover:opacity-100"}`}
                >
                  {t}
                </button>
              ))}
            </ToolbarGroup>
          )}

          {hasFilter && (
            <button
              onClick={() => navigate({ search: (p) => ({ ...p, cat: [], tag: [] }) })}
              className="label opacity-60 hover:opacity-100 ml-auto"
            >
              Clear ✕
            </button>
          )}
        </div>

        {/* Body */}
        <div className="col-span-full mt-12">
          {isLoading && <div className="label label-muted">Loading…</div>}
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: motionConfig.ease }}
            >
              {view === "grid" ? <GridView items={filtered} /> : <ListView items={filtered} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </PageGrid>
      <Footer />
    </main>
  );
}

function ToolbarGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="label label-muted">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function GridView({ items }: { items: Project[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 md:gap-6">
      {items.map((p) => (
        <li key={p.id}>
          <Link to="/work/$slug" params={{ slug: p.slug }} className="group block">
            <div className="aspect-square overflow-hidden bg-card">
              <img
                src={heroFor(p)}
                alt={p.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                draggable={false}
              />
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-3">
              <span className="display text-lg md:text-xl transition-transform duration-500 group-hover:-translate-y-0.5">
                {p.title}
              </span>
              <span className="label label-muted">{p.year}</span>
            </div>
            <div className="label label-muted mt-1">{p.category}</div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ListView({ items }: { items: Project[] }) {
  const [hovered, setHovered] = useState<Project | null>(null);
  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
      <div className="md:col-span-7">
        <ul className="divide-y divide-border">
          {items.map((p, idx) => (
            <li
              key={p.id}
              onMouseEnter={() => setHovered(p)}
              onMouseLeave={() => setHovered((h) => (h?.id === p.id ? null : h))}
            >
              <Link
                to="/work/$slug"
                params={{ slug: p.slug }}
                className="group flex items-baseline justify-between py-7"
              >
                <motion.span
                  className="display text-3xl md:text-5xl"
                  animate={{
                    x: hovered?.id === p.id ? 12 : 0,
                    opacity: hovered && hovered.id !== p.id ? 0.35 : 1,
                  }}
                  transition={{ duration: motionConfig.hoverDuration, ease: motionConfig.ease }}
                >
                  <span className="opacity-40 mr-4 text-sm align-middle tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  {p.title}
                </motion.span>
                <span className="label label-muted hidden md:block">
                  {p.category} — {p.year}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="hidden md:col-span-5 md:block">
        <div className="sticky top-[20vh] aspect-[4/5] overflow-hidden bg-card">
          {hovered && (
            <motion.img
              key={hovered.id}
              src={heroFor(hovered)}
              alt={hovered.title}
              className="h-full w-full object-cover"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: motionConfig.heroCrossfadeDuration, ease: motionConfig.ease }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
