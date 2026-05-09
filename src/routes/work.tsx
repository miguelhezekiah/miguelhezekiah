import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { useProjects, heroFor, type Project } from "@/lib/portfolio";
import { motionConfig, siteConfig } from "@/config/site";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: `Work — ${siteConfig.name}` },
      {
        name: "description",
        content: `Built work, research, and installations by ${siteConfig.name}.`,
      },
      { property: "og:title", content: `Work — ${siteConfig.name}` },
      {
        property: "og:description",
        content: `Built work, research, and installations by ${siteConfig.name}.`,
      },
    ],
  }),
  component: WorkIndex,
});

function WorkIndex() {
  const { data: projects = [], isLoading } = useProjects();
  const [hovered, setHovered] = useState<Project | null>(null);

  return (
    <main
      className="relative min-h-dvh"
      style={{ padding: "calc(var(--site-padding-y) * 5) var(--site-padding-x)" }}
    >
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-7">
          <div className="label label-muted mb-8">Selected — 2022 / 2025</div>
          <ul className="divide-y divide-border">
            {isLoading && <li className="py-8 label label-muted">Loading…</li>}
            {projects.map((p, idx) => (
              <li
                key={p.id}
                onMouseEnter={() => setHovered(p)}
                onMouseLeave={() => setHovered((h) => (h?.id === p.id ? null : h))}
              >
                <Link
                  to="/work/$slug"
                  params={{ slug: p.slug }}
                  className="group flex items-baseline justify-between py-7 transition-all"
                >
                  <motion.span
                    className="display text-3xl md:text-5xl"
                    animate={{ x: hovered?.id === p.id ? 12 : 0, opacity: hovered && hovered.id !== p.id ? 0.35 : 1 }}
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

        {/* preview image */}
        <div className="hidden md:block md:col-span-5">
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
    </main>
  );
}
