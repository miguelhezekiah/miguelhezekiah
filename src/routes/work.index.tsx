import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useProjects, heroFor, type Project } from "@/lib/portfolio";
import { motionConfig, siteConfig } from "@/config/site";
import { PageGrid } from "@/components/site/PageGrid";
import { Footer } from "@/components/site/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const workSearchSchema = z.object({
  view: fallback(z.enum(["grid", "list"]), "grid").default("grid"),
  sort: fallback(z.enum(["year-desc", "year-asc", "alpha", "type"]), "year-desc").default("year-desc"),
  cat: fallback(z.string(), "all").default("all"),
  tag: fallback(z.array(z.string()), []).default([]),
});

export const Route = createFileRoute("/work/")({
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
        (cat === "all" || p.category === cat) &&
        (tag.length === 0 || tag.some((t: string) => p.tags.includes(t))),
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

  const toggleTag = (val: string) =>
    navigate({
      search: (prev: any) => {
        const cur = prev.tag as string[];
        const next = cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val];
        return { ...prev, tag: next };
      },
    });

  const hasFilter = cat !== "all" || tag.length > 0;

  return (
    <main className="pt-24">
      <PageGrid>
        <div className="col-span-full flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="label label-muted mb-2">Work</div>
            <h1 className="display text-[clamp(2rem,5vw,4rem)]">
              Selected project{filtered.length === 1 ? "" : "s"}
            </h1>
          </div>
        </div>

        {/* Toolbar */}
        <div className="col-span-full flex flex-wrap items-center gap-x-6 gap-y-4 border-y border-foreground py-5 sticky top-0 bg-background z-30">
          <div className="flex items-center gap-3">
            <span className="label label-muted">View</span>
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => navigate({ search: (p: any) => ({ ...p, view: v }) })}
                className={`label transition-opacity ${view === v ? "opacity-100 underline underline-offset-4" : "opacity-50 hover:opacity-100"}`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="label label-muted">Sort</span>
            <Select value={sort} onValueChange={(v) => navigate({ search: (p: any) => ({ ...p, sort: v }) })}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="year-desc">Year ↓</SelectItem>
                <SelectItem value="year-asc">Year ↑</SelectItem>
                <SelectItem value="alpha">A–Z</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <span className="label label-muted">Type</span>
            <Select value={cat} onValueChange={(v) => navigate({ search: (p: any) => ({ ...p, cat: v }) })}>
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`label transition-opacity ${tag.includes(t) ? "opacity-100 underline underline-offset-4" : "opacity-50 hover:opacity-100"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {hasFilter && (
            <button
              onClick={() => navigate({ search: (p: any) => ({ ...p, cat: "all", tag: [] }) })}
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

function GridView({ items }: { items: Project[] }) {
  // Asymmetric editorial catalogue: alternate 8/4, 4/8, full-bleed every 5th
  const rows: Project[][] = [];
  let i = 0;
  let pattern = 0;
  while (i < items.length) {
    if (pattern % 3 === 2) {
      rows.push(items.slice(i, i + 1));
      i += 1;
    } else {
      rows.push(items.slice(i, i + 2));
      i += 2;
    }
    pattern++;
  }
  return (
    <div className="space-y-10 md:space-y-14">
      {rows.map((row, rIdx) => {
        const layout =
          row.length === 1
            ? ["col-span-12"]
            : rIdx % 2 === 0
              ? ["col-span-12 md:col-span-8", "col-span-12 md:col-span-4"]
              : ["col-span-12 md:col-span-4", "col-span-12 md:col-span-8"];
        return (
          <div key={rIdx} className="grid grid-cols-12 gap-4 md:gap-6">
            {row.map((p, cIdx) => {
              const globalIdx = items.indexOf(p);
              return (
                <Link
                  key={p.id}
                  to="/work/$slug"
                  params={{ slug: p.slug }}
                  className={`group block ${layout[cIdx]}`}
                >
                  <div className={`overflow-hidden bg-card ${row.length === 1 ? "aspect-[16/8]" : "aspect-[4/3]"}`}>
                    <img
                      src={heroFor(p)}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      draggable={false}
                    />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <span className="display text-lg md:text-2xl transition-transform duration-500 group-hover:-translate-y-0.5">
                        {p.title}
                      </span>
                      <span className="label label-muted display text-lg md:text-2xl">{p.year}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        );
      })}
    </div>
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
                  className="display text-2xl md:text-5xl"
                  animate={{
                    x: hovered?.id === p.id ? 12 : 0,
                    opacity: hovered && hovered.id !== p.id ? 0.35 : 1,
                  }}
                  transition={{ duration: motionConfig.hoverDuration, ease: motionConfig.ease }}
                >
                  {p.title}
                </motion.span>
                <span className="label label-muted hidden md:block">
                  {p.year}
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
