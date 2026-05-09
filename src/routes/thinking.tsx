import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useWriting, useNowItems } from "@/lib/portfolio";
import { siteConfig, motionConfig } from "@/config/site";
import { PageGrid } from "@/components/site/PageGrid";
import { Footer } from "@/components/site/Footer";
import { ScrollReveal } from "@/components/site/PageTransition";

const thinkingSearch = z.object({
  view: fallback(z.enum(["essays", "now"]), "essays").default("essays"),
});

export const Route = createFileRoute("/thinking")({
  validateSearch: zodValidator(thinkingSearch),
  head: () => ({
    meta: [
      { title: `Thinking — ${siteConfig.name}` },
      {
        name: "description",
        content: `Essays, notes, and what ${siteConfig.name} is currently working on.`,
      },
      { property: "og:title", content: `Thinking — ${siteConfig.name}` },
    ],
  }),
  component: ThinkingIndex,
});

function ThinkingIndex() {
  const { view } = Route.useSearch();
  const navigate = useNavigate({ from: "/thinking" });

  return (
    <main className="pt-24">
      <PageGrid>
        <div className="col-span-full">
          <div className="label label-muted mb-6">Thinking</div>
          <h1 className="display text-[clamp(2rem,5vw,4rem)] mb-12">
            {view === "essays" ? "Essays, notes, and technical writing." : "What I'm doing right now."}
          </h1>

          {/* Tabs */}
          <div className="flex gap-8 border-b border-border pb-4 mb-12">
            {(["essays", "now"] as const).map((v) => (
              <button
                key={v}
                onClick={() => navigate({ search: { view: v } })}
                className={`label uppercase underline-offset-8 transition-opacity ${
                  view === v ? "opacity-100 underline" : "opacity-40 hover:opacity-80"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: motionConfig.ease }}
            >
              {view === "essays" ? <EssaysList /> : <NowList />}
            </motion.div>
          </AnimatePresence>
        </div>
      </PageGrid>
      <Footer />
    </main>
  );
}

function EssaysList() {
  const { data: writing = [], isLoading } = useWriting();
  return (
    <ul className="divide-y divide-border">
      {isLoading && <li className="py-8 label label-muted">Loading…</li>}
      {writing.map((w, i) => (
        <ScrollReveal key={w.id} delay={i * 0.05}>
          <li>
            <Link
              to="/thinking/$slug"
              params={{ slug: w.slug }}
              className="grid grid-cols-1 gap-4 py-8 transition-opacity duration-500 hover:opacity-60 md:grid-cols-12"
            >
              <div className="md:col-span-2 label label-muted">{w.date}</div>
              <div className="md:col-span-7">
                <div className="display text-2xl md:text-3xl">{w.title}</div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-xl">{w.excerpt}</p>
              </div>
              <div className="md:col-span-3 label label-muted md:text-right">
                {w.tag} · {w.read_time}
              </div>
            </Link>
          </li>
        </ScrollReveal>
      ))}
    </ul>
  );
}

function NowList() {
  const { data: items = [], isLoading } = useNowItems();
  return (
    <ul className="space-y-6">
      {isLoading && <li className="py-8 label label-muted">Loading…</li>}
      {items.map((n, i) => (
        <ScrollReveal key={n.id} delay={i * 0.04}>
          <li className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-2 label label-muted">{n.kind}</div>
            <div className="md:col-span-10">
              <div className="text-base">
                {n.title}
                {n.author ? <span className="text-muted-foreground"> — {n.author}</span> : null}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{n.note}</div>
            </div>
          </li>
        </ScrollReveal>
      ))}
    </ul>
  );
}
